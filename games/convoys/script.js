const playButton = document.getElementById("play-button");
const options = document.querySelectorAll(".option");
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const endScreen = document.getElementById("end-screen");
const scoreDisplay = document.getElementById("score");
const endMessage = document.getElementById("end-message");
const restartButton = document.getElementById("restart-button");
const returnbutton = document.getElementById("return-home-btn");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridSize = 40;  // Size of each grid cell
const rows = Math.floor(canvas.height / gridSize);
const cols = Math.floor(canvas.width / gridSize);

let snake = [];
let fruit = {};
let gameOver = false;
let snakeDirection = 'right';
let nextDirection = 'right';  // Used for smooth movement
let gameSpeed = 100;  // milliseconds per frame (speed of the game)
let snakeLength = 1;
let moveInterval = null;
let segmentDirection = [];  // Tracks the direction of each snake segment
let fruitImage = null;

// Initialize the snake and fruit positions
function initGame() {
    snake = [{ x: 10, y: 10 }];
    segmentDirection = [{ direction: 'right' }];
    snakeLength = 1;
    nextDirection = 'right';  // Reset next direction for smooth movement
    generateFruit();
    gameOver = false;
    updateScore();
    if (moveInterval) clearInterval(moveInterval);  // Clear previous intervals
    moveInterval = setInterval(gameLoop, gameSpeed);
}

// Handle game options
options.forEach(option => {
    option.addEventListener("click", () => {
        snakeLength = parseInt(option.dataset.length);
        initGame();
    });
});

// Play button
playButton.addEventListener("click", () => {
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    initGame();
    returnbutton.classList.add("hidden");
});

// Keyboard controls
window.addEventListener("keydown", (e) => {
    if (e.key === 'ArrowUp' && snakeDirection !== 'down') nextDirection = 'up';
    if (e.key === 'ArrowDown' && snakeDirection !== 'up') nextDirection = 'down';
    if (e.key === 'ArrowLeft' && snakeDirection !== 'right') nextDirection = 'left';
    if (e.key === 'ArrowRight' && snakeDirection !== 'left') nextDirection = 'right';
});


// Draw the snake
function drawSnake() {
    snake.forEach((segment, index) => {
        const img = new Image();
        const angle = directionAngle(segmentDirection[index].direction);
        img.src = "assets/ship_0.png";  // Use the same image for all segments

        ctx.save();
        ctx.translate(segment.x * gridSize + gridSize / 2, segment.y * gridSize + gridSize / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
        ctx.restore();
    });
}


let fruitScale = 1.5;          // Current scale factor for the fruit
let scaleDirection = 0.5;   // How much the scale changes per frame

// Generate a new fruit aligned to the grid
function generateFruit() {
    fruit = {
        x: Math.floor(Math.random() * cols),
        y: Math.floor(Math.random() * rows)
    };
    fruitImage = null; // Reset fruit image so it gets a new one next time
    fruitScale = 1;    // Reset scale when a new fruit spawns
}

let fruitPulseTime = 0; // Keeps track of time for the sine wave animation
const pulseSpeed = .5; // Speed of the pulsing effect (higher = faster)
const minScale = 1;   // Minimum scale size for the fruit
const maxScale = 2;   // Maximum scale size for the fruit

// Draw the fruit with pulsing animation
function drawFruit() {
    const img = new Image();
    if (!fruitImage) {
        fruitImage = `assets/ship_${Math.floor(Math.random() * 5) + 1}.png`; // Random ship image for fruit
    }
    img.src = fruitImage;

    // Calculate scale factor using sine wave for ease-in/out effect
    fruitPulseTime += pulseSpeed;
    const sineValue = (Math.sin(fruitPulseTime) + 1) / 2; // Oscillates between 0 and 1
    const fruitScale = minScale + sineValue * (maxScale - minScale); // Map to min/max scale

    // Calculate size and position based on scale
    const size = gridSize * fruitScale;
    const offsetX = fruit.x * gridSize + gridSize / 2 - size / 2;
    const offsetY = fruit.y * gridSize + gridSize / 2 - size / 2;

    ctx.drawImage(img, offsetX, offsetY, size, size);
}


// Update the score display
function updateScore() {
    scoreDisplay.textContent = snakeLength-1;
}

// Check for collisions
function checkCollisions() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameOver = true;
    }

    // Self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
        }
    }
}

function updateGame() {
    const head = { ...snake[0] };

    // Move the head based on the next direction
    if (nextDirection === 'up') head.y--;
    if (nextDirection === 'down') head.y++;
    if (nextDirection === 'left') head.x--;
    if (nextDirection === 'right') head.x++;

    // Add the new head to the snake
    snake.unshift(head);
    segmentDirection.unshift({ direction: nextDirection });

    // Update the current direction
    snakeDirection = nextDirection;

    // Check if the snake eats the fruit
    if (head.x === fruit.x && head.y === fruit.y) {
        snakeLength++; // Increase snake length
        generateFruit();
        updateScore();
    } else {
        // If no fruit is eaten, remove the tail
        snake.pop();
        segmentDirection.pop();
    }

    checkCollisions();
}


function growTail() {
    const tail = snake[snake.length - 1]; // Get the current tail segment
    const tailDirection = segmentDirection[segmentDirection.length - 1].direction;

    // Determine the position for the new segment based on the tail's direction
    let newSegment = { ...tail };
    if (tailDirection === 'up') newSegment.y++;
    if (tailDirection === 'down') newSegment.y--;
    if (tailDirection === 'left') newSegment.x++;
    if (tailDirection === 'right') newSegment.x--;

    // Add the new segment and its direction
    snake.push(newSegment);
    segmentDirection.push({ direction: tailDirection });
}


function gameLoop() {
    if (gameOver) {
        endMessage.textContent = `Game Over! Score: ${snakeLength - 1}`;
        endScreen.classList.remove("hidden");
        gameScreen.classList.add("hidden");
        returnbutton.classList.remove("hidden");
        clearInterval(moveInterval);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas
    updateGame();
    drawSnake();
    drawFruit();
}


// Restart the game
restartButton.addEventListener("click", () => {
    endScreen.classList.add("hidden");
    mainMenu.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    returnbutton.classList.add("hidden");
    initGame();
});

// Convert direction to rotation angle
function directionAngle(direction) {
    switch (direction) {
        case 'up': return Math.PI;
        case 'down': return 0;
        case 'left': return Math.PI / 2;
        case 'right': return -Math.PI / 2;
    }
}
