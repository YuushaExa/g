import { SceneManager } from './SceneManager.js';

export class GameEngine {
    constructor() {
        this.sceneManager = new SceneManager();
        this.uiContainer = document.getElementById('uiContainer');
        this.gameData = {};
        this.uiData = {};
    }

    async init() {
        // Load game data
        const [uiResponse, gameResponse] = await Promise.all([
            fetch('./data/ui.json'),
            fetch('./data/game.json')
        ]);
        
        this.uiData = await uiResponse.json();
        this.gameData = await gameResponse.json();
        
        // Initialize scene manager with loaded data
        this.sceneManager.init(this.uiData, this.gameData);
    }

    start() {
        // Start with the initial scene
        this.sceneManager.loadScene('startScreen');
    }

    renderUI(html) {
        this.uiContainer.innerHTML = html;
    }
}
