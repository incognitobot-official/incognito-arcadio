const gameContainer = document.getElementById("game-container");
const gameBoard = document.getElementById("game-board");
const endScreen = document.getElementById("end-screen");
const returnButton = document.getElementById("return-home-btn");

let grid = [];
let pacman = { x: 1, y: 1, direction: 'right' };
let ghosts = [
    { x: 18, y: 18, color: 'red', dx: 0, dy: 0 }
];
let score = 0;
let interval;
let gameOver = false;

// Initialize the grid
function createGrid() {
    grid = [];
    gameBoard.innerHTML = '';

    for (let row = 0; row < 20; row++) {
        const gridRow = [];
        for (let col = 0; col < 20; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (row === 0 || col === 0 || row === 19 || col === 19) {
                tile.classList.add('wall');
            } else {
                const pellet = document.createElement('div');
                pellet.classList.add('pellet');
                tile.appendChild(pellet);
            }
            gameBoard.appendChild(tile);
            gridRow.push(tile);
        }
        grid.push(gridRow);
    }
}

// Start the game
function startGame() {
    document.getElementById("main-menu").classList.add("hidden");
    gameContainer.classList.remove("hidden");
    returnButton.classList.add("hidden");
    createGrid();
    placePacman();
    placeGhosts();
    interval = setInterval(updateGame, 200);
}

// Place Pac-Man
function placePacman() {
    const pacmanTile = grid[pacman.y][pacman.x];
    pacmanTile.classList.add('pacman');
}

// Place Ghosts
function placeGhosts() {
    ghosts.forEach(ghost => {
        const ghostTile = grid[ghost.y][ghost.x];
        const ghostDiv = document.createElement('div');
        ghostDiv.classList.add('ghost');
        ghostDiv.style.backgroundColor = ghost.color;
        ghostTile.appendChild(ghostDiv);
    });
}

// Update the game state
function updateGame() {
    if (gameOver) return;

    // Move Pac-Man
    movePacman();

    // Move Ghosts
    moveGhosts();

    // Check for collisions
    checkCollisions();

    // Check for win
    if (checkWin()) {
        endGame("You Win!");
    }
}

// Move Pac-Man
function movePacman() {
    const { x, y } = pacman;
    grid[y][x].classList.remove('pacman');
    const nextX = pacman.direction === 'right' ? x + 1 : pacman.direction === 'left' ? x - 1 : x;
    const nextY = pacman.direction === 'down' ? y + 1 : pacman.direction === 'up' ? y - 1 : y;
    if (!grid[nextY][nextX].classList.contains('wall')) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
    const tile = grid[pacman.y][pacman.x];
    const pellet = tile.querySelector('.pellet');
    if (pellet) {
        pellet.remove();
        score++;
    }
    tile.classList.add('pacman');
}

// Move Ghosts
function moveGhosts() {
    ghosts.forEach(ghost => {
        grid[ghost.y][ghost.x].classList.remove('ghost');
        const dx = pacman.x - ghost.x;
        const dy = pacman.y - ghost.y;
        ghost.x += Math.sign(dx);
        ghost.y += Math.sign(dy);
        const tile = grid[ghost.y][ghost.x];
        const ghostDiv = tile.querySelector('.ghost') || document.createElement('div');
        ghostDiv.classList.add('ghost');
        ghostDiv.style.backgroundColor = ghost.color;
        tile.appendChild(ghostDiv);
    });
}

// Check for collisions
function checkCollisions() {
    ghosts.forEach(ghost => {
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
            endGame("Game Over!");
        }
    });
}

// Check for win condition
function checkWin() {
    return [...gameBoard.querySelectorAll('.pellet')].length === 0;
}

// End the game
function endGame(message) {
    clearInterval(interval);
    gameOver = true;
    endScreen.querySelector('.final-score').textContent = message;
    endScreen.classList.add('visible');
    returnButton.classList.remove('hidden');
}

// Control Pac-Man
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') pacman.direction = 'right';
    if (event.key === 'ArrowLeft') pacman.direction = 'left';
    if (event.key === 'ArrowUp') pacman.direction = 'up';
    if (event.key === 'ArrowDown') pacman.direction = 'down';
});
