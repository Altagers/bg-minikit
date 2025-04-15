// Events module
const POSITIVE_EVENTS = [
  { trigger: 'feed', text: 'Duck found a shiny coin! 🪩', effect: () => (game.coins += 50) },
  { trigger: 'fitness', text: 'Duck feels stronger! 💪', effect: () => (game.xp += 20) },
];

const NEGATIVE_EVENTS = [
  { trigger: 'feed', text: 'Duck ate bad bread! 😷', effect: () => (game.energy -= 10) },
  { trigger: 'fitness', text: 'Duck pulled a muscle! 😣', effect: () => (game.deathChance += 0.05) },
];

const EPIC_EVENTS = [
  { trigger: 'feed', text: 'Legendary bread feast! 🎉', effect: () => { game.coins += 100; game.gems += 1; } },
];

const CHOICE_EVENTS = [
  {
    trigger: 'feed',
    text: 'Mysterious bread found! Eat it?',
    option1: {
      text: 'Eat',
      success: () => { game.coins += 50; queueNotification('Tasty bread! 🪙'); },
      failure: () => { game.energy -= 10; queueNotification('Bad bread! 😷'); },
    },
    option2: {
      text: 'Ignore',
      success: () => queueNotification('Safe choice!'),
      failure: () => queueNotification('Missed a chance...'),
    },
  },
];

// Event queue
let eventQueue = [];

function queueEvent(text, option1Text, option1Action, option2Text, option2Action) {
  eventQueue.push({ text, option1Text, option1Action, option2Text, option2Action });
  if (eventQueue.length === 1 && DOM.modal.style.display !== 'block') showNextEvent();
}

function showNextEvent() {
  if (!eventQueue.length || !DOM.modal || !DOM.modalText || !DOM.modalOption1 || !DOM.modalOption2) return;
  const evt = eventQueue[0];
  DOM.modalText.textContent = evt.text;
  DOM.modalOption1.textContent = evt.option1Text;
  DOM.modalOption1.onclick = () => {
    DOM.modal.style.display = 'none';
    evt.option1Action();
    eventQueue.shift();
    showNextEvent();
  };
  if (evt.option2Text) {
    DOM.modalOption2.textContent = evt.option2Text;
    DOM.modalOption2.onclick = () => {
      DOM.modal.style.display = 'none';
      evt.option2Action();
      eventQueue.shift();
      showNextEvent();
    };
    DOM.modalOption2.style.display = 'inline';
  } else {
    DOM.modalOption2.style.display = 'none';
  }
  DOM.modalOption1.style.display = 'inline';
  DOM.modalNext.style.display = 'none';
  DOM.modalDone.style.display = 'none';
  DOM.modal.style.display = 'block';
}

function triggerEvent(trigger) {
  if (Math.random() < game.eventChance) {
    const weight = Math.random();
    if (weight < 0.5) {
      const evt = POSITIVE_EVENTS.find(e => e.trigger === trigger);
      if (evt) queueEvent(evt.text, 'OK', () => { evt.effect(); updateGame(); });
    } else if (weight < 0.8) {
      const evt = NEGATIVE_EVENTS.find(e => e.trigger === trigger);
      if (evt) queueEvent(evt.text, 'OK', () => { evt.effect(); updateGame(); });
    } else if (weight < 0.9) {
      const evt = EPIC_EVENTS.find(e => e.trigger === trigger);
      if (evt) queueEvent(evt.text, 'OK', () => { evt.effect(); playEpicSound(); updateGame(); });
    } else {
      const evt = CHOICE_EVENTS.find(e => e.trigger === trigger);
      if (evt) {
        const successChance = 0.6;
        queueEvent(
          evt.text,
          evt.option1.text,
          () => { Math.random() < successChance ? evt.option1.success() : evt.option1.failure(); updateGame(); },
          evt.option2.text,
          () => { Math.random() < successChance ? evt.option2.success() : evt.option2.failure(); updateGame(); }
        );
      }
    }
  }
}