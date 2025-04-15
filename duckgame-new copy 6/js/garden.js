// Garden module
const GARDEN_PLANTS = [
  {
    id: 'bread-flower',
    name: 'Bread Flower',
    icon: '🌼',
    cost: 10,
    growthTime: 300000, // 5 minutes
    rewards: { coins: 20, xp: 5, gemChance: 0.05 },
    description: 'A simple flower that produces bread. Grows quickly.'
  },
  {
    id: 'coin-bush',
    name: 'Coin Bush',
    icon: '🌳',
    cost: 50,
    growthTime: 900000, // 15 minutes
    rewards: { coins: 75, xp: 15, gemChance: 0.1 },
    description: 'A bush that grows coins. Takes longer but gives better rewards.'
  },
  {
    id: 'gem-tree',
    name: 'Gem Tree',
    icon: '🌲',
    cost: 200,
    growthTime: 3600000, // 1 hour
    rewards: { coins: 150, xp: 30, gemChance: 0.3 },
    description: 'A rare tree that has a high chance of producing gems.',
    unlockLevel: 5
  }
];

// Инициализация сада
function initGarden() {
  updateGardenUI();
  
  // Добавляем кнопки для растений
  DOM.plantButtons = document.createElement('div');
  DOM.plantButtons.className = 'garden-plant-buttons';
  DOM.gardenContent.insertBefore(DOM.plantButtons, DOM.gardenStatus);
  
  updatePlantButtons();
}

function updatePlantButtons() {
  DOM.plantButtons.innerHTML = '';
  
  GARDEN_PLANTS.forEach(plant => {
    if (plant.unlockLevel && game.level < plant.unlockLevel) return;
    
    const button = document.createElement('button');
    button.className = 'plant-button';
    button.disabled = game.garden.length >= game.gardenSlots || game.coins < plant.cost;
    button.innerHTML = `${plant.icon} ${plant.name} (${plant.cost} 🪙)`;
    button.title = plant.description;
    button.onclick = () => plantSeed(plant.id);
    DOM.plantButtons.appendChild(button);
  });
}

function plantSeed(plantId) {
  const plant = GARDEN_PLANTS.find(p => p.id === plantId);
  if (!plant || game.coins < plant.cost || game.garden.length >= game.gardenSlots) return;
  
  game.coins -= plant.cost;
  game.garden.push({ 
    id: plant.id, 
    plantedAt: Date.now(), 
    watered: false
  });
  
  queueNotification(`${plant.icon} Planted a ${plant.name}!`);
  playSound(600, 'sine', 0.1);
  updateGame();
}

function waterPlant(index) {
  const plant = game.garden[index];
  if (!plant || plant.watered || game.energy < 5) return;
  
  game.energy -= 5;
  plant.watered = true;
  
  const plantData = GARDEN_PLANTS.find(p => p.id === plant.id);
  queueNotification(`💧 Watered ${plantData.name}! +20% rewards`);
  playSound(400, 'sine', 0.1);
  updateGame();
}

function harvestPlant(index) {
  const plant = game.garden[index];
  if (!plant) return;
  
  const plantData = GARDEN_PLANTS.find(p => p.id === plant.id);
  if (!plantData) return;
  
  // Расчет наград
  let rewards = { ...plantData.rewards };
  
  // Случайный фактор (90-110%)
  const randomFactor = 0.9 + Math.random() * 0.2;
  
  // Бонус за полив
  const waterBonus = plant.watered ? 1.2 : 1.0;
  
  rewards.coins = Math.floor(rewards.coins * waterBonus * randomFactor);
  rewards.xp = Math.floor(rewards.xp * waterBonus * randomFactor);
  
  // Применяем награды
  game.coins += rewards.coins;
  game.xp += rewards.xp;
  game.stats.harvests++;
  game.stats.dailyHarvests++;
  game.stats.dailyCoins += rewards.coins;
  
  // Шанс получения гема
  if (Math.random() < rewards.gemChance) {
    game.gems += 1;
    queueNotification(`💎 Found a gem while harvesting!`);
    playEpicSound();
  }
  
  queueNotification(`🌱 Harvested ${plantData.name}! +${Math.floor(rewards.coins)} coins, +${rewards.xp} XP`);
  showCoinAnimation();
  playSound(500, 'sine', 0.2);
  checkLevelUp();
  
  // Удаляем растение
  game.garden.splice(index, 1);
  updateGame();
}

function updateGarden() {
  const now = Date.now();
  updateGardenUI();
  updatePlantButtons();
  
  if (!DOM.gardenStatus) return; // Проверка на существование DOM элемента
  DOM.gardenStatus.innerHTML = '';
  
  if (game.garden.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'garden-empty-message';
    emptyMsg.textContent = 'Your garden is empty. Plant some seeds!';
    DOM.gardenStatus.appendChild(emptyMsg);
    return;
  }
  
  game.garden.forEach((plant, index) => {
    const plantData = GARDEN_PLANTS.find(p => p.id === plant.id);
    if (!plantData) return;
    
    const timeLeft = Math.max(0, plantData.growthTime - (now - plant.plantedAt));
    
    const statusDiv = document.createElement('div');
    statusDiv.className = 'plant-status';
    
    // Иконка и информация о растении
    const plantIcon = document.createElement('span');
    plantIcon.className = 'plant-icon';
    plantIcon.textContent = plantData.icon;
    statusDiv.appendChild(plantIcon);
    
    const plantInfo = document.createElement('div');
    plantInfo.className = 'plant-info';
    
    const plantName = document.createElement('div');
    plantName.className = 'plant-name';
    plantName.textContent = plantData.name;
    plantInfo.appendChild(plantName);
    
    const plantTime = document.createElement('div');
    plantTime.className = 'plant-time';
    plantTime.textContent = timeLeft > 0 
      ? `Growing: ${Math.floor(timeLeft / 60000)}m ${Math.floor((timeLeft % 60000) / 1000)}s` 
      : 'Ready to harvest!';
    plantInfo.appendChild(plantTime);
    
    // Добавляем иконку полива, если растение полито
    if (plant.watered) {
      const wateredIcon = document.createElement('span');
      wateredIcon.className = 'status-icon watered';
      wateredIcon.textContent = '💧';
      wateredIcon.title = 'Watered: +20% rewards';
      plantInfo.appendChild(wateredIcon);
    }
    
    statusDiv.appendChild(plantInfo);
    
    // Кнопки действий
    const actionButtons = document.createElement('div');
    actionButtons.className = 'plant-actions';
    
    if (timeLeft <= 0) {
      const harvestButton = document.createElement('button');
      harvestButton.className = 'harvest-button';
      harvestButton.textContent = 'Harvest';
      harvestButton.onclick = () => harvestPlant(index);
      actionButtons.appendChild(harvestButton);
    } else if (!plant.watered) {
      const waterButton = document.createElement('button');
      waterButton.className = 'water-button';
      waterButton.textContent = 'Water (5 ⚡)';
      waterButton.disabled = game.energy < 5;
      waterButton.onclick = () => waterPlant(index);
      actionButtons.appendChild(waterButton);
    }
    
    statusDiv.appendChild(actionButtons);
    DOM.gardenStatus.appendChild(statusDiv);
  });
}

function updateGardenUI() {
  // Обновляем слоты сада в зависимости от уровня
  game.gardenSlots = 3 + Math.floor(game.level / 5);
  
  // Обновляем заголовок сада
  const gardenHeader = document.querySelector('.garden-header span');
  if (gardenHeader) {
    gardenHeader.textContent = `Duck's Garden 🌱 (${game.garden.length}/${game.gardenSlots})`;
  }
}

// Экспортируем функции
window.plantFlower = () => plantSeed('bread-flower');
window.plantBush = () => plantSeed('coin-bush');
window.plantTree = () => plantSeed('gem-tree');
window.updateGarden = updateGarden;
window.initGarden = initGarden;