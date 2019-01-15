require('dotenv').config();

var app = require('express')();
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
app.get('/data/daily', dailyData);
app.get('/data/weekly', weeklyData);

//Routes for files
app.get('/main.js', mainScriptInc);
app.get('/p5/p5.min.js', p5ScriptInc);
app.get('/p5/sketch.js', sketchScriptInc);
app.get('/css/bootstrap.min.css', bootstrapCssInc);
app.get('/js/bootstrap/bootstrap.min.js', bootstrapJsInc);
app.get('/js/c3/c3.min.js', c3JsInc);
app.get('/js/c3/c3.min.css', c3CssInc);

setInterval(function(){
  getDaily();
  getWeekly();
}, 3000);

//Socket
io.on('connection', function(socket){
    console.log("Connected");
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
    io.emit("wiki_feed", {"title": data.title, "user": data.user, "size": size, "time": time });
    dbInsert(data);
  }

};

//View functions
function indexView(req, res) {
  res.render('index.html.pug', { title: 'Wiki Feed' })
}

// Script Routes
function mainScriptInc(req, res) {
  res.sendFile(__dirname + '/public/js/main.js');
}
function p5ScriptInc(req, res) {
  res.sendFile(__dirname + '/public/js/p5/p5.min.js');
}
function sketchScriptInc(req, res) {
  res.sendFile(__dirname + '/public/js/p5/sketch.js');
}
function bootstrapCssInc(req, res) {
  res.sendFile(__dirname + '/public/css/bootstrap.min.css');
}
function bootstrapJsInc(req, res) {
  res.sendFile(__dirname + '/public/js/bootstrap/bootstrap.min.js');
}
function c3JsInc(req, res) {
  res.sendFile(__dirname + '/public/js/c3/c3.min.js');
}
function c3CssInc(req, res) {
  res.sendFile(__dirname + '/public/js/c3/c3.min.css');
}

//DB functions
function dbInsert(data) {
  var sql = "INSERT INTO changes(type,bot,title,comment,size,uri,user,wiki,timestamp,namespace) VALUES(?,?,?,?,?,?,?,?,?,?)";
  if(data.length) {size = (data.length.new - data.length.old);} else {size = 0;}
  var inserts = [data.type, data.bot, data.title, data.comment, size, data.meta.uri, data.user, data.wiki, data.timestamp, data.namespace];
  sql = mysql.format(sql, inserts);

  pool.query(sql, function (error) {if (error) throw error;});
}

//get Lists
function getDaily() {
  var sql = "SELECT title, COUNT(*) as total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) GROUP BY title ORDER BY total DESC LIMIT 10";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    io.emit("wiki_daily", { results });
  });
}

function getWeekly() {
  var sql = "SELECT title, COUNT(*) as total FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) GROUP BY title ORDER BY total DESC LIMIT 10";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    io.emit("wiki_weekly", { results });
  });
}

//Controllers for data
function dailyData(req, res) {
  var sql = "SELECT COUNT(*) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d %h') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 86400) group by d";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
}

function weeklyData(req, res) {
  var sql = "SELECT COUNT(*) AS total, FROM_UNIXTIME(timestamp, '%Y-%m-%d') AS d FROM changes WHERE timestamp > (UNIX_TIMESTAMP() - 604800) group by d";

  pool.query(sql, function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
}
