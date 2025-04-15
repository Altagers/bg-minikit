// UI module
// DOM elements
const DOM = {
  duckImage: document.getElementById('duck-image'),
  stageDisplay: document.getElementById('stage-display'),
  levelDisplay: document.getElementById('level-display'),
  coinsDisplay: document.getElementById('coins-display'),
  gemsDisplay: document.getElementById('gems-display'),
  deathsDisplay: document.getElementById('deaths-display'),
  xpDisplay: document.getElementById('xp-display'),
  xpNeeded: document.getElementById('xp-needed'),
  energyDisplay: document.getElementById('energy-display'),
  xpBar: document.getElementById('xp-bar')?.firstChild,
  energyBar: document.getElementById('energy-bar')?.firstChild,
  feedButton: document.getElementById('feed-button'),
  fitnessButton: document.getElementById('fitness-button'),
  minigamesButton: document.getElementById('minigames-button'),
  reviveButton: document.getElementById('revive-button'),
  buyDuckButton: document.getElementById('buy-duck-button'),
  log: document.getElementById('log'),
  clearLogButton: document.getElementById('clear-log-button'),
  modal: document.getElementById('modal'),
  modalText: document.getElementById('modal-text'),
  modalOption1: document.getElementById('modal-option1'),
  modalOption2: document.getElementById('modal-option2'),
  modalNext: document.getElementById('modal-next'),
  modalDone: document.getElementById('modal-done'),
  shopItems: document.getElementById('shop-items'),
  achievementsList: document.getElementById('achievements-list'),
  questsList: document.getElementById('quests-list'),
  helpButton: document.getElementById('help-button'),
  gameContainer: document.getElementById('game-container'),
  minigamesMenu: document.getElementById('minigames-menu'),
  hideButton: document.getElementById('hide-button'),
  fishingButton: document.getElementById('fishing-button'),
  treasureMapButton: document.getElementById('treasure-map-button'),
  closeMinigamesButton: document.getElementById('close-minigames'),
  hideGameBox: document.getElementById('hide-game-box'),
  fishingGameBox: document.getElementById('fishing-game-box'),
  treasureMapBox: document.getElementById('treasure-map-box'),
  plantFlowerButton: document.getElementById('plant-flower-button'),
  plantBushButton: document.getElementById('plant-bush-button'),
  gardenStatus: document.getElementById('garden-status'),
  gardenContent: document.getElementById('garden-content'),
  toggleGardenButton: document.getElementById('toggle-garden-button'),
};

// Notifications
let notificationQueue = [];
function queueNotification(message) {
  notificationQueue.push(message);
  if (notificationQueue.length === 1) showNextNotification();
}

function showNextNotification() {
  if (!notificationQueue.length || !DOM.log) return;
  const entry = document.createElement('div');
  entry.textContent = notificationQueue[0];
  DOM.log.prepend(entry);
  while (DOM.log.children.length > 5) DOM.log.removeChild(DOM.log.lastChild);
  notificationQueue.shift();
  setTimeout(showNextNotification, 2000);
}

// Coin animation
function showCoinAnimation() {
  if (!DOM.gameContainer) return;
  const coin = document.createElement('div');
  coin.className = 'coin-animation';
  coin.textContent = '🪙';
  coin.style.left = `${Math.random() * (DOM.gameContainer.offsetWidth - 15)}px`;
  DOM.gameContainer.appendChild(coin);
  setTimeout(() => coin.remove(), 1000);
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Tutorial
function showTutorial() {
  game.tutorialSeen = true;
  game.tutorialStep = 0;
  updateTutorial();
}

function updateTutorial() {
  const steps = [
    `🦆 Welcome to Life of Duckie! Feed me with "Feed 🥖" to earn coins and XP. But don't overdo it!`,
    `💪 If I'm overfed, use "Workout 💪" to keep me fit. It also earns XP!`,
    `🎮 Try "Mini-games 🎲" like Fishing or Treasure Map for extra rewards. Check out "Duck's Garden 🌱" too!`,
  ];
  DOM.modalText.textContent = steps[game.tutorialStep];
  DOM.modalOption1.style.display = 'none';
  DOM.modalOption2.style.display = 'none';
  DOM.modalNext.style.display = game.tutorialStep < steps.length - 1 ? 'inline' : 'none';
  DOM.modalDone.style.display = game.tutorialStep === steps.length - 1 ? 'inline' : 'none';
  DOM.modal.style.display = 'block';
}

// Help
function showHelp() {
  DOM.modalText.textContent = `Quick Tips:\n- Feed 🥖 to earn coins/XP, but overfeeding risks death.\n- Workout 💪 when overfed.\n- Play Mini-games 🎲 for bonuses.\n- Grow plants in Duck's Garden 🌱.\n- Complete quests and achievements!`;
  DOM.modalOption1.style.display = 'none';
  DOM.modalOption2.style.display = 'none';
  DOM.modalNext.style.display = 'none';
  DOM.modalDone.style.display = 'inline';
  DOM.modal.style.display = 'block';
}