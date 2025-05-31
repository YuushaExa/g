import { ui } from './ui.js';

// Game configuration
const config = {
    cellSize: 32,
    cols: 20,
    rows: 15,
    maxCoins: 3,
    gameState: 'startScreen',
    // Image paths
    playerImage: 'https://raw.githubusercontent.com/YuushaExa/g/refs/heads/main/assets/map/assets_task_01jwk8dx5eenf95wcbx76bcrdc_1748698089_img_0.webp',
    floorImage: 'https://raw.githubusercontent.com/YuushaExa/g/refs/heads/main/assets/map/20250531_1625_Retro%20Grass%20Texture_simple_compose_01jwk89w4tfkrrdfke0frvddyr.png',
    wallImage: 'https://raw.githubusercontent.com/YuushaExa/g/refs/heads/main/assets/map/assets_task_01jwk8dx5eenf95wcbx76bcrdc_1748698089_img_0.webp',
    coinImage: 'https://raw.githubusercontent.com/YuushaExa/g/refs/heads/main/assets/map/assets_task_01jwk8dx5eenf95wcbx76bcrdc_1748698089_img_0.webp'
};

// Game assets
const assets = {
    player: null,
    floor: null,
    wall: null,
    coin: null
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

// Load all game assets
function loadAssets(callback) {
    let loaded = 0;
    const total = Object.keys(assets).length;
    
    function assetLoaded() {
        loaded++;
        if (loaded === total && callback) callback();
    }
    
    // Load player image
    assets.player = new Image();
    assets.player.onload = assetLoaded;
    assets.player.onerror = () => console.error('Failed to load player image');
    assets.player.src = config.playerImage;
    
    // Load floor image
    assets.floor = new Image();
    assets.floor.onload = assetLoaded;
    assets.floor.onerror = () => console.error('Failed to load floor image');
    assets.floor.src = config.floorImage;
    
    // Load wall image
    assets.wall = new Image();
    assets.wall.onload = assetLoaded;
    assets.wall.onerror = () => console.error('Failed to load wall image');
    assets.wall.src = config.wallImage;
    
    // Load coin image
    assets.coin = new Image();
    assets.coin.onload = assetLoaded;
    assets.coin.onerror = () => console.error('Failed to load coin image');
    assets.coin.src = config.coinImage;
}

// Generate a simple map
function generateMap() {
    const map = [];
    for (let y = 0; y < config.rows; y++) {
        const row = [];
        for (let x = 0; x < config.cols; x++) {
            // Border walls
            if (x === 0 || y === 0 || x === config.cols - 1 || y === config.rows - 1) {
                row.push('wall');
            } 
            // Random inner walls (20% chance)
            else if (Math.random() < 0.2 && !(x === state.player.x && y === state.player.y)) {
                row.push('wall');
            } else {
                row.push('floor');
            }
        }
        map.push(row);
    }
    return map;
}

// Generate coins at random positions
function generateCoins() {
    const coins = [];
    for (let i = 0; i < config.maxCoins; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (config.cols - 2)) + 1;
            y = Math.floor(Math.random() * (config.rows - 2)) + 1;
        } while (
            state.map[y][x] !== 'floor' || // Don't spawn in walls
            coins.some(coin => coin.x === x && coin.y === y) || // Don't overlap coins
            (x === state.player.x && y === state.player.y) // Don't spawn on player
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
                const cellType = state.map[y][x];
                const img = cellType === 'wall' ? assets.wall : assets.floor;
                
                if (img && img.complete) {
                    ctx.drawImage(
                        img,
                        x * config.cellSize,
                        y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                } else {
                    // Fallback: draw colored rectangle if image not loaded
                    ctx.fillStyle = cellType === 'wall' ? '#FFFFFF' : '#000000';
                    ctx.fillRect(
                        x * config.cellSize,
                        y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                }
                
                // Draw grid lines (optional)
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
        if (assets.coin && assets.coin.complete) {
            state.coins.forEach(coin => {
                ctx.drawImage(
                    assets.coin,
                    coin.x * config.cellSize,
                    coin.y * config.cellSize,
                    config.cellSize,
                    config.cellSize
                );
            });
        } else {
            // Fallback for coins
            ctx.fillStyle = '#FFFF00';
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
        }
        
        // Draw player
        if (assets.player && assets.player.complete) {
            ctx.drawImage(
                assets.player,
                state.player.x * config.cellSize,
                state.player.y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        } else {
            // Fallback for player
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(
                state.player.x * config.cellSize,
                state.player.y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }
    }
}

// Handle player movement and coin collection
function movePlayer(dx, dy) {
    const newX = state.player.x + dx;
    const newY = state.player.y + dy;
    
    // Check boundaries and walls
    if (newX >= 0 && newX < config.cols && 
        newY >= 0 && newY < config.rows && 
        state.map[newY][newX] !== 'wall') {
        
        // Check for coin collection
        const coinIndex = state.coins.findIndex(c => c.x === newX && c.y === newY);
        if (coinIndex !== -1) {
            state.coins.splice(coinIndex, 1);
            state.collectedCoins++;
            
            // Check if all coins collected
            if (state.collectedCoins >= config.maxCoins) {
                endGame();
                return;
            }
        }
        
        state.player.x = newX;
        state.player.y = newY;
        render();
    }
}

// Start the game
function startGame() {
    config.gameState = 'playing';
    state.map = generateMap();
    state.coins = generateCoins();
    state.collectedCoins = 0;
    state.player = { x: 1, y: 1 };
    ui.clearUI();
    render();
    ui.renderEndButton(endGame);
}

// End the game
function endGame() {
    config.gameState = 'ended';
    ui.clearUI();
    ui.renderEndScreen(state.collectedCoins, config.maxCoins, restartGame);
}

// Restart the game
function restartGame() {
    startGame();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (config.gameState === 'playing') {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                movePlayer(0, -1);
                break;
            case 'a':
            case 'arrowleft':
                movePlayer(-1, 0);
                break;
            case 's':
            case 'arrowdown':
                movePlayer(0, 1);
                break;
            case 'd':
            case 'arrowright':
                movePlayer(1, 0);
                break;
        }
    }
});

// Initialize game
function init() {
    loadAssets(() => {
        ui.renderStartScreen(startGame);
        render();
    });
}

init();
