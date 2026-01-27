import type { CharacterCard } from '../types/tcg';

export const characterDeck: Omit<CharacterCard, 'currentForm' | 'currentHealth' | 'currentChakra' | 'boosters'>[] = [
  {
    id: 'naruto-1',
    name: 'Naruto Uzumaki',
    clan: 'Uzumaki',
    forms: {
      default: {
        name: 'Sage Mode',
        power: 85,
        health: 100,
        maxChakra: 120,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/naruto.png'
      },
      upgraded: {
        name: 'Kurama Sage Mode',
        power: 95,
        health: 120,
        maxChakra: 150,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/naruto.png'
      }
    }
  },
  
  {
    id: 'sasuke-1',
    name: 'Sasuke Uchiha',
    clan: 'Uchiha',
    forms: {
      default: {
        name: 'Mangekyo Sharingan',
        power: 88,
        health: 95,
        maxChakra: 110,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'none',
          genjutsu: 'full'
        },
        imageUrl: '/images/sasukeUchiha.png'
      },
      upgraded: {
        name: 'Rinnegan',
        power: 96,
        health: 110,
        maxChakra: 140,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'full'
        },
        imageUrl: '/images/sasukeUchiha.png'
      }
    }
  },

  // Obito
  {
    id: 'obito-1',
    name: 'Obito Uchiha',
    clan: 'Uchiha',
    forms: {
      default: {
        name: 'Mangekyo Sharingan (Kamui)',
        power: 82,
        health: 90,
        maxChakra: 100,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'full', // Kamui makes him untouchable to taijutsu
          ninjutsu: 'none',
          genjutsu: 'full'
        },
        imageUrl: '/images/obitoUchiha.png'
      },
      upgraded: {
        name: 'Juubito',
        power: 98,
        health: 130,
        maxChakra: 160,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'full',
          ninjutsu: 'half',
          genjutsu: 'full'
        },
        imageUrl: '/images/obitoUchiha.png'
      }
    }
  },

  // Madara
  {
    id: 'madara-1',
    name: 'Madara Uchiha',
    clan: 'Uchiha',
    forms: {
      default: {
        name: 'Eternal Mangekyo Sharingan',
        power: 92,
        health: 105,
        maxChakra: 130,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'none',
          genjutsu: 'full'
        },
        imageUrl: '/images/madaraUchiha.png'
      },
      upgraded: {
        name: 'Rinnegan',
        power: 99,
        health: 125,
        maxChakra: 170,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'full'
        },
        imageUrl: '/images/madaraUchiha.png'
      }
    }
  },

  // Neji
  {
    id: 'neji-1',
    name: 'Neji Hyuga',
    clan: 'Hyuga',
    forms: {
      default: {
        name: 'Byakugan Master',
        power: 78,
        health: 85,
        maxChakra: 90,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'full', // Rotation defense
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/nejiHyuga.png'
      }
    }
  },

  // Hinata
  {
    id: 'hinata-1',
    name: 'Hinata Hyuga',
    clan: 'Hyuga',
    forms: {
      default: {
        name: 'Byakugan',
        power: 70,
        health: 80,
        maxChakra: 85,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'full',
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/hinataHyuga.png'
      }
    }
  },

  // Rock Lee
  {
    id: 'lee-1',
    name: 'Rock Lee',
    forms: {
      default: {
        name: 'Taijutsu Master',
        power: 75,
        health: 90,
        maxChakra: 60,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/rockLee.png'
      },
      upgraded: {
        name: 'Eight Gates',
        power: 94,
        health: 70,
        maxChakra: 80,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/rockLee.png'
      }
    }
  },

  // Kakashi
  {
    id: 'kakashi-1',
    name: 'Kakashi Hatake',
    clan: 'Hatake',
    forms: {
      default: {
        name: 'Copy Ninja',
        power: 84,
        health: 92,
        maxChakra: 95,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'none',
          genjutsu: 'half'
        },
        imageUrl: '/images/kakashiHatake.png'
      },
      upgraded: {
        name: 'Double Sharingan',
        power: 93,
        health: 100,
        maxChakra: 120,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'full'
        },
        imageUrl: '/images/kakashiHatake.png'
      }
    }
  },

  // Itachi
  {
    id: 'itachi-1',
    name: 'Itachi Uchiha',
    clan: 'Uchiha',
    forms: {
      default: {
        name: 'Mangekyo Sharingan',
        power: 90,
        health: 85,
        maxChakra: 115,
        attackType: 'genjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'none',
          genjutsu: 'full'
        },
        imageUrl: '/images/itachiUchiha.png'
      },
      upgraded: {
        name: 'Edo Tensei',
        power: 95,
        health: 110,
        maxChakra: 999,
        attackType: 'genjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'full'
        },
        imageUrl: '/images/itachiUchiha.png'
      }
    }
  },

  // Minato
  {
    id: 'minato-1',
    name: 'Minato Namikaze',
    clan: 'Namikaze',
    forms: {
      default: {
        name: 'Yellow Flash',
        power: 87,
        health: 95,
        maxChakra: 110,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/minato.png'
      },
      upgraded: {
        name: 'KCM Mode',
        power: 94,
        health: 115,
        maxChakra: 145,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/minato.png'
      }
    }
  },

  // Sakura
  {
    id: 'sakura-1',
    name: 'Sakura Haruno',
    forms: {
      default: {
        name: 'Medical Ninja',
        power: 72,
        health: 88,
        maxChakra: 95,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'none',
          genjutsu: 'half'
        },
        imageUrl: '/images/sakuraHaruno.png'
      },
      upgraded: {
        name: 'Hundred Healings',
        power: 86,
        health: 120,
        maxChakra: 130,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'half',
          genjutsu: 'half'
        },
        imageUrl: '/images/sakuraHaruno.png'
      }
    }
  },

  // Gaara
  {
    id: 'gaara-1',
    name: 'Gaara',
    clan: 'Sand',
    forms: {
      default: {
        name: 'Sand Shield',
        power: 80,
        health: 95,
        maxChakra: 105,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'none',
          genjutsu: 'none'
        },
        imageUrl: '/images/gaara.png'
      },
      upgraded: {
        name: 'One-Tail Shukaku',
        power: 91,
        health: 115,
        maxChakra: 140,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'full',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/gaara.png'
      }
    }
  },

  // Jiraiya
  {
    id: 'jiraiya-1',
    name: 'Jiraiya',
    clan: 'Sannin',
    forms: {
      default: {
        name: 'Toad Sage',
        power: 86,
        health: 98,
        maxChakra: 120,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'half',
          genjutsu: 'half'
        },
        imageUrl: '/images/jiraiya.png'
      }
    }
  },

  // Orochimaru
  {
    id: 'orochimaru-1',
    name: 'Orochimaru',
    clan: 'Sannin',
    forms: {
      default: {
        name: 'Snake Sage',
        power: 85,
        health: 92,
        maxChakra: 125,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/orochimaru.png'
      }
    }
  },

  // Tsunade
  {
    id: 'tsunade-1',
    name: 'Tsunade',
    clan: 'Sannin',
    forms: {
      default: {
        name: 'Legendary Medical Ninja',
        power: 83,
        health: 105,
        maxChakra: 115,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'none',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/tsunade.png'
      },
      upgraded: {
        name: 'Hundred Healings Seal',
        power: 89,
        health: 135,
        maxChakra: 150,
        attackType: 'taijutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'none'
        },
        imageUrl: '/images/tsunade.png'
      }
    }
  },

  // Pain/Nagato
  {
    id: 'pain-1',
    name: 'Pain (Nagato)',
    clan: 'Uzumaki',
    forms: {
      default: {
        name: 'Six Paths of Pain',
        power: 93,
        health: 100,
        maxChakra: 135,
        attackType: 'ninjutsu',
        resistances: {
          taijutsu: 'half',
          ninjutsu: 'half',
          genjutsu: 'half'
        },
        imageUrl: '/images/nagato.png'
      }
    }
  }
];
