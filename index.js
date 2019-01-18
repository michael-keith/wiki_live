require('dotenv').config();

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var EventSource = require('eventsource');
var url = 'https://stream.wikimedia.org/v2/stream/recentchange';
var eventSource = new EventSource(url);

var mysql = require('mysql');
var pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : "  ",
  database        : 'wiki_live',
  charset         : 'utf8mb4'
});

app.set('view engine', 'pug')

//Routes
app.get('/', indexView);
app.use(express.static('public'));
app.get('/data/stats', getMainStats);
app.get('/data/daily', getDailyData);
app.get('/data/weekly', getWeeklyData);
app.get('/table/daily', getDailyTable);
app.get('/table/weekly', getWeeklyTable);


//Socket
io.on('connection', function(socket){
    console.log("Connected");
    console.log(socket.id);
});

//Start Server
http.listen(3000, function(){
  console.log('listening on *:3000');
});

eventSource.onopen = function(event) {
  console.log('--- Opened connection.');
};

eventSource.onerror = function(event) {
  console.error('--- Encountered error', event);
};

var wiki = 'enwiki';
eventSource.onmessage = function(event) {
  var data = JSON.parse(event.data);
  if (data.wiki == wiki && data.namespace == 0) {
    // console.log("-------------------------");
    // console.log("USER: " + data.user);
    // console.log("TYPE: " + data.type);
    // console.log("PAGE: " + data.meta.uri);
    // console.log("WIKI: " + data.wiki);
    // //console.log(data);
    if(data.length) {size = (data.length.new - data.length.old);} else {size = 0;}
    ts = Math.round((new Date()).getTime() / 1000);
    time = ts - data.timestamp;
    io.emit("wiki_feed", {"id": data.id, "title": data.title, "user": data.user, "size": size, "time": time, "timestamp": data.timestamp,"bot": data.bot, "comment": data.comment });
    dbInsert(data);
  }

};

//View functions
function indexView(req, res) {
  res.render('index.html.pug', { title: 'Wiki Feed' })
}

//DB functions
function dbInsert(data) {
  var sql = "INSERT INTO changes(type,bot,title,comment,size,uri,user,wiki,timestamp,namespace) VALUES(?,?,?,?,?,?,?,?,?,?)";
  if(data.length) {size = (data.length.new - data.length.old);} else {size = 0;}
  var inserts = [data.type, data.bot, data.title, data.comment, size, data.meta.uri, data.user, data.wiki, data.timestamp, data.namespace];
  sql = mysql.format(sql, inserts);

  pool.query(sql, function (error) {if (error) throw error;});
}

//////////////////////////////////////////////
// Main timer for setters
//////////////////////////////////////////////
setInterval(function () {
    setHourly();
    setHourlyData();
    setSizes();
    setEpm();
}, 1000);

setInterval(function () {
    setDailyTable();
    setWeeklyTable();
    setDailyData();
    setWeeklyData();
    setSizeData()
}, 5000);

///////////////////////////////////////
// Tables and timeseries data pages
///////////////////////////////////////
var daily_table;
var daily_table_size;
setDailyTable();
function setDailyTable() {
  var sql = "SELECT title, uri, COUNT(*) as total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) GROUP BY title ORDER BY total DESC LIMIT 10";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    daily_table = results;
  });
  var sql = "SELECT title, uri, SUM(ABS(size)) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) GROUP BY title ORDER BY ABS(size) DESC LIMIT 10";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    daily_table_size = results;
  });
}
function getDailyTable(req, res) {
  res.send({"no":daily_table,"size":daily_table_size});
}

var weekly_table;
var weekly_table_size;
setWeeklyTable();
function setWeeklyTable() {
  var sql = "SELECT title, uri, COUNT(*) as total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) GROUP BY title ORDER BY total DESC LIMIT 10";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    weekly_table = results;
  });
  var sql = "SELECT title, uri, SUM(ABS(size)) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) GROUP BY title ORDER BY ABS(size) DESC LIMIT 10";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    weekly_table_size = results;
  });
}
function getWeeklyTable(req, res) {
  res.send({"no":weekly_table,"size":weekly_table_size});
}

var daily_data;
var daily_data_size;
setDailyData();
function setDailyData() {
  var sql = "SELECT COUNT(*) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %H') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) group by d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    daily_data = results;
  });
  var sql = "SELECT SUM(size) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %H') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) group by d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    daily_data_size = results;
  });
}
function getDailyData(req, res) {
  res.send({"no": daily_data, "size": daily_data_size});
}

var weekly_data;
var weekly_data_size;
setWeeklyData();
function setWeeklyData() {
  var sql = "SELECT COUNT(*) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) group by d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    weekly_data = results;
  });
  var sql = "SELECT SUM(size) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) group by d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    weekly_data_size = results;
  });
}
function getWeeklyData(req, res) {
  res.send({"no":weekly_data,"size":weekly_data_size});
}

/////////////////////////////////////////////
// Main stats data and pages
/////////////////////////////////////////////
var hourly_count;
setHourly();
function setHourly() {
  var sql = "SELECT COUNT(*) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600)";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    hourly_count = results[0].total;
  });
}

var hourly_data;
setHourlyData();
function setHourlyData() {
  var sql = "SELECT COUNT(*) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %H:%i') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600) GROUP BY d";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    hourly_data = results;
  });
}

var neg_count;
var pos_count;
setSizes();
function setSizes() {
  var neg_sql = "SELECT SUM(size) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600) AND size < 0";
  var pos_sql = "SELECT SUM(size) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600) AND size > 0";

  pool.query(neg_sql, function (error, results, fields) {
    if (error) throw error;
    neg_count = results[0].total;
  });
  pool.query(pos_sql, function (error, results, fields) {
    if (error) throw error;
    pos_count = results[0].total;
  });
}

var epm;
setEpm();
function setEpm() {
  var sql = "SELECT COUNT(*) AS total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 60)";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    epm = results[0].total;
  });
}

var neg_data;
var pos_data;
setSizeData();
function setSizeData() {
  var sql = "SELECT SUM(size) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %H:%i') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600) AND size > 0 GROUP BY d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    pos_data = results;
  });
  var sql = "SELECT SUM(size) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %H:%i') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 3600) AND size < 0 GROUP BY d";
  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    neg_data = results;
  });
}

function getMainStats(req, res) {
  res.send({"hourly_count": hourly_count, "hourly_data": hourly_data, "neg_count": neg_count, "pos_count": pos_count, "pos_data": pos_data, "neg_data":neg_data, "epm": epm});
}
