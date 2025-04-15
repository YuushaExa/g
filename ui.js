// UI Container setup
const uiContainer = document.getElementById('uiContainer');
export const UI = {
// Render Start Screen
export function renderStartScreen(startGameCallback) {
    uiContainer.innerHTML = `
        <div class="start-screen">
            <h1>COLOR GRID GAME</h1>
            <p>Use WASD keys to move</p>
            <button id="startButton" class="game-button">START GAME</button>
        </div>
    `;
    
    document.getElementById('startButton').addEventListener('click', startGameCallback);
}

// Render End Button
export function renderEndButton(endGameCallback) {
    uiContainer.innerHTML += `
        <button id="endButton" class="end-button">END</button>
    `;
    
    document.getElementById('endButton').addEventListener('click', endGameCallback);
}

// Render End Screen
export function renderEndScreen(collectedCoins, maxCoins, restartCallback) {
    uiContainer.innerHTML = `
        <div class="end-screen">
            <h1>GAME OVER</h1>
            <p>You collected ${collectedCoins}/${maxCoins} coins!</p>
            <button id="restartButton" class="game-button">PLAY AGAIN</button>
        </div>
    `;
    
    document.getElementById('restartButton').addEventListener('click', restartCallback);
}

// Clear UI elements
export function clearUI() {
    uiContainer.innerHTML = '';
}

};
