var daily_data = [];
var daily_dates = [];

function getDailyTable() {

  $.ajax({
    dataType: "json",
    url: "/table/daily",
    success: function(result){
      parseDailyTable(result);
    }
  });
}

function parseDailyTable(results) {
  $( "#daily_feed" ).html( "" );
  results.forEach(function(result){
    $( "#daily_feed" ).append( "<tr><td>" + result.title + "</td><td>" +  result.total + "</td></tr>" );
  });
}

function getDailyData() {

  $.ajax({
    dataType: "json",
    url: "/data/daily",
    success: function(result){
      parseDailyData(result);
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
  daily_data.unshift("edits");

  daily_chart.load({
    columns: [
      daily_dates, daily_data
    ],
    types: {
      edits: 'area',
    }
  });

}

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
      },
      padding: {left: 0, right: 5}
    },
    y: {
      min: 0,
      padding: {top: 5, bottom: 0}
    }

  },
  point: {
    show: true
  }
});
