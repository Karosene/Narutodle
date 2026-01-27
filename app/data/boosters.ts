import type { AttributeBoosterCard } from '../types/tcg';

export const boosterDeck: AttributeBoosterCard[] = [
  {
    id: 'kunai-1',
    name: 'Kunai',
    type: 'weapon',
    effect: {
      powerBoost: 5
    },
    description: 'Basic ninja weapon. +5 Power'
  },
  {
    id: 'kunai-2',
    name: 'Kunai',
    type: 'weapon',
    effect: {
      powerBoost: 5
    },
    description: 'Basic ninja weapon. +5 Power'
  },
  {
    id: 'kunai-3',
    name: 'Kunai',
    type: 'weapon',
    effect: {
      powerBoost: 5
    },
    description: 'Basic ninja weapon. +5 Power'
  },
  {
    id: 'shuriken-1',
    name: 'Shuriken',
    type: 'weapon',
    effect: {
      powerBoost: 8
    },
    description: 'Throwing star. +8 Power'
  },
  {
    id: 'shuriken-2',
    name: 'Shuriken',
    type: 'weapon',
    effect: {
      powerBoost: 8
    },
    description: 'Throwing star. +8 Power'
  },
  {
    id: 'shuriken-3',
    name: 'Shuriken',
    type: 'weapon',
    effect: {
      powerBoost: 8
    },
    description: 'Throwing star. +8 Power'
  },
  {
    id: 'explosive-tag-1',
    name: 'Explosive Tag',
    type: 'weapon',
    effect: {
      powerBoost: 12
    },
    description: 'Paper bomb. +12 Power'
  },
  {
    id: 'explosive-tag-2',
    name: 'Explosive Tag',
    type: 'weapon',
    effect: {
      powerBoost: 12
    },
    description: 'Paper bomb. +12 Power'
  },

  // Health Boosters
  {
    id: 'medical-kit-1',
    name: 'Medical Kit',
    type: 'health',
    effect: {
      healthBoost: 20
    },
    description: 'First aid supplies. +20 Health'
  },
  {
    id: 'medical-kit-2',
    name: 'Medical Kit',
    type: 'health',
    effect: {
      healthBoost: 20
    },
    description: 'First aid supplies. +20 Health'
  },
  {
    id: 'medical-kit-3',
    name: 'Medical Kit',
    type: 'health',
    effect: {
      healthBoost: 20
    },
    description: 'First aid supplies. +20 Health'
  },
  {
    id: 'medical-ninjutsu-1',
    name: 'Medical Ninjutsu',
    type: 'health',
    effect: {
      healthBoost: 35
    },
    description: 'Advanced healing technique. +35 Health'
  },
  {
    id: 'medical-ninjutsu-2',
    name: 'Medical Ninjutsu',
    type: 'health',
    effect: {
      healthBoost: 35
    },
    description: 'Advanced healing technique. +35 Health'
  },
  {
    id: 'medical-ninjutsu-3',
    name: 'Medical Ninjutsu',
    type: 'health',
    effect: {
      healthBoost: 35
    },
    description: 'Advanced healing technique. +35 Health'
  },
  {
    id: 'soldier-pill-1',
    name: 'Soldier Pill',
    type: 'health',
    effect: {
      healthBoost: 15,
      chakraBoost: 15
    },
    description: 'Emergency pill. +15 Health, +15 Chakra'
  },
  {
    id: 'soldier-pill-2',
    name: 'Soldier Pill',
    type: 'health',
    effect: {
      healthBoost: 15,
      chakraBoost: 15
    },
    description: 'Emergency pill. +15 Health, +15 Chakra'
  },

  // Chakra Boosters
  {
    id: 'chakra-recovery-1',
    name: 'Chakra Recovery',
    type: 'chakra',
    effect: {
      chakraBoost: 30
    },
    description: 'Restore chakra reserves. +30 Chakra'
  },
  {
    id: 'chakra-recovery-2',
    name: 'Chakra Recovery',
    type: 'chakra',
    effect: {
      chakraBoost: 30
    },
    description: 'Restore chakra reserves. +30 Chakra'
  },
  {
    id: 'chakra-recovery-3',
    name: 'Chakra Recovery',
    type: 'chakra',
    effect: {
      chakraBoost: 30
    },
    description: 'Restore chakra reserves. +30 Chakra'
  },
  {
    id: 'chakra-recovery-4',
    name: 'Chakra Recovery',
    type: 'chakra',
    effect: {
      chakraBoost: 30
    },
    description: 'Restore chakra reserves. +30 Chakra'
  },
  {
    id: 'nature-energy-1',
    name: 'Nature Energy',
    type: 'chakra',
    effect: {
      chakraBoost: 50
    },
    description: 'Harness natural energy. +50 Chakra'
  },
  {
    id: 'nature-energy-2',
    name: 'Nature Energy',
    type: 'chakra',
    effect: {
      chakraBoost: 50
    },
    description: 'Harness natural energy. +50 Chakra'
  },

  // Form Change
  {
    id: 'form-change-1',
    name: 'Form Change',
    type: 'form_change',
    effect: {
      allowFormChange: true
    },
    description: 'Transform to upgraded form (if available)'
  },
  {
    id: 'form-change-2',
    name: 'Form Change',
    type: 'form_change',
    effect: {
      allowFormChange: true
    },
    description: 'Transform to upgraded form (if available)'
  },
  {
    id: 'form-change-3',
    name: 'Form Change',
    type: 'form_change',
    effect: {
      allowFormChange: true
    },
    description: 'Transform to upgraded form (if available)'
  },
  {
    id: 'form-change-4',
    name: 'Form Change',
    type: 'form_change',
    effect: {
      allowFormChange: true
    },
    description: 'Transform to upgraded form (if available)'
  },

  // Power Boosters
  {
    id: 'chakra-enhancement-1',
    name: 'Chakra Enhancement',
    type: 'power',
    effect: {
      powerBoost: 10
    },
    description: 'Enhance jutsu with chakra. +10 Power'
  },
  {
    id: 'chakra-enhancement-2',
    name: 'Chakra Enhancement',
    type: 'power',
    effect: {
      powerBoost: 10
    },
    description: 'Enhance jutsu with chakra. +10 Power'
  },
  {
    id: 'chakra-enhancement-3',
    name: 'Chakra Enhancement',
    type: 'power',
    effect: {
      powerBoost: 10
    },
    description: 'Enhance jutsu with chakra. +10 Power'
  },
  {
    id: 'sage-chakra-1',
    name: 'Sage Chakra',
    type: 'power',
    effect: {
      powerBoost: 15,
      chakraBoost: 20
    },
    description: 'Sage mode enhancement. +15 Power, +20 Chakra'
  },
  {
    id: 'sage-chakra-2',
    name: 'Sage Chakra',
    type: 'power',
    effect: {
      powerBoost: 15,
      chakraBoost: 20
    },
    description: 'Sage mode enhancement. +15 Power, +20 Chakra'
  }
];
