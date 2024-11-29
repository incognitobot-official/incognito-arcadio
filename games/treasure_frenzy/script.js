let grid = [];
let mines = [];
let revealedCount = 0;
let gridSize = 10;
let totalMines = 20;
let gameStatus = "inProgress";  // "inProgress", "won", "lost"

// Function to start a new game
function startGame() {
    grid = [];
    mines = [];
    revealedCount = 0;
    gameStatus = "inProgress";
    document.getElementById('status').innerText = 'Game in Progress';
    
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '';
    
    // Create grid
    for (let row = 0; row < gridSize; row++) {
        let rowArray = [];
        for (let col = 0; col < gridSize; col++) {
            let cell = {
                row: row,
                col: col,
                revealed: false,
                mine: false,
                flagged: false,
                adjacentMines: 0
            };
            rowArray.push(cell);
        }
        grid.push(rowArray);
    }
    
    // Place mines
    while (mines.length < totalMines) {
        let row = Math.floor(Math.random() * gridSize);
        let col = Math.floor(Math.random() * gridSize);
        
        if (!grid[row][col].mine) {
            grid[row][col].mine = true;
            mines.push({ row, col });
        }
    }
    
    // Calculate adjacent mines for each cell
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (!grid[row][col].mine) {
                grid[row][col].adjacentMines = countAdjacentMines(row, col);
            }
        }
    }
    
    // Display grid
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let cellElement = document.createElement('div');
            cellElement.classList.add('grid-cell');
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            cellElement.addEventListener('click', handleCellClick);
            cellElement.addEventListener('contextmenu', handleCellRightClick);
            gameGrid.appendChild(cellElement);
        }
    }
}

// Function to count adjacent mines for a cell
function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let newRow = row + i;
            let newCol = col + j;
            if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
                if (grid[newRow][newCol].mine) {
                    count++;
                }
            }
        }
    }
    return count;
}

// Function to handle left click (reveal cell)
function handleCellClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    
    if (grid[row][col].revealed || grid[row][col].flagged) return;
    
    grid[row][col].revealed = true;
    revealedCount++;
    event.target.classList.add('revealed');
    
    if (grid[row][col].mine) {
        gameStatus = "lost";
        event.target.classList.add('mine');
        document.getElementById('status').innerText = 'Game Over! You hit a mine!';
        revealAllMines();
    } else {
        event.target.innerText = grid[row][col].adjacentMines || '';
        if (revealedCount === (gridSize * gridSize - totalMines)) {
            gameStatus = "won";
            document.getElementById('status').innerText = 'Congratulations! You won!';
        }
    }
}

// Function to handle right click (flag cell)
function handleCellRightClick(event) {
    event.preventDefault();
    
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    
    if (grid[row][col].revealed) return;
    
    grid[row][col].flagged = !grid[row][col].flagged;
    event.target.classList.toggle('flagged');
}

// Function to reveal all mines (when the game ends)
function revealAllMines() {
    const gameGrid = document.getElementById('gameGrid');
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col].mine) {
                const cellElement = gameGrid.children[row * gridSize + col];
                cellElement.classList.add('mine');
            }
        }
    }
}

// Initialize the game
startGame();
