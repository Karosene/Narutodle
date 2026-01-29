import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { CharacterCardComponent } from '~/components/CharacterCard';
import { GameRules } from '~/components/GameRules';
import type { CharacterCard, AttributeBoosterCard } from '~/types/tcg';
import { boosterDeck } from '~/data/boosters';

interface Character {
  name: string;
  file: string;
  gender?: string;
  clan?: string;
  rank?: string;
  affiliations?: string[];
  natureAffinity?: string[];
}

interface Player {
  name: string;
  hand: CharacterCard[];
}

export default function PlayGame() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [attackTypes, setAttackTypes] = useState<Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<[Player, Player]>([
    { name: 'Player 1', hand: [] },
    { name: 'Player 2', hand: [] }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<0 | 1>(0);
  const [coinFlipResult, setCoinFlipResult] = useState<string>('');
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [currentBooster, setCurrentBooster] = useState<AttributeBoosterCard | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/attackTypes.json').then(res => res.json()),
      fetch('/characters.json').then(res => res.json())
    ])
      .then(([attackTypesData, charactersData]: [Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>, Character[]]) => {
        setAttackTypes(attackTypesData);
        setAllCharacters(charactersData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const convertToCard = (char: Character, index: number): CharacterCard => {
    const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
    
    // Get attack type from attackTypes.json, default to taijutsu if not found
    const attackType = attackTypes[char.name] || 'taijutsu';
    
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
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = () => {
    // Filter characters to only include those in attackTypes.json (with complete jutsu data)
    const validCharacters = allCharacters.filter(char => attackTypes[char.name]);
    
    if (validCharacters.length < 16) {
      alert(`Not enough characters with complete jutsu data! Found ${validCharacters.length}, need 16.`);
      return;
    }

    const shuffled = shuffleArray(validCharacters);
    const allCards = shuffled.slice(0, 16).map((char, index) => convertToCard(char, index));

    const player1Hand = allCards.slice(0, 8);
    const player2Hand = allCards.slice(8, 16);

    const coinFlip = Math.random() < 0.5 ? 0 : 1;
    const firstPlayer = coinFlip === 0 ? 'Player 1' : 'Player 2';
    
    setShowCoinFlip(true);
    setCoinFlipResult(`🪙 Coin Flip: ${firstPlayer} goes first!`);
    
    setTimeout(() => {
      setPlayers([
        { name: 'Player 1', hand: player1Hand },
        { name: 'Player 2', hand: player2Hand }
      ]);
      setCurrentPlayerIndex(coinFlip);
      setGameStarted(true);
      setShowCoinFlip(false);
    }, 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([
      { name: 'Player 1', hand: [] },
      { name: 'Player 2', hand: [] }
    ]);
    setCoinFlipResult('');
    setCurrentBooster(null);
  };

  const drawBoosterCard = () => {
    const randomIndex = Math.floor(Math.random() * boosterDeck.length);
    const drawnBooster = boosterDeck[randomIndex];
    setCurrentBooster(drawnBooster);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (showCoinFlip) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl animate-bounce mb-6">🪙</div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{coinFlipResult}</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-slate-50">
              🎴 Naruto Card Game
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Battle with your favorite Naruto characters!
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={startGame}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 dark:border-slate-800">
            <div className="text-center mb-6 space-y-3">
              <div>
                <Link 
                  to="/characters"
                  className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  📖 View All Characters →
                </Link>
              </div>
              <div>
                <GameRules />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">How to Play:</h3>
            <ul className="space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⚔️</span>
                <span>Each player gets 8 random character cards</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🪙</span>
                <span>Coin flip determines who goes first</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎯</span>
                <span>Take turns attacking opponent's cards</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎴</span>
                <span>Each turn: Draw a booster card → Use or skip it → Attack an opponent's card</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⚡</span>
                <span>Boosters can increase power, health, chakra, or change forms</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🛡️</span>
                <span>Characters have resistances that reduce or negate damage</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">💙</span>
                <span>Chakra regenerates each turn</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🏆</span>
                <span>Win by eliminating all opponent's cards!</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[currentPlayerIndex === 0 ? 1 : 0];

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="h-fit flex gap-3">
        {/* Player 1 Section - Left Side */}
        <div className="flex gap-3">
          {/* Player 1 Hand */}
          <div className="bg-slate-800 rounded-lg p-3 w-fit">
            <div className="grid grid-cols-2 gap-3">
              {players[0].hand.map((card, index) => (
                <div key={index} className="w-32">
                  <CharacterCardComponent 
                    card={card}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Player 1 Attribute Card Box */}
          <div className="bg-slate-800 rounded-lg p-3 w-48 flex items-center justify-center">
            {currentBooster && currentPlayerIndex === 0 ? (
              <div className="border-2 border-purple-500 rounded-lg p-3 w-full">
                <h4 className="text-sm font-bold text-white mb-1">{currentBooster.name}</h4>
                <p className="text-[10px] text-slate-300 mb-2">{currentBooster.description}</p>
                <span className="inline-block px-2 py-1 bg-purple-600 text-white rounded-full text-[10px] font-semibold capitalize">
                  {currentBooster.type}
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Attribute Card
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Info + Draw */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Game Info - Top */}
          <div className="bg-slate-800 rounded-lg p-5">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Game Info</h3>
              <p className="text-slate-300 text-base mb-4">Turn: {currentPlayer.name}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition">
                  Reset Game
                </button>
                <GameRules 
                  triggerButton={
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition">
                      📖 Rules
                    </button>
                  }
                />
              </div>
            </div>
          </div>

          {/* Draw Booster Button */}
          <div className="bg-slate-700 rounded-lg p-5 flex items-center justify-center h-full">
            <div className="text-center">
              {!currentBooster && (
                <button
                  onClick={drawBoosterCard}
                  className="w-24 h-24 mx-auto bg-slate-600 rounded-lg border-2 border-dashed border-slate-500 flex items-center justify-center hover:bg-slate-500 transition-colors cursor-pointer mb-2"
                >
                  <span className="text-5xl">✨</span>
                </button>
              )}
              {!currentBooster && <p className="text-slate-400 text-sm">Draw Booster Card</p>}
            </div>
          </div>
        </div>

        {/* Player 2 Section - Right Side */}
        <div className="flex gap-3">
          {/* Player 2 Attribute Card Box */}
          <div className="bg-slate-800 rounded-lg p-3 w-48 flex items-center justify-center">
            {currentBooster && currentPlayerIndex === 1 ? (
              <div className="border-2 border-purple-500 rounded-lg p-3 w-full">
                <h4 className="text-sm font-bold text-white mb-1">{currentBooster.name}</h4>
                <p className="text-[10px] text-slate-300 mb-2">{currentBooster.description}</p>
                <span className="inline-block px-2 py-1 bg-purple-600 text-white rounded-full text-[10px] font-semibold capitalize">
                  {currentBooster.type}
                </span>
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs">
                Attribute Card
              </div>
            )}
          </div>
          
          {/* Player 2 Hand */}
          <div className="bg-slate-800 rounded-lg p-3 w-fit">
            <div className="grid grid-cols-2 gap-3">
              {players[1].hand.map((card, index) => (
                <div key={index} className="w-32">
                  <CharacterCardComponent 
                    card={card}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
