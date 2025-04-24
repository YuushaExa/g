import { GameEngine } from './engine/GameEngine.js';

// Initialize the game engine
const gameEngine = new GameEngine();

// Load game data and start
gameEngine.init()
    .then(() => gameEngine.start())
    .catch(error => console.error('Game initialization failed:', error));
