// UI Container setup
const uiContainer = document.createElement('div');
uiContainer.id = 'ui-container';
document.body.appendChild(uiContainer);

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
    const endButton = document.createElement('button');
    endButton.id = 'endButton';
    endButton.textContent = 'END';
    uiContainer.appendChild(endButton);
    endButton.addEventListener('click', endGameCallback);
}

// Render End Screen
export function renderEndScreen() {
    uiContainer.innerHTML = `
        <div class="end-screen">
            <h1>GAME OVER</h1>
            <p>Thanks for playing!</p>
            <button id="restartButton" class="game-button">PLAY AGAIN</button>
        </div>
    `;
    
    document.getElementById('restartButton').addEventListener('click', () => {
        window.location.reload();
    });
}

// Clear UI elements
export function clearUI() {
    uiContainer.innerHTML = '';
}
