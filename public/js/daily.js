var daily_data = [];
var daily_dates = [];
var daily_table_type = "no";

function getDailyTable() {

  $.ajax({
    dataType: "json",
    url: main_url + "/table/daily",
    success: function(result){
      parseDailyTable(result);
    }
  });
}

function parseDailyTable(results) {

  if(daily_table_type == "no") {
    $( "#daily_feed" ).html( "" );
    results.no.forEach(function(result){
      $( "#daily_feed" ).append( "<tr><td>" + result.title + "</td><td class='centered'>" +  result.total + "</td></tr>" );
    });
  }
  else {
    $( "#daily_feed" ).html( "" );
    results.size.forEach(function(result){
      $( "#daily_feed" ).append( "<tr><td>" + result.title + "</td><td class='centered'>" +  result.total + "B</td></tr>" );
    });
  }

}

function getDailyData() {

  $.ajax({
    dataType: "json",
    url: main_url + "/data/daily",
    success: function(result){
      parseDailyData(result);
    }
  });
}

function parseDailyData(data) {

  daily_data = [];
  daily_dates = [];

  data[daily_table_type].forEach(function(d){
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

function dailyTableSwitch(type) {
  daily_table_type = type;
  getDailyTable();
  getDailyData();

  if(type=="no"){
    $("#tab_daily_size").removeClass("active");
    $("#tab_daily_no").addClass("active");
    $("#daily_chart_title").text("Number of edits per hour last 24 hours:");
  }
  else {
    $("#tab_daily_no").removeClass("active");
    $("#tab_daily_size").addClass("active");
    $("#daily_chart_title").text("Size of edits, in bytes, per hour last 24 hours:");
  }

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
      padding: {top: 5, bottom: 0}
    }

  },
  legend: {show: false},
  point: { show: false },
  tooltip: {show: false},
});
