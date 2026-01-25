import { useState, useEffect } from 'react';
import { CharacterCardComponent } from '~/components/CharacterCard';
import type { CharacterCard } from '~/types/tcg';

interface Character {
  name: string;
  file: string;
  gender?: string;
  clan?: string;
  rank?: string;
  affiliations?: string[];
  natureAffinity?: string[];
}

export default function CardGame() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [displayCards, setDisplayCards] = useState<CharacterCard[]>([]);
  const [selectedForm, setSelectedForm] = useState<'default' | 'upgraded'>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/characters.json')
      .then(res => res.json())
      .then((data: Character[]) => {
        setAllCharacters(data);
        
        // Convert all characters to card format
        const cards: CharacterCard[] = data.map((char, index) => {
          // Extract clan name from character data
          const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
          
          // Determine power based on rank
          const basePower = 
            char.rank === 'Kage' ? 90 :
            char.rank === 'Sannin' ? 85 :
            char.rank === 'Jōnin' || char.rank === 'Anbu' ? 75 :
            char.rank === 'Chūnin' ? 65 :
            char.rank === 'Genin' ? 55 : 60;
          
          // Determine attack type based on nature affinity
          let attackType: 'taijutsu' | 'ninjutsu' | 'genjutsu' = 'taijutsu';
          if (char.natureAffinity && char.natureAffinity.length > 0) {
            attackType = 'ninjutsu';
          } else if (char.name.includes('Uchiha') || char.name.includes('Genjutsu')) {
            attackType = 'genjutsu';
          }
          
          return {
            id: `char-${index}`,
            name: char.name,
            clan: clanName,
            currentHealth: 100,
            currentChakra: 100,
            currentForm: 'default' as const,
            forms: {
              default: {
                name: 'Base Form',
                power: basePower,
                health: 100,
                maxChakra: 100,
                attackType,
                resistances: {
                  taijutsu: 'none',
                  ninjutsu: 'none',
                  genjutsu: 'none'
                },
                imageUrl: char.file
              }
            },
            boosters: []
          };
        });
        
        setDisplayCards(cards);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load characters:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-blue-600 mb-4">
            Naruto Character Cards
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Browse all {displayCards.length} playable characters
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading characters...</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayCards.map((card) => (
              <div key={card.id} className="transform transition-transform hover:scale-105 h-full">
                <CharacterCardComponent
                  card={card}
                  onClick={() => {}}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
