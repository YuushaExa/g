import { ui } from './ui.js';
import { heroes, monsters } from './data.js';

// Game configuration
const config = {
    cellSize: 32,
    cols: 20,
    rows: 15,
    floorColor: '#000000',   // Black (walkable)
    wallColor: '#FFFFFF',    // White (blocked)
    gameState: 'startScreen', // Possible states: 'startScreen', 'partySelection', 'playing', 'combat', 'ended'
    turn: 'player',          // 'player' or 'enemy'
    currentCombat: null      // Stores current combat data
};

// Game state
const state = {
    party: [],               // Selected heroes
    playerPositions: [],     // Positions of party members on map
    map: [],
    enemies: [],
    collectedGold: 0,
    collectedXP: 0,
    currentPlayerIndex: 0,   // Which party member is currently moving
    gameOver: false
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
            else if (Math.random() < 0.2) {
                row.push(config.wallColor);
            } else {
                row.push(config.floorColor);
            }
        }
        map.push(row);
    }
    return map;
}

// Generate enemies at random positions
function generateEnemies() {
    const enemyCount = 5 + Math.floor(Math.random() * 3); // 5-7 enemies
    const enemies = [];
    
    for (let i = 0; i < enemyCount; i++) {
        const randomMonster = {...monsters[Math.floor(Math.random() * monsters.length)]};
        let x, y;
        
        do {
            x = Math.floor(Math.random() * (config.cols - 2)) + 1;
            y = Math.floor(Math.random() * (config.rows - 2)) + 1;
        } while (
            state.map[y][x] !== config.floorColor || // Don't spawn in walls
            enemies.some(e => e.x === x && e.y === y) || // Don't overlap enemies
            state.playerPositions.some(p => p.x === x && p.y === y) // Don't spawn on players
        );
        
        enemies.push({
            ...randomMonster,
            x,
            y,
            maxHealth: randomMonster.health
        });
    }
    
    return enemies;
}

// Position party members at start
function positionParty() {
    state.playerPositions = [];
    const startPositions = [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 1, y: 2 }
    ];
    
    for (let i = 0; i < state.party.length; i++) {
        state.playerPositions.push({
            ...state.party[i],
            ...startPositions[i],
            maxHealth: state.party[i].health
        });
    }
}

// Draw the game
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (['playing', 'combat'].includes(config.gameState)) {
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
        
        // Draw enemies
        state.enemies.forEach(enemy => {
            if (enemy.health > 0) {
                // Enemy body
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(
                    (enemy.x + 0.5) * config.cellSize,
                    (enemy.y + 0.5) * config.cellSize,
                    config.cellSize / 3,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                
                // Enemy health bar
                const healthPercent = enemy.health / enemy.maxHealth;
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(
                    enemy.x * config.cellSize,
                    enemy.y * config.cellSize - 10,
                    config.cellSize * healthPercent,
                    5
                );
            }
        });
        
        // Draw party members
        state.playerPositions.forEach((player, index) => {
            if (player.health > 0) {
                // Player body
                ctx.fillStyle = player.color;
                ctx.fillRect(
                    player.x * config.cellSize,
                    player.y * config.cellSize,
                    config.cellSize,
                    config.cellSize
                );
                
                // Highlight current player
                if (index === state.currentPlayerIndex && config.turn === 'player') {
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(
                        player.x * config.cellSize,
                        player.y * config.cellSize,
                        config.cellSize,
                        config.cellSize
                    );
                }
                
                // Player health bar
                const healthPercent = player.health / player.maxHealth;
                ctx.fillStyle = '#00FF00';
                ctx.fillRect(
                    player.x * config.cellSize,
                    player.y * config.cellSize - 10,
                    config.cellSize * healthPercent,
                    5
                );
            }
        });
        
        // Draw UI info
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Gold: ${state.collectedGold}`, 10, 20);
        ctx.fillText(`XP: ${state.collectedXP}`, 10, 40);
        
        // Draw turn info
        ctx.textAlign = 'right';
        ctx.fillText(
            config.turn === 'player' ? 
            `Turn: ${state.playerPositions[state.currentPlayerIndex].name}` : 
            'Enemy Turn',
            canvas.width - 10, 20
        );
    }
}

// Handle player movement
function movePlayer(dx, dy) {
    if (config.gameState !== 'playing' || config.turn !== 'player') return;
    
    const currentPlayer = state.playerPositions[state.currentPlayerIndex];
    if (currentPlayer.health <= 0) {
        advanceTurn();
        return;
    }
    
    const newX = currentPlayer.x + dx;
    const newY = currentPlayer.y + dy;
    
    // Check boundaries and walls
    if (newX >= 0 && newX < config.cols && 
        newY >= 0 && newY < config.rows && 
        state.map[newY][newX] !== config.wallColor) {
        
        // Check if position is occupied by another party member
        const positionOccupied = state.playerPositions.some((p, i) => 
            i !== state.currentPlayerIndex && p.x === newX && p.y === newY && p.health > 0
        );
        
        if (!positionOccupied) {
            // Check for enemy encounter
            const enemyIndex = state.enemies.findIndex(e => 
                e.x === newX && e.y === newY && e.health > 0
            );
            
            if (enemyIndex !== -1) {
                startCombat(state.currentPlayerIndex, enemyIndex);
            } else {
                currentPlayer.x = newX;
                currentPlayer.y = newY;
                advanceTurn();
            }
        }
    }
}

// Advance to next turn
function advanceTurn() {
    if (config.gameState === 'combat') return;
    
    // Check if all enemies are dead
    const allEnemiesDead = state.enemies.every(e => e.health <= 0);
    if (allEnemiesDead) {
        state.enemies = generateEnemies();
    }
    
    // Check if all players are dead
    const allPlayersDead = state.playerPositions.every(p => p.health <= 0);
    if (allPlayersDead) {
        endGame(false);
        return;
    }
    
    if (config.turn === 'player') {
        // Move to next player
        do {
            state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.playerPositions.length;
        } while (state.playerPositions[state.currentPlayerIndex].health <= 0 && 
                 !state.playerPositions.every(p => p.health <= 0));
        
        // If we've cycled through all players, it's the enemy's turn
        if (state.currentPlayerIndex === 0) {
            config.turn = 'enemy';
            setTimeout(enemyTurn, 1000);
        }
    } else {
        config.turn = 'player';
    }
    
    render();
}

// Enemy turn logic
function enemyTurn() {
    if (config.gameState !== 'playing' || config.turn !== 'enemy') return;
    
    state.enemies.forEach(enemy => {
        if (enemy.health <= 0) return;
        
        // Find nearest player
        let closestPlayer = null;
        let minDistance = Infinity;
        
        state.playerPositions.forEach(player => {
            if (player.health > 0) {
                const distance = Math.abs(player.x - enemy.x) + Math.abs(player.y - enemy.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPlayer = player;
                }
            }
        });
        
        if (closestPlayer) {
            // Move toward player or attack if adjacent
            const dx = closestPlayer.x - enemy.x;
            const dy = closestPlayer.y - enemy.y;
            
            if (Math.abs(dx) + Math.abs(dy) === 1) {
                // Adjacent - attack
                const damage = Math.max(1, enemy.attack - closestPlayer.defense / 2);
                closestPlayer.health = Math.max(0, closestPlayer.health - damage);
                
                // Show combat message
                ui.showCombatMessage(`${enemy.name} hits ${closestPlayer.name} for ${Math.floor(damage)} damage!`);
            } else {
                // Move toward player
                let moveX = 0, moveY = 0;
                if (Math.abs(dx) > Math.abs(dy)) {
                    moveX = dx > 0 ? 1 : -1;
                } else {
                    moveY = dy > 0 ? 1 : -1;
                }
                
                const newX = enemy.x + moveX;
                const newY = enemy.y + moveY;
                
                // Check if move is valid
                if (newX >= 1 && newX < config.cols - 1 &&
                    newY >= 1 && newY < config.rows - 1 &&
                    state.map[newY][newX] !== config.wallColor &&
                    !state.enemies.some(e => e !== enemy && e.x === newX && e.y === newY && e.health > 0) {
                    
                    enemy.x = newX;
                    enemy.y = newY;
                }
            }
        }
    });
    
    render();
    setTimeout(() => {
        advanceTurn();
    }, 1000);
}

// Start combat between player and enemy
function startCombat(playerIndex, enemyIndex) {
    const player = state.playerPositions[playerIndex];
    const enemy = state.enemies[enemyIndex];
    
    config.gameState = 'combat';
    config.currentCombat = { playerIndex, enemyIndex };
    
    ui.showCombatScreen(
        player,
        enemy,
        () => { // Attack callback
            const damage = Math.max(1, player.attack - enemy.defense / 2);
            enemy.health = Math.max(0, enemy.health - damage);
            
            if (enemy.health <= 0) {
                // Enemy defeated
                state.collectedGold += enemy.gold;
                state.collectedXP += enemy.xp;
                ui.showCombatMessage(`${player.name} defeats ${enemy.name}! Gained ${enemy.gold} gold and ${enemy.xp} XP!`);
            } else {
                // Enemy counterattack
                const counterDamage = Math.max(1, enemy.attack - player.defense / 2);
                player.health = Math.max(0, player.health - counterDamage);
                ui.showCombatMessage(`${player.name} hits ${enemy.name} for ${Math.floor(damage)} damage! ${enemy.name} counterattacks for ${Math.floor(counterDamage)} damage!`);
                
                if (player.health <= 0) {
                    ui.showCombatMessage(`${player.name} has been defeated!`);
                }
            }
            
            render();
            
            if (enemy.health <= 0 || player.health <= 0) {
                endCombat();
            }
        },
        () => { // Flee callback (50% chance)
            if (Math.random() < 0.5) {
                ui.showCombatMessage(`${player.name} successfully flees from battle!`);
                endCombat();
            } else {
                const damage = Math.max(1, enemy.attack - player.defense / 2);
                player.health = Math.max(0, player.health - damage);
                ui.showCombatMessage(`${player.name} fails to flee! ${enemy.name} attacks for ${Math.floor(damage)} damage!`);
                
                if (player.health <= 0) {
                    ui.showCombatMessage(`${player.name} has been defeated!`);
                    endCombat();
                }
                
                render();
            }
        }
    );
}

// End combat and return to exploration
function endCombat() {
    config.gameState = 'playing';
    config.currentCombat = null;
    ui.clearCombatScreen();
    
    // Remove dead enemies
    state.enemies = state.enemies.filter(e => e.health > 0);
    
    // Check if all players are dead
    const allPlayersDead = state.playerPositions.every(p => p.health <= 0);
    if (allPlayersDead) {
        endGame(false);
        return;
    }
    
    advanceTurn();
}

// Start the game with selected party
function startGame(selectedHeroes) {
    config.gameState = 'playing';
    config.turn = 'player';
    state.party = selectedHeroes;
    state.map = generateMap();
    positionParty();
    state.enemies = generateEnemies();
    state.collectedGold = 0;
    state.collectedXP = 0;
    state.currentPlayerIndex = 0;
    state.gameOver = false;
    ui.clearUI();
    render();
    ui.renderEndButton(() => endGame(false));
    
    console.log("Game started with party:", state.party);
}

// End the game
function endGame(victory) {
    config.gameState = 'ended';
    ui.clearUI();
    ui.renderEndScreen(
        state.collectedGold,
        state.collectedXP,
        state.playerPositions.filter(p => p.health > 0).length,
        state.party.length,
        victory,
        restartGame
    );
}

// Restart the game
function restartGame() {
    ui.renderStartScreen(startGame);
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (config.gameState === 'playing' && config.turn === 'player') {
        const currentPlayer = state.playerPositions[state.currentPlayerIndex];
        if (!currentPlayer || currentPlayer.health <= 0) return;
        
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
            case ' ': // Space to skip turn
                advanceTurn();
                break;
        }
    }
});

// Initialize game
function init() {
    ui.renderStartScreen(startGame);
    render();
}

init();
