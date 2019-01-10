var feed_items = [];
var index = 1;

$(function () {
  var socket = io();
  socket.on('wiki_feed', feedAdd);
});

function feedAdd(change) {
  time = Date.now();
  $( "#wiki_feed" ).prepend( "<p id='feed_" + time + "'><b>" + change.title + "</b> - " + change.user + " (" + change.size + ")" + "</p>" );
  feed_items.unshift(time);
  points.unshift(new Point(change.time, change.size, change.title, index));
  feedCull();
  if( index > feed_items.length ) { index=1; }
  else {index++;}
}

function feedCull() {
  if( feed_items.length > 10) {
    $( "#feed_" + feed_items[10] ).remove();
    feed_items.pop();
  }
  if(points.length > 50) {
    points.pop();
  }
}
