// Check whether user is viewing page
page_vis_state = 1;
var visibilityChange = (function (window) {
  inView = false;
  return function (fn) {
    window.onfocus = window.onblur = window.onpageshow = window.onpagehide = function (e) {
      if ({focus:1, pageshow:1}[e.type]) {
        if (inView) return;
        fn("visible");
        inView = true;
      } else if (inView) {
        fn("hidden");
        inView = false;
      }
    };
  };
}(this));
visibilityChange(function (state) {
  if (state=="hidden")
  {
    page_vis_state = 0;
  }
  if (state=="visible")
  {
    page_vis_state = 1;
  }
});

// Live feed
var feed_items = [];
var index = 1;

var last_point = "";

var feed_active = true;

$(function () {
  //var socket = io('http://www.doc.gold.ac.uk', {path: '/www/119/socket.io/'});
  var socket = io();
  socket.on('wiki_feed', feedAdd);
});

function feedAdd(change) {
  if(feed_active) {
    time = Date.now();
    if(change.size > 0) {size_symbol = "▲"; size_class="pos"} else {size_symbol = "▼"; size_class="neg"}
    if(change.bot == true){bot_symbol = " <i class='fas fa-robot'></i>";} else {bot_symbol = "";}
    user_colour = intToRGB(hashCode(change.user));
    text_colour = getColorByBgColor(user_colour);
    $( "#wiki_feed" ).prepend( "<div id='feed_" + time + "' class='feed_box'><p><b>● " + change.title + "</b> <span class='feed_badge "+size_class+"'>" + size_symbol + change.size + " bytes</span></p><span class='feed_badge user_badge' style='color: "+text_colour+"; background-color: #"+user_colour+"'>User:</b> "+change.user+"  "+bot_symbol+"</span></div>" );
    $( "#feed_" + time ).fadeTo( "slow" , 1 );
    feed_items.unshift(time);
  }

  if(change.title != last_point && page_vis_state) {
    points.unshift(new Point(change.time, change.size, change.title, index, change.user, change.comment));

    if( index > 10 ) { index=1; }
    else {index++;}
  }

  feedCull();
  last_point = change.title;
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

getDailyData();
getWeeklyData();

getDailyTable();
getWeeklyTable();

setInterval(function () {
  if(page_vis_state) {
    getDailyData();
    getWeeklyData();

    getDailyTable();
    getWeeklyTable();
  }
}, 10000);

function hashCode(str) { // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i){
  var c = (i & 0x00FFFFFF)
  .toString(16)
  .toUpperCase();

  return "00000".substring(0, 6 - c.length) + c;
}

function getColorByBgColor(bgColor) {
  var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
  var r = parseInt(color.substring(0, 2), 16); // hexToR
  var g = parseInt(color.substring(2, 4), 16); // hexToG
  var b = parseInt(color.substring(4, 6), 16); // hexToB
  return (((r * 0.299) + (g * 0.587) + (b * 0.114)) > 180) ?
  "#000" : "#FFF";
}
