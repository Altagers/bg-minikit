// Achievements module
const ACHIEVEMENTS = [
  {
    id: 'test-reward', name: 'Test Reward', icon: '🎁', description: 'Claim your test reward!',
    condition: () => true, progress: () => 'Ready to claim!', reward: { coins: 5000, gems: 100 }, secret: false
  },
  {
    id: 'feed-10', name: 'Bread Lover', icon: '🥖', description: 'Feed the duck 10 times.',
    condition: () => game.stats.feeds >= 10, progress: () => `${Math.min(game.stats.feeds, 10)}/10 feeds`, reward: { coins: 100, gems: 1 }, secret: false
  },
  {
    id: 'level-3', name: 'Rising Star', icon: '📈', description: 'Reach level 3.',
    condition: () => game.level >= 3, progress: () => `Level ${Math.min(game.level, 3)}/3`, reward: { coins: 200, gems: 2 }, secret: false
  },
  {
    id: 'workout-5', name: 'Fitness Fan', icon: '💪', description: 'Complete 5 workouts.',
    condition: () => game.stats.workouts >= 5, progress: () => `${Math.min(game.stats.workouts, 5)}/5 workouts`, reward: { coins: 150, gems: 1 }, secret: false
  },
  {
    id: 'coin-1000', name: 'Coin Collector', icon: '🪙', description: 'Collect 1000 coins.',
    condition: () => game.coins >= 1000, progress: () => `${Math.min(Math.floor(game.coins), 1000)}/1000 coins`, reward: { coins: 300, gems: 3 }, secret: false
  },
  {
    id: 'gardener', name: 'Gardener', icon: '🌱', description: 'Harvest 20 plants.',
    condition: () => game.stats.harvests >= 20, progress: () => `${Math.min(game.stats.harvests, 20)}/20 harvests`, reward: { coins: 500, gems: 3 }, secret: false
  },
  {
    id: 'fisher', name: 'Master Fisher', icon: '🎣', description: 'Catch 50 fish.',
    condition: () => game.stats.fishCaught >= 50, progress: () => `${Math.min(game.stats.fishCaught, 50)}/50 fish`, reward: { coins: 500, gems: 3 }, secret: false
  },
];

const QUESTS = [
  {
    id: 'feed-2', name: 'Quick Snack', icon: '🥖', description: 'Feed the duck 2 times today.',
    condition: () => game.stats.dailyFeeds >= 2, progress: () => `${Math.min(game.stats.dailyFeeds, 2)}/2 feeds`, reward: { coins: 50, gems: 1 }, reset: 'daily'
  },
  {
    id: 'workout-1', name: 'Morning Workout', icon: '💪', description: 'Complete 1 workout today.',
    condition: () => game.stats.dailyWorkouts >= 1, progress: () => `${Math.min(game.stats.dailyWorkouts, 1)}/1 workout`, reward: { coins: 75, gems: 1 }, reset: 'daily'
  },
  {
    id: 'fish-10', name: 'Fish Catcher', icon: '🎣', description: 'Catch 10 fish today.',
    condition: () => game.stats.dailyFishCaught >= 10, progress: () => `${Math.min(game.stats.dailyFishCaught, 10)}/10 fish`, reward: { coins: 150, gems: 1 }, reset: 'daily'
  },
];

// Update achievements in UI
function updateAchievements() {
  ACHIEVEMENTS.forEach(ach => {
    if (game.achievements.includes(ach.id) || game.pendingAchievements.includes(ach.id)) return;
    if (ach.condition()) {
      game.pendingAchievements.push(ach.id);
      queueNotification(`🏆 Achievement unlocked: ${ach.name}!`);
      const tab = document.querySelector('[data-tab="achievements-tab"]');
      if (tab) tab.classList.add('pending');
    }
  });

  DOM.achievementsList.innerHTML = '';
  ACHIEVEMENTS.forEach(ach => {
    if (ach.secret && !game.achievements.includes(ach.id) && !game.pendingAchievements.includes(ach.id)) return;
    const div = document.createElement('div');
    const isCompleted = game.achievements.includes(ach.id);
    const isPending = game.pendingAchievements.includes(ach.id);
    div.className = isCompleted ? 'completed' : isPending ? 'can-claim' : 'incomplete';
    div.innerHTML = `
      <div class="item-text">${ach.icon} ${ach.name}</div>
      <div class="item-description">${ach.description}</div>
      <div class="item-description">${isCompleted ? 'Completed!' : ach.progress()}</div>
      <div class="item-description">Reward: ${ach.reward.coins} 🪙, ${ach.reward.gems} 💎</div>
      ${isPending ? '<button class="claim-button">Claim</button>' : ''}
    `;
    if (isPending) {
      const button = div.querySelector('button');
      button.onclick = () => {
        game.coins += ach.reward.coins;
        game.gems += ach.reward.gems;
        game.achievements.push(ach.id);
        game.pendingAchievements = game.pendingAchievements.filter(id => id !== ach.id);
        queueNotification(`🏆 Claimed ${ach.name}! +${ach.reward.coins} coins, +${ach.reward.gems} gems`);
        playEpicSound();
        updateGame();
      };
    }
    DOM.achievementsList.appendChild(div);
  });
}

// Update quests in UI
function updateQuests() {
  QUESTS.forEach(quest => {
    if (game.quests.includes(quest.id) || game.pendingQuests.includes(quest.id)) return;
    if (quest.condition()) {
      game.pendingQuests.push(quest.id);
      queueNotification(`📜 Quest completed: ${quest.name}!`);
      const tab = document.querySelector('[data-tab="quests-tab"]');
      if (tab) tab.classList.add('pending');
    }
  });

  DOM.questsList.innerHTML = '';
  QUESTS.forEach(quest => {
    const div = document.createElement('div');
    const isCompleted = game.quests.includes(quest.id);
    const isPending = game.pendingQuests.includes(quest.id);
    div.className = isCompleted ? 'completed' : isPending ? 'can-claim' : 'incomplete';
    div.innerHTML = `
      <div class="item-text">${quest.icon} ${quest.name}</div>
      <div class="item-description">${quest.description}</div>
      <div class="item-description">${isCompleted ? 'Completed!' : quest.progress()}</div>
      <div class="item-description">Reward: ${quest.reward.coins} 🪙, ${quest.reward.gems} 💎</div>
      ${isPending ? '<button class="claim-button">Claim</button>' : ''}
    `;
    if (isPending) {
      const button = div.querySelector('button');
      button.onclick = () => {
        game.coins += quest.reward.coins;
        game.gems += quest.reward.gems;
        game.quests.push(quest.id);
        game.pendingQuests = game.pendingQuests.filter(id => id !== quest.id);
        queueNotification(`📜 Claimed ${quest.name}! +${quest.reward.coins} coins, +${quest.reward.gems} gems`);
        playEpicSound();
        updateGame();
      };
    }
    DOM.questsList.appendChild(div);
  });
}