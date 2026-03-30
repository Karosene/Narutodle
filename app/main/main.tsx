import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { useEffect, useMemo, useRef, useState } from "react";
import { normalize } from "~/utils/normalize";
import { getCurrentUser, getUserProfile, updateUserProfile } from "~/utils/auth";

export function Welcome() {
  return (
    
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <nav className="rounded-3xl border border-gray-200 p-6 dark:border-gray-700 space-y-4">
            <p className="leading-6 text-gray-700 dark:text-gray-200 text-center">
              What&apos;s next?
            </p>
            <ul>
              {resources.map(({ href, text, icon }) => (
                <li key={href}>
                  <a
                    className="group flex items-center gap-3 self-stretch p-3 leading-normal text-blue-700 hover:underline dark:text-blue-500"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon}
                    {text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}

const resources = [
  {
    href: "https://reactrouter.com/docs",
    text: "React Router Docs",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M9.99981 10.0751V9.99992M17.4688 17.4688C15.889 19.0485 11.2645 16.9853 7.13958 12.8604C3.01467 8.73546 0.951405 4.11091 2.53116 2.53116C4.11091 0.951405 8.73546 3.01467 12.8604 7.13958C16.9853 11.2645 19.0485 15.889 17.4688 17.4688ZM2.53132 17.4688C0.951566 15.8891 3.01483 11.2645 7.13974 7.13963C11.2647 3.01471 15.8892 0.951453 17.469 2.53121C19.0487 4.11096 16.9854 8.73551 12.8605 12.8604C8.73562 16.9853 4.11107 19.0486 2.53132 17.4688Z"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "https://rmx.as/discord",
    text: "Join Discord",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="20"
        viewBox="0 0 24 20"
        fill="none"
        className="stroke-gray-600 group-hover:stroke-current dark:stroke-gray-300"
      >
        <path
          d="M15.0686 1.25995L14.5477 1.17423L14.2913 1.63578C14.1754 1.84439 14.0545 2.08275 13.9422 2.31963C12.6461 2.16488 11.3406 2.16505 10.0445 2.32014C9.92822 2.08178 9.80478 1.84975 9.67412 1.62413L9.41449 1.17584L8.90333 1.25995C7.33547 1.51794 5.80717 1.99419 4.37748 2.66939L4.19 2.75793L4.07461 2.93019C1.23864 7.16437 0.46302 11.3053 0.838165 15.3924L0.868838 15.7266L1.13844 15.9264C2.81818 17.1714 4.68053 18.1233 6.68582 18.719L7.18892 18.8684L7.50166 18.4469C7.96179 17.8268 8.36504 17.1824 8.709 16.4944L8.71099 16.4904C10.8645 17.0471 13.128 17.0485 15.2821 16.4947C15.6261 17.1826 16.0293 17.8269 16.4892 18.4469L16.805 18.8725L17.3116 18.717C19.3056 18.105 21.1876 17.1751 22.8559 15.9238L23.1224 15.724L23.1528 15.3923C23.5873 10.6524 22.3579 6.53306 19.8947 2.90714L19.7759 2.73227L19.5833 2.64518C18.1437 1.99439 16.6386 1.51826 15.0686 1.25995ZM16.6074 10.7755L16.6074 10.7756C16.5934 11.6409 16.0212 12.1444 15.4783 12.1444C14.9297 12.1444 14.3493 11.6173 14.3493 10.7877C14.3493 9.94885 14.9378 9.41192 15.4783 9.41192C16.0471 9.41192 16.6209 9.93851 16.6074 10.7755ZM8.49373 12.1444C7.94513 12.1444 7.36471 11.6173 7.36471 10.7877C7.36471 9.94885 7.95323 9.41192 8.49373 9.41192C9.06038 9.41192 9.63892 9.93712 9.6417 10.7815C9.62517 11.6239 9.05462 12.1444 8.49373 12.1444Z"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

// -- Site component (moved from app/routes/home.tsx)
type Character = {
  name: string;
  file: string;
  gender?: string;
  age?: string;
  height?: string;
  clan?: string;
  team?: string;
  affiliations?: string[];
  rank?: string;
  natureAffinity?: string[];
  firstAppearance?: string;
};

type LeaderboardEntry = {
  display_name: string;
  level?: number;
  xp?: number;
  narutodle_avg_guesses?: number;
  narutodle_games_played?: number;
};

const SUPA_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

export default function Site() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const suggRef = useRef<HTMLFormElement | null>(null);
  const [suggestions, setSuggestions] = useState<Character[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [characters, setCharacters] = useState<Character[] | null>(null);
  const [idx, setIdx] = useState<number | null>(null);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [guesses, setGuesses] = useState<
    { char: Character; matches: Record<string, boolean>; ageComparison?: string | null; arcComparison?: string | null; rankComparison?: string | null; heightComparison?: string | null }[]
  >([]);
  const [showAttributes, setShowAttributes] = useState(false);
  const [showHintCard, setShowHintCard] = useState(false);
  const mounted = useRef(false);
  const [statsSaved, setStatsSaved] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [levelBoard, setLevelBoard] = useState<LeaderboardEntry[]>([]);
  const [avgBoard, setAvgBoard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const headers = { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}` };
    fetch(`${SUPA_URL}/rest/v1/profiles?select=display_name,level,xp&order=level.desc,xp.desc&limit=5`, { headers })
      .then(r => r.json())
      .then(data => setLevelBoard(Array.isArray(data) ? data : []))
      .catch(() => {});
    fetch(`${SUPA_URL}/rest/v1/profiles?select=display_name,narutodle_avg_guesses,narutodle_games_played&narutodle_games_played=gt.0&order=narutodle_avg_guesses.asc&limit=5`, { headers })
      .then(r => r.json())
      .then(data => setAvgBoard(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const TRIES_REQUIRED = 10;
  const CLUE_COUNT = 7;
  const cluesUnlocked = guesses.length >= TRIES_REQUIRED ? CLUE_COUNT : 0;
  const AFFILIATION_UNLOCK_TRIES = 7;

  useEffect(() => {
    const headers = { 'apikey': SUPA_KEY, 'Authorization': `Bearer ${SUPA_KEY}`, 'Range': '0-999' };
    fetch(`${SUPA_URL}/rest/v1/characters?select=name,file,gender,age,height,clan,team,rank,first_appearance,nature_affinity,affiliations`, { headers })
      .then((r) => r.json())
      .then((data: any[]) => {
        const mapped: Character[] = data.map((c) => ({
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
        const map = new Map<string, Character>();
        for (const c of mapped) {
          const key = normalize(c.name);
          const existing = map.get(key);
          if (!existing) { map.set(key, c); continue; }
          const existingHasFile = !!existing.file && existing.file.trim() !== "";
          const cHasFile = !!c.file && c.file.trim() !== "";
          if (!existingHasFile && cHasFile) { map.set(key, c); continue; }
        }
        const uniq = Array.from(map.values());
        setCharacters(uniq);
        if (uniq.length) setIdx(Math.floor(Math.random() * uniq.length));
      })
      .catch((e) => {
        console.error(e);
        setFeedback("Failed to load characters from database");
      });
  }, []);

  useEffect(() => {
    if (!characters) return;
    const q = guess.trim();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      return;
    }

    const nq = normalize(q);
    const guessedSet = new Set((guesses || []).map((g) => normalize(g.char.name)));

    const firstNameMatches: Character[] = [];
    const lastNameMatches: Character[] = [];

    characters.forEach((c) => {
      if (guessedSet.has(normalize(c.name))) return;
      const nameParts = c.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      if (normalize(firstName).startsWith(nq)) {
        firstNameMatches.push(c);
      } else if (lastName && normalize(lastName).startsWith(nq)) {
        lastNameMatches.push(c);
      }
    });

    const matches = [...firstNameMatches, ...lastNameMatches]
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .slice(0, 12);

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setActiveSuggestion(matches.length > 0 ? 0 : -1);
  }, [guess, characters, guesses]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!suggRef.current) return;
      if (suggRef.current.contains(e.target as Node)) return;
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => {
    if (revealed) {
      setShowHintCard(false);
    }
  }, [revealed]);

  useEffect(() => {
    if (mounted.current) {
      setGuess("");
      setRevealed(false);
      setShowHintCard(false);
      setFeedback(null);
      setStatsSaved(false); // Reset stats saved flag for new game
    }
    mounted.current = true;
  }, [idx]);

  // Update stats when game is completed
  useEffect(() => {
    const updateStats = async () => {
      if (statsSaved) {
        console.log('[Narutodle] Stats already saved, skipping');
        return;
      }

      const isWon = revealed;
      const isLost = showAttributes && !revealed && guesses.length > 0;
      const isOutOfGuesses = guesses.length >= 25 && !revealed;

      console.log('[Narutodle] Game state:', { isWon, isLost, isOutOfGuesses, guessCount: guesses.length, revealed, showAttributes });

      if (!isWon && !isLost && !isOutOfGuesses) {
        console.log('[Narutodle] Game not completed yet');
        return;
      }

      const user = getCurrentUser();
      if (!user) {
        console.log('[Narutodle] No user logged in, cannot save stats');
        return;
      }

      console.log('[Narutodle] Saving stats for user:', user.id);

      try {
        const profile = await getUserProfile(user.id);
        if (!profile) {
          console.error('[Narutodle] Profile not found');
          return;
        }

        const currentGames = profile.narutodle_games_played ?? 0;
        const currentTotalGuesses = profile.narutodle_total_guesses ?? 0;
        const currentGuesses = guesses.length;
        const currentXP = profile.xp ?? 0;

        console.log('[Narutodle] Current stats:', { currentGames, currentTotalGuesses, currentGuesses, currentXP });

        const newTotalGuesses = currentTotalGuesses + (isOutOfGuesses ? 25 : currentGuesses);
        const newGamesPlayed = currentGames + 1;
        const newAverage = newTotalGuesses / newGamesPlayed;

        let xpEarned = 0;
        if (isWon) {
          xpEarned = 5;
          if (currentGuesses < 5) {
            xpEarned += 5;
          }
        }
        const newXP = currentXP + xpEarned;

        const levelFromXp = (value: number) => {
          if (value <= 0) return 1;
          const scaled = (2 * value) / 5;
          return Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * scaled)) / 2));
        };
        const newLevel = levelFromXp(newXP);

        console.log('[Narutodle] New stats:', { newGamesPlayed, newAverage, xpEarned, newXP, newLevel });

        const result = await updateUserProfile(user.id, {
          narutodle_games_played: newGamesPlayed,
          narutodle_total_guesses: newTotalGuesses,
          narutodle_avg_guesses: parseFloat(newAverage.toFixed(2)),
          xp: newXP,
          level: newLevel
        });

        if (result.success) {
          console.log('[Narutodle] Stats saved successfully!');
          setStatsSaved(true);
        } else {
          console.error('[Narutodle] Failed to save stats:', result.error);
        }
      } catch (error) {
        console.error('[Narutodle] Error updating stats:', error);
      }
    };

    if (guesses.length >= 25 || revealed || (showAttributes && guesses.length > 0)) {
      updateStats();
    }
  }, [revealed, showAttributes, guesses]); // Updated logic to ensure the game ends at 25 guesses or when revealed

  const current = useMemo(() => {
    if (!characters || idx === null) return null;
    return characters[idx];
  }, [characters, idx]);

  // Helpers for comparisons (shared between checkGuess and suggestion submit)
  const arrayOverlap = (a?: string[], b?: string[]) => {
    if (!a || !b) return false;
    const A = a.map(normalize);
    const B = b.map(normalize);
    return A.some((x) => B.includes(x));
  };  

  const parseAge = (ageStr?: string) => {
    if (!ageStr) return null;
    const num = parseInt(ageStr, 10);
    return isNaN(num) ? null : num;
  };

  const ARC_ORDER = [
    'Land of Waves',
    'Chūnin Exams',
    'Konoha Crush',
    'Search for Tsunade',
    'Sasuke Recovery Mission',
    'Kazekage Rescue Mission',
    'Tenchi Bridge Reconnaissance Mission',
    'Akatsuki Suppression Mission',
    'Itachi Pursuit Mission',
    'Tale of Jiraiya the Gallant',
    'Fated Battle Between Brothers',
    "Pain's Assault",
    'Five Kage Summit',
    'Fourth Shinobi World War',
  ];

  const RANK_ORDER = [
    'None',
    'Genin',
    'Chūnin',
    'Jōnin',
    'Tokubetsu Jōnin',
    'Anbu',
    'Kage',
  ];

  const getRankIndex = (rank?: string | null) => {
    if (!rank) return null;
    const r = rank.trim();
    const idx = RANK_ORDER.findIndex((x) => x.toLowerCase() === r.toLowerCase());
    return idx === -1 ? null : idx;
  };

  const getArcIndex = (arc?: string | null) => {
    if (!arc) return null;
    const a = arc.trim();
    const idx = ARC_ORDER.findIndex((x) => x.toLowerCase() === a.toLowerCase());
    return idx === -1 ? null : idx;
  };

  function computeComparison(guessed: Character, currentChar: Character | null) {
    const guessedAge = parseAge(guessed.age);
    const currentAge = parseAge(currentChar?.age);
    const ageComparison =
      guessedAge !== null && currentAge !== null
        ? guessedAge < currentAge
          ? 'higher'
          : guessedAge > currentAge
          ? 'lower'
          : 'equal'
        : null;

    const guessedArcIdx = getArcIndex(guessed.firstAppearance as string | undefined | null);
    const currentArcIdx = getArcIndex(currentChar?.firstAppearance as string | undefined | null);
    const arcComparison =
      guessedArcIdx !== null && currentArcIdx !== null
        ? guessedArcIdx < currentArcIdx
          ? 'later'
          : guessedArcIdx > currentArcIdx
          ? 'earlier'
          : 'equal'
        : null;

    const guessedRankIdx = getRankIndex(guessed.rank as string | undefined | null);
    const currentRankIdx = getRankIndex(currentChar?.rank as string | undefined | null);
    const rankComparison =
      guessedRankIdx !== null && currentRankIdx !== null
        ? guessedRankIdx < currentRankIdx
          ? 'higher'
          : guessedRankIdx > currentRankIdx
          ? 'lower'
          : 'equal'
        : null;

    const matches: Record<string, boolean> = {
      name: normalize(guessed.name) === normalize(currentChar?.name ?? ''),
      gender:
        !!guessed.gender && !!currentChar?.gender
          ? normalize(guessed.gender) === normalize(currentChar!.gender!)
          : false,
      age:
        !!guessed.age && !!currentChar?.age
          ? normalize(guessed.age) === normalize(currentChar!.age!)
          : false,
      height:
        !!guessed.height && !!currentChar?.height
          ? normalize(guessed.height) === normalize(currentChar!.height!)
          : false,
      clan:
        !!guessed.clan && !!currentChar?.clan
          ? normalize(guessed.clan) === normalize(currentChar!.clan!)
          : false,
      team:
        !!guessed.team && !!currentChar?.team
          ? normalize(guessed.team) === normalize(currentChar!.team!)
          : false,
      affiliations: arrayOverlap(guessed.affiliations, currentChar?.affiliations),
      rank:
        !!guessed.rank && !!currentChar?.rank
          ? normalize(guessed.rank) === normalize(currentChar!.rank!)
          : false,
      nature: arrayOverlap(guessed.natureAffinity, currentChar?.natureAffinity),
      firstAppearance:
        !!guessed.firstAppearance && !!currentChar?.firstAppearance
          ? normalize(guessed.firstAppearance) === normalize(currentChar!.firstAppearance!)
          : false,
    };

    const guessedHeightNum = guessed.height ? parseFloat(guessed.height.match(/[\d.]+/)?.[0] ?? '') : null;
    const currentHeightNum = currentChar?.height ? parseFloat(currentChar.height.match(/[\d.]+/)?.[0] ?? '') : null;
    const heightComparison =
      guessedHeightNum !== null && currentHeightNum !== null && !isNaN(guessedHeightNum) && !isNaN(currentHeightNum)
        ? guessedHeightNum < currentHeightNum
          ? 'taller'
          : guessedHeightNum > currentHeightNum
          ? 'shorter'
          : 'equal'
        : null;

    return { matches, ageComparison, arcComparison, rankComparison, heightComparison };
  }

  function checkGuess(e?: React.FormEvent) {
    e?.preventDefault();
    if (!current || !characters || guesses.length >= 25) return;
    const n = normalize(guess || "");
    const guessed = characters.find((c) =>
      normalize(c.name) === n
    );

    if (!guessed) {
      setFeedback("Character not found in database.");
      return;
    }

    if (guesses.some((g) => g.char.name === guessed.name)) {
      setFeedback("You already guessed this character!");
      setGuess("");
      setShowSuggestions(false);
      return;
    }

    const { matches, ageComparison, arcComparison, rankComparison, heightComparison } = computeComparison(guessed, current);
    const tries = guesses.length + 1;
    setGuesses((s) => [{ char: guessed, matches, ageComparison, arcComparison, rankComparison, heightComparison }, ...s].slice(0, 25));
    setGuess("");
    setShowSuggestions(false);
    setShowHintCard(false);

    if (matches.name) {
      setRevealed(true);
    }
  }

  function giveUp() {
    if (!current) return;
    setShowAttributes(true);
    setFeedback(`Revealed: ${current.name}`);
  }

  function pickNext() {
    if (!characters || characters.length === 0) return;
    if (characters.length === 1) return;
    let next = Math.floor(Math.random() * characters.length);
    if (next === idx) next = (next + 1) % characters.length;
    setGuesses([]);
    setShowAttributes(false);
    setIdx(next);
  }


  return (
    <main className="flex items-start justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-8 overflow-x-hidden overflow-y-auto md:overflow-visible bg-linear-to-br from-slate-900 via-blue-900 to-slate">
      {/* How to Play button */}
      <button
        type="button"
        onClick={() => setShowHowToPlay(true)}
        className="fixed right-4 bottom-4 z-50 w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 border-2 border-yellow-300/50 text-black font-bold text-lg transition hover:scale-110 flex items-center justify-center"
        title="How to play"
      >
        ?
      </button>

      {/* How to Play modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowHowToPlay(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl w-full max-w-md p-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-3 right-4 text-slate-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
            <h2 className="text-2xl font-extrabold mb-4 text-center">How to Play</h2>
            <ol className="space-y-3 text-sm text-slate-200 list-decimal list-inside">
              <li>Type a Naruto character's name in the search box and select them from the dropdown.</li>
              <li>After each guess, every attribute is colour-coded:
                <ul className="mt-1 ml-4 space-y-1 list-none">
                  <li><span className="inline-block w-3 h-3 rounded-sm bg-emerald-500 mr-2 align-middle" />Green — exact match ✓</li>
                  <li><span className="inline-block w-3 h-3 rounded-sm bg-gray-500 mr-2 align-middle" />Grey — no match ✗</li>
                </ul>
              </li>
              <li>Numbers (Age, Height, Rank, First Arc) show an <strong>↑</strong> or <strong>↓</strong> arrow when the correct answer is higher or lower.</li>
              <li>Keep guessing until you find the character — you have up to <strong>25 guesses</strong>.</li>
              <li>After <strong>10 guesses</strong> a blurred image hint appears.</li>
              <li>Stuck? Hit <strong>Give Up</strong> to reveal the answer.</li>
            </ol>
            <p className="mt-4 text-xs text-slate-400 text-center">Good luck, ninja!</p>
          </div>
        </div>
      )}

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="w-full max-w-6xl relative z-10 mt-10 space-y-6">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 text-center">Narutodle</h1>
        <p className="text-sm text-slate-300 mb-10 text-center">Character guessing from Naruto and Naruto Shippuden</p>

        <div className="w-1/2 mx-auto mb-6 flex justify-center">
          <div className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg border border-slate-700/50">
            <span className="text-lg text-white font-semibold">
              Guesses: {guesses.length}
            </span>
          </div>
        </div>

        <div className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-700/50 w-full md:w-1/2 mx-auto relative z-20">
          {guesses.length > 0 && !revealed && !showAttributes ? (
            <button
              type="button"
              onClick={() => setShowHintCard((v) => !v)}
              disabled={revealed}
              className="w-full mb-4 md:hidden px-4 py-3 rounded-lg bg-linear-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md hover:shadow-lg hover:from-blue-400 hover:to-blue-500 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {showHintCard ? 'Hide' : 'Show'} Progress Hint
            </button>
          ) : null}
          <form onSubmit={checkGuess} className="flex flex-col md:flex-row gap-3" ref={suggRef}>
            <div className="flex gap-3 md:order-2">
              <button type="submit" disabled={guesses.length >= 25 && !revealed} className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg bg-linear-to-r from-yellow-400 to-yellow-500 text-black font-bold shadow-md hover:shadow-lg hover:from-yellow-300 hover:to-yellow-400 transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">Guess</button>
              {guesses.length > 0 && !revealed && !showAttributes && guesses.length < 25 ? (
                <button type="button" onClick={giveUp} className="flex-1 md:flex-none px-4 md:px-6 py-3 rounded-lg bg-linear-to-r from-red-500 to-red-600 text-white font-bold shadow-md hover:shadow-lg hover:from-red-400 hover:to-red-500 transition transform hover:scale-105 active:scale-95">Give Up</button>
              ) : null}
            </div>
            
            <div className="relative md:flex-1 md:order-1">
              <input
                ref={inputRef}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => {
                  if (!showSuggestions) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setActiveSuggestion((i) => Math.min(i + 1, suggestions.length - 1));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setActiveSuggestion((i) => Math.max(i - 1, 0));
                  } else if (e.key === 'Enter') {
                      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
                        e.preventDefault();
                        const s = suggestions[activeSuggestion];
                        setGuess(s.name);
                        setShowSuggestions(false);
                        setActiveSuggestion(-1);
                        // submit the selected suggestion as a guess immediately
                        if (current) {
                          const { matches, ageComparison, arcComparison, rankComparison, heightComparison } = computeComparison(s, current);
                          const tries = guesses.length + 1;
                          setGuesses((st) => [{ char: s, matches, ageComparison, arcComparison, rankComparison, heightComparison }, ...st].slice(0, 25));
                          if (matches.name) {
                            setRevealed(true);
                          }
                        }
                      }
                  } else if (e.key === 'Escape') {
                    setShowSuggestions(false);
                    setActiveSuggestion(-1);
                  }
                }}
                role="combobox"
                aria-activedescendant={activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined}
                className="w-full px-4 py-3 rounded-lg border-2 border-transparent bg-white/80 dark:bg-gray-800/80 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Who is this?"
                aria-autocomplete="list"
                aria-expanded={showSuggestions}
                aria-controls="suggestions-list"
                disabled={revealed}
              />

              {showSuggestions && suggestions.length > 0 ? (
                <div id="suggestions-list" role="listbox" className="absolute left-0 right-0 top-full mt-2 z-100 bg-white/95 dark:bg-gray-800/95 rounded-xl shadow-xl max-h-96 overflow-auto border border-white/20 dark:border-gray-700/50">
                  {suggestions.map((s, i) => (
                    <div
                      id={`suggestion-${i}`}
                      key={s.name + i}
                      role="option"
                      aria-selected={i === activeSuggestion}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        setGuess(s.name);
                        setShowSuggestions(false);
                        setActiveSuggestion(-1);
                        setTimeout(() => inputRef.current?.focus(), 0);
                      }}
                      onMouseEnter={() => setActiveSuggestion(i)}
                      className={`px-4 py-3 cursor-pointer transition ${i === activeSuggestion ? 'bg-blue-500/20 dark:bg-blue-500/30 border-l-4 border-blue-500' : 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50'}`}
                    >
                      <div className="flex items-center gap-4 h-20">
                        {s.file ? (
                          <div className="w-20 h-20 flex items-center justify-center shrink-0 rounded-lg bg-white/50 dark:bg-gray-700/50">
                            <img src={s.file} alt={`${s.name} photo`} style={{ height: '95%', width: '95%' }} className="rounded-md object-cover" />
                          </div>
                        ) : null}
                        <div>
                          <div className="font-semibold text-base text-gray-900 dark:text-white">{s.name}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </form>

          {showHintCard && current && guesses.length > 0 && !revealed && !showAttributes ? (
            (() => {
              const revealedAttrs = new Set<string>();
              guesses.forEach(({ matches }) => {
                Object.entries(matches).forEach(([key, isMatch]) => {
                  if (isMatch) revealedAttrs.add(key);
                });
              });

              return (
                <div className="mt-3 p-3 rounded-xl bg-linear-to-br from-indigo-900/30 via-indigo-800/20 to-indigo-900/30 border border-indigo-500/30 shadow-lg md:hidden">
                  <h3 className="text-sm font-bold text-white mb-2 text-center">Progress Hint</h3>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Gender</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('gender') ? current.gender : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Age</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('age') ? current.age : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Height</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('height') ? current.height : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Clan</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('clan') ? current.clan : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Team</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('team') ? current.team : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2">
                      <div className="text-xs text-gray-400 mb-1">Rank</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('rank') ? current.rank : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2 col-span-2">
                      <div className="text-xs text-gray-400 mb-1">Affiliations</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('affiliations') ? (current.affiliations?.join(', ') || '—') : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2 col-span-2">
                      <div className="text-xs text-gray-400 mb-1">Nature Affinity</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('nature') ? (current.natureAffinity?.join(', ') || '—') : '?'}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-gray-700/20 rounded-lg p-2 col-span-2">
                      <div className="text-xs text-gray-400 mb-1">First Appearance</div>
                      <div className="font-semibold text-white">{revealedAttrs.has('firstAppearance') ? current.firstAppearance : '?'}</div>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}


          {current && (revealed || showAttributes) ? (
            <div className="mt-2 p-6 rounded-xl bg-linear-to-br from-white/10 via-white/5 to-white/3 dark:from-white/8 dark:via-white/4 dark:to-white/2 border border-white/10 dark:border-white/5 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <div className="w-72 h-72 flex items-center justify-center shrink-0 rounded-lg bg-white/10 dark:bg-gray-700/20">
                  {current.file ? (
                    <img src={current.file} alt={current.name} style={{ width: '95%', height: '95%' }} className="rounded-md object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-md bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 font-bold text-4xl">{(current.name || '').split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{current.name}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <button type="button" onClick={pickNext} className="px-5 py-2 rounded-lg bg-linear-to-r from-green-500 to-green-600 text-white font-bold shadow-md hover:shadow-lg hover:from-green-400 hover:to-green-500 transition">New Game</button>
              </div>
            </div>
          ) : current && guesses.length >= 25 && !revealed ? (
            <div className="mt-2 p-6 rounded-xl bg-linear-to-br from-red-900/20 via-red-800/10 to-red-900/20 dark:from-red-900/30 dark:via-red-800/20 dark:to-red-900/30 border border-red-500/30 dark:border-red-500/20 shadow-lg">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-2xl font-bold text-red-500 mb-2">Game Over!</h3>
                <p className="text-gray-300 mb-4">You've used all 25 guesses</p>
                <div className="w-72 h-72 flex items-center justify-center shrink-0 rounded-lg bg-white/10 dark:bg-gray-700/20">
                  {current.file ? (
                    <img src={current.file} alt={current.name} style={{ width: '95%', height: '95%' }} className="rounded-md object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center rounded-md bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-100 font-bold text-4xl">{(current.name || '').split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{current.name}</div>
                </div>
              </div>
              <div className="mt-4 flex justify-center">
                <button type="button" onClick={pickNext} className="px-5 py-2 rounded-lg bg-linear-to-r from-green-500 to-green-600 text-white font-bold shadow-md hover:shadow-lg hover:from-green-400 hover:to-green-500 transition">New Game</button>
              </div>
            </div>
          ) : current && guesses.length >= 10 ? (
            (() => {
              const blurAmount = (20 - guesses.length) * 3 + 15;
              return (
                <div className="mt-2 p-6 rounded-xl bg-linear-to-br from-white/10 via-white/5 to-white/3 dark:from-white/8 dark:via-white/4 dark:to-white/2 border border-white/10 dark:border-white/5 shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-4 text-center">Character Hint</h3>
                  <div className="flex justify-center">
                    <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-700">
                      {current.file ? (
                        <img 
                          src={current.file} 
                          alt={current.name} 
                          style={{ filter: `blur(${blurAmount}px)`, width: '100%', height: '100%' }} 
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-600 text-white font-bold text-xl">{(current.name || '').split(' ').map(s => s[0]).slice(0,2).join('')}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : null}

          
        </div>

        {/* Guesses box + leaderboards */}
        <div className="relative mb-8">

          {/* Left leaderboard – Top Levels */}
          <aside className="hidden lg:block absolute -left-[216px] top-0 w-[200px]">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
              <h2 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-3 text-center">🏆 Top Levels</h2>
              {levelBoard.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
              ) : (
                <ol className="space-y-2">
                  {levelBoard.map((entry, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        i === 0 ? 'bg-yellow-400 text-black' :
                        i === 1 ? 'bg-slate-300 text-black' :
                        i === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-700 text-slate-300'
                      }`}>{i + 1}</span>
                      <span className="flex-1 truncate text-white">{entry.display_name}</span>
                      <span className="text-yellow-400 font-bold shrink-0">Lv {entry.level ?? 1}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>

          <div className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-700/50 w-full overflow-x-auto">
            {/* Desktop view - horizontal grid */}
            <div className="hidden md:block">
              <div className="grid grid-cols-11 gap-2 items-center mb-3 px-4">
                {[
                  'Photo',
                  'Name',
                  'Gender',
                  'Age',
                  'Height',
                  'Clan',
                  'Team',
                  'Affiliation',
                  'Rank',
                  'Nature',
                  'First Arc',
                ].map((h) => (
                  <div
                    key={h}
                    className="px-2 py-1 bg-white/90 dark:bg-gray-800 rounded-full text-xs shadow-md border border-gray-200 dark:border-gray-700 text-center truncate"
                  >
                    {h}
                  </div>
                ))}
              </div>

              {guesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                  <p className="text-sm font-medium">No guesses yet — who could it be?</p>
                  <p className="text-xs opacity-60">Type any character to begin</p>
                </div>
              ) : (
              <div className="guesses-scroll space-y-3 max-h-[484px] overflow-y-auto pr-2">
                {guesses.map(({ char, matches, ageComparison, arcComparison, rankComparison, heightComparison }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-11 gap-2 items-center text-xs bg-white/5 p-4 min-h-20 rounded-lg shadow-inner"
                  >
                    <div className={`px-2 rounded-md text-center ${matches.name ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="h-20 flex items-center justify-center">
                        {char.file ? (
                          <img src={char.file} alt={`${char.name} photo`} style={{ height: '85%' }} className="rounded-md object-cover" />
                        ) : (
                          <div className="w-16 h-16 rounded-md bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 font-semibold wrap-break-word ${matches.name ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.name}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.gender ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.gender ?? '—'}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 ${matches.age ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.age ?? '—'}</span>
                        {ageComparison === 'higher' && <span className="text-lg">↑</span>}
                        {ageComparison === 'lower' && <span className="text-lg">↓</span>}
                      </div>
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 truncate ${matches.height ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.height ?? '—'}</span>
                        {heightComparison === 'taller' && <span className="text-lg">↑</span>}
                        {heightComparison === 'shorter' && <span className="text-lg">↓</span>}
                      </div>
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.clan ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.clan ?? '—'}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.team ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.team ?? '—'}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.affiliations ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.affiliations?.join(', ') ?? '—'}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 ${matches.rank ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.rank ?? '—'}</span>
                        {rankComparison === 'higher' && <span className="text-base">↑</span>}
                        {rankComparison === 'lower' && <span className="text-base">↓</span>}
                      </div>
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.nature ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.natureAffinity?.join(', ') ?? '—'}
                    </div>

                    <div className={`px-2 rounded-md text-center flex items-center justify-center h-20 wrap-break-word ${matches.firstAppearance ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.firstAppearance ?? '—'}</span>
                        {(typeof arcComparison !== 'undefined' && arcComparison !== null) ? (
                          arcComparison === 'later' ? <span className="text-base">↑</span>
                          : arcComparison === 'earlier' ? <span className="text-base">↓</span>
                          : null
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Mobile view - vertical columns */}
            <div className="md:hidden">
              {guesses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
                  <span className="text-3xl">🥷</span>
                  <p className="text-sm font-medium">No guesses yet — who could it be?</p>
                  <p className="text-xs opacity-60">Type a character name above to start guessing</p>
                </div>
              ) : (
              <div className="flex gap-4">
                {guesses.map(({ char, matches, ageComparison, arcComparison, rankComparison, heightComparison }, i) => (
                  <div key={i} className="shrink-0 w-48 bg-white/5 p-3 rounded-lg shadow-inner">
                    <div className="space-y-2 text-xs">
                      <div className={`p-2 rounded-md ${matches.name ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Photo</div>
                        <div className="flex justify-center">
                          {char.file ? (
                            <img src={char.file} alt={`${char.name} photo`} className="w-20 h-20 rounded-md object-cover" />
                          ) : (
                            <div className="w-20 h-20 rounded-md bg-gray-200 dark:bg-gray-700" />
                          )}
                        </div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.name ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Name</div>
                        <div className="text-center font-semibold wrap-break-word">{char.name}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.gender ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Gender</div>
                        <div className="text-center">{char.gender ?? '—'}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.age ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Age</div>
                        <div className="text-center flex items-center justify-center gap-1">
                          <span>{char.age ?? '—'}</span>
                          {ageComparison === 'higher' && <span className="text-base">↑</span>}
                          {ageComparison === 'lower' && <span className="text-base">↓</span>}
                        </div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.height ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Height</div>
                        <div className="text-center flex items-center justify-center gap-1">
                          <span>{char.height ?? '—'}</span>
                          {heightComparison === 'taller' && <span className="text-base">↑</span>}
                          {heightComparison === 'shorter' && <span className="text-base">↓</span>}
                        </div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.clan ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Clan</div>
                        <div className="text-center wrap-break-word">{char.clan ?? '—'}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.team ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Team</div>
                        <div className="text-center wrap-break-word">{char.team ?? '—'}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.affiliations ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Affiliation</div>
                        <div className="text-center wrap-break-word">{char.affiliations?.join(', ') ?? '—'}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.rank ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Rank</div>
                        <div className="text-center flex items-center justify-center gap-1">
                          <span>{char.rank ?? '—'}</span>
                          {rankComparison === 'higher' && <span className="text-base">↑</span>}
                          {rankComparison === 'lower' && <span className="text-base">↓</span>}
                        </div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.nature ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">Nature</div>
                        <div className="text-center wrap-break-word">{char.natureAffinity?.join(', ') ?? '—'}</div>
                      </div>

                      <div className={`p-2 rounded-md ${matches.firstAppearance ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                        <div className="text-center font-bold mb-1 text-[10px] opacity-70">First Arc</div>
                        <div className="text-center wrap-break-word flex items-center justify-center gap-1">
                          <span>{char.firstAppearance ?? '—'}</span>
                          {(typeof arcComparison !== 'undefined' && arcComparison !== null) ? (
                            arcComparison === 'later' ? <span className="text-base">↑</span>
                            : arcComparison === 'earlier' ? <span className="text-base">↓</span>
                            : null
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Right leaderboard – Best Avg Guesses */}
          <aside className="hidden lg:block absolute -right-[216px] top-0 w-[200px]">
            <div className="bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
              <h2 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider mb-3 text-center">🎯 Best Avg</h2>
              {avgBoard.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
              ) : (
                <ol className="space-y-2">
                  {avgBoard.map((entry, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 ${
                        i === 0 ? 'bg-yellow-400 text-black' :
                        i === 1 ? 'bg-slate-300 text-black' :
                        i === 2 ? 'bg-amber-600 text-white' :
                        'bg-slate-700 text-slate-300'
                      }`}>{i + 1}</span>
                      <span className="flex-1 truncate text-white">{entry.display_name}</span>
                      <span className="text-emerald-400 font-bold shrink-0">{entry.narutodle_avg_guesses?.toFixed(1) ?? '—'}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>

        </div>{/* end guesses grid */}

        {/* Mobile leaderboards – shown below guesses on small screens */}
        <div className="flex lg:hidden gap-4 mb-8">
          {/* Top Levels */}
          <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
            <h2 className="text-sm font-extrabold text-yellow-400 uppercase tracking-wider mb-3 text-center">🏆 Top Levels</h2>
            {levelBoard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
            ) : (
              <ol className="space-y-2">
                {levelBoard.map((entry, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-black' :
                      i === 1 ? 'bg-slate-300 text-black' :
                      i === 2 ? 'bg-amber-600 text-white' :
                      'bg-slate-700 text-slate-300'
                    }`}>{i + 1}</span>
                    <span className="flex-1 truncate text-white">{entry.display_name}</span>
                    <span className="text-yellow-400 font-bold shrink-0">Lv {entry.level ?? 1}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          {/* Best Avg */}
          <div className="flex-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-lg">
            <h2 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider mb-3 text-center">🎯 Best Avg</h2>
            {avgBoard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
            ) : (
              <ol className="space-y-2">
                {avgBoard.map((entry, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-black' :
                      i === 1 ? 'bg-slate-300 text-black' :
                      i === 2 ? 'bg-amber-600 text-white' :
                      'bg-slate-700 text-slate-300'
                    }`}>{i + 1}</span>
                    <span className="flex-1 truncate text-white">{entry.display_name}</span>
                    <span className="text-emerald-400 font-bold shrink-0">{entry.narutodle_avg_guesses?.toFixed(1) ?? '—'}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
