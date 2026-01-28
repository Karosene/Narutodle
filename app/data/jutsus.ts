import jutsusData from '../../public/jutsusData.json';

export interface Jutsu {
  name: string;
  description: string;
  jutsuType: 'ninjutsu' | 'taijutsu' | 'genjutsu';
  chakraCost: number;
  damage?: number;
  effect?: {
    type: 'poison' | 'stun' | 'heal' | 'buff' | 'shield' | 'chakra_drain';
    value: number;
    duration?: number; // in turns
    target?: 'self' | 'opponent' | 'all-opponents' | 'all-allies';
  };
}

export interface CharacterJutsus {
  name: string;
  jutsus: [Jutsu, Jutsu]; // Each character has exactly 2 jutsus in base form
  upgradedJutsu?: Jutsu; // 1 upgraded version when boosted
}

export const characterJutsus: CharacterJutsus[] = jutsusData as CharacterJutsus[];

export function getCharacterJutsus(characterName: string, upgraded: boolean = false): [Jutsu, Jutsu] | Jutsu | undefined {
  const characterData = characterJutsus.find(
    (c) => c.name.toLowerCase() === characterName.toLowerCase()
  );
  
  if (!characterData) return undefined;
  
  if (upgraded && characterData.upgradedJutsu) {
    return characterData.upgradedJutsu;
  }
  
  return characterData.jutsus;
}

export function calculateTotalJutsuDamage(jutsu: Jutsu): number {
  let totalDamage = jutsu.damage || 0;
  
  if (jutsu.effect && jutsu.effect.type === 'poison' && jutsu.effect.duration) {
    totalDamage += jutsu.effect.value * jutsu.effect.duration;
  }
  
  return totalDamage;
}
