export type CharacterForm = 'default' | 'upgraded';

export type AttackType = 'taijutsu' | 'ninjutsu' | 'genjutsu';

export type ResistanceLevel = 'none' | 'half' | 'full';

export type StatusEffectType = 'poison' | 'burn' | 'bleed' | 'stun' | 'buff' | 'shield' | 'damage_suppress';

export interface StatusEffect {
  type: StatusEffectType;
  value?: number;
  duration: number;
}

export interface JutsuEffect {
  type: 'heal' | 'poison' | 'burn' | 'bleed' | 'stun' | 'chakra_drain' | 'buff' | 'shield' | 'damage_suppress';
  value?: number;
  duration?: number;
  target: 'self' | 'opponent' | 'ally' | 'all_allies' | 'all_opponents';
}

export interface Jutsu {
  name: string;
  description: string;
  jutsuType: AttackType;
  chakraCost: number;
  damage?: number;
  effect?: JutsuEffect;
}

export interface CharacterJutsuData {
  name: string;
  jutsus: [Jutsu, Jutsu];
  upgradedJutsu: Jutsu;
}

export interface PassiveAbility {
  characterName: string;
  passiveName: string;
  description: string;
  trigger: 'after_using_jutsu' | 'on_being_attacked' | 'after_using_poison' | 'after_using_kirin' | 'after_using_creation';
  chance: number;
  effect: {
    type: 'heal_all_allies' | 'dodge' | 'extend_poison_duration' | 'dodge_next_attack' | 'hit_all_enemies' | 'counter_damage' | 'bonus_damage';
    value?: number;
    attackTypes?: AttackType[];
  };
}

export interface Resistances {
  taijutsu?: ResistanceLevel;
  ninjutsu?: ResistanceLevel;
  genjutsu?: ResistanceLevel;
}

export interface CharacterFormData {
  name: string;
  health: number;
  maxChakra: number;
  power: number;
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
  jutsuMasteryRoundsLeft?: number;
  damageBoostActive?: boolean;
  jutsuCooldowns?: Record<string, number>;
  statusEffects?: StatusEffect[];
  buffRoundsLeft?: number;
  buffPowerIncrease?: number;
  shieldRoundsLeft?: number;
  damageSuppressActive?: boolean;
  damageSuppressAmount?: number;
  stunRoundsLeft?: number;
  passiveAbility?: PassiveAbility;
  dodgeNextAttack?: boolean;
}

export type BoosterType = 'health' | 'chakra' | 'jutsu_recovery' | 'jutsu_mastery' | 'damage_boost' | 'splash_damage' | 'double_attack';

export interface AttributeBoosterCard {
  id: string;
  name: string;
  type: BoosterType;
  effect: {
    healthBoost?: number;
    chakraBoost?: number;
    resetCooldowns?: boolean;
    unlockSpecialJutsu?: boolean;
    duration?: number;
    damageBoostPercent?: number;
    multiTarget?: number;
    extraAttack?: boolean;
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
