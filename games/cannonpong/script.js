const playButton = document.getElementById("play-button");
const options = document.querySelectorAll(".option");
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const scoreDisplay = document.getElementById("score");
const endMessage = document.getElementById("end-message");
const restartButton = document.getElementById("restart-button");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const returnbutton = document.getElementById("return-home-btn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRounds = 3; // Default rounds
let leftScore = 0;
let rightScore = 0;
let ball, leftShip, rightShip;
let ballSpeed = { x: 6, y: 4 };
let gameOver = false;
let keys = {};

// Ball and paddle initialization
function initGame() {
    ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 10 };
    leftShip = { x: 50, y: canvas.height / 2 - 75, width: 75, height: 150 };
    rightShip = { x: canvas.width - 90, y: canvas.height / 2 - 75, width: 75, height: 150 };
}

// Handle game options
options.forEach(option => {
    option.addEventListener("click", () => {
        const rounds = option.dataset.rounds;
        gameRounds = rounds === "infinite" ? Infinity : parseInt(rounds);
    });
});

// Play button
playButton.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initGame();
    gameLoop();
    returnbutton.classList.add("hidden");
});

// Keyboard controls
window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

function drawBall() {
    const img = new Image();
    img.src = "assets/cannonball.png";
    ctx.drawImage(img, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
}

function drawPaddle(ship, imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    ctx.drawImage(img, ship.x, ship.y, ship.width, ship.height - 20);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle(leftShip, "assets/ship_left.png");
    drawPaddle(rightShip, "assets/ship_right.png");
}

const paddleSpeed = 3;
const ballSpeedIncrement = 0.2

let ballSpeedX = 4;  // Initial ball speed in the x direction
let ballSpeedY = 4;  // Initial ball speed in the y direction

function update() {
    ball.x += ballSpeedX;
    ball.y += ballSpeedY;

    // Ball collision with walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ballSpeedY *= -1;  // Reverse ball's vertical direction
    }

    // Ball collision with left paddle
    if (ball.x - ball.radius <= leftShip.x + leftShip.width &&
        ball.y >= leftShip.y && ball.y <= leftShip.y + leftShip.height) {
        ball.x = leftShip.x + leftShip.width + ball.radius;  // Push ball away from paddle
        ballSpeedX *= -1;  // Reverse ball's horizontal direction
        increaseBallSpeed();  // Increment ball speed
    }

    // Ball collision with right paddle
    if (ball.x + ball.radius >= rightShip.x &&
        ball.y >= rightShip.y && ball.y <= rightShip.y + rightShip.height) {
        ball.x = rightShip.x - ball.radius;  // Push ball away from paddle
        ballSpeedX *= -1;  // Reverse ball's horizontal direction
        increaseBallSpeed();  // Increment ball speed
    }

    // Player controls for left paddle
    if (keys.ArrowUp && leftShip.y > 0) {
        leftShip.y -= paddleSpeed;
    }

    if (keys.ArrowDown && leftShip.y < canvas.height - leftShip.height) {
        leftShip.y += paddleSpeed;
    }

    // AI for right paddle
    if (rightShip.y + rightShip.height / 2 < ball.y) rightShip.y += paddleSpeed;
    else rightShip.y -= paddleSpeed;

    // Scoring logic
    if (ball.x - ball.radius <= 0) {
        rightScore++;
        resetBall();
    }

    if (ball.x + ball.radius >= canvas.width) {
        leftScore++;
        resetBall();
    }

    scoreDisplay.textContent = `${leftScore} : ${rightScore}`;

    if (leftScore === gameRounds || rightScore === gameRounds) {
        gameOver = true;
        endGame();
    }
}

// Increase ball speed incrementally after each collision with paddle
function increaseBallSpeed() {
    ballSpeedX += (ballSpeedX > 0 ? ballSpeedIncrement : -ballSpeedIncrement);
    ballSpeedY += (ballSpeedY > 0 ? ballSpeedIncrement : -ballSpeedIncrement);
}

// Reset ball to center and reset speed
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ballSpeedX = 4 * (Math.random() > 0.5 ? 1 : -1);  // Random direction
    ballSpeedY = 4 * (Math.random() > 0.5 ? 1 : -1);  // Random direction
}



function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

function endGame() {
    gameScreen.classList.add("hidden");
    endScreen.classList.remove("hidden");
    returnbutton.classList.remove("hidden");
    endMessage.textContent = leftScore > rightScore ? "You Win!" : "You Lose!";
}

// Restart button
restartButton.addEventListener("click", () => {
    location.reload();
});
