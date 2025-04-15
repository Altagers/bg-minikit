// Minigames module
function showMinigamesMenu() {
  DOM.minigamesMenu.style.display = 'flex';
}

function hideMinigamesMenu() {
  DOM.minigamesMenu.style.display = 'none';
}

// Find Coin minigame
function findCoin() {
  if (game.energy < 10 || game.state === 'dead' || Date.now() < game.lastHide + 300000) return;
  game.energy -= 10;
  game.lastHide = Date.now();
  hideMinigamesMenu();

  DOM.hideGameBox.style.display = 'flex';
  DOM.hideGameBox.innerHTML = '<div id="hide-game-close">✖</div>';
  const bushes = ['🌳', '🌳', '🌳'];
  const coinBush = Math.floor(Math.random() * 3);
  bushes.forEach((bush, index) => {
    const bushElement = document.createElement('div');
    bushElement.className = 'bush';
    bushElement.textContent = bush;
    bushElement.onclick = () => {
      DOM.hideGameBox.style.display = 'none';
      if (index === coinBush) {
        const coinReward = Math.random() < 0.5 ? 50 : 0;
        const xpReward = coinReward === 0 && Math.random() < 0.3 ? 15 : 0;
        if (coinReward) {
          game.coins += coinReward;
          game.stats.dailyCoins += coinReward;
          queueNotification(`🪙 Found ${coinReward} coins!`);
          showCoinAnimation();
        } else if (xpReward) {
          game.xp += xpReward;
          queueNotification(`📈 Found ${xpReward} XP!`);
          checkLevelUp();
        } else {
          queueNotification('Nothing here... 😢');
        }
      } else {
        queueNotification('Wrong bush! 😢');
      }
      updateGame();
    };
    DOM.hideGameBox.appendChild(bushElement);
  });

  document.getElementById('hide-game-close').onclick = () => {
    DOM.hideGameBox.style.display = 'none';
    updateGame();
  };
}

// Fishing minigame
function goFishing() {
  if (game.energy < 12 || game.state === 'dead' || Date.now() < game.lastFishing + 600000) return;
  game.energy -= 12;
  game.lastFishing = Date.now();
  hideMinigamesMenu();

  DOM.fishingGameBox.style.display = 'block';
  DOM.fishingGameBox.innerHTML = `
    <div id="fishing-game-close">✖</div>
    <div id="fishing-lane" class="fishing-lane">
      <div class="catch-zone"></div>
    </div>
    <button id="fishing-catch-button">Catch 🎣</button>
  `;
  const fishingLane = document.getElementById('fishing-lane');
  const catchButton = document.getElementById('fishing-catch-button');

  let attempts = 0;
  const maxAttempts = game.level >= 5 ? 5 : 3;
  let fishCaught = 0;

  function spawnFish() {
    if (attempts >= maxAttempts) {
      DOM.fishingGameBox.style.display = 'none';
      game.stats.fishCaught += fishCaught;
      game.stats.dailyFishCaught += fishCaught;
      queueNotification(`🎣 Caught ${fishCaught} fish!`);
      updateGame();
      return;
    }

    fishingLane.querySelectorAll('.fish-item').forEach(el => el.remove());
    const itemType = Math.random();
    const isFast = game.level >= 5 && Math.random() < 0.3;
    const item = itemType < 0.33 ? '👟' : itemType < 0.66 ? '🪙' : '🐟';
    const fishItem = document.createElement('div');
    fishItem.className = 'fish-item';
    fishItem.textContent = item;
    fishItem.style.animationDuration = isFast ? '1s' : '2s';
    fishingLane.appendChild(fishItem);

    let caught = false;
    catchButton.onclick = () => {
      if (caught) return;
      caught = true;
      attempts++;
      const position = parseFloat(fishItem.offsetLeft);
      if (position >= 85 && position <= 115) {
        if (item === '🐟') {
          fishCaught++;
          const coinReward = isFast ? 45 : 30;
          const xpReward = isFast ? 15 : 10;
          game.coins += coinReward;
          game.xp += xpReward;
          game.stats.dailyCoins += coinReward;
          queueNotification(`🐟 Caught a fish! +${coinReward} coins, +${xpReward} XP`);
          showCoinAnimation();
          checkLevelUp();
        } else if (item === '🪙') {
          const coinReward = 50;
          game.coins += coinReward;
          game.stats.dailyCoins += coinReward;
          queueNotification(`🪙 Caught a coin! +${coinReward} coins`);
          showCoinAnimation();
        } else {
          queueNotification('👟 Caught a boot...');
        }
      } else {
        queueNotification('Missed! 😢');
      }
      setTimeout(spawnFish, 500);
    };
  }

  spawnFish();
  document.getElementById('fishing-game-close').onclick = () => {
    DOM.fishingGameBox.style.display = 'none';
    updateGame();
  };
}

// Treasure Map minigame
function openTreasureMap() {
  if (game.energy < 5 || game.state === 'dead' || Date.now() < game.lastTreasureMap + 43200000) return;
  game.energy -= 5;
  game.lastTreasureMap = Date.now();
  hideMinigamesMenu();

  DOM.treasureMapBox.style.display = 'block';
  DOM.treasureMapBox.innerHTML = '<div id="treasure-map-close">✖</div><div id="treasure-map-grid" class="treasure-map-grid"></div><button id="upgrade-map-button">Upgrade Map (50 🪙)</button>';
  const grid = document.getElementById('treasure-map-grid');
  const upgradeButton = document.getElementById('upgrade-map-button');

  let upgraded = false;
  const cells = Array(16).fill(null).map(() => {
    const type = Math.random();
    if (game.level >= 5 && type < 0.2) return 'trap';
    if (type < 0.3) return 'empty';
    if (type < 0.35 + (upgraded ? 0.1 : 0)) return 'treasure';
    return 'normal';
  });

  let picksLeft = game.level >= 5 ? 5 : 3;
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'treasure-cell';
    cell.textContent = '❓';
    cell.onclick = () => {
      if (picksLeft <= 0 || cell.classList.contains('revealed')) return;
      cell.classList.add('revealed');
      picksLeft--;
      const type = cells[i];
      if (type === 'normal') {
        const coins = Math.floor(Math.random() * 41) + 10;
        game.coins += coins;
        game.stats.dailyCoins += coins;
        cell.textContent = '🪙';
        queueNotification(`🪙 Found ${coins} coins`);
        showCoinAnimation();
      } else if (type === 'treasure') {
        game.coins += 100;
        game.gems += 1;
        cell.textContent = '💎';
        queueNotification('💎 Found a treasure! +100 coins, +1 gem');
        showCoinAnimation();
      } else if (type === 'trap') {
        game.energy = Math.max(0, game.energy - 5);
        cell.textContent = '💥';
        queueNotification('💥 Hit a trap! -5 energy');
      } else {
        cell.textContent = '⭕';
        queueNotification('⭕ Empty cell...');
      }

      if (picksLeft === 0) {
        setTimeout(() => {
          DOM.treasureMapBox.style.display = 'none';
          updateGame();
        }, 1000);
      }
    };
    grid.appendChild(cell);
  }

  upgradeButton.onclick = () => {
    if (game.coins >= 50 && !upgraded) {
      game.coins -= 50;
      upgraded = true;
      upgradeButton.disabled = true;
      queueNotification('🗺️ Map upgraded! Higher treasure chance.');
      updateGame();
    }
  };

  document.getElementById('treasure-map-close').onclick = () => {
    DOM.treasureMapBox.style.display = 'none';
    updateGame();
  };
}