import { initUI, showStartScreen, showGameScreen, showEndScreen } from './ui.js';

// Game configuration
const config = {
    cellSize: 32,
    cols: 20,
    rows: 15,
    playerColor: '#FF0000',  // Red
    floorColor: '#000000',   // Black (walkable)
    wallColor: '#FFFFFF',    // White (blocked)
    coinColor: '#FFFF00',    // Yellow
    maxCoins: 3,
    gameState: 'startScreen' // Possible states: 'startScreen', 'playing', 'ended'
};

// Game state
const state = {
    player: { x: 1, y: 1 },
    map: [],
    coins: [],
    collectedCoins: 0
};

// Initialize canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = config.cols * config.cellSize;
canvas.height = config.rows * config.cellSize;

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

// Generate coins randomly
function generateCoins() {
    const coins = [];
    for (let i = 0; i < config.maxCoins; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (config.cols - 2)) + 1;
            y = Math.floor(Math.random() * (config.rows - 2)) + 1;
        } while (
            state.map[y][x] !== config.floorColor ||  // Don't spawn in walls
            coins.some(coin => coin.x === x && coin.y === y) ||  // Don't overlap coins
            (x === state.player.x && y === state.player.y)  // Don't spawn on player
        );
        coins.push({ x, y });
    }
    return coins;
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
        
        // Draw coins
        ctx.fillStyle = config.coinColor;
        state.coins.forEach(coin => {
            ctx.beginPath();
            ctx.arc(
                (coin.x + 0.5) * config.cellSize,
                (coin.y + 0.5) * config.cellSize,
                config.cellSize / 3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
        
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
        
        // Check for coin collection
        const coinIndex = state.coins.findIndex(c => c.x === newX && c.y === newY);
        if (coinIndex !== -1) {
            state.coins.splice(coinIndex, 1);
            state.collectedCoins++;
        }
        
        state.player.x = newX;
        state.player.y = newY;
    }
}

// Start the game
function startGame() {
    config.gameState = 'playing';
    state.map = generateMap();
    state.coins = generateCoins();
    state.collectedCoins = 0;
    showGameScreen();
    render();
}

// End the game
function endGame() {
    config.gameState = 'ended';
    showEndScreen(state.collectedCoins, config.maxCoins);
}

// Restart the game
function restartGame() {
    state.player = { x: 1, y: 1 };
    state.map = generateMap();
    state.coins = generateCoins();
    state.collectedCoins = 0;
    config.gameState = 'playing';
    showGameScreen();
    render();
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
    initUI(startGame, endGame, restartGame);
    showStartScreen();
    render();
}

init();
