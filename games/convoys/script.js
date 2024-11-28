// Global Variables
let canvas, ctx;
let snake, fruits, score, gameOver;
let direction = 'RIGHT';
let fruitCount = 1;

// Canvas setup
function setupCanvas() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 400;
}

// Start Game with given number of fruits
function startGame(fruitNum) {
    document.getElementById('menu').style.display = 'none';
    document.getElementById('endScreen').style.display = 'none';
    gameOver = false;
    score = 0;
    fruitCount = fruitNum;
    setupCanvas();
    snake = [{ x: 150, y: 150 }];
    fruits = generateFruits(fruitCount);
    document.addEventListener('keydown', changeDirection);
    gameLoop();
}

// Generate fruits (random ships)
function generateFruits(count) {
    let fruitsArray = [];
    for (let i = 0; i < count; i++) {
        let randomX = Math.floor(Math.random() * (canvas.width / 20)) * 20;
        let randomY = Math.floor(Math.random() * (canvas.height / 20)) * 20;
        fruitsArray.push({ x: randomX, y: randomY, img: `ship_${Math.floor(Math.random() * 5) + 1}.png` });
    }
    return fruitsArray;
}

// Game Loop
function gameLoop() {
    if (gameOver) return;

    setTimeout(() => {
        clearCanvas();
        drawSnake();
        drawFruits();
        moveSnake();
        checkCollisions();
        gameLoop();
    }, 100);
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw Snake
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        const part = snake[i];
        const img = new Image();
        img.src = `ship_${i === 0 ? 0 : i}.png`; // Head is ship_0.png, body is ship_{i}
        ctx.drawImage(img, part.x, part.y, 20, 20);
    }
}

// Draw Fruits
function drawFruits() {
    fruits.forEach(fruit => {
        const img = new Image();
        img.src = fruit.img;
        ctx.drawImage(img, fruit.x, fruit.y, 20, 20);
    });
}

// Move Snake
function moveSnake() {
    let head = { ...snake[0] };

    if (direction === 'UP') head.y -= 20;
    if (direction === 'DOWN') head.y += 20;
    if (direction === 'LEFT') head.x -= 20;
    if (direction === 'RIGHT') head.x += 20;

    snake.unshift(head); // Add new head to snake

    // Check if snake eats fruit
    for (let i = 0; i < fruits.length; i++) {
        if (head.x === fruits[i].x && head.y === fruits[i].y) {
            score++;
            fruits.splice(i, 1); // Remove eaten fruit
            fruits = fruits.concat(generateFruits(1)); // Add new fruit
            break;
        }
    }

    // Remove tail unless snake grew
    if (fruits.length < score + fruitCount) {
        snake.pop();
    }

    document.getElementById('score').textContent = `Score: ${score}`;
}

// Change Direction
function changeDirection(e) {
    if (e.key === 'ArrowUp' && direction !== 'DOWN') direction = 'UP';
    if (e.key === 'ArrowDown' && direction !== 'UP') direction = 'DOWN';
    if (e.key === 'ArrowLeft' && direction !== 'RIGHT') direction = 'LEFT';
    if (e.key === 'ArrowRight' && direction !== 'LEFT') direction = 'RIGHT';
}

// Check for Collisions
function checkCollisions() {
    const head = snake[0];

    // Collide with walls
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        gameOverScreen();
    }

    // Collide with self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOverScreen();
        }
    }
}

// Game Over
function gameOverScreen() {
    gameOver = true;
    document.getElementById('endScreen').style.display = 'block';
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Return to Menu
function returnToMenu() {
    document.getElementById('menu').style.display = 'block';
    document.getElementById('endScreen').style.display = 'none';
}
