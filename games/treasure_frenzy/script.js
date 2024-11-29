const options = document.querySelectorAll(".option");
const mainMenu = document.getElementById("main-menu");
const gameContainer = document.getElementById("game-container");
const gameBoard = document.getElementById("game-board");
const messageOverlay = document.getElementById("message-overlay");
const messageText = document.getElementById("message-text");
const returnbutton = document.getElementById("return-home-btn");
let gridSize = 8;
let mineCount = 0;
let tiles = [];
let mines = [];

options.forEach(option => {
    option.addEventListener("click", () => {
        gridSize = parseInt(option.dataset.size);
        startGame(gridSize);
    });
});

let revealedCount = 0;  // Track revealed non-mine tiles
let totalSafeTiles = 0;  // Total number of non-mine tiles

function startGame(size) {
    mainMenu.classList.add("hidden");
    returnbutton.classList.add("hidden");
    messageOverlay.classList.add("hidden"); // Ensure overlay is hidden when game starts
    gameContainer.classList.remove("hidden");
    generateBoard(size);
    firstClick = true; // Reset first-click logic
    revealedCount = 0; // Reset the revealed count
    totalSafeTiles = size * size - Math.floor(size * size * 0.15); // Total safe tiles (non-mine)
}

function generateBoard(size) {
    gameBoard.innerHTML = "";
    gameBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    gameBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    tiles = Array.from({ length: size * size }, (_, i) => {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.dataset.index = i;
        tile.addEventListener("click", () => handleTileClick(tile, i));
        gameBoard.appendChild(tile);
        return tile;
    });
}

function placeMines(size) {
    mines = [];
    const mineTotal = Math.floor(size * size * 0.15); // 15% of the board will be mines
    while (mines.length < mineTotal) {
        const index = Math.floor(Math.random() * (size * size));
        if (!mines.includes(index)) mines.push(index);
    }
    mineCount = mineTotal;
}

let firstClick = true; // Track if this is the first click

function handleTileClick(tile, index) {
    console.log(revealedCount + " " + totalSafeTiles);
    if (tile.classList.contains("clicked")) return;

    // Ensure safe first click
    if (firstClick) {
        firstClick = false;
        placeMinesAfterFirstClick(index);
        revealEmptyTiles(index);
        return;
    }
    revealedCount++;
    tile.classList.add("clicked");

    if (mines.includes(index)) {
        // Show dirt background and crab
        tile.classList.add("mine");
        tile.style.backgroundImage = "assets/dirt.png";
        tile.style.backgroundSize = "cover, contain";
        tile.style.backgroundPosition = "center";
        endGame("You hit a crab!");
    } else {
        const surroundingMines = countSurroundingMines(index);
        if (surroundingMines > 0) {
            tile.textContent = surroundingMines;
            tile.style.color = getNumberColor(surroundingMines);
            tile.style.textShadow = `2px 2px 1px black`;
        } else {
            revealEmptyTiles(index);
        }
    }

    if (revealedCount === totalSafeTiles) {
        endGame("You Win! All treasures found!");
    }
}

function getNumberColor(number) {
    // Map numbers to specific colors
    const colors = {
        1: "dodgerblue",
        2: "limegreen",
        3: "red",
        4: "darkblue",
        5: "darkred",
        6: "darkcyan",
        7: "black",
        8: "grey",
    };
    return colors[number] || "white"; // Default to white if not specified
}

function placeMinesAfterFirstClick(firstIndex) {
    mines = [];
    const totalMines = Math.floor(gridSize * gridSize * 0.15); // 15% of tiles are mines
    const firstClickNeighbors = new Set(getNeighbors(firstIndex));
    firstClickNeighbors.add(firstIndex); // Include the clicked tile itself

    while (mines.length < totalMines) {
        const index = Math.floor(Math.random() * (gridSize * gridSize));
        if (!mines.includes(index) && !firstClickNeighbors.has(index)) {
            mines.push(index);
        }
    }
}


function countSurroundingMines(index) {
    const neighbors = getNeighbors(index);
    return neighbors.filter(i => mines.includes(i)).length;
}

function getNeighbors(index) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                neighbors.push(r * gridSize + c);
            }
        }
    }
    return neighbors;
}

function revealEmptyTiles(index) {
    const queue = [index];
    while (queue.length > 0) {
        const current = queue.pop();
        const neighbors = getNeighbors(current);
        neighbors.forEach(i => {
            const tile = tiles[i];
            if (!tile.classList.contains("clicked") && !mines.includes(i)) {
                tile.classList.add("clicked");
                revealedCount++;
                const surroundingMines = countSurroundingMines(i);
                if (surroundingMines > 0) {
                    tile.textContent = surroundingMines;
                    tile.style.color = getNumberColor(surroundingMines);
                    tile.style.textShadow = `2px 2px 1px black`;
                } else {
                    queue.push(i);
                }
            }
        });
    }
}


function endGame(message) {
    messageText.textContent = message;
    returnbutton.classList.remove("hidden");
    messageOverlay.classList.remove("hidden"); // Show overlay
    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.classList.add("option");
    restartButton.addEventListener("click", () => location.reload()); // Reload page
    messageOverlay.appendChild(restartButton);
}