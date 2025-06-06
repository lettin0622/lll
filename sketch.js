// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let catImg, fishImg;
let fishes = [];
let gameClear = false;
let correctFishIndex = 1; // 0:文學院, 1:教育學院
let score = false;

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
      w: 50, // 魚的寬度（小一點）
      h: 32, // 魚的高度（小一點）
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
  textSize(20);
  for (let i = 0; i < fishes.length; i++) {
    let fish = fishes[i];
    // 移動
    fish.x += fish.vx;
    fish.y += fish.vy;
    // 邊界反彈
    if (fish.x < 0 || fish.x > width - fish.w) fish.vx *= -1;
    if (fish.y < titleH || fish.y > height - fish.h) fish.vy *= -1;
    // 顯示
    image(fishImg, fish.x, fish.y, fish.w, fish.h);

    // 在魚頭上加標籤
    fill(255);
    stroke(0);
    strokeWeight(2);
    let label = i === 0 ? "文學院" : "教育學院";
    textAlign(CENTER, BOTTOM);
    text(label, fish.x + fish.w / 2, fish.y - 5);
    noStroke();
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

          // 在貓頭上方顯示題目
          fill(0);
          noStroke();
          textSize(24);
          textAlign(CENTER, BOTTOM);
          text("淡江教科系隸屬?", x, catY - 10);
        }
      }
    }
  }

  // 判斷cat.png是否碰到正確的fish.png
  if (catX !== null && catY !== null && !score) {
    for (let i = 0; i < fishes.length; i++) {
      let fish = fishes[i];
      if (
        catX < fish.x + fish.w &&
        catX + catW > fish.x &&
        catY < fish.y + fish.h &&
        catY + catH > fish.y
      ) {
        if (i === correctFishIndex) {
          score = true;
        }
      }
    }
  }

  // 顯示過關訊息與笑臉
  if (score) {
    fill(255, 200, 0);
    textSize(48);
    text('答對！', width / 2, height / 2);

    // 畫一個簡單的笑臉
    let faceX = width / 2;
    let faceY = height / 2 + 80;
    let r = 60;
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(3);
    ellipse(faceX, faceY, r * 2, r * 2);
    // 眼睛
    fill(0);
    noStroke();
    ellipse(faceX - 20, faceY - 15, 12, 12);
    ellipse(faceX + 20, faceY - 15, 12, 12);
    // 微笑
    noFill();
    stroke(0);
    strokeWeight(4);
    arc(faceX, faceY + 10, 50, 30, 0, PI);
  }
}
