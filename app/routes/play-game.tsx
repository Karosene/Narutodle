import { useState, useEffect } from 'react';
import { Link } from 'react-router';
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

interface Player {
  name: string;
  hand: CharacterCard[];
}

export default function PlayGame() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<[Player, Player]>([
    { name: 'Player 1', hand: [] },
    { name: 'Player 2', hand: [] }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<0 | 1>(0);
  const [coinFlipResult, setCoinFlipResult] = useState<string>('');
  const [showCoinFlip, setShowCoinFlip] = useState(false);

  useEffect(() => {
    fetch('/characters.json')
      .then(res => res.json())
      .then((data: Character[]) => {
        setAllCharacters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load characters:', err);
        setLoading(false);
      });
  }, []);

  const convertToCard = (char: Character, index: number): CharacterCard => {
    const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
    
    const basePower = 
      char.rank === 'Kage' ? 90 :
      char.rank === 'Sannin' ? 85 :
      char.rank === 'Jōnin' || char.rank === 'Anbu' ? 75 :
      char.rank === 'Chūnin' ? 65 :
      char.rank === 'Genin' ? 55 : 60;
    
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
    if (allCharacters.length < 16) {
      alert('Not enough characters loaded!');
      return;
    }

    // Shuffle and convert characters to cards
    const shuffled = shuffleArray(allCharacters);
    const allCards = shuffled.slice(0, 16).map((char, index) => convertToCard(char, index));

    // Deal 8 cards to each player
    const player1Hand = allCards.slice(0, 8);
    const player2Hand = allCards.slice(8, 16);

    // Coin flip to determine who goes first
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
            <div className="text-center mb-6">
              <Link 
                to="/characters"
                className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                📖 View All Characters →
              </Link>
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
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4 pt-2 flex items-start justify-center">
      {/* Control Box - Left Side (Always Visible) */}
      <div className="fixed left-16 top-20 bottom-20 py-4 w-40 z-10">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-800 h-full flex flex-col">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-50 mb-3 text-center">
            🎴 Card Game
          </h1>
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 text-center">
              Current Turn:<br/>{currentPlayer.name}
            </p>
          </div>
          <button
            onClick={resetGame}
            className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition">
            Reset Game
          </button>
        </div>
      </div>

      {/* Game Board - Center */}
      <div className="max-w-[2200px] mx-auto space-y-3">
          {/* Player 1 Cards - Top Box */}
          <div className="rounded-lg bg-white dark:bg-slate-900 shadow-lg p-2 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2 justify-center">
              {players[0].hand.map((card, index) => (
                <div key={index} className="w-36">
                  <CharacterCardComponent 
                    card={card}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Playing Area - Center Box */}
          <div className="rounded-lg bg-white dark:bg-slate-900 shadow-lg p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-center h-72">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
                PLAYING AREA
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select your card and choose an opponent's card to attack
              </p>
            </div>
          </div>

          {/* Player 2 Cards - Bottom Box */}
          <div className="rounded-lg bg-white dark:bg-slate-900 shadow-lg p-2 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap gap-2 justify-center">
              {players[1].hand.map((card, index) => (
                <div key={index} className="w-36">
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
  );
}
