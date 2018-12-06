var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var EventSource = require('eventsource');
var url = 'https://stream.wikimedia.org/v2/stream/recentchange';
var eventSource = new EventSource(url);

app.set('view engine', 'pug')

//Routes
app.get('/', indexView);
app.get('/main.js', mainScriptView);

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

eventSource.onopen = function(event) {
  console.log('--- Opened connection.');
};

eventSource.onerror = function(event) {
  console.error('--- Encountered error', event);
};

var wiki = 'enwiki';
eventSource.onmessage = function(event) {
  var change = JSON.parse(event.data);
  if (change.wiki == wiki && change.namespace == 0) {
    // console.log("-------------------------");
    // console.log("USER: " + data.user);
    // console.log("TYPE: " + data.type);
    // console.log("PAGE: " + data.meta.uri);
    // console.log("WIKI: " + data.wiki);
    // //console.log(data);
    io.emit("wiki_feed", {"title": change.title, "user": change.user} );
  }

};

//View functions
function indexView(req, res) {
  res.render('index.html.pug', { title: 'Wiki Feed' })
}
function mainScriptView(req, res) {
  res.sendFile(__dirname + '/public/js/main.js');
}
