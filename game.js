import { ui } from './ui.js';

// Game configuration
const config = {
    cellSize: 32,
    cols: 20,
    rows: 15,
    maxCoins: 3,
    gameState: 'startScreen',
    moveRange: 3,
    playerAttack: 3,
    wallHP: 5,
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
    map: [], // Now stores objects { type: 'wall'|'floor', hp?: number }
    coins: [],
    collectedCoins: 0,
    selectedUnit: null,
    validMoves: [],
    attackTargets: []
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
                row.push({ type: 'wall', hp: config.wallHP });
            } 
            // Random inner walls (20% chance)
            else if (Math.random() < 0.2 && !(x === state.player.x && y === state.player.y)) {
                row.push({ type: 'wall', hp: config.wallHP });
            } else {
                row.push({ type: 'floor' });
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
            state.map[y][x].type !== 'floor' || // Don't spawn in walls
            coins.some(coin => coin.x === x && coin.y === y) || // Don't overlap coins
            (x === state.player.x && y === state.player.y) // Don't spawn on player
        );
        coins.push({ x, y });
    }
    return coins;
}

// Calculate valid moves and attack targets
function calculateMovementOptions(x, y, range) {
    const moves = [];
    const attacks = [];
    const visited = new Set();
    const queue = [{ x, y, distance: 0 }];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // Check if current position is adjacent to a wall (attack target)
        if (current.distance > 0 && current.distance <= range) {
            const directions = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];
            
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                // Check boundaries
                if (nx >= 0 && nx < config.cols && ny >= 0 && ny < config.rows) {
                    const cell = state.map[ny][nx];
                    if (cell.type === 'wall' && cell.hp > 0) {
                        attacks.push({ x: nx, y: ny });
                        break; // Only need to find one adjacent wall
                    }
                }
            }
        }
        
        if (current.distance <= range) {
            // Only add if it's a floor tile and not occupied by the player
            if (state.map[current.y][current.x].type === 'floor' && 
                !(current.x === state.player.x && current.y === state.player.y)) {
                moves.push({ x: current.x, y: current.y });
            }
            
            // Continue exploring neighbors
            const directions = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];
            
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                // Check boundaries and walls (can't move through walls)
                if (nx >= 0 && nx < config.cols && 
                    ny >= 0 && ny < config.rows && 
                    state.map[ny][nx].type !== 'wall') {
                    queue.push({ x: nx, y: ny, distance: current.distance + 1 });
                }
            }
        }
    }
    
    return { moves, attacks };
}

// Draw the game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (config.gameState === 'playing') {
        // Draw map
        for (let y = 0; y < config.rows; y++) {
            for (let x = 0; x < config.cols; x++) {
                const cell = state.map[y][x];
                const img = cell.type === 'wall' ? assets.wall : assets.floor;
                
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
                    ctx.fillStyle = cell.type === 'wall' ? '#FFFFFF' : '#000000';
                    ctx.fillRect(
                        x * config.cellSize,
                        y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                }
                
                // Draw wall HP if applicable
                if (cell.type === 'wall' && cell.hp > 0) {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        cell.hp.toString(),
                        x * config.cellSize + config.cellSize / 2,
                        y * config.cellSize + config.cellSize / 2
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
                
                // Highlight valid moves
                if (state.validMoves.some(move => move.x === x && move.y === y)) {
                    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    ctx.fillRect(
                        x * config.cellSize,
                        y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                }
                
                // Highlight attack targets
                if (state.attackTargets.some(target => target.x === x && target.y === y)) {
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.fillRect(
                        x * config.cellSize,
                        y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                }
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
        
        // Draw selection border
        if (state.selectedUnit) {
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 3;
            ctx.strokeRect(
                state.selectedUnit.x * config.cellSize,
                state.selectedUnit.y * config.cellSize,
                config.cellSize,
                config.cellSize
            );
        }
    }
}

// Handle player movement
function movePlayer(newX, newY) {
    // Check if the move is valid
    const isValidMove = state.validMoves.some(move => move.x === newX && move.y === newY);
    
    if (isValidMove) {
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
        
        // Move the player
        state.player.x = newX;
        state.player.y = newY;
        
        // Clear selection after move
        state.selectedUnit = null;
        state.validMoves = [];
        state.attackTargets = [];
        
        render();
    }
}

// Handle attacking a wall
function attackWall(x, y) {
    const cell = state.map[y][x];
    if (cell.type === 'wall' && cell.hp > 0) {
        cell.hp -= config.playerAttack;
        
        // If wall is destroyed, convert to floor
        if (cell.hp <= 0) {
            cell.type = 'floor';
            delete cell.hp;
            
            // Check if any coins were blocked by this wall
            for (const coin of state.coins) {
                if (!isCoinReachable(coin.x, coin.y)) {
                    // Move coin to a reachable position
                    let newX, newY;
                    do {
                        newX = Math.floor(Math.random() * (config.cols - 2)) + 1;
                        newY = Math.floor(Math.random() * (config.rows - 2)) + 1;
                    } while (
                        state.map[newY][newX].type !== 'floor' ||
                        (newX === state.player.x && newY === state.player.y) ||
                        state.coins.some(c => c.x === newX && c.y === newY)
                    );
                    coin.x = newX;
                    coin.y = newY;
                }
            }
        }
        
        // Clear selection after attack
        state.selectedUnit = null;
        state.validMoves = [];
        state.attackTargets = [];
        
        render();
    }
}

// Check if a coin is reachable by the player
function isCoinReachable(coinX, coinY) {
    const visited = new Set();
    const queue = [{ x: state.player.x, y: state.player.y }];
    
    while (queue.length > 0) {
        const current = queue.shift();
        const key = `${current.x},${current.y}`;
        
        if (visited.has(key)) continue;
        visited.add(key);
        
        // Found the coin
        if (current.x === coinX && current.y === coinY) {
            return true;
        }
        
        // Explore neighbors
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        
        for (const dir of directions) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            
            // Check boundaries and walls
            if (nx >= 0 && nx < config.cols && 
                ny >= 0 && ny < config.rows && 
                state.map[ny][nx].type !== 'wall') {
                queue.push({ x: nx, y: ny });
            }
        }
    }
    
    return false;
}

// Handle canvas click
function handleCanvasClick(event) {
    if (config.gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / config.cellSize);
    const y = Math.floor((event.clientY - rect.top) / config.cellSize);
    
    // Check if click is within bounds
    if (x < 0 || x >= config.cols || y < 0 || y >= config.rows) return;
    
    // If clicking on player, select it
    if (x === state.player.x && y === state.player.y) {
        state.selectedUnit = { x, y };
        const options = calculateMovementOptions(x, y, config.moveRange);
        state.validMoves = options.moves;
        state.attackTargets = options.attacks;
        render();
    } 
    // If a unit is selected and clicking on a valid move, move there
    else if (state.selectedUnit && state.validMoves.some(move => move.x === x && move.y === y)) {
        movePlayer(x, y);
    }
    // If a unit is selected and clicking on an attack target, attack it
    else if (state.selectedUnit && state.attackTargets.some(target => target.x === x && target.y === y)) {
        attackWall(x, y);
    }
}

// Start the game
function startGame() {
    config.gameState = 'playing';
    state.map = generateMap();
    state.coins = generateCoins();
    state.collectedCoins = 0;
    state.player = { x: 1, y: 1 };
    state.selectedUnit = null;
    state.validMoves = [];
    state.attackTargets = [];
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

// Initialize game
function init() {
    loadAssets(() => {
        ui.renderStartScreen(startGame);
        render();
    });
    
    // Add click event listener
    canvas.addEventListener('click', handleCanvasClick);
}

init();
