import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Link } from 'react-router';
import { CharacterCardComponent } from '~/components/CharacterCard';
import type { CharacterCard, AttributeBoosterCard, CharacterJutsuData, Jutsu, StatusEffect, PassiveAbility } from '~/types/tcg';
import { boosterDeck } from '~/data/boosters';
import { getCurrentUser, getUserProfile, updateUserProfile, type Profile } from '../utils/auth';
import { getGameSession, loadGameState, saveGameState, updateGameSession, type OnlineGameSession } from '../utils/onlineGame';

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

function LevelBadge({ level, xp, size = 40 }: { level: number | null; xp?: number | null; size?: number }) {
  const stroke = Math.max(4, Math.round(size * 0.1));
  const radius = (size - stroke) / 2.3;
  const circumference = 2 * Math.PI * radius;
  const xpValue = xp ?? 0;
  const levelFromXp = (value: number) => {
    if (value <= 0) return 1;
    const scaled = (2 * value) / 5;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * scaled)) / 2));
  };
  const xpForLevel = (lvl: number) => (5 * (lvl - 1) * lvl) / 2;
  const currentLevel = level ?? levelFromXp(xpValue);
  const currentThreshold = xpForLevel(currentLevel);
  const nextThreshold = xpForLevel(currentLevel + 1);
  const progress = nextThreshold > currentThreshold
    ? Math.min(1, Math.max(0, (xpValue - currentThreshold) / (nextThreshold - currentThreshold)))
    : 0;
  const dash = `${(progress * circumference).toFixed(2)} ${circumference.toFixed(2)}`;
  const currentXpProgress = xpValue - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return (
    <div style={{ width: size, height: size }} title={`${currentXpProgress}/${xpNeeded}XP`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#374151" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="#7c3aed" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={dash} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: 'relative', top: -size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-white font-semibold mt-0.5" style={{ fontSize: size * 0.35, lineHeight: 1, textAlign: 'center' }}>{level ?? '-'}</div>
      </div>
    </div>
  );
}

interface PlayerHeaderProps {
  username: string;
  profilePicture?: string;
  level?: number;
  xp?: number;
  wins?: number;
  losses?: number;
  isLeftSide: boolean;
  playerIndex: 0 | 1;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isHovered: boolean;
}

function PlayerHeader({ username, profilePicture, level = 1, xp = 0, wins = 0, losses = 0, isLeftSide, playerIndex, onMouseEnter, onMouseLeave, isHovered }: PlayerHeaderProps) {
  if (isLeftSide) {
    // Player 1 layout: Avatar → Username → Level → W/L
    return (
      <div 
        className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between h-fit relative cursor-pointer transition-all hover:bg-slate-700"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {isHovered && (
          <div className="absolute top-full left-0 mt-2 bg-slate-900 border-2 border-purple-500 rounded-lg p-4 z-50 min-w-[320px] shadow-2xl">
            <h4 className="text-white font-bold text-lg mb-3 border-b border-slate-700 pb-2">Player Statistics</h4>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="text-white font-semibold">{username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Level:</span>
                <span className="text-purple-400 font-semibold">{level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total XP:</span>
                <span className="text-blue-400 font-semibold">{xp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Win Rate:</span>
                <span className="text-yellow-400 font-semibold">
                  {wins + losses > 0 ? `${((wins / (wins + losses)) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
            
            {/* Game Stats Boxes */}
            <div className="space-y-2">
              {/* Total Games - Big Box */}
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Games</div>
                <div className="text-white text-3xl font-bold">{wins + losses}</div>
              </div>
              
              {/* Games Won and Lost - Side by Side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800 border-2 border-green-500 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Won</div>
                  <div className="text-green-400 text-2xl font-bold">{wins}</div>
                </div>
                <div className="bg-slate-800 border-2 border-red-500 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Lost</div>
                  <div className="text-red-400 text-2xl font-bold">{losses}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={username}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-white font-bold text-xl">
            {username}
          </span>
          <LevelBadge level={level} xp={xp} size={56} />
        </div>
        <div className="text-lg font-bold">
          <span className="text-green-400">{wins}W</span>
          <span className="text-slate-400"> / </span>
          <span className="text-red-400">{losses}L</span>
        </div>
      </div>
    );
  } else {
    // Player 2 layout: W/L → Level → Username → Avatar
    return (
      <div 
        className="bg-slate-800 rounded-lg px-4 py-3 flex items-center justify-between h-fit relative cursor-pointer transition-all hover:bg-slate-700"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {isHovered && (
          <div className="absolute top-full right-0 mt-2 bg-slate-900 border-2 border-purple-500 rounded-lg p-4 z-50 min-w-[320px] shadow-2xl">
            <h4 className="text-white font-bold text-lg mb-3 border-b border-slate-700 pb-2">Player Statistics</h4>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Username:</span>
                <span className="text-white font-semibold">{username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Level:</span>
                <span className="text-purple-400 font-semibold">{level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total XP:</span>
                <span className="text-blue-400 font-semibold">{xp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Win Rate:</span>
                <span className="text-yellow-400 font-semibold">
                  {wins + losses > 0 ? `${((wins / (wins + losses)) * 100).toFixed(1)}%` : '0%'}
                </span>
              </div>
            </div>
            
            {/* Game Stats Boxes */}
            <div className="space-y-2">
              {/* Total Games - Big Box */}
              <div className="bg-slate-800 border-2 border-blue-500 rounded-lg p-3 text-center">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Games</div>
                <div className="text-white text-3xl font-bold">{wins + losses}</div>
              </div>
              
              {/* Games Won and Lost - Side by Side */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800 border-2 border-green-500 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Won</div>
                  <div className="text-green-400 text-2xl font-bold">{wins}</div>
                </div>
                <div className="bg-slate-800 border-2 border-red-500 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Lost</div>
                  <div className="text-red-400 text-2xl font-bold">{losses}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="text-lg font-bold">
          <span className="text-green-400">{wins}W</span>
          <span className="text-slate-400"> / </span>
          <span className="text-red-400">{losses}L</span>
        </div>
        <div className="flex items-center gap-3">
          <LevelBadge level={level} xp={xp} size={56} />
          <span className="text-white font-bold text-xl">
            {username}
          </span>
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={username}
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    );
  }
}

interface PlayerCardsSectionProps {
  playerIndex: 0 | 1;
  players: [Player, Player];
  currentPlayerIndex: 0 | 1;
  selectingTarget: boolean;
  selectingJutsuTarget: boolean;
  selectedJutsu: Jutsu | null;
  splashTargets: Array<{playerIndex: 0 | 1, cardIndex: number}>;
  isHealer: (card: CharacterCard) => boolean;
  handleCharacterClick: (playerIndex: 0 | 1, cardIndex: number) => void;
  isMyTurn: () => boolean;
}

function PlayerCardsSection({ 
  playerIndex, 
  players, 
  currentPlayerIndex,
  selectingTarget,
  selectingJutsuTarget,
  selectedJutsu,
  splashTargets,
  isHealer,
  handleCharacterClick,
  isMyTurn
}: PlayerCardsSectionProps) {
  const player = players[playerIndex];
  
  return (
    <div className="bg-slate-800 rounded-lg px-3 pt-3 pb-0 h-fit flex-1 flex flex-col w-full max-w-2xl">
      <div className="grid grid-cols-3 gap-3">
        {/* Passive ability card Box */}
        {player.hand.filter(card => card.passiveAbility).slice(0, 1).length > 0 && (
          <div className="border-2 border-blue-600 rounded-lg p-3 relative">
            <div className="absolute -top-3 left-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md">
                Passive ability cards
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {player.hand.filter(card => card.passiveAbility).slice(0, 1).map((card) => {
                const index = player.hand.indexOf(card);
                let isValidTarget = false;
                if (selectingJutsuTarget && selectedJutsu) {
                  if (selectedJutsu.damage) {
                    isValidTarget = (currentPlayerIndex !== playerIndex);
                  }
                  else if (selectedJutsu.effect) {
                    const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                      selectedJutsu.effect.target === 'self' || 
                      selectedJutsu.effect.target === 'ally' || 
                      selectedJutsu.effect.target === 'all_allies';
                    const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                      selectedJutsu.effect.target === 'all_opponents';
                    
                    if (isHealOrAlly && currentPlayerIndex === playerIndex) isValidTarget = true;
                    if (isOpponent && currentPlayerIndex !== playerIndex) isValidTarget = true;
                  }
                }
                const isSplashTarget = splashTargets.some(t => t.playerIndex === playerIndex && t.cardIndex === index);
                
                return (
                  <div 
                    key={index}
                    className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                    onClick={() => handleCharacterClick(playerIndex, index)}
                  >
                    <CharacterCardComponent 
                      card={card}
                      onClick={() => {}}
                      isSelectable={
                        (selectingTarget && currentPlayerIndex === playerIndex && isMyTurn()) || 
                        (selectingJutsuTarget && isValidTarget && isMyTurn()) ||
                        (currentPlayerIndex === playerIndex && !selectingTarget && !selectingJutsuTarget && isMyTurn())
                      }
                      isHealer={isHealer(card)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Healers Box */}
        {player.hand.filter(card => isHealer(card) && !card.passiveAbility).length > 0 && (
          <div className="col-span-2 border-2 border-green-600 rounded-lg p-3 relative">
            <div className="absolute -top-3 left-2">
              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded-md">
                Healers
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {player.hand.filter(card => isHealer(card) && !card.passiveAbility).map((card) => {
                const index = player.hand.indexOf(card);
                let isValidTarget = false;
                if (selectingJutsuTarget && selectedJutsu) {
                  if (selectedJutsu.damage) {
                    isValidTarget = (currentPlayerIndex !== playerIndex);
                  }
                  else if (selectedJutsu.effect) {
                    const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                      selectedJutsu.effect.target === 'self' || 
                      selectedJutsu.effect.target === 'ally' || 
                      selectedJutsu.effect.target === 'all_allies';
                    const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                      selectedJutsu.effect.target === 'all_opponents';
                    
                    if (isHealOrAlly && currentPlayerIndex === playerIndex) isValidTarget = true;
                    if (isOpponent && currentPlayerIndex !== playerIndex) isValidTarget = true;
                  }
                }
                const isSplashTarget = splashTargets.some(t => t.playerIndex === playerIndex && t.cardIndex === index);
                
                return (
                  <div 
                    key={index}
                    className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                    onClick={() => handleCharacterClick(playerIndex, index)}
                  >
                    <CharacterCardComponent 
                      card={card}
                      onClick={() => {}}
                      isSelectable={
                        (selectingTarget && currentPlayerIndex === playerIndex && isMyTurn()) || 
                        (selectingJutsuTarget && isValidTarget && isMyTurn()) ||
                        (currentPlayerIndex === playerIndex && !selectingTarget && !selectingJutsuTarget && isMyTurn())
                      }
                      isHealer={isHealer(card)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Normal cards */}
        {player.hand.filter(card => !card.passiveAbility && !isHealer(card)).map((card) => {
          const index = player.hand.indexOf(card);
          let isValidTarget = false;
          if (selectingJutsuTarget && selectedJutsu) {
            if (selectedJutsu.damage) {
              isValidTarget = (currentPlayerIndex !== playerIndex);
            }
            else if (selectedJutsu.effect) {
              const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                selectedJutsu.effect.target === 'self' || 
                selectedJutsu.effect.target === 'ally' || 
                selectedJutsu.effect.target === 'all_allies';
              const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                selectedJutsu.effect.target === 'all_opponents';
              
              if (isHealOrAlly && currentPlayerIndex === playerIndex) isValidTarget = true;
              if (isOpponent && currentPlayerIndex !== playerIndex) isValidTarget = true;
            }
          }
          
          const isSplashTarget = splashTargets.some(t => t.playerIndex === playerIndex && t.cardIndex === index);
          
          return (
            <div 
              key={index}
              className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
              onClick={() => handleCharacterClick(playerIndex, index)}
            >
              <CharacterCardComponent 
                card={card}
                onClick={() => {}}
                isSelectable={
                  (selectingTarget && currentPlayerIndex === playerIndex && isMyTurn()) || 
                  (selectingJutsuTarget && isValidTarget && isMyTurn()) ||
                  (currentPlayerIndex === playerIndex && !selectingTarget && !selectingJutsuTarget && isMyTurn())
                }
                isHealer={isHealer(card)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface BoosterHandSectionProps {
  playerIndex: 0 | 1;
  boosterHands: [AttributeBoosterCard[], AttributeBoosterCard[]];
  currentPlayerIndex: 0 | 1;
  selectingTarget: boolean;
  selectedBooster: {booster: AttributeBoosterCard, index: number} | null;
  newlyDrawnCard: {playerIndex: 0 | 1, cardIndex: number} | null;
  handleBoosterClick: (booster: AttributeBoosterCard, index: number) => void;
  setSelectedBooster: (val: {booster: AttributeBoosterCard, index: number} | null) => void;
  setSelectingTarget: (val: boolean) => void;
  isMyTurn: () => boolean;
}

function BoosterHandSection({
  playerIndex,
  boosterHands,
  currentPlayerIndex,
  selectingTarget,
  selectedBooster,
  newlyDrawnCard,
  handleBoosterClick,
  setSelectedBooster,
  setSelectingTarget,
  isMyTurn
}: BoosterHandSectionProps) {
  const hand = boosterHands[playerIndex];
  
  return (
    <div className="bg-slate-800 rounded-lg p-3 w-56 h-fit flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-bold text-white">Booster Hand ({hand.length}/5)</h4>
      </div>
      <hr className="border-slate-600 mb-3" />
      <div className="space-y-2">
        {hand.map((booster, index) => (
          <button
            key={index}
            onClick={() => handleBoosterClick(booster, index)}
            disabled={currentPlayerIndex !== playerIndex || selectingTarget || !isMyTurn()}
            className={`border-2 rounded-lg p-3 w-full text-left transition-all h-20 ${
              currentPlayerIndex === playerIndex && !selectingTarget && isMyTurn()
                ? 'border-purple-500 hover:bg-purple-900 cursor-pointer'
                : 'border-slate-600 opacity-50 cursor-not-allowed'
            } ${
              selectedBooster?.index === index && selectedBooster?.booster === booster ? 'bg-purple-800' : ''
            } ${
              newlyDrawnCard?.playerIndex === playerIndex && newlyDrawnCard?.cardIndex === index
                ? 'animate-pulse ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/50'
                : ''
            }`}
          >
            <h5 className="text-sm font-bold text-white mb-1">{booster.name}</h5>
            <p className="text-xs text-slate-300 line-clamp-2">{booster.description}</p>
          </button>
        ))}
      </div>
      {selectingTarget && selectedBooster && currentPlayerIndex === playerIndex && (
        <button
          onClick={() => {
            setSelectedBooster(null);
            setSelectingTarget(false);
          }}
          className="mt-2 w-full px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
        >
          Cancel
        </button>
      )}  
    </div>
  );
}

interface GameHistorySectionProps {
  history: string[];
}

function GameHistorySection({ history }: GameHistorySectionProps) {
  return (
    <div className="bg-slate-700/30 rounded-lg p-3 w-full h-fit">
      <h4 className="text-sm font-bold text-white mb-2">📜 Game History</h4>
      <div className="max-h-48 overflow-y-auto">
        {history.length === 0 ? (
          <p className="text-slate-400 text-xs italic py-2">No actions yet...</p>
        ) : (
          <div className="divide-y divide-slate-600">
            {history.map((action, index) => (
              <div key={index} className="py-2">
                <p className="text-xs text-slate-200 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnlineGamePlay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session');
  
  // Online multiplayer state
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<OnlineGameSession | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [player1Profile, setPlayer1Profile] = useState<Profile | null>(null);
  const [player2Profile, setPlayer2Profile] = useState<Profile | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPlayerIndexRef = useRef<0 | 1>(0);
  
  // Game data
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [attackTypes, setAttackTypes] = useState<Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>>({});
  const [jutsuData, setJutsuData] = useState<Record<string, CharacterJutsuData>>({});
  const [passiveAbilities, setPassiveAbilities] = useState<Record<string, PassiveAbility>>({});
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState<[Player, Player]>([
    { name: 'Player 1', hand: [] },
    { name: 'Player 2', hand: [] }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<0 | 1>(0);
  const [showNumberGuess, setShowNumberGuess] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [player1Guess, setPlayer1Guess] = useState<string>('');
  const [player2Guess, setPlayer2Guess] = useState<string>('');
  const [guessingPlayerIndex, setGuessingPlayerIndex] = useState<0 | 1 | null>(null);
  const [guessTimer, setGuessTimer] = useState<number>(10);
  const [gameResult, setGameResult] = useState<string>('');
  const [pendingPlayers, setPendingPlayers] = useState<[Player, Player] | null>(null);
  const [currentBooster, setCurrentBooster] = useState<AttributeBoosterCard | null>(null);
  const [boosterHands, setBoosterHands] = useState<[AttributeBoosterCard[], AttributeBoosterCard[]]>([[], []]);
  const [selectedBooster, setSelectedBooster] = useState<{booster: AttributeBoosterCard, index: number} | null>(null);
  const [selectingTarget, setSelectingTarget] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [showJutsuSelector, setShowJutsuSelector] = useState(false);
  const [selectedJutsu, setSelectedJutsu] = useState<Jutsu | null>(null);
  const [selectingJutsuTarget, setSelectingJutsuTarget] = useState(false);
  const [showPassiveTab, setShowPassiveTab] = useState(false);
  const [jutsusUsedThisTurn, setJutsusUsedThisTurn] = useState(0);
  const [newlyDrawnCard, setNewlyDrawnCard] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [doubleAttackCharacter, setDoubleAttackCharacter] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [splashTargets, setSplashTargets] = useState<Array<{playerIndex: 0 | 1, cardIndex: number}>>([]);
  const [isSelectingSplashTargets, setIsSelectingSplashTargets] = useState(false);
  const [healedCard, setHealedCard] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hoveredPlayer, setHoveredPlayer] = useState<0 | 1 | null>(null);
  const [gameHistory, setGameHistory] = useState<string[]>([]);

  // Initialize game - load data and check session
  useEffect(() => {
    const initGame = async () => {
      // Check user is logged in
      const currentUser = getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // Check session ID exists
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      // Load game session
      const sessionResult = await getGameSession(sessionId);
      if (!sessionResult.success || !sessionResult.session) {
        setError('Game session not found');
        setLoading(false);
        return;
      }
      setSession(sessionResult.session);

      // Load player profiles
      const hostProfile = await getUserProfile(sessionResult.session.host_user_id);
      setPlayer1Profile(hostProfile);
      
      if (sessionResult.session.guest_user_id) {
        const guestProfile = await getUserProfile(sessionResult.session.guest_user_id);
        setPlayer2Profile(guestProfile);
      }

      // Check if user is part of this game
      const userIsHost = sessionResult.session.host_user_id === currentUser.id;
      const userIsGuest = sessionResult.session.guest_user_id === currentUser.id;
      
      if (!userIsHost && !userIsGuest) {
        setError('You are not part of this game');
        setLoading(false);
        return;
      }
      
      setIsHost(userIsHost);

      // Load game data
      try {
        const [attackTypesData, charactersData, jutsusDataArray, passiveAbilitiesArray] = await Promise.all([
          fetch('/attackTypes.json').then(res => res.json()),
          fetch('/characters.json').then(res => res.json()),
          fetch('/jutsusData.json').then(res => res.json()),
          fetch('/passiveAbilities.json').then(res => res.json())
        ]);
        
        setAttackTypes(attackTypesData);
        setAllCharacters(charactersData);
        
        const jutsuMap: Record<string, CharacterJutsuData> = {};
        jutsusDataArray.forEach((charJutsu: CharacterJutsuData) => {
          jutsuMap[charJutsu.name] = charJutsu;
        });
        setJutsuData(jutsuMap);
        
        const passiveMap: Record<string, PassiveAbility> = {};
        passiveAbilitiesArray.forEach((passive: PassiveAbility) => {
          passiveMap[passive.characterName] = passive;
        });
        setPassiveAbilities(passiveMap);
        
        // Load or create game state
        const stateResult = await loadGameState(sessionId);
        if (stateResult.success && stateResult.state) {
          // Restore game state from database
          const state = stateResult.state;
          if (state.players) setPlayers(state.players);
          if (state.pending_players) setPendingPlayers(state.pending_players);
          if (state.booster_hands) setBoosterHands(state.booster_hands);
          if (typeof state.game_started === 'boolean') setGameStarted(state.game_started);
          if (typeof state.show_number_guess === 'boolean') setShowNumberGuess(state.show_number_guess);
          if (state.target_number) setTargetNumber(state.target_number);
          if (state.player1_guess) setPlayer1Guess(state.player1_guess);
          if (state.player2_guess) setPlayer2Guess(state.player2_guess);
          if (state.guessing_player_index !== undefined) setGuessingPlayerIndex(state.guessing_player_index);
          if (typeof state.guess_timer === 'number') setGuessTimer(state.guess_timer);
          if (typeof state.jutsus_used_this_turn === 'number') setJutsusUsedThisTurn(state.jutsus_used_this_turn);
          if (state.selected_character) setSelectedCharacter(state.selected_character);
          if (state.selected_jutsu) setSelectedJutsu(state.selected_jutsu);
          if (state.selected_booster) setSelectedBooster(state.selected_booster);
          if (typeof state.selecting_target === 'boolean') setSelectingTarget(state.selecting_target);
          if (typeof state.selecting_jutsu_target === 'boolean') setSelectingJutsuTarget(state.selecting_jutsu_target);
          if (typeof state.is_selecting_splash_targets === 'boolean') setIsSelectingSplashTargets(state.is_selecting_splash_targets);
          if (state.splash_targets) setSplashTargets(state.splash_targets);
          if (state.newly_drawn_card) setNewlyDrawnCard(state.newly_drawn_card);
          if (state.double_attack_character) setDoubleAttackCharacter(state.double_attack_character);
        }
        
        // Set current player from session
        if (sessionResult.session.current_player_index !== undefined) {
          const initialPlayerIndex = sessionResult.session.current_player_index as 0 | 1;
          currentPlayerIndexRef.current = initialPlayerIndex;
          setCurrentPlayerIndex(initialPlayerIndex);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to load game data:', err);
        setError('Failed to load game data');
        setLoading(false);
      }
    };

    initGame();
  }, [sessionId, navigate]);

  // Polling for state updates every 3 seconds
  useEffect(() => {
    if (!sessionId || loading) return;

    const pollGameState = async () => {
      try {
        const stateResult = await loadGameState(sessionId);
        if (stateResult.success && stateResult.state) {
          const state = stateResult.state;
          
          console.log('Polling received state:', { 
            game_started: state.game_started, 
            has_players: !!state.players,
            players_length: state.players?.length
          });
          
          // Update all state variables (except UI selection states which are player-specific)
          if (state.players) setPlayers(state.players);
          if (state.pending_players) setPendingPlayers(state.pending_players);
          if (state.booster_hands) setBoosterHands(state.booster_hands);
          if (typeof state.game_started === 'boolean') {
            console.log('Setting gameStarted to:', state.game_started);
            setGameStarted(state.game_started);
          }
          if (typeof state.show_number_guess === 'boolean') setShowNumberGuess(state.show_number_guess);
          if (state.target_number !== undefined) setTargetNumber(state.target_number);
          if (state.player1_guess !== undefined) setPlayer1Guess(state.player1_guess);
          if (state.player2_guess !== undefined) setPlayer2Guess(state.player2_guess);
          if (state.guessing_player_index !== undefined) setGuessingPlayerIndex(state.guessing_player_index);
          if (typeof state.guess_timer === 'number') setGuessTimer(state.guess_timer);
          if (typeof state.jutsus_used_this_turn === 'number') setJutsusUsedThisTurn(state.jutsus_used_this_turn || 0);
          if (state.newly_drawn_card) setNewlyDrawnCard(state.newly_drawn_card);
          if (state.double_attack_character !== undefined) setDoubleAttackCharacter(state.double_attack_character);
          if (state.healed_card !== undefined) setHealedCard(state.healed_card);
          
          // DO NOT sync UI selection states (selectedCharacter, selectedJutsu, etc.)
          // These are player-specific and should not persist across turns
          
          // Update session data for current player index
          const sessionResult = await getGameSession(sessionId);
          if (sessionResult.success && sessionResult.session) {
            setSession(sessionResult.session);
            if (sessionResult.session.current_player_index !== undefined) {
              const newPlayerIndex = sessionResult.session.current_player_index as 0 | 1;
              
              // If turn changed, clear any local selection states
              // Use ref to avoid stale closure issues
              if (newPlayerIndex !== currentPlayerIndexRef.current) {
                console.log('Turn changed! Clearing selection states', {
                  from: currentPlayerIndexRef.current,
                  to: newPlayerIndex
                });
                setSelectedCharacter(null);
                setSelectedJutsu(null);
                setSelectedBooster(null);
                setSelectingTarget(false);
                setSelectingJutsuTarget(false);
                setIsSelectingSplashTargets(false);
                setSplashTargets([]);
                setShowJutsuSelector(false);
              }
              
              currentPlayerIndexRef.current = newPlayerIndex;
              setCurrentPlayerIndex(newPlayerIndex);
            }
          }
        }
      } catch (err) {
        console.error('Failed to poll game state:', err);
      }
    };

    // Poll immediately, then every 3 seconds
    pollGameState();
    pollingIntervalRef.current = setInterval(pollGameState, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [sessionId, loading]);

  // Debug: Log when gameStarted changes
  useEffect(() => {
    console.log('gameStarted changed to:', gameStarted);
  }, [gameStarted]);

  // Fetch guest profile when they join
  useEffect(() => {
    const fetchGuestProfile = async () => {
      if (session?.guest_user_id && !player2Profile) {
        const guestProfile = await getUserProfile(session.guest_user_id);
        setPlayer2Profile(guestProfile);
      }
    };
    fetchGuestProfile();
  }, [session?.guest_user_id, player2Profile]);

  // Helper function to save current state
  const saveCurrentState = async (updates: any = {}) => {
    if (!sessionId) return;
    
    try {
      await saveGameState({
        session_id: sessionId,
        players: updates.players || players,
        pending_players: updates.pendingPlayers !== undefined ? updates.pendingPlayers : pendingPlayers,
        booster_hands: updates.boosterHands || boosterHands,
        game_started: updates.gameStarted !== undefined ? updates.gameStarted : gameStarted,
        show_number_guess: updates.showNumberGuess !== undefined ? updates.showNumberGuess : showNumberGuess,
        target_number: updates.targetNumber !== undefined ? updates.targetNumber : targetNumber,
        player1_guess: updates.player1Guess !== undefined ? updates.player1Guess : player1Guess,
        player2_guess: updates.player2Guess !== undefined ? updates.player2Guess : player2Guess,
        guessing_player_index: updates.guessingPlayerIndex !== undefined ? updates.guessingPlayerIndex : guessingPlayerIndex,
        guess_timer: updates.guessTimer !== undefined ? updates.guessTimer : guessTimer,
        jutsus_used_this_turn: updates.jutsusUsedThisTurn !== undefined ? updates.jutsusUsedThisTurn : jutsusUsedThisTurn,
        // UI selection states - always save as null/false (not synced across players)
        selected_character: null,
        selected_jutsu: null,
        selected_booster: null,
        selecting_target: false,
        selecting_jutsu_target: false,
        is_selecting_splash_targets: false,
        splash_targets: [],
        newly_drawn_card: updates.newlyDrawnCard !== undefined ? updates.newlyDrawnCard : newlyDrawnCard,
        double_attack_character: updates.doubleAttackCharacter !== undefined ? updates.doubleAttackCharacter : doubleAttackCharacter,
        healed_card: updates.healedCard !== undefined ? updates.healedCard : healedCard
      });
    } catch (err) {
      console.error('Failed to save game state:', err);
    }
  };

  const convertToCard = (char: Character, index: number): CharacterCard => {
    const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
    const attackType = attackTypes[char.name] || 'taijutsu';
    
    const card: CharacterCard = {
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
    
    if (passiveAbilities[char.name]) {
      card.passiveAbility = passiveAbilities[char.name];
    }
    
    return card;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = async () => {
    // Only host can start the game
    if (!isHost) {
      alert('Only the host can start the game!');
      return;
    }
    
    const validCharacters = allCharacters.filter(char => attackTypes[char.name]);
    
    if (validCharacters.length < 18) {
      alert(`Not enough characters with complete jutsu data! Found ${validCharacters.length}, need 18.`);
      return;
    }

    const charactersWithPassive = validCharacters.filter(char => passiveAbilities[char.name]);
    const healers = validCharacters.filter(char => {
      const charJutsu = jutsuData[char.name];
      if (!charJutsu) return false;
      const hasHealJutsu = charJutsu.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
      const hasPassive = passiveAbilities[char.name];
      return hasHealJutsu && !hasPassive;
    });
    const normalChars = validCharacters.filter(char => {
      const charJutsu = jutsuData[char.name];
      const hasPassive = passiveAbilities[char.name];
      const hasHealJutsu = charJutsu?.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
      return !hasPassive && !hasHealJutsu;
    });
    
    if (charactersWithPassive.length < 2 || healers.length < 4 || normalChars.length < 12) {
      alert('Not enough characters of each type!');
      return;
    }

    const shuffledPassive = shuffleArray(charactersWithPassive);
    const shuffledHealers = shuffleArray(healers);
    const shuffledNormal = shuffleArray(normalChars);
    
    const player1Chars = [
      shuffledPassive[0],
      shuffledHealers[0],
      shuffledHealers[1],
      ...shuffledNormal.slice(0, 6)
    ];
    
    const player2Chars = [
      shuffledPassive[1],
      shuffledHealers[2],
      shuffledHealers[3],
      ...shuffledNormal.slice(6, 12)
    ];
    
    if (player1Chars.length !== 9 || player2Chars.length !== 9) {
      alert('Error: Card distribution failed!');
      return;
    }
    
    const player1Hand = player1Chars.map((char, index) => convertToCard(char, index));
    const player2Hand = player2Chars.map((char, index) => convertToCard(char, index + 9));

    const newPlayers: [Player, Player] = [
      { name: 'Player 1', hand: player1Hand },
      { name: 'Player 2', hand: player2Hand }
    ];
    
    // Host (Player 1) always goes first
    const startingPlayer = 0;
    
    // Set game state
    setPlayers(newPlayers);
    currentPlayerIndexRef.current = startingPlayer;
    setCurrentPlayerIndex(startingPlayer);
    setGameStarted(true);
    
    // Update session with current player
    if (sessionId) {
      await updateGameSession(sessionId, {
        current_player_index: startingPlayer
      });
    }
    
    // Give starting player a random booster card
    const randomIndex = Math.floor(Math.random() * boosterDeck.length);
    const booster = boosterDeck[randomIndex];
    
    const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [[], []];
    newHands[startingPlayer] = [booster];
    setBoosterHands(newHands);
    setNewlyDrawnCard({playerIndex: startingPlayer, cardIndex: 0});
    
    // Save state to database
    console.log('Saving game state with gameStarted: true');
    await saveCurrentState({
      players: newPlayers,
      gameStarted: true,
      boosterHands: newHands,
      newlyDrawnCard: {playerIndex: startingPlayer, cardIndex: 0}
    });
    console.log('Game state saved successfully');
    
    // Clear the newly drawn card animation after delay
    setTimeout(() => setNewlyDrawnCard(null), 1500);
  };

  const resetGame = () => {
    setShowResetConfirm(true);
  };

  const confirmResetGame = async () => {
    setGameStarted(false);
    setPlayers([
      { name: 'Player 1', hand: [] },
      { name: 'Player 2', hand: [] }
    ]);
    setShowNumberGuess(false);
    setGameResult('');
    setCurrentBooster(null);
    setBoosterHands([[], []]);
    setSelectedBooster(null);
    setSelectingTarget(false);
    setShowResetConfirm(false);
    
    await saveCurrentState({
      gameStarted: false,
      showNumberGuess: false,
      boosterHands: [[], []]
    });
  };

  const applyBoosterToCharacter = async (characterIndex: number) => {
    if (!selectedBooster) return;
    
    const { booster, index: boosterIndex } = selectedBooster;
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const targetCard = newPlayers[currentPlayerIndex].hand[characterIndex];
    
    switch (booster.type) {
      case 'health':
        const maxHealth = targetCard.forms[targetCard.currentForm]?.health || 100;
        targetCard.currentHealth = Math.min(
          targetCard.currentHealth + (booster.effect.healthBoost || 0),
          maxHealth
        );
        break;
      case 'chakra':
        targetCard.currentChakra = Math.min(
          targetCard.currentChakra + (booster.effect.chakraBoost || 0),
          100
        );
        break;
      case 'jutsu_recovery':
        if (booster.effect.resetCooldowns && targetCard.jutsuCooldowns) {
          targetCard.jutsuCooldowns = {};
        }
        break;
      case 'jutsu_mastery':
        if (booster.effect.unlockSpecialJutsu && booster.effect.duration) {
          targetCard.jutsuMasteryRoundsLeft = booster.effect.duration;
          targetCard.boosters.push(booster);
        }
        break;
      case 'damage_boost':
        if (booster.effect.damageBoostPercent) {
          targetCard.damageBoostActive = true;
          targetCard.boosters.push(booster);
        }
        break;
      case 'splash_damage':
        targetCard.splashDamageActive = true;
        targetCard.boosters.push(booster);
        break;
      case 'double_attack':
        targetCard.boosters.push(booster);
        targetCard.doubleAttackRoundsLeft = 1;
        break;
    }
    
    const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [...boosterHands] as [AttributeBoosterCard[], AttributeBoosterCard[]];
    newHands[currentPlayerIndex] = newHands[currentPlayerIndex].filter((_, i) => i !== boosterIndex);
    
    setPlayers(newPlayers);
    setBoosterHands(newHands);
    setSelectedBooster(null);
    setSelectingTarget(false);
    
    await saveCurrentState({
      players: newPlayers,
      boosterHands: newHands,
      selectedBooster: null,
      selectingTarget: false
    });
  };

  const handleBoosterClick = (booster: AttributeBoosterCard, index: number) => {
    // Check if it's current player's turn
    if (!isMyTurn()) {
      alert("It's not your turn!");
      return;
    }
    
    setSelectedBooster({ booster, index });
    setSelectingTarget(true);
  };

  const canApplyBooster = (booster: AttributeBoosterCard, targetCard: CharacterCard): boolean => {
    switch (booster.type) {
      case 'health':
        const maxHealth = targetCard.forms[targetCard.currentForm]?.health || 100;
        return targetCard.currentHealth < maxHealth;
      case 'chakra':
        return targetCard.currentChakra < 100;
      case 'jutsu_recovery':
        return !!(targetCard.jutsuCooldowns && Object.keys(targetCard.jutsuCooldowns).length > 0);
      case 'jutsu_mastery':
        return !targetCard.jutsuMasteryRoundsLeft || targetCard.jutsuMasteryRoundsLeft === 0;
      case 'damage_boost':
        return !targetCard.damageBoostActive;
      case 'splash_damage':
      case 'double_attack':
        return !targetCard.boosters?.some(b => b.type === booster.type);
      default:
        return true;
    }
  };

  const regenerateChakra = (newPlayers: [Player, Player]) => {
    newPlayers.forEach(player => {
      const aliveCount = player.hand.filter(card => card.currentHealth > 0).length;
      let regenAmount = 3;
      
      if (aliveCount >= 7) regenAmount = 3;
      else if (aliveCount >= 5) regenAmount = 5;
      else if (aliveCount >= 3) regenAmount = 10;
      else if (aliveCount === 2) regenAmount = 15;
      else if (aliveCount === 1) regenAmount = 30;
      
      player.hand.forEach(card => {
        if (card.currentChakra < 100) {
          card.currentChakra = Math.min(card.currentChakra + regenAmount, 100);
        }
      });
    });
  };

  const endTurn = async () => {
    // Check if it's current player's turn
    if (!isMyTurn()) {
      alert("It's not your turn!");
      return;
    }
    
    setSelectingJutsuTarget(false);
    setSelectedJutsu(null);
    setSelectedCharacter(null);
    setShowJutsuSelector(false);
    setIsSelectingSplashTargets(false);
    setSplashTargets([]);
    setShowPassiveTab(false);

    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    regenerateChakra(newPlayers);
    processStatusEffects(newPlayers);
    decrementCooldowns(newPlayers);
    
    setJutsusUsedThisTurn(0);
    setDoubleAttackCharacter(null);
    
    const nextPlayer: 0 | 1 = currentPlayerIndex === 0 ? 1 : 0;
    currentPlayerIndexRef.current = nextPlayer;
    setCurrentPlayerIndex(nextPlayer);
    setPlayers(newPlayers);
    
    // Update session with new current player
    if (sessionId) {
      await updateGameSession(sessionId, {
        current_player_index: nextPlayer
      });
    }
    
    // Wait 1 second before updating state for opponent to see the move
    setTimeout(async () => {
      const nextPlayerHand = boosterHands[nextPlayer];
      if (nextPlayerHand.length < 5) {
        const randomIndex = Math.floor(Math.random() * boosterDeck.length);
        const drawnBooster = boosterDeck[randomIndex];
        
        const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [...boosterHands] as [AttributeBoosterCard[], AttributeBoosterCard[]];
        newHands[nextPlayer] = [...nextPlayerHand, drawnBooster];
        setBoosterHands(newHands);
        setCurrentBooster(drawnBooster);
        setNewlyDrawnCard({playerIndex: nextPlayer, cardIndex: newHands[nextPlayer].length - 1});
        
        await saveCurrentState({
          players: newPlayers,
          boosterHands: newHands,
          jutsusUsedThisTurn: 0,
          doubleAttackCharacter: null,
          newlyDrawnCard: {playerIndex: nextPlayer, cardIndex: newHands[nextPlayer].length - 1}
        });
        
        setTimeout(() => setNewlyDrawnCard(null), 1500);
      } else {
        await saveCurrentState({
          players: newPlayers,
          jutsusUsedThisTurn: 0,
          doubleAttackCharacter: null
        });
      }
    }, 1000);
  };

  const processStatusEffects = (newPlayers: [Player, Player]) => {
    newPlayers.forEach((player, playerIndex) => {
      player.hand.forEach(card => {
        if (!card.statusEffects) card.statusEffects = [];
        
        if (playerIndex === currentPlayerIndex) {
          card.statusEffects = card.statusEffects.filter(effect => {
            switch (effect.type) {
              case 'poison':
              case 'burn':
              case 'bleed':
                const effectDamage = effect.value || 0;
                card.currentHealth = Math.max(0, card.currentHealth - effectDamage);
                break;
            }
            effect.duration--;
            return effect.duration > 0;
          });
          
          if (card.buffRoundsLeft && card.buffRoundsLeft > 0) {
            card.buffRoundsLeft--;
            if (card.buffRoundsLeft === 0) {
              card.buffPowerIncrease = 0;
            }
          }
          
          if (card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0) {
            card.jutsuMasteryRoundsLeft--;
            if (card.jutsuMasteryRoundsLeft === 0) {
              card.boosters = card.boosters?.filter(b => b.type !== 'jutsu_mastery') || [];
            }
          }
          
          if (card.stunRoundsLeft && card.stunRoundsLeft > 0) {
            card.stunRoundsLeft--;
          }
          
          if (card.shieldRoundsLeft && card.shieldRoundsLeft > 0) {
            card.shieldRoundsLeft--;
          }
          
          if (card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0) {
            card.doubleAttackRoundsLeft--;
            if (card.doubleAttackRoundsLeft === 0) {
              card.boosters = card.boosters?.filter(b => b.type !== 'double_attack') || [];
            }
          }
          
          if (card.damageSuppressActive) {
            card.damageSuppressActive = false;
            card.damageSuppressAmount = 0;
          }
        }
      });
    });
  };

  const decrementCooldowns = (newPlayers: [Player, Player]) => {
    newPlayers[currentPlayerIndex].hand.forEach(card => {
      if (!card.jutsuCooldowns) card.jutsuCooldowns = {};
      
      Object.keys(card.jutsuCooldowns).forEach(jutsuName => {
        if (card.jutsuCooldowns![jutsuName] > 0) {
          card.jutsuCooldowns![jutsuName]--;
        }
      });
    });
  };

  const calculateTypeAdvantage = (attackerType: 'taijutsu' | 'ninjutsu' | 'genjutsu', defenderType: 'taijutsu' | 'ninjutsu' | 'genjutsu'): number => {
    if (attackerType === 'ninjutsu') {
      if (defenderType === 'taijutsu') return 1.1;
      if (defenderType === 'genjutsu') return 0.9;
    } else if (attackerType === 'taijutsu') {
      if (defenderType === 'genjutsu' || defenderType === 'ninjutsu') return 1.1;
    } else if (attackerType === 'genjutsu') {
      if (defenderType === 'ninjutsu' || defenderType === 'taijutsu') return 1.1;
    }
    return 1.0;
  };

  const handleCharacterClick = (playerIndex: 0 | 1, cardIndex: number) => {
    if (selectingTarget && currentPlayerIndex === playerIndex && selectedBooster) {
      const targetCard = players[playerIndex].hand[cardIndex];
      
      if (!canApplyBooster(selectedBooster.booster, targetCard)) {
        let message = '';
        switch (selectedBooster.booster.type) {
          case 'health':
            message = `${targetCard.name} already has full health!`;
            break;
          case 'chakra':
            message = `${targetCard.name} already has full chakra!`;
            break;
          case 'jutsu_recovery':
            message = `${targetCard.name} has no cooldowns to reset!`;
            break;
          case 'jutsu_mastery':
            message = `${targetCard.name} already has Jutsu Mastery active!`;
            break;
          case 'damage_boost':
            message = `${targetCard.name} already has Damage Boost active!`;
            break;
          case 'splash_damage':
            message = `${targetCard.name} already has Splash Damage!`;
            break;
          case 'double_attack':
            message = `${targetCard.name} already has Double Attack!`;
            break;
        }
        alert(message);
        return;
      }
      
      applyBoosterToCharacter(cardIndex);
      return;
    }
    
    if (selectingJutsuTarget && selectedJutsu && selectedCharacter) {
      if (selectedJutsu.damage) {
        const enemyPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        if (playerIndex !== enemyPlayerIndex) {
          alert('Damage jutsus must target enemy characters!');
          return;
        }
      }
      else if (selectedJutsu.effect) {
        const isHealEffect = selectedJutsu.effect.type === 'heal';
        const isSelfOrAllyTarget = selectedJutsu.effect.target === 'self' || selectedJutsu.effect.target === 'ally' || selectedJutsu.effect.target === 'all_allies';
        const isOpponentTarget = selectedJutsu.effect.target === 'opponent' || selectedJutsu.effect.target === 'all_opponents';
        
        if (isHealEffect || isSelfOrAllyTarget) {
          if (playerIndex !== currentPlayerIndex) {
            alert('This jutsu can only be used on your own characters!');
            return;
          }
        }
        
        if (isOpponentTarget) {
          if (playerIndex === currentPlayerIndex) {
            alert('This jutsu can only be used on opponent characters!');
            return;
          }
        }
      }
      
      if (isSelectingSplashTargets) {
        const enemyPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        if (playerIndex !== enemyPlayerIndex) {
          alert('Splash damage can only target enemy characters!');
          return;
        }
        
        const alreadySelected = splashTargets.some(
          t => t.playerIndex === playerIndex && t.cardIndex === cardIndex
        );
        
        if (alreadySelected) {
          setSplashTargets(splashTargets.filter(
            t => !(t.playerIndex === playerIndex && t.cardIndex === cardIndex)
          ));
        } else if (splashTargets.length < 3) {
          setSplashTargets([...splashTargets, {playerIndex, cardIndex}]);
        }
        return;
      }
      
      useJutsuOnTarget(playerIndex, cardIndex);
      return;
    }
    
    if (currentPlayerIndex === playerIndex && !selectingTarget && !selectingJutsuTarget) {
      // Check if it's player's turn
      if (!isMyTurn()) {
        alert("It's not your turn!");
        return;
      }
      
      if (doubleAttackCharacter && (doubleAttackCharacter.playerIndex !== playerIndex || doubleAttackCharacter.cardIndex !== cardIndex)) {
        alert('Double Attack is active! You must use the second jutsu from the same character.');
        return;
      }
      
      const card = players[playerIndex].hand[cardIndex];
      
      if (card.currentHealth === 0) {
        alert(`${card.name} is defeated and cannot use jutsus!`);
        return;
      }
      
      if (card.stunRoundsLeft && card.stunRoundsLeft > 0) {
        alert(`${card.name} is stunned and cannot use jutsus for ${card.stunRoundsLeft} more round(s)!`);
        return;
      }
      
      setSelectedCharacter({ playerIndex, cardIndex });
      setShowJutsuSelector(true);
    }
  };

  const handleJutsuSelect = (jutsu: Jutsu) => {
    if (!selectedCharacter) return;
    
    const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    if (!card.jutsuCooldowns) card.jutsuCooldowns = {};
    if (card.jutsuCooldowns[jutsu.name] && card.jutsuCooldowns[jutsu.name] > 0) {
      alert(`${jutsu.name} is on cooldown for ${card.jutsuCooldowns[jutsu.name]} more round(s)!`);
      return;
    }
    
    if (card.currentChakra < jutsu.chakraCost) {
      alert(`Not enough chakra! Need ${jutsu.chakraCost}, have ${card.currentChakra}`);
      return;
    }
    
    setSelectedJutsu(jutsu);
    
    const needsTargetSelection = jutsu.damage || 
      (jutsu.effect && ['heal', 'poison', 'burn', 'bleed', 'stun', 'chakra_drain'].includes(jutsu.effect.type));
    
    if (needsTargetSelection) {
      if (!selectedCharacter) return;
      const caster = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
      if (caster.splashDamageActive && jutsu.damage) {
        setIsSelectingSplashTargets(true);
        setSplashTargets([]);
      }
      setSelectingJutsuTarget(true);
      setShowJutsuSelector(false);
    } else {
      useJutsuAutomatic();
    }
  };

  const useJutsuAutomatic = async () => {
    if (!selectedCharacter || !selectedJutsu) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    if (selectedJutsu.effect) {
      switch (selectedJutsu.effect.type) {
        case 'shield':
          caster.shieldRoundsLeft = selectedJutsu.effect.duration || 3;
          addToHistory(`${caster.name} used ${selectedJutsu.name}`);
          break;
        case 'buff':
          caster.buffRoundsLeft = selectedJutsu.effect.duration || 3;
          caster.buffPowerIncrease = selectedJutsu.effect.value || 10;
          addToHistory(`${caster.name} used ${selectedJutsu.name}`);
          break;
        case 'damage_suppress':
          caster.damageSuppressActive = true;
          caster.damageSuppressAmount = selectedJutsu.effect.value || 20;
          addToHistory(`${caster.name} used ${selectedJutsu.name}`);
          break;
      }
    }
    
    setPlayers(newPlayers);
    setSelectedCharacter(null);
    setSelectedJutsu(null);
    setShowJutsuSelector(false);
    
    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);
    
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && newJutsuCount === 1) {
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      alert('Double Attack is active! You can use another jutsu from the same character.');
      
      // Don't end turn, allow another jutsu
    } else {
      // Turn ends after using jutsu
      setDoubleAttackCharacter(null);
      setTimeout(() => endTurn(), 500);
    }
  };

  const executeSplashDamageJutsu = async () => {
    if (!selectedCharacter || !selectedJutsu || splashTargets.length === 0) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    caster.splashDamageActive = false;
    caster.boosters = caster.boosters?.filter(b => b.type !== 'splash_damage') || [];
    
    const shouldApplyDamageBoost = caster.damageBoostActive;
    const damageBoostMultiplier = shouldApplyDamageBoost ? 1.5 : 1;

    splashTargets.forEach(target => {
      const targetCard = newPlayers[target.playerIndex].hand[target.cardIndex];
      
      let damageBlocked = false;
      
      if (targetCard.passiveAbility && targetCard.passiveAbility.trigger === 'on_being_attacked') {
        if (targetCard.passiveAbility.effect.type === 'dodge') {
          const attackTypes = targetCard.passiveAbility.effect.attackTypes || [];
          if (attackTypes.includes(selectedJutsu.jutsuType)) {
            if (Math.random() < targetCard.passiveAbility.chance) {
              alert(`${targetCard.name} dodged the attack using ${targetCard.passiveAbility.passiveName}!`);
              damageBlocked = true;
            }
          }
        }
      }
      
      if (targetCard.dodgeNextAttack) {
        alert(`${targetCard.name} dodged the attack using Rinnegan!`);
        targetCard.dodgeNextAttack = false;
        damageBlocked = true;
      }
      
      if (!damageBlocked) {
        let finalDamage = selectedJutsu.damage || 0;
        
        if (caster.buffRoundsLeft && caster.buffRoundsLeft > 0 && caster.buffPowerIncrease) {
          finalDamage += caster.buffPowerIncrease;
        }
        
        if (shouldApplyDamageBoost) {
          finalDamage = Math.floor(finalDamage * damageBoostMultiplier);
        }
        
        if (targetCard.shieldRoundsLeft && targetCard.shieldRoundsLeft > 0) {
          finalDamage = Math.floor(finalDamage * 0.5);
        }
        
        if (targetCard.damageSuppressActive && targetCard.damageSuppressAmount) {
          finalDamage = Math.max(0, finalDamage - targetCard.damageSuppressAmount);
        }
        
        targetCard.currentHealth = Math.max(0, targetCard.currentHealth - finalDamage);
        
        if (targetCard.currentHealth === 0) {
          if (caster.passiveAbility && 
              caster.passiveAbility.trigger === 'after_using_jutsu' &&
              caster.passiveAbility.effect.type === 'heal_all_allies') {
            if (Math.random() < caster.passiveAbility.chance) {
              const healAmount = caster.passiveAbility.effect.value || 0;
              alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! All allies heal ${healAmount} HP!`);
              newPlayers[selectedCharacter.playerIndex].hand.forEach(ally => {
                const allyMaxHealth = ally.forms[ally.currentForm]?.health || 100;
                ally.currentHealth = Math.min(allyMaxHealth, ally.currentHealth + healAmount);
              });
            }
          }
        }
      }
    });
    
    if (shouldApplyDamageBoost) {
      caster.damageBoostActive = false;
      caster.boosters = caster.boosters?.filter(b => b.type !== 'damage_boost') || [];
    }

    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);
    
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && jutsusUsedThisTurn === 0) {
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      alert('Double Attack is active! You can use another jutsu from the same character.');
      
      setPlayers(newPlayers);
      setSelectedCharacter(null);
      setSelectedJutsu(null);
      setSelectingJutsuTarget(false);
      setIsSelectingSplashTargets(false);
      setSplashTargets([]);
    } else {
      setPlayers(newPlayers);
      setSelectedCharacter(null);
      setSelectedJutsu(null);
      setSelectingJutsuTarget(false);
      setIsSelectingSplashTargets(false);
      setSplashTargets([]);
      
      // Turn ends automatically after jutsu
      setTimeout(() => endTurn(), 500);
    }
  };

  const useJutsuOnTarget = async (targetPlayerIndex: 0 | 1, targetCardIndex: number) => {
    if (!selectedCharacter || !selectedJutsu) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    const target = newPlayers[targetPlayerIndex].hand[targetCardIndex];
    
    addToHistory(`${caster.name} used ${selectedJutsu.name} on ${target.name}`);
    
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    let damageBlocked = false;
    
    if (target.passiveAbility && target.passiveAbility.trigger === 'on_being_attacked') {
      if (target.passiveAbility.effect.type === 'dodge') {
        const attackTypes = target.passiveAbility.effect.attackTypes || [];
        if (attackTypes.includes(selectedJutsu.jutsuType)) {
          if (Math.random() < target.passiveAbility.chance) {
            alert(`${target.name} dodged the attack using ${target.passiveAbility.passiveName}!`);
            damageBlocked = true;
          }
        }
      }
    }
    
    if (target.dodgeNextAttack) {
      alert(`${target.name} dodged the attack using Rinnegan!`);
      target.dodgeNextAttack = false;
      damageBlocked = true;
    }
    
    let finalDamage = selectedJutsu.damage || 0;
    let targetsToHit: Array<{playerIndex: 0 | 1, cardIndex: number}> = [{playerIndex: targetPlayerIndex, cardIndex: targetCardIndex}];
    
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_jutsu' &&
        caster.passiveAbility.effect.type === 'hit_all_enemies') {
      if (Math.random() < caster.passiveAbility.chance) {
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Hitting all enemies!`);
        const enemyPlayerIndex = selectedCharacter.playerIndex === 0 ? 1 : 0;
        targetsToHit = newPlayers[enemyPlayerIndex].hand.map((_, idx) => ({
          playerIndex: enemyPlayerIndex,
          cardIndex: idx
        }));
      }
    }
    
    if (!damageBlocked && finalDamage > 0) {
      targetsToHit.forEach(targetInfo => {
        const currentTarget = newPlayers[targetInfo.playerIndex].hand[targetInfo.cardIndex];
        let damage = finalDamage;
        
        const typeMultiplier = calculateTypeAdvantage(
          selectedJutsu.jutsuType,
          currentTarget.forms[currentTarget.currentForm]?.attackType || 'taijutsu'
        );
        damage = Math.floor(damage * typeMultiplier);
        
        if (caster.damageBoostActive) {
          damage = Math.floor(damage * 1.2);
          caster.damageBoostActive = false;
          caster.boosters = caster.boosters?.filter(b => b.type !== 'damage_boost') || [];
        }
        
        if (caster.buffPowerIncrease) {
          damage += caster.buffPowerIncrease;
        }
        
        if (caster.passiveAbility && 
            caster.passiveAbility.trigger === 'after_using_creation' &&
            selectedJutsu.name === 'Creation of All Things') {
          if (Math.random() < caster.passiveAbility.chance) {
            damage += caster.passiveAbility.effect.value || 20;
            alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! +20 damage!`);
          }
        }
        
        if (currentTarget.shieldRoundsLeft && currentTarget.shieldRoundsLeft > 0) {
          damage = 0;
          alert(`${currentTarget.name}'s shield blocked the attack!`);
        } else {
          if (currentTarget.damageSuppressActive && currentTarget.damageSuppressAmount) {
            damage = Math.max(0, damage - currentTarget.damageSuppressAmount);
          }
          
          currentTarget.currentHealth = Math.max(0, currentTarget.currentHealth - damage);
          
          if (currentTarget.passiveAbility && 
              currentTarget.passiveAbility.trigger === 'on_being_attacked' &&
              currentTarget.passiveAbility.effect.type === 'counter_damage') {
            if (Math.random() < currentTarget.passiveAbility.chance) {
              const counterDamage = currentTarget.passiveAbility.effect.value || 20;
              caster.currentHealth = Math.max(0, caster.currentHealth - counterDamage);
              alert(`${currentTarget.name} used Talk No Jutsu! Dealt ${counterDamage} damage back!`);
            }
          }
        }
      });
    }
    
    if (selectedJutsu.effect) {
      switch (selectedJutsu.effect.type) {
        case 'heal':
          const targetMaxHealth = target.forms[target.currentForm]?.health || 100;
          if (target.currentHealth >= targetMaxHealth) {
            alert(`${target.name} already has full health! Jutsu wasted.`);
          } else {
            const healAmount = selectedJutsu.effect.value || 0;
            target.currentHealth = Math.min(
              target.currentHealth + healAmount,
              targetMaxHealth
            );
          }
          break;
        case 'buff':
          if (selectedJutsu.effect.target === 'self') {
            caster.buffRoundsLeft = selectedJutsu.effect.duration || 3;
            caster.buffPowerIncrease = selectedJutsu.effect.value || 10;
          }
          break;
        case 'poison':
        case 'burn':
        case 'bleed':
          if (!target.statusEffects) target.statusEffects = [];
          let duration = selectedJutsu.effect.duration || 3;
          
          if (selectedJutsu.effect.type === 'poison' &&
              caster.passiveAbility && 
              caster.passiveAbility.trigger === 'after_using_poison') {
            if (Math.random() < caster.passiveAbility.chance) {
              duration += caster.passiveAbility.effect.value || 1;
              alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Poison lasts longer!`);
            }
          }
          
          target.statusEffects.push({
            type: selectedJutsu.effect.type,
            value: selectedJutsu.effect.value,
            duration: duration
          });
          break;
        case 'stun':
          target.stunRoundsLeft = selectedJutsu.effect.duration || 2;
          break;
        case 'chakra_drain':
          const drainAmount = selectedJutsu.effect.value || 0;
          target.currentChakra = Math.max(0, target.currentChakra - drainAmount);
          break;
      }
    }
    
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_kirin' &&
        selectedJutsu.name === 'Kirin') {
      if (Math.random() < caster.passiveAbility.chance) {
        caster.dodgeNextAttack = true;
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Will dodge next attack!`);
      }
    }
    
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_jutsu' &&
        caster.passiveAbility.effect.type === 'heal_all_allies') {
      if (Math.random() < caster.passiveAbility.chance) {
        const healAmount = caster.passiveAbility.effect.value || 15;
        newPlayers[selectedCharacter.playerIndex].hand.forEach((ally) => {
          const allyMaxHealth = ally.forms[ally.currentForm]?.health || 100;
          ally.currentHealth = Math.min(
            ally.currentHealth + healAmount,
            allyMaxHealth
          );
        });
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! All allies healed for ${healAmount} HP!`);
      }
    }
    
    setPlayers(newPlayers);
    
    // Check for game end
    const player0Alive = newPlayers[0].hand.filter(card => card.currentHealth > 0).length;
    const player1Alive = newPlayers[1].hand.filter(card => card.currentHealth > 0).length;
    
    if (player0Alive === 0) {
      setTimeout(async () => {
        alert(`🎉 ${newPlayers[1].name} wins! ${newPlayers[0].name} has no characters left!`);
        if (sessionId) {
          const winnerUserId = isHost ? session?.guest_user_id : session?.host_user_id;
          const loserUserId = isHost ? session?.host_user_id : session?.guest_user_id;
          
          // Update winner stats
          if (winnerUserId) {
            const winnerProfile = await getUserProfile(winnerUserId);
            await updateUserProfile(winnerUserId, {
              cardgame_games_won: (winnerProfile?.cardgame_games_won || 0) + 1
            });
          }
          
          // Update loser stats
          if (loserUserId) {
            const loserProfile = await getUserProfile(loserUserId);
            await updateUserProfile(loserUserId, {
              cardgame_games_lost: (loserProfile?.cardgame_games_lost || 0) + 1
            });
          }
          
          await updateGameSession(sessionId, {
            status: 'finished',
            winner_user_id: winnerUserId || ''
          });
        }
        navigate('/online-game');
      }, 500);
      return;
    }
    if (player1Alive === 0) {
      setTimeout(async () => {
        alert(`🎉 ${newPlayers[0].name} wins! ${newPlayers[1].name} has no characters left!`);
        if (sessionId) {
          const winnerUserId = isHost ? session?.host_user_id : session?.guest_user_id;
          const loserUserId = isHost ? session?.guest_user_id : session?.host_user_id;
          
          // Update winner stats
          if (winnerUserId) {
            const winnerProfile = await getUserProfile(winnerUserId);
            await updateUserProfile(winnerUserId, {
              cardgame_games_won: (winnerProfile?.cardgame_games_won || 0) + 1
            });
          }
          
          // Update loser stats
          if (loserUserId) {
            const loserProfile = await getUserProfile(loserUserId);
            await updateUserProfile(loserUserId, {
              cardgame_games_lost: (loserProfile?.cardgame_games_lost || 0) + 1
            });
          }
          
          await updateGameSession(sessionId, {
            status: 'finished',
            winner_user_id: winnerUserId || ''
          });
        }
        navigate('/online-game');
      }, 500);
      return;
    }
    
    setSelectedCharacter(null);
    setSelectedJutsu(null);
    setSelectingJutsuTarget(false);
    
    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);
    
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && newJutsuCount === 1) {
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      alert('Double Attack is active! You can use another jutsu from the same character.');
      
      // Don't end turn yet, allow another jutsu
      setPlayers(newPlayers);
    } else {
      setDoubleAttackCharacter(null);
      setPlayers(newPlayers);
      
      // Turn ends automatically after jutsu
      setTimeout(() => endTurn(), 500);
    }
  };

  // Helper function to determine if it's current user's turn
  const isMyTurn = (): boolean => {
    if (!session || !user) return false;
    if (isHost && currentPlayerIndex === 0) return true;
    if (!isHost && currentPlayerIndex === 1) return true;
    return false;
  };

  // Helper function to add action to history (keep last 5)
  const addToHistory = (action: string) => {
    setGameHistory(prev => {
      const newHistory = [action, ...prev];
      return newHistory.slice(0, 5); // Keep only last 5 actions
    });
  };

  // Helper function to check if a card is a healer
  const isHealer = (card: CharacterCard): boolean => {
    const charJutsu = jutsuData[card.name];
    if (!charJutsu) return false;
    return charJutsu.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎴</div>
          <p className="text-white text-2xl font-bold">Loading Game...</p>
          <p className="text-slate-400 mt-2">Connecting to session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <Link
            to="/online-game"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
          >
            ← Back to Online Games
          </Link>
        </div>
      </div>
    );
  }

  // Pre-game start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Online Multiplayer Game
            </h1>
            <p className="text-xl text-slate-300">
              Session: {sessionId?.substring(0, 8)}...
            </p>
            <p className="text-lg text-yellow-400 mt-2">
              You are: {isHost ? '🌟 Player 1 (Host)' : '👤 Player 2 (Guest)'}
            </p>
          </div>
          
          {isHost ? (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-8 border border-slate-700/50">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-white mb-2">Ready to Start?</h2>
                <p className="text-slate-300">You are the host. Click the button below to start the game!</p>
              </div>
              <button
                onClick={startGame}
                className="w-full px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                ⚔️ Start Game
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl p-8 border border-slate-700/50">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">⏳</div>
                <h2 className="text-2xl font-bold text-white mb-2">Waiting for Host...</h2>
                <p className="text-slate-300">The host will start the game when ready.</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link
              to="/online-game"
              className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              ← Back to Lobby
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main game screen
  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[currentPlayerIndex === 0 ? 1 : 0];
  const myPlayerIndex = isHost ? 0 : 1;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="h-[calc(100vh-2rem)] flex gap-1 justify-center items-start">
        {/* Player 1 Section - Left Side */}
        <div className="flex flex-col gap-1 h-full">
          {/* Player 1 Profile Header */}
          <PlayerHeader 
            username={player1Profile?.display_name || session?.host_user_id || 'Player 1'}
            profilePicture={player1Profile?.profile_picture}
            level={player1Profile?.level}
            xp={player1Profile?.xp}
            wins={player1Profile?.cardgame_games_won}
            losses={player1Profile?.cardgame_games_lost}
            isLeftSide={true}
            playerIndex={0}
            onMouseEnter={() => setHoveredPlayer(0)}
            onMouseLeave={() => setHoveredPlayer(null)}
            isHovered={hoveredPlayer === 0}
          />
          
          <div className="flex gap-1 h-full">
            {/* Player 1 Cards */}
            <PlayerCardsSection 
              playerIndex={0}
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              selectingTarget={selectingTarget}
              selectingJutsuTarget={selectingJutsuTarget}
              selectedJutsu={selectedJutsu}
              splashTargets={splashTargets}
              isHealer={isHealer}
              handleCharacterClick={handleCharacterClick}
              isMyTurn={isMyTurn}
            />
            
            {/* Player 1 Booster Hand */}
            <BoosterHandSection 
              playerIndex={0}
              boosterHands={boosterHands}
              currentPlayerIndex={currentPlayerIndex}
              selectingTarget={selectingTarget}
              selectedBooster={selectedBooster}
              newlyDrawnCard={newlyDrawnCard}
              handleBoosterClick={handleBoosterClick}
              setSelectedBooster={setSelectedBooster}
              setSelectingTarget={setSelectingTarget}
              isMyTurn={isMyTurn}
            />
          </div>
        </div>

        {/* Middle Section - Game Info */}
        <div className="flex-1 flex flex-col gap-1 h-full">
          <div className="bg-slate-800 rounded-lg p-5 w-56 mx-auto h-fit">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Game Info</h3>
              
              {/* Turn Indicator */}
              <div className={`mb-4 p-3 rounded-lg ${isMyTurn() ? 'bg-green-600' : 'bg-orange-600'}`}>
                <p className="text-white font-bold text-lg">
                  {isMyTurn() ? '🎯 Your Turn!' : '⏳ Opponent\'s Turn'}
                </p>
                <p className="text-white text-sm">
                  {currentPlayer.name} {isHost && currentPlayerIndex === 0 ? '(You)' : !isHost && currentPlayerIndex === 1 ? '(You)' : ''}
                </p>
              </div>
              
              {selectingTarget && (
                <p className="text-yellow-400 text-sm mb-2 font-semibold">
                  ⚡ Click a character to apply {selectedBooster?.booster.name}
                </p>
              )}
              {selectingJutsuTarget && selectedJutsu && (
                <p className="text-yellow-400 text-sm mb-2 font-semibold">
                  🎯 Select target for {selectedJutsu.name}
                </p>
              )}
              
              <div className="flex gap-2 justify-center flex-col">
                <button
                  onClick={endTurn}
                  disabled={!isMyTurn()}
                  className={`px-4 py-2 ${isMyTurn() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 cursor-not-allowed'} text-white font-semibold rounded-lg transition`}
                >
                  Skip Turn
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                  Reset Game
                </button>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition text-center"
                >
                  📖 Rules
                </button>
              </div>
              
              {/* Divider */}
              <hr className="border-slate-600 my-4" />
              
              {/* Game History */}
              <div>
                <GameHistorySection history={gameHistory} />
              </div>
              
              <div>
                {isSelectingSplashTargets && (
                  <>
                    <hr className="border-slate-600 my-3" />
                    <div className="bg-purple-600 text-white px-4 py-3 rounded-lg shadow border-2 border-yellow-400">
                      <p className="text-sm font-bold mb-1">💥 Splash Damage Active!</p>
                      <p className="text-xs mb-2">Select up to 3 enemy targets ({splashTargets.length}/3 selected)</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={executeSplashDamageJutsu}
                          disabled={splashTargets.length === 0}
                          className={`w-full px-3 py-2 rounded-lg font-semibold transition ${
                            splashTargets.length === 0
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          Confirm ({splashTargets.length} targets)
                        </button>
                        <button
                          onClick={() => {
                            setIsSelectingSplashTargets(false);
                            setSplashTargets([]);
                            setSelectingJutsuTarget(false);
                            setSelectedJutsu(null);
                            setShowJutsuSelector(true);
                          }}
                          className="w-full px-3 py-2 bg-red-500 hover:bg-red-900 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
                
                {selectingJutsuTarget && !isSelectingSplashTargets && selectedJutsu && (
                  <>
                    <hr className="border-slate-600 my-3" />
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow border-2 border-cyan-400">
                      <p className="text-sm font-bold mb-1">🎯 {selectedJutsu.name}</p>
                      <p className="text-xs mb-2">Select a target for this jutsu</p>
                      <button
                        onClick={() => {
                          setSelectingJutsuTarget(false);
                          setSelectedJutsu(null);
                          setSelectedCharacter(null);
                          setShowJutsuSelector(false);
                        }}
                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-900 rounded-lg font-semibold transition"
                      >
                        Cancel Jutsu
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Section - Right Side */}
        <div className="flex flex-col gap-1 h-full">
          {/* Player 2 Profile Header */}
          <PlayerHeader 
            username={player2Profile?.display_name || session?.guest_user_id || 'Player 2'}
            profilePicture={player2Profile?.profile_picture}
            level={player2Profile?.level}
            xp={player2Profile?.xp}
            wins={player2Profile?.cardgame_games_won}
            losses={player2Profile?.cardgame_games_lost}
            isLeftSide={false}
            playerIndex={1}
            onMouseEnter={() => setHoveredPlayer(1)}
            onMouseLeave={() => setHoveredPlayer(null)}
            isHovered={hoveredPlayer === 1}
          />
          
          <div className="flex gap-1 h-full">
            {/* Player 2 Booster Hand */}
            <BoosterHandSection 
              playerIndex={1}
              boosterHands={boosterHands}
              currentPlayerIndex={currentPlayerIndex}
              selectingTarget={selectingTarget}
              selectedBooster={selectedBooster}
              newlyDrawnCard={newlyDrawnCard}
              handleBoosterClick={handleBoosterClick}
              setSelectedBooster={setSelectedBooster}
              setSelectingTarget={setSelectingTarget}
              isMyTurn={isMyTurn}
            />
            
            {/* Player 2 Cards */}
            <PlayerCardsSection 
              playerIndex={1}
              players={players}
              currentPlayerIndex={currentPlayerIndex}
              selectingTarget={selectingTarget}
              selectingJutsuTarget={selectingJutsuTarget}
              selectedJutsu={selectedJutsu}
              splashTargets={splashTargets}
              isHealer={isHealer}
              handleCharacterClick={handleCharacterClick}
              isMyTurn={isMyTurn}
            />
          </div>
        </div>
      </div>

      {/* Jutsu Selector Modal */}
      {showJutsuSelector && selectedCharacter && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowJutsuSelector(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-purple-500" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">
              {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name}
            </h3>
            
            {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowPassiveTab(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    !showPassiveTab
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Jutsus
                </button>
                <button
                  onClick={() => setShowPassiveTab(true)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    showPassiveTab
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Passive Ability
                </button>
              </div>
            )}
            
            {showPassiveTab && players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility ? (
              <div className="border-2 border-yellow-500 bg-yellow-900 bg-opacity-30 rounded-lg p-4">
                <h4 className="text-xl font-bold text-yellow-400 mb-2">
                  {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.passiveName}
                </h4>
                <p className="text-sm text-slate-200">
                  {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.description}
                </p>
                <p className="text-xs text-yellow-300 mt-2">
                  Activation Chance: {((players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.chance || 0) * 100).toFixed(0)}%
                </p>
              </div>
            ) : (
              jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name] && (
                <div className="space-y-3">
                  {jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name].jutsus.map((jutsu, idx) => {
                    const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
                    const onCooldown = card.jutsuCooldowns && card.jutsuCooldowns[jutsu.name] > 0;
                    const notEnoughChakra = card.currentChakra < jutsu.chakraCost;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => !onCooldown && !notEnoughChakra && handleJutsuSelect(jutsu)}
                        disabled={onCooldown || notEnoughChakra}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          onCooldown || notEnoughChakra
                            ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                            : 'border-blue-500 bg-blue-900 hover:bg-blue-800 cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white">{jutsu.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            jutsu.jutsuType === 'ninjutsu' ? 'bg-blue-600' :
                            jutsu.jutsuType === 'taijutsu' ? 'bg-red-600' : 'bg-purple-600'
                          } text-white`}>
                            {jutsu.jutsuType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-2">{jutsu.description}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="text-blue-400">Chakra: {jutsu.chakraCost}</span>
                          {jutsu.damage && <span className="text-red-400">Damage: {jutsu.damage}</span>}
                        </div>
                        {onCooldown && (
                          <p className="text-xs text-yellow-400 mt-1">Cooldown: {card.jutsuCooldowns![jutsu.name]} rounds</p>
                        )}
                        {notEnoughChakra && (
                          <p className="text-xs text-red-400 mt-1">Not enough chakra!</p>
                        )}
                      </button>
                    );
                  })}
                  
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Upgraded Jutsu</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                  </div>
                  
                  {(() => {
                    const jutsu = jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name].upgradedJutsu;
                    const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
                    const hasMastery = card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0;
                    const onCooldown = card.jutsuCooldowns && card.jutsuCooldowns[jutsu.name] > 0;
                    const notEnoughChakra = card.currentChakra < jutsu.chakraCost;
                    const isDisabled = !hasMastery || onCooldown || notEnoughChakra;
                    
                    return (
                      <div>
                        {hasMastery && (
                          <div className="text-xs text-yellow-400 font-semibold mb-2">
                            ⚡ Special Jutsu Unlocked ({card.jutsuMasteryRoundsLeft} rounds left)
                          </div>
                        )}
                        <button
                          onClick={() => !isDisabled && handleJutsuSelect(jutsu)}
                          disabled={isDisabled}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            isDisabled
                              ? 'border-gray-600 bg-gray-800/30 opacity-40 cursor-not-allowed'
                              : 'border-yellow-500 bg-yellow-900 hover:bg-yellow-800 cursor-pointer'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-white">{jutsu.name}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              jutsu.jutsuType === 'ninjutsu' ? 'bg-blue-600' :
                              jutsu.jutsuType === 'taijutsu' ? 'bg-red-600' : 'bg-purple-600'
                            } text-white`}>
                              {jutsu.jutsuType}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mb-2">{jutsu.description}</p>
                          <div className="flex gap-2 text-xs">
                            <span className="text-blue-400">Chakra: {jutsu.chakraCost}</span>
                            {jutsu.damage && <span className="text-red-400">Damage: {jutsu.damage}</span>}
                          </div>
                          {!hasMastery && (
                            <p className="text-xs text-red-400 mt-1">⚡ Requires Jutsu Mastery booster!</p>
                          )}
                          {hasMastery && onCooldown && (
                            <p className="text-xs text-yellow-400 mt-1">Cooldown: {card.jutsuCooldowns![jutsu.name]} rounds</p>
                          )}
                          {hasMastery && notEnoughChakra && (
                            <p className="text-xs text-red-400 mt-1">Not enough chakra!</p>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              )
            )}
            
            <button
              onClick={() => {
                setShowJutsuSelector(false);
                setShowPassiveTab(false);
                setSelectedCharacter(null);
                setSelectedJutsu(null);
                setSelectingJutsuTarget(false);
                setIsSelectingSplashTargets(false);
                setSplashTargets([]);
              }}
              className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal - Same as local game */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowRulesModal(false)}>
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-slate-700/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-br from-slate-800 to-slate-900 p-4 border-b border-slate-700/50 z-10">
              <div className="text-center">
                <div className="text-4xl mb-2">📜</div>
                <h1 className="text-3xl font-black mb-1 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Game Rules
                </h1>
                <p className="text-sm text-slate-300 font-medium">
                  Complete guide to playing Naruto Card Game Online
                </p>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-6 text-slate-300 text-sm space-y-4">
              <p>Same rules as local game apply. Key differences for online multiplayer:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Host = Player 1 (goes first if they win the number guess)</li>
                <li>Guest = Player 2</li>
                <li>Only the current player can perform actions</li>
                <li>State syncs automatically every 3 seconds</li>
                <li>Wait for your turn indicator before taking actions</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-red-500" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-3">Reset Game?</h2>
              <p className="text-slate-300 text-lg">Do you really want to reset the game? All progress will be lost.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetGame}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
