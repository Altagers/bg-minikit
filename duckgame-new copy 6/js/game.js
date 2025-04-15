// Core game functions
function updateGame() {
  const now = Date.now();
  const delta = (now - game.lastUpdate) / 1000;
  game.energy = Math.min(100, game.energy + delta * game.energyRegen);
  game.lastUpdate = now;

  if (game.xpBuffStart && now >= game.xpBuffStart + 3600000) {
    game.xpMultiplier /= 2;
    delete game.xpBuffStart;
    queueNotification('XP Buff ended! 📈');
  }

  if (game.fitnessEnd && now >= game.fitnessEnd) {
    game.state = 'hungry';
    game.fitnessEnd = 0;
    DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
  }

  const today = new Date().toDateString();
  if (game.stats.lastDay !== today) {
    game.stats.lastDay = today;
    resetDailyStats();
    game.gems += 1;
    game.coins += 50;
    queueNotification('Daily login bonus: +1 gem, +50 coins! 🎁');
  }

  DOM.stageDisplay.textContent = game.stage;
  DOM.levelDisplay.textContent = game.level;
  DOM.coinsDisplay.textContent = Math.floor(game.coins);
  DOM.gemsDisplay.textContent = game.xpBuffStart
    ? `${game.gems} 💎 (XP Buff: ${Math.floor((3600000 - (now - game.xpBuffStart)) / 60000)}m)`
    : game.gems;
  DOM.deathsDisplay.textContent = game.stats.deaths;
  DOM.xpDisplay.textContent = Math.floor(game.xp);
  DOM.xpNeeded.textContent = game.xpNeeded;
  DOM.energyDisplay.textContent = Math.floor(game.energy);
  DOM.energyBar.style.width = `${Math.min(100, game.energy)}%`;
  DOM.xpBar.style.width = `${Math.min(100, (game.xp / game.xpNeeded) * 100)}%`;

  DOM.feedButton.disabled = game.energy < 10 || game.state === 'dead' || game.fitnessEnd;
  DOM.fitnessButton.disabled = game.state !== 'overfed' || game.energy < 25 || game.fitnessEnd;
  DOM.reviveButton.disabled = game.state !== 'dead' || game.freeRevives <= 0;
  DOM.reviveButton.textContent = `Revive Free (${game.freeRevives})`;
  DOM.buyDuckButton.style.display = game.state === 'dead' && game.freeRevives <= 0 ? 'inline' : 'none';

  const hideTimeLeft = Math.max(0, (game.lastHide + 300000 - now) / 1000);
  DOM.hideButton.textContent = hideTimeLeft > 0 ? `Find Coin 🌳 (${Math.floor(hideTimeLeft)}s)` : 'Find Coin 🌳';
  DOM.hideButton.disabled = hideTimeLeft > 0 || game.energy < 10 || game.state === 'dead';

  const fishingTimeLeft = Math.max(0, (game.lastFishing + 600000 - now) / 1000);
  DOM.fishingButton.textContent = fishingTimeLeft > 0 ? `Fishing 🎣 (${Math.floor(fishingTimeLeft)}s)` : 'Fishing 🎣';
  DOM.fishingButton.disabled = fishingTimeLeft > 0 || game.energy < 12 || game.state === 'dead';

  const treasureMapTimeLeft = Math.max(0, (game.lastTreasureMap + 43200000 - now) / 1000);
  DOM.treasureMapButton.textContent = treasureMapTimeLeft > 0 ? `Treasure Map 🗺️ (${Math.floor(treasureMapTimeLeft / 3600)}h:${Math.floor((treasureMapTimeLeft % 3600) / 60)}m)` : 'Treasure Map 🗺️';
  DOM.treasureMapButton.disabled = treasureMapTimeLeft > 0 || game.energy < 5 || game.state === 'dead';

  updateDuckImage();
  updateShop();
  updateAchievements();
  updateQuests();
  
  // Проверяем наличие функции updateGarden перед вызовом
  if (typeof window.updateGarden === 'function') {
    window.updateGarden();
  }
}

function updateDuckImage() {
  const skin = SKINS[game.selectedSkin] || SKINS.default;
  DOM.duckImage.src = skin.images[game.state] || 'images/fallback.png';
  DOM.duckImage.className = game.state;
}

function checkLevelUp() {
  while (game.xp >= game.xpNeeded) {
    game.level++;
    game.xp -= game.xpNeeded;
    game.xpNeeded = Math.round(game.xpNeeded * 1.5);
    queueNotification(`Level up! Now ${game.level} 🎉`);
    playSound(1100, 'sawtooth', 0.2);
    if (game.level >= 5 && game.stage === 'Baby') {
      game.stage = 'Adult';
      queueNotification('Duck grew into an Adult! 🦆');
    } else if (game.level >= 10 && game.stage === 'Adult') {
      game.stage = 'Legend';
      queueNotification('Duck became a Legend! 🦆');
    }
  }
}

function resetDailyStats() {
  game.stats.dailyFeeds = 0;
  game.stats.dailyWorkouts = 0;
  game.stats.dailyCoins = 0;
  game.stats.dailyHarvests = 0;
  game.stats.dailyFishCaught = 0;
  game.quests = game.quests.filter(q => !QUESTS.find(quest => quest.id === q && quest.reset === 'daily'));
  game.pendingQuests = [];
}

function feedDuck() {
  if (game.energy < 10 || game.state === 'dead' || game.fitnessEnd) return;
  game.energy -= 10;
  let coins = game.coinsPerFeed;
  let xp = game.xpPerFeed * game.xpMultiplier;

  if (game.state === 'overfed') {
    coins *= 1.5;
    xp *= 1.5;
    game.deathChance += 0.1;
    if (Math.random() < game.deathChance) {
      game.state = 'dead';
      game.coins = Math.floor(game.coins * 0.95);
      game.stats.deaths++;
      queueNotification('Duck overate and died! 💀 -5% coins');
      playDeathSound();
      updateGame();
      return;
    }
  }

  game.coins += coins;
  game.xp += xp;
  game.stats.feeds++;
  game.stats.dailyFeeds++;
  game.stats.dailyCoins += coins;

  if (game.state === 'hungry') game.state = 'normal';
  else if (game.state === 'normal') game.state = 'overfed';

  queueNotification(`🪙 +${Math.floor(coins)} coins, 📈 +${Math.floor(xp)} XP`);
  showCoinAnimation();
  checkLevelUp();
  triggerEvent('feed');
  updateGame();
}

function workoutDuck() {
  if (game.state !== 'overfed' || game.energy < 25 || game.fitnessEnd) return;
  game.energy -= 25;
  game.state = 'fitness';
  game.fitnessEnd = Date.now() + game.fitnessTime * 1000;
  game.deathChance = Math.max(0.05, game.deathChance - 0.05);

  let clicks = 0;
  let endTime = Date.now() + 2000;
  DOM.fitnessButton.textContent = 'Click! (0)';
  DOM.fitnessButton.onclick = () => {
    if (Date.now() > endTime) return;
    clicks++;
    DOM.fitnessButton.textContent = `Click! (${clicks})`;
    DOM.duckImage.classList.add('clickPulse');
    playSound(800, 'square', 0.05);
    setTimeout(() => DOM.duckImage.classList.remove('clickPulse'), 100);
  };

  setTimeout(() => {
    let xp = clicks >= 10 ? 10 * game.xpMultiplier : 0;
    game.xp += xp;
    game.stats.workouts++;
    game.stats.dailyWorkouts++;
    queueNotification(`Workout done! 📈 +${xp} XP`);
    DOM.fitnessButton.onclick = debounce(workoutDuck, 300);
    checkLevelUp();
    triggerEvent('fitness');
    updateGame();
  }, 2000);
}

function reviveDuck() {
  if (game.state !== 'dead' || game.freeRevives <= 0) return;
  game.freeRevives--;
  game.state = 'hungry';
  game.deathChance = 0.2;
  queueNotification('Duck revived for free! 🦆');
  updateGame();
}

function buyDuck() {
  if (game.state !== 'dead' || game.coins < 100) return;
  game.coins -= 100;
  game.state = 'hungry';
  game.deathChance = 0.2;
  queueNotification('Bought a new duck! 🦆');
  updateGame();
}