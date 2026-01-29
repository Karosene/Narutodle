import { useState, useEffect } from 'react';
import { CharacterCardComponent } from '~/components/CharacterCard';
import type { CharacterCard } from '~/types/tcg';
import { getCharacterJutsus, type Jutsu } from '../data/jutsus';
import { normalize } from '~/utils/normalize';

interface Character {
  name: string;
  file: string;
  gender?: string;
  clan?: string;
  rank?: string;
  affiliations?: string[];
  natureAffinity?: string[];
}

export default function Characters() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [displayCards, setDisplayCards] = useState<CharacterCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClan, setSelectedClan] = useState<string>('all');
  const [selectedAffiliation, setSelectedAffiliation] = useState<string>('all');
  const [selectedNatureAffinity, setSelectedNatureAffinity] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>('all');
  const [selectedJutsuType, setSelectedJutsuType] = useState<string>('all');
  const [selectedCharacter, setSelectedCharacter] = useState<{ card: CharacterCard; rawData: Character } | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedCharacter) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCharacter]);

  useEffect(() => {
    Promise.all([
      fetch('/attackTypes.json').then(res => res.json()),
      fetch('/characters.json').then(res => res.json())
    ])
      .then(([attackTypesData, data]: [Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>, Character[]]) => {
        setAllCharacters(data);
        
        const cards: CharacterCard[] = data.map((char, index) => {
          const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
          
          // Get attack type from attackTypes.json, default to taijutsu if not found
          const attackType = attackTypesData[char.name] || 'taijutsu';
          
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
                power: 50,
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

  // Filter characters based on search and filters
  const filteredCards = displayCards.filter((card, index) => {
    const rawData = allCharacters[index];
    const matchesSearch = normalize(card.name).includes(normalize(searchTerm));
    const matchesClan = selectedClan === 'all' || card.clan === selectedClan;
    
    const matchesAffiliation = selectedAffiliation === 'all' || 
      (rawData.affiliations && rawData.affiliations.some(a => a === selectedAffiliation));
    
    const matchesNatureAffinity = selectedNatureAffinity === 'all' || 
      (rawData.natureAffinity && rawData.natureAffinity.some(n => n === selectedNatureAffinity));
    
    const matchesRank = selectedRank === 'all' || rawData.rank === selectedRank;
    
    const matchesJutsuType = selectedJutsuType === 'all' || 
      card.forms.default.attackType === selectedJutsuType;
    
    return matchesSearch && matchesClan && matchesAffiliation && matchesNatureAffinity && matchesRank && matchesJutsuType;
  });

  // Get unique values for filters
  const uniqueClans = Array.from(new Set(displayCards.map(card => card.clan).filter(Boolean))).sort();
  const uniqueAffiliations = Array.from(new Set(allCharacters.flatMap(char => char.affiliations || []))).sort();
  const uniqueNatureAffinities = Array.from(new Set(allCharacters.flatMap(char => char.natureAffinity || []))).sort();
  const uniqueRanks = Array.from(new Set(allCharacters.map(char => char.rank).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-linear-to-r from-orange-600 to-blue-600 mb-4">
            Naruto Character Cards
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
            Browse all {displayCards.length} playable characters
          </p>

          {/* Search and Filters */}
          {!loading && (
            <div className="max-w-6xl mx-auto mb-8 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-3 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>
              </div>

              {/* Filters */}
              <div className="flex gap-4 justify-center overflow-x-auto">
                <select
                  value={selectedClan}
                  onChange={(e) => setSelectedClan(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Clans</option>
                  {uniqueClans.map(clan => (
                    <option key={clan} value={clan}>{clan}</option>
                  ))}
                </select>

                <select
                  value={selectedAffiliation}
                  onChange={(e) => setSelectedAffiliation(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Affiliations</option>
                  {uniqueAffiliations.map(affiliation => (
                    <option key={affiliation} value={affiliation}>{affiliation}</option>
                  ))}
                </select>

                <select
                  value={selectedNatureAffinity}
                  onChange={(e) => setSelectedNatureAffinity(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Nature Types</option>
                  {uniqueNatureAffinities.map(nature => (
                    <option key={nature} value={nature}>{nature}</option>
                  ))}
                </select>

                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Ranks</option>
                  {uniqueRanks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>

                <select
                  value={selectedJutsuType}
                  onChange={(e) => setSelectedJutsuType(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 focus:border-orange-500 focus:outline-none"
                >
                  <option value="all">All Jutsu Types</option>
                  <option value="ninjutsu">Ninjutsu</option>
                  <option value="taijutsu">Taijutsu</option>
                  <option value="genjutsu">Genjutsu</option>
                </select>
              </div>

              {/* Results Count */}
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredCards.length} of {displayCards.length} characters
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading characters...</p>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((card) => {
              const rawData = allCharacters.find(c => c.name === card.name);
              return (
                <div key={card.id} className="transform transition-transform hover:scale-105 h-full">
                  <CharacterCardComponent
                    card={card}
                    onClick={() => rawData && setSelectedCharacter({ card, rawData })}
                  />
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredCards.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-600 dark:text-slate-400">No characters found</p>
            <p className="text-slate-500 dark:text-slate-500 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCharacter(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Close button */}
              <button
                onClick={() => setSelectedCharacter(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
              >
                ✕
              </button>

              {/* Character Image Header */}
              <div className="relative h-64 overflow-hidden rounded-t-2xl">
                <img 
                  src={selectedCharacter.card.forms.default.imageUrl}
                  alt={selectedCharacter.card.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-800 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h2 className="text-4xl font-bold text-white drop-shadow-lg">{selectedCharacter.card.name}</h2>
                  {selectedCharacter.card.clan && (
                    <span className="inline-block mt-2 px-3 py-1 bg-orange-500 text-white rounded-full font-semibold">
                      {selectedCharacter.card.clan}
                    </span>
                  )}
                </div>
              </div>

              {/* Character Details */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedCharacter.rawData.rank && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Rank</p>
                      <p className="text-white font-bold text-lg">{selectedCharacter.rawData.rank}</p>
                    </div>
                  )}
                  {selectedCharacter.rawData.gender && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Gender</p>
                      <p className="text-white font-bold text-lg">{selectedCharacter.rawData.gender}</p>
                    </div>
                  )}
                  {selectedCharacter.rawData.natureAffinity && selectedCharacter.rawData.natureAffinity.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Nature Affinity</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedCharacter.rawData.natureAffinity.map((nature, i) => (
                          <span key={i} className="px-2 py-0.5 bg-green-600 text-white rounded-full text-xs font-semibold">
                            {nature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCharacter.rawData.affiliations && selectedCharacter.rawData.affiliations.length > 0 && (
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Affiliations</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedCharacter.rawData.affiliations.map((affiliation, i) => (
                          <span key={i} className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-semibold">
                            {affiliation}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Card Stats</h3>
                  <div className="space-y-4">
                    <div className="bg-slate-900 rounded-lg p-4">
                      <p className="text-slate-400 text-sm mb-1">Attack Type</p>
                      <p className="text-white font-bold text-lg uppercase">{selectedCharacter.card.forms.default.attackType}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">Health</p>
                        <p className="text-white font-bold text-2xl">{selectedCharacter.card.forms.default.health}</p>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-4">
                        <p className="text-slate-400 text-sm mb-1">Max Chakra</p>
                        <p className="text-white font-bold text-2xl">{selectedCharacter.card.forms.default.maxChakra}</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                                  <span className="text-slate-400">Chakra Cost: </span>
                                  <span className="text-blue-400 font-bold">{jutsu.chakraCost}</span>
                                </div>
                                {jutsu.damage && (
                                  <div>
                                    <span className="text-slate-400">Damage: </span>
                                    <span className="text-red-400 font-bold">{jutsu.damage}</span>
                                  </div>
                                )}
                                {jutsu.effect && (
                                  <div>
                                    <span className="text-slate-400">Effect: </span>
                                    <span className="text-green-400 font-bold capitalize">{jutsu.effect?.type?.replace(/_/g, ' ') || 'Unknown'}</span>
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
                                <span className="text-slate-400">Chakra Cost: </span>
                                <span className="text-blue-400 font-bold">{upgradedJutsu.chakraCost}</span>
                              </div>
                              {upgradedJutsu.damage && (
                                <div>
                                  <span className="text-slate-400">Damage: </span>
                                  <span className="text-red-400 font-bold">{upgradedJutsu.damage}</span>
                                </div>
                              )}
                              {upgradedJutsu.effect && (
                                <div>
                                  <span className="text-slate-400">Effect: </span>
                                  <span className="text-green-400 font-bold capitalize">{upgradedJutsu.effect?.type?.replace(/_/g, ' ') || 'Unknown'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
