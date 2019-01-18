var weekly_data = [];
var weekly_dates = [];

function getWeeklyTable() {

  $.ajax({
    dataType: "json",
    url: "/table/weekly",
    success: function(result){
      parseWeeklyTable(result);
    }
  });
}

function parseWeeklyTable(results) {
  $( "#weekly_feed" ).html( "" );
  results.forEach(function(result){
    $( "#weekly_feed" ).append( "<tr><td>" + result.title + "</td><td>" +  result.total + "</td></tr>" );
  });
}

function getWeeklyData() {

  $.ajax({
    dataType: "json",
    url: "/data/weekly",
    success: function(result){
      parseWeeklyData(result);
    }
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
  weekly_data.unshift("edits");

  weekly_chart.load({
    columns: [
      weekly_dates, weekly_data
    ],
    types: {
      edits: 'area',
    }
  });

}

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
