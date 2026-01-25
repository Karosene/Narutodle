import type { 
  CharacterCard, 
  AttributeBoosterCard, 
  GameState, 
  Player,
  ResistanceLevel,
  AttackType,
  Resistances
} from '../types/tcg';
import { characterDeck } from '../data/characters';
import { boosterDeck } from '../data/boosters';

// Shuffle array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Initialize a character card from deck template
export function initializeCharacter(
  template: Omit<CharacterCard, 'currentForm' | 'currentHealth' | 'currentChakra' | 'boosters'>
): CharacterCard {
  return {
    ...template,
    currentForm: 'default',
    currentHealth: template.forms.default.health,
    currentChakra: template.forms.default.maxChakra,
    boosters: []
  };
}

// Deal 8 random cards to each player
export function dealInitialCards(): [CharacterCard[], CharacterCard[], CharacterCard[]] {
  const shuffled = shuffleArray(characterDeck);
  
  const player1Hand = shuffled.slice(0, 8).map(initializeCharacter);
  const player2Hand = shuffled.slice(8, 16).map(initializeCharacter);
  const remainingDeck = shuffled.slice(16).map(initializeCharacter);
  
  return [player1Hand, player2Hand, remainingDeck];
}

// Create initial game state
export function createInitialGameState(player1Name: string, player2Name: string): GameState {
  const [player1Hand, player2Hand, remainingCharacters] = dealInitialCards();
  
  return {
    players: [
      {
        id: 'player1',
        name: player1Name,
        hand: player1Hand,
        discardPile: []
      },
      {
        id: 'player2',
        name: player2Name,
        hand: player2Hand,
        discardPile: []
      }
    ],
    characterDeck: remainingCharacters,
    boosterDeck: shuffleArray([...boosterDeck]),
    currentPlayerIndex: 0,
    gamePhase: 'setup',
    turnPhase: 'draw_booster',
    currentBoosterDraw: null,
    winner: null
  };
}

// Draw a booster card from the deck
export function drawBoosterCard(state: GameState): AttributeBoosterCard | null {
  if (state.boosterDeck.length === 0) {
    return null;
  }
  return state.boosterDeck[0];
}

// Calculate effective damage based on resistances
export function calculateDamage(
  attackPower: number,
  attackType: AttackType,
  defenderResistances: Resistances
): number {
  const resistance = defenderResistances[attackType] || 'none';
  
  switch (resistance) {
    case 'full':
      return 0;
    case 'half':
      return Math.floor(attackPower / 2);
    case 'none':
    default:
      return attackPower;
  }
}

// Get total power of a character including boosters
export function getTotalPower(card: CharacterCard): number {
  const formData = card.forms[card.currentForm];
  if (!formData) return 0;
  const basePower = formData.power;
  const boosterPower = card.boosters.reduce((sum, booster) => {
    return sum + (booster.effect.powerBoost || 0);
  }, 0);
  return basePower + boosterPower;
}

// Apply booster to character
export function applyBooster(
  card: CharacterCard,
  booster: AttributeBoosterCard
): CharacterCard {
  const updatedCard = { ...card };
  
  // Add booster to the card's booster array
  updatedCard.boosters = [...card.boosters, booster];
  
  // Apply immediate effects
  if (booster.effect.healthBoost) {
    const formData = updatedCard.forms[updatedCard.currentForm];
    if (formData) {
      updatedCard.currentHealth = Math.min(
        updatedCard.currentHealth + booster.effect.healthBoost,
        formData.health
      );
    }
  }
  
  if (booster.effect.chakraBoost) {
    const formData = updatedCard.forms[updatedCard.currentForm];
    if (formData) {
      updatedCard.currentChakra = Math.min(
        updatedCard.currentChakra + booster.effect.chakraBoost,
        formData.maxChakra
      );
    }
  }
  
  if (booster.effect.allowFormChange && updatedCard.forms.upgraded) {
    updatedCard.currentForm = 'upgraded';
    const upgradedForm = updatedCard.forms.upgraded;
    updatedCard.currentHealth = upgradedForm.health;
    updatedCard.currentChakra = upgradedForm.maxChakra;
  }
  
  return updatedCard;
}

// Check if game is over
export function checkGameOver(state: GameState): string | null {
  if (state.players[0].hand.length === 0) {
    return state.players[1].name;
  }
  if (state.players[1].hand.length === 0) {
    return state.players[0].name;
  }
  return null;
}

// Perform attack between two cards
export function performAttack(
  attacker: CharacterCard,
  defender: CharacterCard
): { attacker: CharacterCard; defender: CharacterCard; damage: number } {
  const attackerForm = attacker.forms[attacker.currentForm];
  const defenderForm = defender.forms[defender.currentForm];
  
  if (!attackerForm || !defenderForm) {
    return { attacker, defender, damage: 0 };
  }
  
  const totalPower = getTotalPower(attacker);
  const damage = calculateDamage(
    totalPower,
    attackerForm.attackType,
    defenderForm.resistances
  );
  
  const updatedDefender = {
    ...defender,
    currentHealth: Math.max(0, defender.currentHealth - damage)
  };
  
  return {
    attacker,
    defender: updatedDefender,
    damage
  };
}

// Regenerate chakra at end of turn
export function regenerateChakra(card: CharacterCard, amount: number = 10): CharacterCard {
  const formData = card.forms[card.currentForm];
  if (!formData) return card;
  return {
    ...card,
    currentChakra: Math.min(card.currentChakra + amount, formData.maxChakra)
  };
}
