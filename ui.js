// UI Container setup
const uiContainer = document.getElementById('uiContainer');
import { heroes } from './data.js';

export const ui = {
    // Render Start Screen
    renderStartScreen: function(startGameCallback) {
        uiContainer.innerHTML = `
            <div class="start-screen">
                <h1>RPG ADVENTURE</h1>
                <p>Select your party of heroes</p>
                <button id="startButton" class="game-button">START GAME</button>
            </div>
        `;
        
        document.getElementById('startButton').addEventListener('click', () => {
            this.renderPartySelection(startGameCallback);
        });
    },

    // Render Party Selection
    renderPartySelection: function(startGameCallback) {
        uiContainer.innerHTML = `
            <div class="party-selection">
                <h2>Select Your Party (up to 3 heroes)</h2>
                <div class="heroes-container">
                    ${heroes.map(hero => `
                        <div class="hero-card" data-id="${hero.id}">
                            <div class="hero-color" style="background-color: ${hero.color}"></div>
                            <h3>${hero.name}</h3>
                            <p>ATK: ${hero.attack} DEF: ${hero.defense}</p>
                            <p>HP: ${hero.health} SPD: ${hero.speed}</p>
                            <button class="select-hero">Select</button>
                        </div>
                    `).join('')}
                </div>
                <div class="selected-heroes">
                    <h3>Your Party:</h3>
                    <div class="selected-list"></div>
                    <div class="party-selection-buttons">
                        <button id="cancelSelection" class="game-button">Cancel</button>
                        <button id="confirmSelection" class="game-button">Confirm</button>
                    </div>
                </div>
            </div>
        `;

        const selectedHeroes = [];
        const selectedList = document.querySelector('.selected-list');
        const heroCards = document.querySelectorAll('.hero-card');

        heroCards.forEach(card => {
            const selectButton = card.querySelector('.select-hero');
            selectButton.addEventListener('click', () => {
                const heroId = parseInt(card.dataset.id);
                const hero = heroes.find(h => h.id === heroId);

                if (selectedHeroes.length < 3 && !selectedHeroes.some(h => h.id === heroId)) {
                    selectedHeroes.push(hero);
                    updateSelectedList();
                }
            });
        });

        function updateSelectedList() {
            selectedList.innerHTML = selectedHeroes.map(hero => `
                <div class="selected-hero" data-id="${hero.id}">
                    <span style="color: ${hero.color}">${hero.name}</span>
                    <button class="remove-hero">×</button>
                </div>
            `).join('');

            document.querySelectorAll('.remove-hero').forEach(button => {
                button.addEventListener('click', (e) => {
                    const heroId = parseInt(e.target.closest('.selected-hero').dataset.id);
                    const index = selectedHeroes.findIndex(h => h.id === heroId);
                    if (index !== -1) {
                        selectedHeroes.splice(index, 1);
                        updateSelectedList();
                    }
                });
            });
        }

        document.getElementById('cancelSelection').addEventListener('click', () => {
            this.renderStartScreen(startGameCallback);
        });

        document.getElementById('confirmSelection').addEventListener('click', () => {
            if (selectedHeroes.length > 0) {
                startGameCallback(selectedHeroes);
            } else {
                alert('Please select at least one hero!');
            }
        });
    },
    // Render End Button
    renderEndButton: function(endGameCallback) {
        uiContainer.innerHTML += `
            <button id="endButton" class="end-button">END</button>
        `;
        
        document.getElementById('endButton').addEventListener('click', endGameCallback);
    },

    // Render End Screen
// Add to ui.js
showCombatScreen: function(player, enemy, attackCallback, fleeCallback) {
    uiContainer.innerHTML += `
        <div class="combat-screen">
            <div class="combat-info">
                <h2>COMBAT!</h2>
                <div class="combatants">
                    <div class="combatant player">
                        <h3>${player.name}</h3>
                        <p>HP: ${Math.floor(player.health)}/${player.maxHealth}</p>
                        <p>ATK: ${player.attack} DEF: ${player.defense}</p>
                    </div>
                    <div class="vs">VS</div>
                    <div class="combatant enemy">
                        <h3>${enemy.name}</h3>
                        <p>HP: ${Math.floor(enemy.health)}/${enemy.maxHealth}</p>
                        <p>ATK: ${enemy.attack} DEF: ${enemy.defense}</p>
                    </div>
                </div>
                <div class="combat-message"></div>
                <div class="combat-actions">
                    <button id="attackButton" class="game-button">ATTACK</button>
                    <button id="fleeButton" class="game-button">FLEE</button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('attackButton').addEventListener('click', attackCallback);
    document.getElementById('fleeButton').addEventListener('click', fleeCallback);
},

showCombatMessage: function(message) {
    const messageEl = document.querySelector('.combat-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
},

clearCombatScreen: function() {
    const combatScreen = document.querySelector('.combat-screen');
    if (combatScreen) {
        combatScreen.remove();
    }
},

// Update renderEndScreen to include victory parameter
renderEndScreen: function(gold, xp, survivors, totalParty, victory, restartCallback) {
    uiContainer.innerHTML = `
        <div class="end-screen">
            <h1>${victory ? 'VICTORY!' : 'GAME OVER'}</h1>
            <p>Survivors: ${survivors}/${totalParty}</p>
            <p>Gold Collected: ${gold}</p>
            <p>Experience Gained: ${xp}</p>
            <button id="restartButton" class="game-button">PLAY AGAIN</button>
        </div>
    `;
    
    document.getElementById('restartButton').addEventListener('click', restartCallback);
},

    // Clear UI elements
    clearUI: function() {
        uiContainer.innerHTML = '';
    }
};
