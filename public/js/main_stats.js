spark_width = document.getElementById("epd_chart").offsetWidth;
guage_width = document.getElementById("epm_div").offsetWidth;

spark = c3.generate({
  bindto: '#epd_chart',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  data: {
    x: 'x',
    xFormat: '%Y-%m-%d %H:%M',
    columns: [
    ]
  },
  types: {
    edits: 'area',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%M',
        count: 5,
      },
      show: false,
    },
    y: {
      min: 0,
      padding: {top: 0, bottom: 0},
      show: false,
    }

  },
  point: {
    show: false
  },
  tooltip:{show:false},
  legend:{show:false},
  size: {height:80, width:spark_width},
});

size_spark = c3.generate({
  bindto: '#size_spark',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  data: {
    x: 'x',
    xFormat: '%Y-%m-%d %H:%M',
    columns: [
    ]
  },
  types: {
    edits: 'area',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: {
        format: '%M',
        count: 5,
      },
      show: false,
    },
    y: {
      padding: {top: 0, bottom: 0},
      show: false,
    }

  },
  point: {
    show: false
  },
  tooltip:{show:false},
  legend:{show:false},
  size: {height:60, width:spark_width},
});

var epm_guage = c3.generate({
  bindto: '#epm_guage',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  data: {
    columns: [
      ['data', 91.4]
    ],
    type: 'gauge',
  },
  gauge: {
    label: {
      format: function(value, ratio) {
        return value;
      },
      show: false // to turn off the min/max labels.
    },
    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
    max: 150, // 100 is default
    width: 30 // for adjusting arc thickness
  },
  color: {
    pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
    threshold: {
      values: [40, 60, 100, 130]
    }
  },
  legend:{show:false},
  tooltip:{show:false},
  size: {
    height: 115,
    width: guage_width
  },
});

setInterval(function () {
  getStats();
}, 1000);

getStats();
function getStats() {

  $.ajax({
    dataType: "json",
    url: main_url + "/data/stats",
    success: function(result){
      parseStats(result);
    }
  });
}

var last_epm = 0;
function parseStats(results) {
  $( "#epd" ).html(results.hourly_count);

  total_size = ( results.pos_count + Math.abs(results.neg_count) ) / 1000000 + "MB";
  $( "#total_size" ).text(total_size);

  $( "#neg_text" ).text( Math.round( (results.neg_count*100)/1000000 )/100 + "MB" );
  $( "#pos_text" ).text( Math.round( (results.pos_count*100)/1000000 )/100 + "MB" );
  neg_perc = Math.round((Math.abs(results.neg_count)/( Math.abs(results.neg_count) + results.pos_count))*100) + "%";
  pos_perc = Math.round((Math.abs(results.pos_count)/( Math.abs(results.neg_count) + results.pos_count))*100) + "%";
  $( "#neg_bar" ).css( "width", neg_perc);
  $( "#pos_bar" ).css( "width", pos_perc);

  parseSizeData(results.pos_data, results.neg_data);

  parseEpm(results.epm);
  last_epm = results.epm;

  parseHourlyData(results.hourly_data);

}

function parseHourlyData(data) {
  hourly_data = [];
  hourly_dates = [];

  data.forEach(function(d, i){
    if(i>0) {
      hourly_dates.push(d["d"]);
      hourly_data.push(d["total"]);
    }
  });
  hourly_dates.unshift("x");
  hourly_data.unshift("edits");

  spark.load({
    columns: [
      hourly_dates, hourly_data
    ],
    types: {
      edits: 'area',
    },
  });
}

function parseSizeData(pos_d, neg_d) {
  pos_data = [];
  neg_data = [];
  dates = [];

  pos_d.forEach(function(d, i){
    if(i>0) {
      dates.push(d["d"]);
      pos_data.push(d["total"]);
    }
  });
  dates.unshift("x");
  pos_data.unshift("edits");

  neg_d.forEach(function(d, i){
    if(i>0) {
      neg_data.push(d["total"]);
    }
  });
  neg_data.unshift("edits_2");

  size_spark.load({
    columns: [
      dates, pos_data, neg_data
    ],
    types: {
      edits: 'area',
      edits_2: 'area',
    }
  });
}

function parseEpm(data) {
  epm_data = [];
  epm_data.push(data);
  epm_data.unshift("data");

  if(data != last_epm) {
    epm_guage.load({
      columns: [
        epm_data
      ]
    });
  }
}
