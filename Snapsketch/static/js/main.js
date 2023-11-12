var colorStr = document.getElementById("color");
var drawColor = colorStr.value;//ペンの色
console.log('+'+drawColor);

//キャンバスの設定
function setup() {
 canvas = createCanvas(1344, 700);//Canvasを作成
 background(255); //Canvasの背景を白にする
//  clearButton = createButton('消す');//ボタンを作成
//  clearButton.mousePressed(clearCanvas);//ボタンクリックの関数を指定
}

//マウスで絵を描くための関数
function draw() {
  console.log("draw()");
  console.log(mouseIsPressed);
  
   if (mouseIsPressed) {
     stroke(drawColor);//色
     strokeWeight(18);//線の太さ
     line(mouseX, mouseY, pmouseX, pmouseY);
   }
}

function colorChange(colorCode){
  drawColor = colorCode;
}

 //消しゴムツール
 function kesigomu(){
  drawColor = "#ffffff";
 }

// canvasを画像で保存
$("#download").click(function(){
  var canvas = document.getElementById('canvas');
  var base64 = canvas.toDataURL("image/jpeg");
  document.getElementById("download").href = base64;
});

function setBgColor(){
  // canvasの背景色を設定(指定がない場合にjpeg保存すると背景が黒になる)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0,0,cnvWidth,cnvHeight);
}

function colorChange(colorCode){
  drawColor = colorCode;
}

 //消しゴムツール
 function eraser(){
  drawColor = "#ffffff";
 }

//絵を全て消すボタンの動作
function clearCanvas() {
  background(255);
 }

