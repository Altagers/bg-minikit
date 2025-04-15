// Game configuration
const SKINS = {
  default: {
    name: 'Default Duck',
    images: {
      hungry: 'images/normal/hungry.png',
      normal: 'images/normal/normal.png',
      overfed: 'images/normal/overfed.png',
      dead: 'images/normal/dead.png',
      fitness: 'images/normal/fitness.png',
    },
  },
  crypto: {
    name: 'Crypto Duck',
    images: {
      hungry: 'images/cryptoduck/hungry.png',
      normal: 'images/cryptoduck/normal.png',
      overfed: 'images/cryptoduck/overfed.png',
      dead: 'images/cryptoduck/dead.png',
      fitness: 'images/cryptoduck/fitness.png',
    },
  },
  cyborg: {
    name: 'Cyborg Duck',
    images: {
      hungry: 'images/cyborg/hungry.png',
      normal: 'images/cyborg/normal.png',
      overfed: 'images/cyborg/overfed.png',
      dead: 'images/cyborg/dead.png',
      fitness: 'images/cyborg/fitness.png',
    },
  },
  silver: {
    name: 'Silver Duck',
    images: {
      hungry: 'images/silver/hungry.png',
      normal: 'images/silver/normal.png',
      overfed: 'images/silver/overfed.png',
      dead: 'images/silver/dead.png',
      fitness: 'images/silver/fitness.png',
    },
  },
};

const UPGRADES = [
  { id: 'helmet', name: 'Safety Helmet', icon: '🛡️', baseCost: 100, effect: () => (game.deathChance *= 0.9), description: 'Reduces death chance by 10%.', maxPurchases: 5, level: 1 },
  { id: 'energy-drink', name: 'Energy Drink', icon: '⚡', baseCost: 150, effect: () => (game.energyRegen *= 1.1), description: 'Boosts energy regen by 10%.', maxPurchases: 5, level: 1 },
  { id: 'coin-boost', name: 'Coin Boost', icon: '🪙', baseCost: 200, effect: () => (game.coinsPerFeed *= 1.1), description: 'Increases coins per feed by 10%.', maxPurchases: 5, level: 1 },
  { id: 'xp-boost', name: 'XP Boost', icon: '📈', baseCost: 250, effect: () => (game.xpPerFeed *= 1.1), description: 'Increases XP per feed by 10%.', maxPurchases: 5, level: 2 },
  { id: 'lucky-charm', name: 'Lucky Charm', icon: '🍀', baseCost: 400, effect: () => (game.eventChance += 0.02), description: 'Increases event chance by 2%.', maxPurchases: 5, level: 2 },
  { id: 'gem-detector', name: 'Gem Detector', icon: '💎', baseCost: 600, effect: () => (game.gemChance += 0.01), description: 'Increases gem chance by 1%.', maxPurchases: 5, level: 3 },
];

const GEM_UPGRADES = [
  { id: 'crypto', name: 'Crypto Duck Skin', icon: '🦆', cost: 15, effect: () => { game.upgrades.push('crypto'); queueNotification('Crypto Duck skin unlocked!'); }, description: 'Unlocks Crypto Duck skin.', repeatable: false },
  { id: 'cyborg', name: 'Cyborg Duck Skin', icon: '🤖', cost: 15, effect: () => { game.upgrades.push('cyborg'); queueNotification('Cyborg Duck skin unlocked!'); }, description: 'Unlocks Cyborg Duck skin.', repeatable: false },
  { id: 'silver', name: 'Silver Duck Skin', icon: '✨', cost: 15, effect: () => { game.upgrades.push('silver'); queueNotification('Silver Duck skin unlocked!'); }, description: 'Unlocks Silver Duck skin.', repeatable: false },
  { id: 'energy-boost', name: 'Full Energy', icon: '⚡', cost: 3, effect: () => (game.energy = 100), description: 'Fully restores energy.', repeatable: true },
  { id: 'xp-buff', name: 'XP Buff (1h)', icon: '📈', cost: 5, effect: () => {
      game.xpBuffStart = Date.now();
      game.xpMultiplier *= 2;
      setTimeout(() => {
        game.xpMultiplier /= 2;
        delete game.xpBuffStart;
        queueNotification('XP Buff ended! 📈');
        updateGame();
      }, 3600000);
    }, description: 'Doubles XP gain for 1 hour.', repeatable: true },
];

// Переименовываем PLANTS в CONFIG_PLANTS, чтобы избежать конфликта с garden.js
const CONFIG_PLANTS = [
  { id: 'bread-flower', name: 'Bread Flower', icon: '🌼', cost: 10, growthTime: 3600000, rewards: { coins: 20, xp: 5, gemChance: 0 } },
  { id: 'coin-bush', name: 'Coin Bush', icon: '🌳', cost: 50, growthTime: 14400000, rewards: { coins: 100, xp: 20, gemChance: 0.05 } },
];

// Initial game state
let game = {
  state: 'hungry',
  level: 1,
  stage: 'Baby',
  coins: 50,
  gems: 0,
  xp: 0,
  xpNeeded: 100,
  xpMultiplier: 1,
  energy: 100,
  energyRegen: 0.5, // per second
  coinsPerFeed: 5,
  xpPerFeed: 10,
  deathChance: 0.1,
  eventChance: 0.2,
  gemChance: 0.05,
  lastUpdate: Date.now(),
  freeRevives: 3,
  upgrades: [],
  upgradeCounts: {},
  achievements: [],
  pendingAchievements: [],
  quests: [],
  pendingQuests: [],
  garden: [],
  gardenSlots: 3,
  gardenVisible: true,
  selectedSkin: 'default',
  tutorialSeen: false,
  tutorialStep: 0,
  stats: {
    feeds: 0,
    workouts: 0,
    deaths: 0,
    harvests: 0,
    fishCaught: 0,
    dailyFeeds: 0,
    dailyWorkouts: 0,
    dailyHarvests: 0,
    dailyFishCaught: 0,
    dailyCoins: 0,
    lastDay: new Date().toDateString(),
  },
};