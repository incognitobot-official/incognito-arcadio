const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Images
const seaImg = new Image();
seaImg.src = "assets/sea.png";
const playerShipImg = new Image();
playerShipImg.src = "assets/playerShip.png";
const aiShipImgs = [
    "assets/aiship_1.png",
    "assets/aiship_2.png",
    "assets/aiship_3.png",
    "assets/aiship_4.png",
    "assets/aiship_5.png",
].map((src) => {
    const img = new Image();
    img.src = src;
    return img;
});
const heartImg = new Image();
heartImg.src = "assets/heart.png";

// Game variables
let scrollY = 0;
let lives = 3;
let score = 0;
let gameRunning = false;
let aiShips = [];
let shipSpeed = 2; // Start slow
let scrollSpeed = 2; // Start slow
const player = { x: canvas.width / 2 - 50, y: canvas.height - 150, width: 50, height: 80, speed: 7 };

// Event listener for start button
document.getElementById("start-button").addEventListener("click", startGame);

// Start the game
function startGame() {
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("return-home-btn").classList.add("hidden");
    canvas.style.display = "block";
    gameRunning = true;
    score = 0;
    lives = 3;
    aiShips = [];
    shipSpeed = 2; // Reset speed
    scrollSpeed = 2; // Reset speed
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Scroll background
    scrollY += scrollSpeed;
    if (scrollY >= canvas.height) scrollY = 0;

    // Move player
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.width) player.x += player.speed;

    // Spawn AI ships
    if (Math.random() < 0.05) {
        const laneWidth = canvas.width / 5;
        const lane = Math.floor(Math.random() * 5);
        const ship = {
            x: lane * laneWidth + laneWidth / 2 - 25,
            y: -80,
            width: 50,
            height: 80,
            speed: shipSpeed,
            img: aiShipImgs[Math.floor(Math.random() * aiShipImgs.length)],
        };
        aiShips.push(ship);
    }

    // Move AI ships and detect collisions
    aiShips.forEach((ship, index) => {
        ship.y += ship.speed;

        if (
            ship.x < player.x + player.width &&
            ship.x + ship.width > player.x &&
            ship.y < player.y + player.height &&
            ship.y + ship.height > player.y
        ) {
            aiShips.splice(index, 1);
            lives--;
            if (lives <= 0) gameOver();
        }
    });

    aiShips = aiShips.filter((ship) => ship.y < canvas.height);

    // Increase speed every second
    if (Math.floor(score) % 1 === 0) {
        shipSpeed += 0.02;
        scrollSpeed += 0.02;
    }

    // Update score
    score += 1 / 60;
}

// Render game
function render() {
    // Draw scrolling background
    ctx.drawImage(seaImg, 0, scrollY - canvas.height, canvas.width, canvas.height);
    ctx.drawImage(seaImg, 0, scrollY, canvas.width, canvas.height);

    // Draw player ship
    ctx.drawImage(playerShipImg, player.x, player.y, player.width, player.height);

    // Draw AI ships
    aiShips.forEach((ship) => ctx.drawImage(ship.img, ship.x, ship.y, ship.width, ship.height));

    // Draw score
    ctx.fillStyle = "white";
    ctx.font = "20px Pixel";
    ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width - 200, 30);

    // Draw lives
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heartImg, 10 + i * 50, 10, 40, 40);
    }
}

// Handle keyboard input
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById("final-score").textContent = Math.floor(score);
    document.getElementById("end-screen").classList.remove("hidden");
    document.getElementById("return-home-btn").classList.remove("hidden");
}
