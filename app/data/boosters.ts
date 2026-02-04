import type { AttributeBoosterCard } from '../types/tcg';

// Generate booster cards based on probabilities from NarutoCardGameLogic.txt
const generateBoosterCards = (): AttributeBoosterCard[] => {
  const cards: AttributeBoosterCard[] = [];
  
  // Heal (30% - 30 cards out of 100)
  for (let i = 1; i <= 30; i++) {
    cards.push({
      id: `heal-${i}`,
      name: 'Heal',
      type: 'health',
      effect: { healthBoost: 25 },
      description: 'Heals a chosen character for 25 health points'
    });
  }
  
  // Chakra Restore (25% - 25 cards)
  for (let i = 1; i <= 25; i++) {
    cards.push({
      id: `chakra-restore-${i}`,
      name: 'Chakra Restore',
      type: 'chakra',
      effect: { chakraBoost: 40 },
      description: 'Restores 40 chakra to a chosen character'
    });
  }
  
  // Jutsu Recovery (15% - 15 cards)
  for (let i = 1; i <= 15; i++) {
    cards.push({
      id: `jutsu-recovery-${i}`,
      name: 'Jutsu Recovery',
      type: 'jutsu_recovery',
      effect: { resetCooldowns: true },
      description: 'Cancels cooldown on all jutsus of a chosen character'
    });
  }
  
  // Jutsu Mastery (15% - 15 cards)
  for (let i = 1; i <= 15; i++) {
    cards.push({
      id: `jutsu-mastery-${i}`,
      name: 'Jutsu Mastery',
      type: 'jutsu_mastery',
      effect: { unlockSpecialJutsu: true, duration: 3 },
      description: 'Chosen character unlocks a special jutsu for 3 rounds'
    });
  }
  
  // Jutsu Damage Boost (5% - 5 cards)
  for (let i = 1; i <= 5; i++) {
    cards.push({
      id: `jutsu-damage-boost-${i}`,
      name: 'Jutsu Damage Boost',
      type: 'damage_boost',
      effect: { damageBoostPercent: 20 },
      description: 'Increases damage on all jutsus of a chosen character by 20% for 3 rounds'
    });
  }
  
  // Splash Damage (5% - 5 cards)
  for (let i = 1; i <= 5; i++) {
    cards.push({
      id: `splash-damage-${i}`,
      name: 'Splash Damage',
      type: 'splash_damage',
      effect: { multiTarget: 3 },
      description: 'Next attack will deal damage to 3 chosen characters at once for 1 round'
    });
  }
  
  // Double Attack (5% - 5 cards)
  for (let i = 1; i <= 5; i++) {
    cards.push({
      id: `double-attack-${i}`,
      name: 'Double Attack',
      type: 'double_attack',
      effect: { extraAttack: true },
      description: 'Allows a player to use 2 jutsus at once from different characters on the same target for 1 round'
    });
  }
  
  return cards;
};

export const boosterDeck: AttributeBoosterCard[] = generateBoosterCards();
