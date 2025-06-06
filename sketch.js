// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let catImg, fishImg;
let fishes = [];
let score = false;
let wrong = false;

// 題庫
const questions = [
  {
    question: "淡江教科系隸屬?",
    options: ["文學院", "教育學院"],
    answer: 1 // 教育學院
  },
  {
    question: "淡江大學的全名是?",
    options: ["淡江大學學校財團法人淡江大學", "淡江大學校"],
    answer: 0 // 回答一
  }
];

let currentQuestion = 0;

// 狀態控制
let gameState = "intro"; // intro, countdown, play
let countdownStart = 0;
let countdownNum = 3;

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
  initFishes();

  // 狀態初始化
  gameState = "intro";
  countdownStart = millis();
}

function initFishes() {
  fishes = [];
  for (let i = 0; i < 2; i++) {
    fishes.push({
      x: random(width * 0.1, width * 0.9),
      y: random(height * 0.2, height * 0.8),
      w: 120,
      h: 80,
      vx: random([-1, 1]) * random(0.5, 1),
      vy: random([-1, 1]) * random(0.5, 1)
    });
  }
  score = false;
  wrong = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // 設定淺藍色底色
  background(180, 220, 255);

  // 畫面最上方加大標題
  textAlign(CENTER, TOP);
  textSize(56);
  fill(0, 60, 120);
  text('ＴＫＵＥＴ小測驗', width / 2, 30);

  // 狀態：intro
  if (gameState === "intro") {
    textSize(48);
    fill(0);
    text("請讓貓咪吃到正確的魚\n倒數三秒遊戲開始！", width / 2, height / 2 - 40);

    if (millis() - countdownStart > 3000) {
      gameState = "countdown";
      countdownStart = millis();
      countdownNum = 3;
    }
    return;
  }

  // 狀態：countdown
  if (gameState === "countdown") {
    let elapsed = millis() - countdownStart;
    let num = 3 - floor(elapsed / 1000);
    if (num !== countdownNum) {
      countdownNum = num;
    }
    if (num > 0) {
      textSize(120);
      fill(255, 100, 0);
      text(num, width / 2, height / 2);
    } else {
      gameState = "play";
      score = false;
      wrong = false;
      initFishes();
    }
    return;
  }

  // --- 遊戲主畫面 ---
  let titleH = 56 + 30;

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
  textSize(40);
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

    // 在魚頭上加大標籤
    fill(255);
    stroke(0);
    strokeWeight(4);
    let label = questions[currentQuestion].options[i];
    textAlign(CENTER, BOTTOM);
    text(label, fish.x + fish.w / 2, fish.y - 10);
    noStroke();
  }

  let catX = null, catY = null, catW = 160, catH = 160;

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

          // 在貓頭上方顯示大題目
          fill(0);
          noStroke();
          textSize(36);
          textAlign(CENTER, BOTTOM);
          text(questions[currentQuestion].question, x, catY - 20);
        }
      }
    }
  }

  // 判斷cat.png是否碰到正確或錯誤的fish.png
  if (catX !== null && catY !== null && !score) {
    for (let i = 0; i < fishes.length; i++) {
      let fish = fishes[i];
      if (
        catX < fish.x + fish.w &&
        catX + catW > fish.x &&
        catY < fish.y + fish.h &&
        catY + catH > fish.y
      ) {
        if (i === questions[currentQuestion].answer) {
          score = true;
          wrong = false;
          setTimeout(() => {
            currentQuestion++;
            if (currentQuestion >= questions.length) {
              currentQuestion = 0; // 或可改為結束
            }
            initFishes();
            gameState = "intro";
            countdownStart = millis();
          }, 1500);
        } else {
          wrong = true;
        }
      }
    }
  }

  // 顯示過關訊息與笑臉
  if (score) {
    fill(255, 200, 0);
    textSize(64);
    text('答對！', width / 2, height / 2);

    // 畫一個大笑臉
    let faceX = width / 2;
    let faceY = height / 2 + 100;
    let r = 90;
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(5);
    ellipse(faceX, faceY, r * 2, r * 2);
    // 眼睛
    fill(0);
    noStroke();
    ellipse(faceX - 30, faceY - 25, 20, 20);
    ellipse(faceX + 30, faceY - 25, 20, 20);
    // 微笑
    noFill();
    stroke(0);
    strokeWeight(7);
    arc(faceX, faceY + 20, 80, 50, 0, PI);
  } else if (wrong) {
    fill(255, 100, 100);
    textSize(64);
    text('答錯了！', width / 2, height / 2);

    // 畫一個大哭臉
    let faceX = width / 2;
    let faceY = height / 2 + 100;
    let r = 90;
    fill(255, 255, 0);
    stroke(0);
    strokeWeight(5);
    ellipse(faceX, faceY, r * 2, r * 2);
    // 眼睛
    fill(0);
    noStroke();
    ellipse(faceX - 30, faceY - 25, 20, 20);
    ellipse(faceX + 30, faceY - 25, 20, 20);
    // 哭臉
    noFill();
    stroke(0);
    strokeWeight(7);
    arc(faceX, faceY + 50, 80, 50, PI, 0);
    // 淚水
    stroke(0, 180, 255);
    strokeWeight(6);
    line(faceX - 30, faceY - 10, faceX - 30, faceY + 20);
    line(faceX + 30, faceY - 10, faceX + 30, faceY + 20);
  }
}
