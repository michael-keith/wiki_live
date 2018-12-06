var feed_items = [];

$(function () {
  var socket = io();
  socket.on('wiki_feed', feedAdd);
});

function feedAdd(change) {
  time = Date.now();
  $( "#wiki_feed" ).prepend( "<p id='feed_" + time + "'>" + change.title + " - " + change.user + "</p>" );
  feed_items.unshift(time);
  feedCull();
}

function feedCull() {
  if( feed_items.length > 10) {
    $( "#feed_" + feed_items[10] ).remove();
  }
}
