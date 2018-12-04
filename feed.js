require('dotenv').config()
var EventSource = require('eventsource');
var mysql = require('mysql');

var pool  = mysql.createPool({
  connectionLimit : 100,
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : "  ",
  database        : 'wiki_live',
  charset         : 'utf8mb4'
});

var url = 'https://stream.wikimedia.org/v2/stream/recentchange';

console.log(`Connecting to EventStreams at ${url}`);
var eventSource = new EventSource(url);

eventSource.onopen = function(event) {
  console.log('--- Opened connection.');
};

eventSource.onerror = function(event) {
  console.error('--- Encountered error', event);
};

var wiki = 'enwiki';
eventSource.onmessage = function(event) {
  var data = JSON.parse(event.data);
  //if (change.wiki == wiki) {
  console.log("-------------------------");
  console.log("USER: " + data.user);
  console.log("TYPE: " + data.type);
  console.log("PAGE: " + data.meta.uri);
  console.log("WIKI: " + data.wiki);
  //console.log(data);
  //}

  var sql = "INSERT INTO changes(type,bot,comment,size,uri,user,wiki,timestamp) VALUES(?,?,?,?,?,?,?,?)";
  if(data.length) {size = (data.length.new - data.length.old);} else {size = 0;}
  var inserts = [data.type, data.bot, data.comment, size, data.meta.uri, data.user, data.wiki, data.timestamp];
  sql = mysql.format(sql, inserts);

  pool.query(sql, function (error) {
    if (error) throw error;
  });

};