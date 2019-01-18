function getPageEdits(title) {
  feed_active = false;
  getPageData(title);
}

//This will break if titles contain certain characters. For the most part Wikipedia doesn't all this, but from searching the DB I know some do contain charcters which aren't URL safe.
function getPageData(title) {

  $.ajax({
    dataType: "json",
    url: main_url + "/data/page?title=" + title,
    success: function(result){
      parsePageData(result);
    }
  });

}

function parsePageData(data) {
  $( "#wiki_feed" ).html("");
  $( "#wiki_feed" ).append("<div id='back'><a href='#' onClick='returnLive()'>Return to live feed</a></div>");
  $( "#wiki_feed" ).append("<h2>Recent changes to:</h2><h2><a href='"+data[0].uri+"'>"+data[0].title+"</a></h2>");

  data.forEach(function(d){
    if(d.size > 0) {size_symbol = "▲"; size_class="pos"} else {size_symbol = "▼"; size_class="neg"}
    if(d.bot == true){bot_symbol = " <i class='fas fa-robot'></i>";} else {bot_symbol = "";}
    user_colour = intToRGB(hashCode(d.user));
    text_colour = getColorByBgColor(user_colour);
    comment = "";
    if(d.comment){comment = "<p><b>Comment: </b>"+d.comment+"</p>"}

    $( "#wiki_feed").append("<div class='page_box'><p><b>"+ new Date(d.timestamp*1000) + "</b></p><p><span class='feed_badge user_badge' style='color: "+text_colour+"; background-color: #"+user_colour+"'>User:</b> "+d.user+"  "+bot_symbol+"</span><span class='feed_badge "+size_class+"'>" + size_symbol + d.size + " bytes</span></p>"+comment+"</div>");
  });

}

function returnLive() {
  $( "#wiki_feed" ).html("");
  feed_active = true;
}
