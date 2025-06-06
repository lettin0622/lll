// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let catImg, fishImg;
let fishes = [];
let gameClear = false;

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
  catImg = loadImage('cat.png');
  fishImg = loadImage('fish.png');
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);

  // 初始化兩隻魚的位置與速度
  for (let i = 0; i < 2; i++) {
    fishes.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.2, height * 0.8),
      w: 60, // 魚的寬度
      h: 40, // 魚的高度
      vx: random([-1, 1]) * random(0.5, 1),
      vy: random([-1, 1]) * random(0.5, 1)
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定淺藍色底色
  background(180, 220, 255);

  // 畫面最上方加標題
  textAlign(CENTER, TOP);
  textSize(32);
  fill(0, 60, 120);
  text('ＴＫＵＥＴ小測驗', width / 2, 20);

  // 計算標題高度與間距
  let titleH = 32 + 20; // 字高+間距

  // 計算視訊顯示區域（約視窗 70%，置中，且不與標題碰撞）
  let vidW = width * 0.7;
  let vidH = video.height * (vidW / video.width);
  if (vidH > height - titleH - 40) {
    vidH = height - titleH - 40;
    vidW = video.width * (vidH / video.height);
  }
  let vidX = (width - vidW) / 2;
  let vidY = titleH + ((height - titleH) - vidH) / 2;

  image(video, vidX, vidY, vidW, vidH);

  // 更新並顯示魚
  for (let fish of fishes) {
    // 移動
    fish.x += fish.vx;
    fish.y += fish.vy;
    // 邊界反彈
    if (fish.x < 0 || fish.x > width - fish.w) fish.vx *= -1;
    if (fish.y < titleH || fish.y > height - fish.h) fish.vy *= -1;
    // 顯示
    image(fishImg, fish.x, fish.y, fish.w, fish.h);
  }

  let catX = null, catY = null, catW = 80, catH = 80;

  // 只顯示兩隻手的食指指尖，並將cat.png跟著其中一隻手的食指
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1 && hand.keypoints.length > 8) {
        let indexTip = hand.keypoints[8];
        // 依照縮放後的座標
        let x = map(indexTip.x, 0, video.width, vidX, vidX + vidW);
        let y = map(indexTip.y, 0, video.height, vidY, vidY + vidH);

        // 只跟著第一隻手的食指顯示cat.png
        if (catX === null && catY === null) {
          catX = x - catW / 2;
          catY = y - catH / 2;
          image(catImg, catX, catY, catW, catH);
        }
      }
    }
  }

  // 判斷cat.png是否碰到任一fish.png
  if (catX !== null && catY !== null && !gameClear) {
    for (let fish of fishes) {
      if (
        catX < fish.x + fish.w &&
        catX + catW > fish.x &&
        catY < fish.y + fish.h &&
        catY + catH > fish.y
      ) {
        gameClear = true;
      }
    }
  }

  // 顯示過關訊息
  if (gameClear) {
    fill(255, 100, 0);
    textSize(48);
    text('過關！', width / 2, height / 2);
  }
}