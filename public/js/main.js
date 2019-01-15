var feed_items = [];
var index = 1;

var last_point = "";

$(function () {
  var socket = io();
  socket.on('wiki_feed', feedAdd);
  socket.on('wiki_daily', feedDaily);
  socket.on('wiki_weekly', feedWeekly);
});

function feedAdd(change) {
  time = Date.now();
  $( "#wiki_feed" ).prepend( "<p id='feed_" + time + "'><b>" + change.title + "</b> - " + change.user + " (" + change.size + ")" + "</p>" );
  feed_items.unshift(time);

  if(change.title != last_point) {
    points.unshift(new Point(change.time, change.size, change.title, index));

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

function feedDaily(results) {
  $( "#daily_feed" ).html( "" );
  results.results.forEach(function(result){
    $( "#daily_feed" ).append( "<p>" + result.title + " - " +  result.total + "</p>" );
  });
}

function feedWeekly(results) {
  $( "#weekly_feed" ).html( "" );
  results.results.forEach(function(result){
    $( "#weekly_feed" ).append( "<p>" + result.title + " - " +  result.total + "</p>" );
  });
}



var daily_data = [];
var daily_dates = [];

var weekly_data = [];
var weekly_dates = [];

getDailyData();
getWeeklyData();

daily_chart = c3.generate({
  bindto: '#daily_chart',
  padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 50,
    },
    data: {
        x: 'x',
        xFormat: '%Y-%m-%d %H',
        columns: [
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%H'
            }
        },
        y: {
         min: 0,
         padding: {top: 20, bottom: 20}
        }

    }
});

weekly_chart = c3.generate({
  bindto: '#weekly_chart',
  padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 50,
    },
    data: {
        x: 'x',
        xFormat: '%Y-%m-%d',
        columns: [
        ]
    },
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%d'
            }
        },
        y: {
         min: 0,
         padding: {top: 20, bottom: 20}
        }

    }
});


setInterval(function () {
    getDailyData();
    getWeeklyData();

}, 5000);

function getDailyData() {

  $.ajax({
    dataType: "json",
    url: "/data/daily",
    success: function(result){
      data = result;
      parseDailyData(data);
    }
  });
}

function getWeeklyData() {

  $.ajax({
    dataType: "json",
    url: "/data/weekly",
    success: function(result){
      data = result;
      parseWeeklyData(data);
    }
  });

}

function parseDailyData(data) {

  daily_data = [];
  daily_dates = [];

  data.forEach(function(d){
    daily_dates.push(d["d"]);
    daily_data.push(d["total"]);
  });
  daily_dates.unshift("x");
  daily_data.unshift("data_1");

  daily_chart.load({
      columns: [
          daily_dates, daily_data
      ]
  });

}

function parseWeeklyData(data) {

  weekly_data = [];
  weekly_dates = [];

  data.forEach(function(d){
    weekly_dates.push(d["d"]);
    weekly_data.push(d["total"]);
  });
  weekly_dates.unshift("x");
  weekly_data.unshift("data_1");

  weekly_chart.load({
      columns: [
          weekly_dates, weekly_data
      ]
  });

}
