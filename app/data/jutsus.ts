// Character Jutsus for Naruto TCG
// Each character has 2 unique jutsus with special effects

export interface Jutsu {
  name: string;
  description: string;
  jutsuType: 'ninjutsu' | 'taijutsu' | 'genjutsu';
  chakraCost: number;
  damage?: number;
  effect?: {
    type: 'poison' | 'stun' | 'heal' | 'buff' | 'debuff' | 'shield' | 'drain';
    value: number;
    duration?: number; // in turns
    target?: 'self' | 'opponent' | 'all-opponents' | 'all-allies';
  };
}

export interface CharacterJutsus {
  characterName: string;
  jutsus: [Jutsu, Jutsu]; // Each character has exactly 2 jutsus in base form
  upgradedJutsu?: Jutsu; // 1 upgraded version when boosted
}

export const characterJutsus: CharacterJutsus[] = [
  {
    characterName: 'Shizune',
    jutsus: [
      {
        name: 'Prepared Needle Shot',
        description: 'Fires poison senbon from wrist-mounted launcher dealing 18 damage and poisoning target for 6 per turn (3 turns)',
        jutsuType: 'ninjutsu',
        chakraCost: 20,
        damage: 18,
        effect: {
          type: 'poison',
          value: 6,
          duration: 3,
          target: 'opponent'
        }
      },
      {
        name: 'Mystical Palm Technique',
        description: 'Advanced medical ninjutsu that heals 28 HP',
        jutsuType: 'ninjutsu',
        chakraCost: 25,
        effect: {
          type: 'heal',
          value: 28,
          target: 'self'
        }
      }
    ],
    upgradedJutsu: {
      name: 'Poison Mist',
      description: 'Exhales fatal poisonous gas from mouth that deals 40 damage over time',
      jutsuType: 'ninjutsu',
      chakraCost: 35,
      damage: 15,
      effect: {
        type: 'poison',
        value: 10,
        duration: 3,
        target: 'opponent'
      }
    }
  },
  {
    characterName: 'Kakashi Hatake',
    jutsus: [
      {
        name: 'Lightning Cutter',
        description: 'High-speed Chidori variant that can split lightning, dealing 35 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 30,
        damage: 35
      },
      {
        name: 'Water Style: Water Wall',
        description: 'Creates massive water barrier that shields 20 damage for 2 turns',
        jutsuType: 'ninjutsu',
        chakraCost: 25,
        effect: {
          type: 'shield',
          value: 20,
          duration: 2,
          target: 'self'
        }
      }
    ],
    upgradedJutsu: {
      name: 'Purple Lightning',
      description: 'Advanced lightning technique created after losing Sharingan, dealing 50 damage',
      jutsuType: 'ninjutsu',
      chakraCost: 40,
      damage: 50
    }
  },
  {
    characterName: 'Naruto Uzumaki',
    jutsus: [
      {
        name: 'Shadow Clone Technique',
        description: 'Mass-scale clone creation overwhelming opponents with 30 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 25,
        damage: 30
      },
      {
        name: 'Rasengan',
        description: 'Spiraling ball of compressed chakra dealing 38 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 35,
        damage: 38
      }
    ],
    upgradedJutsu: {
      name: 'Sage Mode',
      description: 'Perfect natural energy absorption increasing all combat prowess by 18 for 3 turns',
      jutsuType: 'ninjutsu',
      chakraCost: 40,
      effect: {
        type: 'buff',
        value: 18,
        duration: 3,
        target: 'self'
      }
    }
  },
  {
    characterName: 'Sakura Haruno',
    jutsus: [
      {
        name: 'Cherry Blossom Impact',
        description: 'Chakra-enhanced strength punch that can destroy buildings, dealing 32 damage',
        jutsuType: 'taijutsu',
        chakraCost: 25,
        damage: 32
      },
      {
        name: 'Mystical Palm Technique',
        description: 'Medical ninjutsu healing fatal injuries, restoring 32 HP',
        jutsuType: 'ninjutsu',
        chakraCost: 28,
        effect: {
          type: 'heal',
          value: 32,
          target: 'self'
        }
      }
    ],
    upgradedJutsu: {
      name: 'Strength of a Hundred Seal',
      description: 'Released seal with accumulated chakra boosting power by 22 for 3 turns',
      jutsuType: 'ninjutsu',
      chakraCost: 40,
      effect: {
        type: 'buff',
        value: 22,
        duration: 3,
        target: 'self'
      }
    }
  },
  {
    characterName: 'Sasuke Uchiha',
    jutsus: [
      {
        name: 'Chidori',
        description: 'High-speed lightning thrust requiring Sharingan, dealing 36 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 30,
        damage: 36
      },
      {
        name: 'Fire Style: Fireball Jutsu',
        description: 'Massive fireball technique mastered at young age, dealing 28 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 25,
        damage: 28
      }
    ],
    upgradedJutsu: {
      name: 'Kirin',
      description: 'Massive lightning dragon using natural lightning from sky, dealing 58 damage',
      jutsuType: 'ninjutsu',
      chakraCost: 45,
      damage: 58
    }
  },
  {
    characterName: 'Might Guy',
    jutsus: [
      {
        name: 'Dynamic Entry',
        description: 'Signature flying kick entrance dealing 26 damage',
        jutsuType: 'taijutsu',
        chakraCost: 20,
        damage: 26
      },
      {
        name: 'Morning Peacock',
        description: 'Rapid punches igniting through air friction dealing 35 damage',
        jutsuType: 'taijutsu',
        chakraCost: 30,
        damage: 35
      }
    ],
    upgradedJutsu: {
      name: 'Night Guy',
      description: 'Eighth Gate ultimate kick distorting space itself, boosting power by 28 for 2 turns',
      jutsuType: 'taijutsu',
      chakraCost: 50,
      effect: {
        type: 'buff',
        value: 28,
        duration: 2,
        target: 'self'
      }
    }
  },
  {
    characterName: 'Rock Lee',
    jutsus: [
      {
        name: 'Leaf Hurricane',
        description: 'Spinning kick from Strong Fist style dealing 28 damage',
        jutsuType: 'taijutsu',
        chakraCost: 25,
        damage: 28
      },
      {
        name: 'Drunken Fist',
        description: 'Unpredictable fighting style when consuming alcohol, dealing 34 damage',
        jutsuType: 'taijutsu',
        chakraCost: 28,
        damage: 34
      }
    ],
    upgradedJutsu: {
      name: 'Front Lotus',
      description: 'Pile-driving technique with first gate open dealing 48 damage',
      jutsuType: 'taijutsu',
      chakraCost: 42,
      damage: 48
    }
  },
  {
    characterName: 'Hinata Hyuga',
    jutsus: [
      {
        name: 'Gentle Fist',
        description: 'Byakugan-guided chakra point strike dealing 24 damage',
        jutsuType: 'taijutsu',
        chakraCost: 20,
        damage: 24
      },
      {
        name: 'Eight Trigrams Vacuum Palm',
        description: 'Pressurized air attack outside physical range dealing 28 damage',
        jutsuType: 'taijutsu',
        chakraCost: 25,
        damage: 28
      }
    ],
    upgradedJutsu: {
      name: 'Eight Trigrams Sixty-Four Palms',
      description: 'Precise strikes closing 64 tenketsu points, dealing 40 damage',
      jutsuType: 'taijutsu',
      chakraCost: 38,
      damage: 40
    }
  },
  {
    characterName: 'Gaara',
    jutsus: [
      {
        name: 'Sand Binding Coffin',
        description: 'Captures and immobilizes opponent in sand dealing 30 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 28,
        damage: 30
      },
      {
        name: 'Shield of Sand',
        description: 'Automatic absolute defense blocking 22 damage for 2 turns',
        jutsuType: 'ninjutsu',
        chakraCost: 25,
        effect: {
          type: 'shield',
          value: 22,
          duration: 2,
          target: 'self'
        }
      }
    ],
    upgradedJutsu: {
      name: 'Sand Waterfall Funeral',
      description: 'Crushes all body parts of captured target dealing 52 damage',
      jutsuType: 'ninjutsu',
      chakraCost: 42,
      damage: 52
    }
  },
  {
    characterName: 'Jiraiya',
    jutsus: [
      {
        name: 'Rasengan',
        description: 'Destructive compressed chakra ball created by Jiraiya, dealing 36 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 30,
        damage: 36
      },
      {
        name: 'Fire Style: Flame Bullet',
        description: 'Powerful blast of fire dealing 32 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 28,
        damage: 32
      }
    ],
    upgradedJutsu: {
      name: 'Sage Art: Goemon',
      description: 'Combined oil-fire attack with Fukasaku and Shima dealing 58 damage',
      jutsuType: 'ninjutsu',
      chakraCost: 48,
      damage: 58
    }
  },
  {
    characterName: 'Itachi Uchiha',
    jutsus: [
      {
        name: 'Amaterasu',
        description: 'Ignites target with inextinguishable black flames from right Mangekyō Sharingan, dealing 40 damage',
        jutsuType: 'ninjutsu',
        chakraCost: 38,
        damage: 40
      },
      {
        name: 'Tsukuyomi',
        description: 'Powerful genjutsu trapping opponent in illusory world, stunning for 2 turns',
        jutsuType: 'genjutsu',
        chakraCost: 35,
        effect: {
          type: 'stun',
          value: 1,
          duration: 2,
          target: 'opponent'
        }
      }
    ],
    upgradedJutsu: {
      name: 'Susanoo',
      description: 'Spectral warrior with Sword of Totsuka and Yata Mirror boosting defense by 25 for 3 turns',
      jutsuType: 'ninjutsu',
      chakraCost: 50,
      effect: {
        type: 'shield',
        value: 25,
        duration: 3,
        target: 'self'
      }
    }
  }
];

// Helper function to get jutsus for a specific character
export function getCharacterJutsus(characterName: string, upgraded: boolean = false): [Jutsu, Jutsu] | Jutsu | undefined {
  const characterData = characterJutsus.find(
    (c) => c.characterName.toLowerCase() === characterName.toLowerCase()
  );
  
  if (!characterData) return undefined;
  
  // Return upgraded jutsu if available and requested, otherwise return base jutsus
  if (upgraded && characterData.upgradedJutsu) {
    return characterData.upgradedJutsu;
  }
  
  return characterData.jutsus;
}

// Helper function to calculate total damage including effects
export function calculateTotalJutsuDamage(jutsu: Jutsu): number {
  let totalDamage = jutsu.damage || 0;
  
  if (jutsu.effect && jutsu.effect.type === 'poison' && jutsu.effect.duration) {
    totalDamage += jutsu.effect.value * jutsu.effect.duration;
  }
  
  return totalDamage;
}
