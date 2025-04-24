export class SceneManager {
    constructor() {
        this.currentScene = null;
        this.uiData = {};
        this.gameData = {};
    }

    init(uiData, gameData) {
        this.uiData = uiData;
        this.gameData = gameData;
    }

    loadScene(sceneId) {
        const scene = this.uiData.scenes.find(s => s.id === sceneId);
        if (!scene) {
            console.error(`Scene ${sceneId} not found`);
            return;
        }

        this.currentScene = scene;
        
        // Get the UI template
        const uiTemplate = this.uiData.uiTemplates[scene.ui];
        if (!uiTemplate) {
            console.error(`UI template ${scene.ui} not found`);
            return;
        }

        // Render the UI
        gameEngine.renderUI(uiTemplate.html);
        
        // Set up event listeners if any
        this.setupEventListeners(uiTemplate.events);
    }

    setupEventListeners(events) {
        if (!events) return;
        
        Object.entries(events).forEach(([elementId, eventConfig]) => {
            const element = document.getElementById(elementId);
            if (element) {
                element.addEventListener(eventConfig.event, () => {
                    if (eventConfig.action === 'loadScene') {
                        this.loadScene(eventConfig.target);
                    }
                    // Add more action types as needed
                });
            }
        });
    }
}
