// Shop module
function updateShop() {
  console.log('Updating shop...');
  // Clear shop container
  DOM.shopItems.innerHTML = '';
  
  // Add stats
  const statsDiv = document.createElement('div');
  statsDiv.className = 'shop-stats';
  statsDiv.innerHTML = `
    <span class="stat-item"><span class="icon">🪙</span> ${Math.floor(game.coins)} Coins</span>
    <span class="stat-item"><span class="icon">💎</span> ${game.gems} Gems</span>
  `;
  DOM.shopItems.appendChild(statsDiv);

  // Upgrades
  const upgradesHeader = document.createElement('h3');
  upgradesHeader.textContent = 'Upgrades';
  DOM.shopItems.appendChild(upgradesHeader);

  UPGRADES.forEach((upgrade, index) => {
    const count = game.upgradeCounts[upgrade.id] || 0;
    if (count >= upgrade.maxPurchases || game.level < upgrade.level) return;
    const cost = Math.round(upgrade.baseCost * Math.pow(1.5, count));
    const canAfford = game.coins >= cost;

    const div = document.createElement('div');
    div.className = canAfford ? 'can-buy' : 'unavailable';
    div.innerHTML = `
      <div class="item-text">${upgrade.icon} ${upgrade.name} (${count}/${upgrade.maxPurchases})</div>
      <div class="item-description">${upgrade.description}</div>
    `;

    const button = document.createElement('button');
    button.id = `upgrade-btn-${upgrade.id}-${index}`; // Unique ID for debugging
    button.className = 'shop-button';
    button.textContent = `Buy (${cost} 🪙)`;
    button.disabled = !canAfford;
    console.log(`Creating button for ${upgrade.name}, ID: ${button.id}, enabled: ${!button.disabled}`);

    button.onclick = () => {
      console.log(`Clicked buy for ${upgrade.name}, cost: ${cost}, coins: ${game.coins}`);
      if (game.coins < cost) {
        queueNotification('Not enough coins! 🪙');
        console.log('Purchase failed: insufficient coins');
        return;
      }
      game.coins -= cost;
      upgrade.effect();
      game.upgradeCounts[upgrade.id] = (game.upgradeCounts[upgrade.id] || 0) + 1;
      queueNotification(`Purchased ${upgrade.name}! 🎉`);
      playSound(1000, 'sine', 0.2);
      console.log(`Purchased ${upgrade.name}, new coin balance: ${game.coins}`);
      updateGame();
    };

    div.appendChild(button);
    DOM.shopItems.appendChild(div);
  });

  // Skins and boosts
  const gemsHeader = document.createElement('h3');
  gemsHeader.textContent = 'Skins & Boosts';
  DOM.shopItems.appendChild(gemsHeader);

  GEM_UPGRADES.forEach((upgrade, index) => {
    if (!upgrade.repeatable && game.upgrades.includes(upgrade.id)) return;
    const canAfford = game.gems >= upgrade.cost;

    const div = document.createElement('div');
    div.className = canAfford ? 'can-buy' : 'unavailable';
    div.innerHTML = `
      <div class="item-text">${upgrade.icon} ${upgrade.name}</div>
      <div class="item-description">${upgrade.description}</div>
    `;

    const button = document.createElement('button');
    button.id = `gem-btn-${upgrade.id}-${index}`;
    button.className = 'shop-button';
    button.textContent = `Buy (${upgrade.cost} 💎)`;
    button.disabled = !canAfford;
    console.log(`Creating button for ${upgrade.name}, ID: ${button.id}, enabled: ${!button.disabled}`);

    button.onclick = () => {
      console.log(`Clicked buy for ${upgrade.name}, cost: ${upgrade.cost}, gems: ${game.gems}`);
      if (game.gems < upgrade.cost) {
        queueNotification('Not enough gems! 💎');
        console.log('Purchase failed: insufficient gems');
        return;
      }
      game.gems -= upgrade.cost;
      upgrade.effect();
      queueNotification(`Purchased ${upgrade.name}! 🎉`);
      playSound(1000, 'sine', 0.2);
      console.log(`Purchased ${upgrade.name}, new gem balance: ${game.gems}`);
      updateGame();
    };

    div.appendChild(button);
    DOM.shopItems.appendChild(div);
  });

  // Skins
  const skinsHeader = document.createElement('h4');
  skinsHeader.textContent = 'Skins';
  DOM.shopItems.appendChild(skinsHeader);

  Object.keys(SKINS).forEach((skinId, index) => {
    if (skinId === 'default' || game.upgrades.includes(skinId)) {
      const isSelected = game.selectedSkin === skinId;

      const div = document.createElement('div');
      div.className = isSelected ? 'purchased' : 'can-buy';
      div.innerHTML = `
        <div class="item-text">${SKINS[skinId].name}</div>
      `;

      const button = document.createElement('button');
      button.id = `skin-btn-${skinId}-${index}`;
      button.className = 'shop-button';
      button.textContent = isSelected ? 'Selected' : 'Select';
      button.disabled = isSelected;
      console.log(`Creating button for ${SKINS[skinId].name}, ID: ${button.id}, enabled: ${!button.disabled}`);

      button.onclick = () => {
        console.log(`Clicked select for ${SKINS[skinId].name}`);
        if (!isSelected) {
          game.selectedSkin = skinId;
          queueNotification(`Selected ${SKINS[skinId].name}! 🦆`);
          playSound(900, 'sine', 0.2);
          console.log(`Selected skin ${SKINS[skinId].name}`);
          updateGame();
        }
      };

      div.appendChild(button);
      DOM.shopItems.appendChild(div);
    }
  });
}