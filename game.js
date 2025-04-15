import { renderStartScreen, renderEndButton, renderEndScreen, clearUI } from './ui.js';

// Game configuration
const config = {
    cellSize: 32,
    cols: 20,
    rows: 15,
    playerColor: '#FF0000',  // Red
    floorColor: '#000000',   // Black (walkable)
    wallColor: '#FFFFFF',    // White (blocked)
    gameState: 'startScreen' // Possible states: 'startScreen', 'playing', 'ended'
};

// Game state
const state = {
    player: { x: 1, y: 1 },
    map: []
};

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = config.cols * config.cellSize;  // 20 × 32 = 640
canvas.height = config.rows * config.cellSize; // 15 × 32 = 480

// Generate a simple map
function generateMap() {
    const map = [];
    for (let y = 0; y < config.rows; y++) {
        const row = [];
        for (let x = 0; x < config.cols; x++) {
            // Border walls
            if (x === 0 || y === 0 || x === config.cols - 1 || y === config.rows - 1) {
                row.push(config.wallColor);
            } 
            // Random inner walls (20% chance)
            else if (Math.random() < 0.2 && !(x === state.player.x && y === state.player.y)) {
                row.push(config.wallColor);
            } else {
                row.push(config.floorColor);
            }
        }
        map.push(row);
    }
    return map;
}

// Draw the game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (config.gameState === 'playing') {
        // Draw map
        for (let y = 0; y < config.rows; y++) {
            for (let x = 0; x < config.cols; x++) {
                ctx.fillStyle = state.map[y][x];
                ctx.fillRect(
                    x * config.cellSize,
                    y * config.cellSize,
                    config.cellSize,
                    config.cellSize
                );
                
                // Draw grid lines
                ctx.strokeStyle = '#333';
                ctx.strokeRect(
                    x * config.cellSize,
                    y * config.cellSize,
                    config.cellSize,
                    config.cellSize
                );
            }
        }
        
        // Draw player
        ctx.fillStyle = config.playerColor;
        ctx.fillRect(
            state.player.x * config.cellSize,
            state.player.y * config.cellSize,
            config.cellSize,
            config.cellSize
        );
    }
}

// Handle player movement
function movePlayer(dx, dy) {
    const newX = state.player.x + dx;
    const newY = state.player.y + dy;
    
    // Check boundaries and walls
    if (newX >= 0 && newX < config.cols && 
        newY >= 0 && newY < config.rows && 
        state.map[newY][newX] !== config.wallColor) {
        
        state.player.x = newX;
        state.player.y = newY;
    }
}

// Start the game
function startGame() {
    config.gameState = 'playing';
    state.map = generateMap();
    clearUI();
    render();
    renderEndButton(endGame); // Add the End button when game starts
}

// End the game
function endGame() {
    config.gameState = 'ended';
    clearUI();
    renderEndScreen();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (config.gameState === 'playing') {
        switch (e.key.toLowerCase()) {
            case 'w': movePlayer(0, -1); break;
            case 'a': movePlayer(-1, 0); break;
            case 's': movePlayer(0, 1); break;
            case 'd': movePlayer(1, 0); break;
        }
        render();
    }
});

// Initialize and start game
function init() {
    renderStartScreen(startGame);
    render(); // Initial render (will show the start screen overlay)
}

init();
