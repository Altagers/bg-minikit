// Main initialization
function init() {
  if (!DOM.feedButton || !DOM.fitnessButton || !DOM.minigamesButton || !DOM.shopItems) {
    console.error('Required DOM elements are missing');
    return;
  }

  DOM.feedButton.onclick = debounce(feedDuck, 300);
  DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
  DOM.minigamesButton.onclick = debounce(showMinigamesMenu, 300);
  DOM.hideButton.onclick = debounce(findCoin, 300);
  DOM.fishingButton.onclick = debounce(goFishing, 300);
  DOM.treasureMapButton.onclick = debounce(openTreasureMap, 300);
  DOM.closeMinigamesButton.onclick = hideMinigamesMenu;
  DOM.reviveButton.onclick = debounce(reviveDuck, 300);
  DOM.buyDuckButton.onclick = debounce(buyDuck, 300);
  
  DOM.clearLogButton.onclick = () => {
    DOM.log.innerHTML = '';
    notificationQueue = [];
  };
  
  // Проверяем наличие элементов сада
  if (DOM.toggleGardenButton) {
    DOM.toggleGardenButton.onclick = () => {
      game.gardenVisible = !game.gardenVisible;
      if (DOM.gardenContent) {
        DOM.gardenContent.classList.toggle('hidden', !game.gardenVisible);
      }
      DOM.toggleGardenButton.textContent = game.gardenVisible ? 'Hide' : 'Show';
    };
  }
  
  DOM.helpButton.onclick = showHelp;
  DOM.modalNext.onclick = () => {
    game.tutorialStep++;
    updateTutorial();
  };
  DOM.modalDone.onclick = () => {
    DOM.modal.style.display = 'none';
    updateGame();
  };

  document.querySelectorAll('.icon-button').forEach(button => {
    button.onclick = () => {
      console.log(`Switching to tab: ${button.dataset.tab}`);
      document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.icon-button').forEach(btn => {
        btn.classList.remove('active');
      });
      document.getElementById(button.dataset.tab).classList.add('active');
      button.classList.add('active');
      button.classList.remove('pending');
    };
  });

  // Load saved game or show tutorial
  const savedGame = localStorage.getItem('duckGame');
  if (savedGame) {
    try {
      const parsed = JSON.parse(savedGame);
      game = { ...game, ...parsed };
      game.lastUpdate = Date.now();
      queueNotification('Game loaded! 🎮');
    } catch (e) {
      console.error('Failed to load saved game:', e);
    }
  } else if (!game.tutorialSeen) {
    setTimeout(showTutorial, 1000);
  }

  // Save game periodically
  setInterval(() => {
    localStorage.setItem('duckGame', JSON.stringify(game));
  }, 30000);

  // Инициализируем сад, если функция существует
  if (typeof window.initGarden === 'function') {
    window.initGarden();
  }

  // Update game regularly
  setInterval(updateGame, 1000);
  updateGame();
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Добавляем обновление сада в функцию gameLoop
function gameLoop() {
  updateGame();
  updateShop();
  updateAchievements();
  updateQuests();
  
  // Обновляем сад, если функция существует
  if (typeof window.updateGarden === 'function') {
    window.updateGarden();
  }
  
  requestAnimationFrame(gameLoop);
}