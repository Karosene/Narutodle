import { useState, useEffect } from 'react';
import { CharacterCardComponent } from '~/components/CharacterCard';
import type { CharacterCard } from '~/types/tcg';
import { getCharacterJutsus, type Jutsu } from '../data/jutsus';

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
  const [selectedCharacter, setSelectedCharacter] = useState<{ card: CharacterCard; original: Character } | null>(null);

  useEffect(() => {
    fetch('/characters.json')
      .then(res => res.json())
      .then((data: Character[]) => {
        setAllCharacters(data);
        
        // Convert all characters to card format
        const cards: CharacterCard[] = data.map((char, index) => {
          // Extract clan name from character data
          const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
          
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
    <div className="min-h-screen bg-slate-900">
      <div className="container mx-auto px-4 pt-2">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Naruto Character Cards
          </h1>
          <p className="text-slate-400 text-base mb-3">
            Browse all {displayCards.length} playable characters
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-400"></div>
            <p className="mt-4 text-slate-400">Loading characters...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {displayCards.map((card, index) => (
              <div key={card.id} className="transform transition-transform hover:scale-105 h-full">
                <CharacterCardComponent
                  card={card}
                  onClick={() => setSelectedCharacter({ card, original: allCharacters[index] })}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Character Details Modal */}
      {selectedCharacter && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCharacter(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-64 bg-linear-to-br from-slate-700 to-slate-900">
              <img 
                src={selectedCharacter.card.forms.default.imageUrl} 
                alt={selectedCharacter.card.name}
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-800 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-4xl font-bold text-white mb-2">{selectedCharacter.card.name}</h2>
                {selectedCharacter.card.clan && (
                  <span className="inline-block px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-semibold">
                    {selectedCharacter.card.clan} Clan
                  </span>
                )}
              </div>
              <button 
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-xl"
              >
                ×
              </button>
            </div>

            {/* Character Info */}
            <div className="p-6 space-y-6">
              {/* Basic Stats */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Character Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-400 text-sm">Gender</p>
                    <p className="text-white font-semibold">{selectedCharacter.original.gender || 'Unknown'}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-400 text-sm">Rank</p>
                    <p className="text-white font-semibold">{selectedCharacter.original.rank || 'Unknown'}</p>
                  </div>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <p className="text-slate-400 text-sm">Attack Type</p>
                    <p className="text-white font-semibold capitalize">{selectedCharacter.card.forms.default.attackType}</p>
                  </div>
                </div>
              </div>

              {/* Affiliations */}
              {selectedCharacter.original.affiliations && selectedCharacter.original.affiliations.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Affiliations</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.original.affiliations.map((aff, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                        {aff}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nature Affinity */}
              {selectedCharacter.original.natureAffinity && selectedCharacter.original.natureAffinity.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Nature Affinity</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.original.natureAffinity.map((nature, i) => (
                      <span key={i} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm">
                        {nature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Jutsus */}
              {(() => {
                const baseJutsus = getCharacterJutsus(selectedCharacter.card.name, false);
                const upgradedJutsu = getCharacterJutsus(selectedCharacter.card.name, true);
                const hasUpgradedJutsu = upgradedJutsu && !Array.isArray(upgradedJutsu);
                
                return baseJutsus && Array.isArray(baseJutsus) ? (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Signature Jutsus</h3>
                    
                    {/* Base Form Jutsus */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-teal-400 mb-2">Base Form</h4>
                      <div className="space-y-3">
                        {baseJutsus.map((jutsu: Jutsu, i: number) => (
                          <div key={i} className="bg-slate-900 rounded-lg p-4 border-l-4 border-purple-500">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-lg font-bold text-white">{jutsu.name}</h4>
                              <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold">
                                {jutsu.jutsuType}
                              </span>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{jutsu.description}</p>
                            <div className="flex gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">Chakra Cost:</span>
                                <span className="text-blue-400 font-semibold ml-1">{jutsu.chakraCost}</span>
                              </div>
                              {jutsu.damage !== undefined && jutsu.damage > 0 && (
                                <div>
                                  <span className="text-slate-400">Damage:</span>
                                  <span className="text-red-400 font-semibold ml-1">{jutsu.damage}</span>
                                </div>
                              )}
                              {jutsu.effect && (
                                <div>
                                  <span className="text-slate-400">Effect:</span>
                                  <span className="text-green-400 font-semibold ml-1 capitalize">{jutsu.effect.type}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Upgraded Form Jutsu */}
                    {hasUpgradedJutsu && (
                      <div>
                        <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                          <span>Upgraded Form</span>
                          <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded">⚡ Booster Required</span>
                        </h4>
                        <div className="bg-slate-900 rounded-lg p-4 border-l-4 border-orange-500">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-white">{upgradedJutsu.name}</h4>
                            <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-semibold">
                              {upgradedJutsu.jutsuType}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm mb-3">{upgradedJutsu.description}</p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Chakra Cost:</span>
                              <span className="text-blue-400 font-semibold ml-1">{upgradedJutsu.chakraCost}</span>
                            </div>
                            {upgradedJutsu.damage !== undefined && upgradedJutsu.damage > 0 && (
                              <div>
                                <span className="text-slate-400">Damage:</span>
                                <span className="text-red-400 font-semibold ml-1">{upgradedJutsu.damage}</span>
                              </div>
                            )}
                            {upgradedJutsu.effect && (
                              <div>
                                <span className="text-slate-400">Effect:</span>
                                <span className="text-green-400 font-semibold ml-1 capitalize">{upgradedJutsu.effect.type}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Stats Bars */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Base Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">Health</span>
                      <span className="text-white font-semibold text-sm">{selectedCharacter.card.forms.default.health}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-red-500 h-3 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-400 text-sm">Max Chakra</span>
                      <span className="text-white font-semibold text-sm">{selectedCharacter.card.forms.default.maxChakra}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
