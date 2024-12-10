const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score-display");
const ship = document.getElementById("ship");
const endScreen = document.getElementById("end-screen");
const returnButton = document.getElementById("return-home-btn");

let cannonballs = [];
let mouseX = null;
let mouseY = null;
let shipX = 0;
let shipY = 0;
let shipAngle = 0;
let score = 0;
let gameInterval;
let spawnInterval;
let difficulty = "easy";

// Difficulty settings
const difficultySettings = {
    easy: { spawnRate: 1500, cannonballSpeed: 3 },
    medium: { spawnRate: 1000, cannonballSpeed: 5 },
    hard: { spawnRate: 750, cannonballSpeed: 7 }
};

// Initialize game options
document.querySelectorAll(".option").forEach(button => {
    button.addEventListener("click", () => {
        difficulty = button.dataset.difficulty;
        startGame();
    });
});

// Start the game
function startGame() {
    mainMenu.classList.add("hidden");
    gameContainer.classList.remove("hidden");
    resetGame();
    spawnInterval = setInterval(spawnCannonball, difficultySettings[difficulty].spawnRate);
    gameInterval = setInterval(updateGame, 16);
    document.addEventListener("mousemove", updateMousePosition);
    returnButton.classList.add("hidden");
}

// Reset the game
function resetGame() {
    cannonballs.forEach(c => c.element.remove());
    cannonballs = [];
    score = 0;

    const rect = gameContainer.getBoundingClientRect();
    shipX = rect.width / 2 - ship.offsetWidth / 2;
    shipY = rect.height / 2 - ship.offsetHeight / 2;
    shipAngle = 0;
    ship.src = 'assets/ship.png'; // Ensure the ship image is reset
    ship.style.left = `${shipX}px`;
    ship.style.top = `${shipY}px`;
    ship.style.width = '60px'; // Reset ship size
    scoreDisplay.textContent = `Score: 0`;
}

// Track the mouse position
function updateMousePosition(event) {
    const rect = gameContainer.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}

// Spawn cannonballs
function spawnCannonball() {
    const cannonball = document.createElement("div");
    cannonball.classList.add("cannonball");

    const rect = gameContainer.getBoundingClientRect();
    const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (side) {
        case 0: // Top
            x = Math.random() * rect.width;
            y = -20;
            break;
        case 1: // Right
            x = rect.width + 20;
            y = Math.random() * rect.height;
            break;
        case 2: // Bottom
            x = Math.random() * rect.width;
            y = rect.height + 20;
            break;
        case 3: // Left
            x = -20;
            y = Math.random() * rect.height;
            break;
    }

    const targetX = shipX + ship.offsetWidth / 2;
    const targetY = shipY + ship.offsetHeight / 2;

    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);
    const speed = difficultySettings[difficulty].cannonballSpeed;

    cannonball.style.left = `${x}px`;
    cannonball.style.top = `${y}px`;
    gameContainer.appendChild(cannonball);

    cannonballs.push({
        element: cannonball,
        x,
        y,
        dx: (dx / distance) * speed,
        dy: (dy / distance) * speed
    });
}

// Update the game state
function updateGame() {
    const rect = gameContainer.getBoundingClientRect();

    // Update ship position with slowing effect as it approaches the mouse
    const maxSpeed = 6;
    const slowDownRadius = 100; // Distance within which the ship slows down
    if (mouseX !== null && mouseY !== null) {
        const deltaX = mouseX - (shipX + ship.offsetWidth / 2);
        const deltaY = mouseY - (shipY + ship.offsetHeight / 2);
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const speed = Math.min(maxSpeed, distance / slowDownRadius * maxSpeed);
        if (distance > 0.5) {
            shipX += (deltaX / distance) * speed;
            shipY += (deltaY / distance) * speed;
        }
    }

    ship.style.left = `${shipX}px`;
    ship.style.top = `${shipY}px`;

    // Instantly rotate the ship to face the mouse
    if (mouseX !== null && mouseY !== null) {
        shipAngle = Math.atan2(
            mouseY - (shipY + ship.offsetHeight / 2),
            mouseX - (shipX + ship.offsetWidth / 2)
        ) - Math.PI / 2;
    }
    ship.style.transform = `rotate(${shipAngle}rad)`;

    // Update cannonball positions
    cannonballs.forEach(c => {
        c.x += c.dx;
        c.y += c.dy;

        c.element.style.left = `${c.x}px`;
        c.element.style.top = `${c.y}px`;

        // Check for collision with the ship
        const rect1 = ship.getBoundingClientRect();
        const rect2 = c.element.getBoundingClientRect();
        if (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        ) {
            ship.src = 'assets/explosion.png'; // Change ship image to explosion on collision
            ship.style.width = '120px'; // Double the size
            ship.style.height = 'auto'; // Maintain aspect ratio
            endGame();
        }
    });

    // Update score
    score += 1 / 60;
    scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
}

// End the game
function endGame() {
    clearInterval(spawnInterval);
    clearInterval(gameInterval);
    document.removeEventListener("mousemove", updateMousePosition);

    endScreen.querySelector(".final-score").textContent = `Score: ${Math.floor(score)}`;
    endScreen.classList.remove("hidden");
    returnButton.classList.remove("hidden");
}
