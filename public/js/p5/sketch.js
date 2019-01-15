var points = [];

function setup() {
  //var width = window.innerWidth;
  var width = document.getElementById("sketch_holder").offsetWidth
  var height = window.innerHeight / 2;

  frameRate(30);

  var canvas = createCanvas(width, height);
  canvas.parent('sketch_holder');

}

function draw() {

  background(255);

  strokeWeight(10);
  stroke(0);

  points.forEach(function(point, index){
    point.draw();

    if(mouseX > point.bx && mouseX < point.bxe && mouseY > point.by && mouseY < point.bye) {
      // document.body.style.cursor = "pointer";
      point.mouse_over = true;
    }
    else {point.mouse_over = false;}

  });

}

function mousePressed() {
  points.forEach(function(point, index){

    if(mouseX > point.bx && mouseX < point.bxe && mouseY > point.by && mouseY < point.bye) {
      console.log(point.title);
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
  constructor(time, size, title, index) {
    this.x = time + 300 + (width/2);
    this.y = index * 40;
    this.size = 15;
    this.lifetime = 300;
    this.title = title;

    noStroke();
    textSize(17);
    fill(0, this.lifetime);

    this.tw = textWidth(this.title);
    this.total_length = this.size + this.tw;

    this.mouse_over = false;
  }

  draw() {

    strokeWeight(3);
    stroke(0, this.lifetime);
    fill(255);
    ellipse(this.x, this.y, 10, 10);

    noStroke();
    textSize(17);
    fill(0, this.lifetime);
    if(this.mouse_over) { fill(255,0,0, this.lifetime); }
    text(this.title, this.x + 10, this.y + 6)

    if(this.mouse_over) {
      stroke(0);
      strokeWeight(5);
      noFill();
      rect(this.bx, this.by, this.total_length + (this.size * 2), this.size*2 );
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

}
