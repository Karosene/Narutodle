/**
 * Game Data Utilities
 * Fetches card game data (attack types, jutsus, passive abilities) from Supabase
 */

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
};

/**
 * Fetches attack types from Supabase and returns a Record<characterName, attackType>
 */
export async function fetchAttackTypes(): Promise<Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/attack_types?select=character_name,attack_type&limit=1000`,
    { headers: HEADERS }
  );
  const data: { character_name: string; attack_type: string }[] = await res.json();
  const result: Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'> = {};
  for (const row of data) {
    result[row.character_name] = row.attack_type as 'taijutsu' | 'ninjutsu' | 'genjutsu';
  }
  return result;
}

/**
 * Fetches jutsus data from Supabase and returns an array matching the jutsusData.json shape
 */
export async function fetchJutsusData(): Promise<any[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/jutsus?select=character_name,jutsus,upgraded_jutsu&limit=1000`,
    { headers: HEADERS }
  );
  const data: { character_name: string; jutsus: any; upgraded_jutsu?: any }[] = await res.json();
  return data.map(row => ({
    name: row.character_name,
    jutsus: row.jutsus ?? [],
    upgradedJutsu: row.upgraded_jutsu ?? null,
  }));
}

/**
 * Fetches passive abilities from Supabase and returns an array matching passiveAbilities.json shape
 */
export async function fetchPassiveAbilities(): Promise<any[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/passive_abilities?select=character_name,passive_name,description,trigger,chance,effect&limit=1000`,
    { headers: HEADERS }
  );
  const data: {
    character_name: string;
    passive_name: string;
    description: string;
    trigger: string;
    chance: number;
    effect: any;
  }[] = await res.json();
  return data.map(row => ({
    characterName: row.character_name,
    passiveName: row.passive_name,
    description: row.description,
    trigger: row.trigger,
    chance: row.chance,
    effect: row.effect,
  }));
}

/**
 * Fetches characters from Supabase and returns an array matching characters.json shape
 */
export async function fetchCharacters(): Promise<any[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/characters?select=name,file,gender,age,height,clan,team,rank,first_appearance,nature_affinity,affiliations&limit=1000`,
    { headers: { ...HEADERS, 'Range': '0-999' } }
  );
  const data: any[] = await res.json();
  return data.map(c => ({
    name: c.name,
    file: c.file,
    gender: c.gender,
    age: c.age,
    height: c.height,
    clan: c.clan,
    team: c.team,
    rank: c.rank,
    firstAppearance: c.first_appearance,
    natureAffinity: c.nature_affinity,
    affiliations: c.affiliations,
  }));
}
