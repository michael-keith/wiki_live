var frame_rate = 30;

var points = [];

function setup() {
  //var width = window.innerWidth;
  var width = document.getElementById("sketch_holder").offsetWidth - 40;
  var height = window.innerHeight / 2;

  frameRate(frame_rate);

  var canvas = createCanvas(width, height);
  canvas.parent('sketch_holder');

}

function windowResized() {
  var width = document.getElementById("sketch_holder").offsetWidth - 40;
  var height = window.innerHeight / 2;
  resizeCanvas(width, height);
}

function draw() {

  background(240,243,246);
  //background(255);

  strokeWeight(10);
  stroke(0);

  points.forEach(function(point, index){
    point.draw();

    if(mouseX > point.bx && mouseX < point.bxe && mouseY > point.by && mouseY < point.bye) {
      point.mouse_over = true;
      // point.mouseOver();
    }
    else {point.mouse_over = false;}

  });

}

function mousePressed() {
  points.forEach(function(point, index){

    if(mouseX > point.bx && mouseX < point.bxe && mouseY > point.by && mouseY < point.bye) {
      getPageEdits(point.title);
    }

  });
}

// function mouseMoved() {
//   points.forEach(function(point, index){
//     if(mouseX > point.bx && mouseX < point.bxe && mouseY > point.by && mouseY < point.bye) {
//       // document.body.style.cursor = "pointer";
//       point.mouse_over = true;
//     }
//     else {point.mouse_over = false;}
//   });
// }

class Point {
  constructor(time, size, title, index, user, comment) {
    this.x = time + 300 + (width/2);
    this.y = index * 40;
    this.size = 15;
    this.lifetime = 400;
    this.title = title;

    this.bytes = size;
    if(size > 0) {this.bytes_symbol = "▲";}
    else {this.bytes_symbol = "▼";}
    this.user = user;
    this.user_colour = intToRGB(hashCode(this.user));
    this.comment = comment;

    noStroke();
    textSize(17);
    fill(0, this.lifetime);

    this.tw = textWidth(this.title);
    this.total_length = this.size + this.tw;

    this.mouse_over = false;
  }

  draw() {

    strokeWeight(3);
    stroke("#" + this.user_colour);
    fill("#" + this.user_colour);
    ellipse(this.x, this.y, 10, 10);

    noStroke();
    textSize(17);
    fill(0, this.lifetime);
    if(this.mouse_over) { fill(62,110,176, this.lifetime); }
    text(this.title, this.x + 10, this.y + 6)

    if(this.mouse_over) {
      stroke(0);
      strokeWeight(5);
      noFill();
      // rect(this.bx, this.by, this.total_length + (this.size * 2), this.size*2 );
    }

    this.x -=4;
    this.lifetime -= 1;

    this.calc_bounds();
  }

  calc_bounds() {
    this.bx = this.x - this.size;
    this.bxe = this.x + this.total_length + (this.size * 2);
    this.by = this.y - this.size;
    this.bye = this.by + (this.size*2);
  }

  // mouseOver() {
  //
  //   fill(255,255,255);
  //   strokeWeight(0);
  //   rect(this.bx, this.bye, 450, 100 + textHeight(this.comment));
  //
  //   stroke(0);
  //   fill(0);
  //   text("Size: ", this.bx + 10, this.bye + 25);
  //   text(this.bytes_symbol, this.bx + 63, this.bye + 23);
  //   text(this.bytes + " bytes", this.bx + 85, this.bye + 25);
  //
  //   text("User: ", this.bx + 10, this.by + 80);
  //   fill("#" + this.user_colour);
  //   ellipse(this.bx + 70, this.by + 74, 15, 15);
  //   fill(0);
  //   text(this.user, this.bx + 85, this.by + 80 );
  //
  //   text(this.comment, this.bx + 10, this.by + 100, 440);
  // }

}

// class Line {
//     constructor(id) {
//       this.id = id;
//       this.x = 300 + (width/2);
//     }
//     draw() {
//       stroke(0);
//       strokeWeight(1);
//       line(this.x, 0, this.x, height);
//       console.log(this.index);
//       this.x -= 4;
//     }
//     cull() {
//
//     }
// }
