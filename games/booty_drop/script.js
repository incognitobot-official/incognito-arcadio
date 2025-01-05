const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score-display");
const bag = document.getElementById("bag");
const endScreen = document.getElementById("end-screen");
const returnButton = document.getElementById("return-home-btn");

let coins = [];
let mouseX = null;
let mouseY = null;
let bagX = 0;
let bagY = 0;
let score = 0;
let gameInterval;
let spawnInterval;
let difficulty = "easy";
let bombCounter = 0;
let gameTime = 0; 
let level1 = false;
let level2 = false;
let level3 = false;

// Difficulty settings
const difficultySettings = {
    easy: { spawnRate: 1500, coinSpeed: 3, bombFrequency: 10, scoreMultiplier: 1 },
    medium: { spawnRate: 1000, coinSpeed: 5, bombFrequency: 5, scoreMultiplier: 1.5 },
    hard: { spawnRate: 750, coinSpeed: 7, bombFrequency: 2, scoreMultiplier: 2 }
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
    endScreen.classList.add("hidden");
    endScreen.style.display = "none"; 
    resetGame();
    spawnInterval = setInterval(spawnObject, difficultySettings[difficulty].spawnRate);
    gameInterval = setInterval(updateGame, 16);
    document.addEventListener("mousemove", updateMousePosition);
    returnButton.classList.add("hidden");
}

// Reset the game
function resetGame() {
    coins.forEach(c => c.element.remove());
    coins = [];
    score = 0;
    bombCounter = 0;
    gameTime = 0;

    const rect = gameContainer.getBoundingClientRect();
    bagX = rect.width / 2 - bag.offsetWidth / 2;
    bagY = rect.height - 100;
    bag.style.left = `${bagX}px`;
    bag.style.top = `${bagY}px`;
    scoreDisplay.textContent = `Score: 0`;
}

// Track the mouse position
function updateMousePosition(event) {
    const rect = gameContainer.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}

// Spawn coins, gems, or bombs
function spawnObject() {
    const object = document.createElement("div");
    const rect = gameContainer.getBoundingClientRect();
    const x = Math.random() * (rect.width - 50);
    const y = -50;
    let type, speed;

    if (bombCounter === difficultySettings[difficulty].bombFrequency) {
        type = "bomb";
        speed = difficultySettings[difficulty].coinSpeed + 2;
        bombCounter = 0;
    } else {
        const isGem = Math.random() < 0.1; 
        type = isGem ? "gem" : "coin";
        speed = difficultySettings[difficulty].coinSpeed;
        bombCounter++;
    }

    object.classList.add(type);
    object.style.left = `${x}px`;
    object.style.top = `${y}px`;
    gameContainer.appendChild(object);

    coins.push({
        element: object,
        x,
        y,
        dy: speed,
        type
    });
}

// Update the game state
function updateGame() {
    const rect = gameContainer.getBoundingClientRect();
    gameTime++;

    // Increase speed and spawn rate based on score
    if (score >= 100 && score < 500 && !level1) {
        difficultySettings[difficulty].coinSpeed += 4;
        difficultySettings[difficulty].spawnRate -= 100;
        level1 = true;
    } else if (score >= 500 && score < 1000 && !level2) {
        difficultySettings[difficulty].coinSpeed += 7;
        difficultySettings[difficulty].spawnRate -= 100;
        level2 = true;
    } else if (score >= 1000 && !level3) {
        difficultySettings[difficulty].coinSpeed += 10;
        difficultySettings[difficulty].spawnRate -= 100;
        level3 = true;
    }

    // Update bag position
    if (mouseX !== null && mouseY !== null) {
        bagX = mouseX - bag.offsetWidth / 2;
    }
    bag.style.left = `${bagX}px`;

    // Update object positions
    coins.forEach(c => {
        c.y += c.dy;
        c.element.style.top = `${c.y}px`;

        // Check for collision with the bag
        const bagRect = bag.getBoundingClientRect();
        const objRect = c.element.getBoundingClientRect();
        if (
            bagRect.left < objRect.right &&
            bagRect.right > objRect.left &&
            bagRect.top < objRect.bottom &&
            bagRect.bottom > objRect.top
        ) {
            if (c.type === "bomb") {
                endGame();
            } else {
                const points = c.type === "gem" 
                    ? Math.floor(50 + Math.random() * 50) 
                    : Math.floor(1 + Math.random() * 10);
                score += points * difficultySettings[difficulty].scoreMultiplier;
                scoreDisplay.textContent = `Score: ${Math.floor(score)}`;
            }
            c.element.remove();
            coins = coins.filter(coin => coin !== c);
        }

        // Remove objects that fall out of the screen
        if (c.y > rect.height) {
            if (c.type !== "bomb") endGame();
            c.element.remove();
            coins = coins.filter(coin => coin !== c);
        }
    });
}

// End the game
function endGame() {
    clearInterval(spawnInterval);
    clearInterval(gameInterval);
    document.removeEventListener("mousemove", updateMousePosition);

    endScreen.querySelector(".final-score").textContent = `Final Score: ${Math.floor(score)}`;
    endScreen.style.display = "block";
    returnButton.classList.remove("hidden");
}

// Restart the game
returnButton.addEventListener("click", () => {
    resetGame();
    endScreen.classList.add("hidden");
    mainMenu.classList.remove("hidden");
    endScreen.style.display = "none";
    clearInterval(spawnInterval);
    clearInterval(gameInterval);
});
