export type CharacterForm = 'default' | 'upgraded';

export type AttackType = 'taijutsu' | 'ninjutsu' | 'genjutsu';

export type ResistanceLevel = 'none' | 'half' | 'full';

export interface Resistances {
  taijutsu?: ResistanceLevel;
  ninjutsu?: ResistanceLevel;
  genjutsu?: ResistanceLevel;
}

export interface CharacterFormData {
  name: string;
  health: number;
  maxChakra: number;
  attackType: AttackType;
  resistances: Resistances;
  imageUrl?: string;
}

export interface CharacterCard {
  id: string;
  name: string;
  clan?: string;
  forms: {
    default: CharacterFormData;
    upgraded?: CharacterFormData;
  };
  currentForm: CharacterForm;
  currentHealth: number;
  currentChakra: number;
  boosters: AttributeBoosterCard[];
}

export type BoosterType = 'weapon' | 'health' | 'chakra' | 'form_change';

export interface AttributeBoosterCard {
  id: string;
  name: string;
  type: BoosterType;
  effect: {
    healthBoost?: number;
    chakraBoost?: number;
    powerBoost?: number;
    allowFormChange?: boolean;
  };
  description: string;
}

// Player
export interface Player {
  id: string;
  name: string;
  hand: CharacterCard[];
  discardPile: CharacterCard[];
}

// Game Phase
export type GamePhase = 'setup' | 'first_turn_battle' | 'player_turn' | 'game_over';

// Turn Phase
export type TurnPhase = 'draw_booster' | 'use_or_keep_booster' | 'attack' | 'end_turn';

// Game State
export interface GameState {
  players: [Player, Player];
  characterDeck: CharacterCard[];
  boosterDeck: AttributeBoosterCard[];
  currentPlayerIndex: 0 | 1;
  gamePhase: GamePhase;
  turnPhase: TurnPhase;
  currentBoosterDraw: AttributeBoosterCard | null;
  winner: string | null;
}
