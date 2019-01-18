var weekly_data = [];
var weekly_dates = [];
var weekly_table_type = "no";

function getWeeklyTable() {

  $.ajax({
    dataType: "json",
    url: main_url + "/table/weekly",
    success: function(result){
      parseWeeklyTable(result);
    }
  });
}

function parseWeeklyTable(results) {

  if(weekly_table_type == "no") {
    $( "#weekly_feed" ).html( "" );
    results.no.forEach(function(result){
      $( "#weekly_feed" ).append( "<tr><td><a href=" + result.uri + ">" + result.title + "</a></td><td class='centered'>" +  result.total + "</td></tr>" );
    });
  }
  else {
    $( "#weekly_feed" ).html( "" );
    results.size.forEach(function(result){
      $( "#weekly_feed" ).append( "<tr><td><a href=" + result.uri + ">" + result.title + "</a></td><td class='centered'>" +  result.total + "B</td></tr>" );
    });
  }

}

function getWeeklyData() {

  $.ajax({
    dataType: "json",
    url: main_url + "/data/weekly",
    success: function(result){
      parseWeeklyData(result);
    }
  });

}

function parseWeeklyData(data) {

  weekly_data = [];
  weekly_dates = [];

  data[weekly_table_type].forEach(function(d){
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

function weeklyTableSwitch(type) {
  weekly_table_type = type;
  getWeeklyTable();
  getWeeklyData();

  if(type=="no"){
    $("#tab_weekly_size").removeClass("active");
    $("#tab_weekly_no").addClass("active");
    $("#weekly_chart_title").text("Number of edits per day in the last week:");
  }
  else {
    $("#tab_weekly_no").removeClass("active");
    $("#tab_weekly_size").addClass("active");
    $("#weekly_chart_title").text("Size of edits, in bytes, per day in the last week:");
  }

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
      padding: {top: 5, bottom: 0}
    }

  },
  legend: {show: false},
  point: { show: false },
  tooltip: {show: false},
});
