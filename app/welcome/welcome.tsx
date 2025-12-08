import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { useEffect, useMemo, useRef, useState } from "react";

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
  aliases?: string[];
  gender?: string;
  age?: string;
  clan?: string;
  affiliations?: string[];
  rank?: string;
  natureAffinity?: string[];
  firstAppearance?: string;
};

function normalize(s: string) {
  return s
    .normalize?.('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

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
  const [showClues, setShowClues] = useState(false);
  const [guesses, setGuesses] = useState<
    { char: Character; matches: Record<string, boolean>; ageComparison?: string | null; arcComparison?: string | null }[]
  >([]);
  const mounted = useRef(false);

  const TRIES_REQUIRED = 10;
  const CLUE_COUNT = 7;
  const triesLeft = Math.max(0, TRIES_REQUIRED - guesses.length);
  const cluesUnlocked = guesses.length >= TRIES_REQUIRED ? CLUE_COUNT : 0;
  const cluesLocked = guesses.length < TRIES_REQUIRED;

  useEffect(() => {
    fetch("/characters.json")
      .then((r) => r.json())
      .then((data: Character[]) => {
        const map = new Map<string, Character>();
        for (const c of data) {
          const key = normalize(c.name);
          const existing = map.get(key);
          if (!existing) {
            map.set(key, c);
            continue;
          }
          const existingHasFile = !!existing.file && existing.file.trim() !== "";
          const cHasFile = !!c.file && c.file.trim() !== "";
          if (!existingHasFile && cHasFile) {
            map.set(key, c);
            continue;
          }
        }

        const uniq = Array.from(map.values());
        setCharacters(uniq);
        if (uniq.length) setIdx(Math.floor(Math.random() * uniq.length));
      })
      .catch((e) => {
        console.error(e);
        setFeedback("Failed to load characters.json");
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

    const matches = characters
      .filter((c) => {
        if (guessedSet.has(normalize(c.name))) return false;
        if (normalize(c.name).includes(nq)) return true;
        if (c.aliases && c.aliases.some((a) => normalize(a).includes(nq))) return true;
        return false;
      })
      .slice(0, 8);

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setActiveSuggestion(-1);
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
    if (mounted.current) {
      setGuess("");
      setRevealed(false);
      setFeedback(null);
    }
    mounted.current = true;
  }, [idx]);

  const current = useMemo(() => {
    if (!characters || idx === null) return null;
    return characters[idx];
  }, [characters, idx]);

  function checkGuess(e?: React.FormEvent) {
    e?.preventDefault();
    if (!current || !characters) return;
    const n = normalize(guess || "");

    const guessed = characters.find((c) =>
      [c.name, ...(c.aliases || [])].map(normalize).includes(n)
    );

    if (!guessed) {
      setFeedback("Character not found in database.");
      return;
    }

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

    const guessedAge = parseAge(guessed.age);
    const currentAge = parseAge(current.age);
    const ageComparison =
      guessedAge !== null && currentAge !== null
        ? guessedAge < currentAge ? 'higher' : guessedAge > currentAge ? 'lower' : 'equal'
        : null;

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

    const getArcIndex = (arc?: string | null) => {
      if (!arc) return null;
      const a = arc.trim();
      const idx = ARC_ORDER.findIndex((x) => x.toLowerCase() === a.toLowerCase());
      return idx === -1 ? null : idx;
    };

    const guessedArcIdx = getArcIndex(guessed.firstAppearance as string | undefined | null);
    const currentArcIdx = getArcIndex(current.firstAppearance as string | undefined | null);
    const arcComparison =
      guessedArcIdx !== null && currentArcIdx !== null
        ? guessedArcIdx < currentArcIdx
          ? 'later'
          : guessedArcIdx > currentArcIdx
          ? 'earlier'
          : 'equal'
        : null;

    const matches: Record<string, boolean> = {
      name: normalize(guessed.name) === normalize(current.name),
      gender:
        !!guessed.gender && !!current.gender
          ? normalize(guessed.gender) === normalize(current.gender)
          : false,
      age:
        !!guessed.age && !!current.age
          ? normalize(guessed.age) === normalize(current.age)
          : false,
      clan:
        !!guessed.clan && !!current.clan
          ? normalize(guessed.clan) === normalize(current.clan)
          : false,
      affiliations: arrayOverlap(guessed.affiliations, current.affiliations),
      rank:
        !!guessed.rank && !!current.rank
          ? normalize(guessed.rank) === normalize(current.rank)
          : false,
      nature: arrayOverlap(guessed.natureAffinity, current.natureAffinity),
      firstAppearance:
        !!guessed.firstAppearance && !!current.firstAppearance
          ? normalize(guessed.firstAppearance) === normalize(current.firstAppearance)
          : false,
    };

    const tries = guesses.length + 1;
    setGuesses((s) => [{ char: guessed, matches, ageComparison, arcComparison }, ...s].slice(0, 20));

    if (matches.name) {
      setRevealed(true);
      setFeedback(`Correct! It's ${current.name}. You guessed it in ${tries} ${tries === 1 ? 'try' : 'tries'}.`);
    } else {
      setFeedback("Guess recorded — see comparison row below.");
    }
  }

  function pickNext() {
    if (!characters || characters.length === 0) return;
    if (characters.length === 1) return;
    let next = Math.floor(Math.random() * characters.length);
    if (next === idx) next = (next + 1) % characters.length;
    setGuesses([]);
    setIdx(next);
  }

  return (
    <main className="flex items-start justify-center min-h-screen p-8 mt-10">
      <div className="w-full max-w-6xl">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-2 text-center">Narutodle</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-10 text-center">Refresh the page (or press New) to get a new character — type your guess and submit.</p>

        <div className="bg-white/5 dark:bg-white/3 rounded-xl p-6 shadow-sm">

          <form onSubmit={checkGuess} className="flex gap-2 mb-3 relative" ref={suggRef}>
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
                  }
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                  setActiveSuggestion(-1);
                }
              }}
              role="combobox"
              aria-activedescendant={activeSuggestion >= 0 ? `suggestion-${activeSuggestion}` : undefined}
              className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white text-black dark:bg-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Who is this?"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="suggestions-list"
            />

            {showSuggestions && suggestions.length > 0 ? (
              <div id="suggestions-list" role="listbox" className="absolute left-0 right-0 mt-12 z-50 bg-white/95 dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700">
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
                    className={`px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${i === activeSuggestion ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <div className="font-medium">{s.name}</div>
                    {s.aliases && s.aliases.length > 0 ? <div className="text-xs text-gray-500">Aliases: {s.aliases.join(', ')}</div> : null}
                  </div>
                ))}
              </div>
            ) : null}
            <button type="submit" className="px-3 py-2 rounded-md bg-yellow-400 text-black font-semibold">Guess</button>
            <button type="button" onClick={pickNext} className="px-3 py-2 rounded-md bg-blue-600 text-white">New</button>
            <button
              type="button"
              onClick={() => { if (cluesLocked) return; setShowClues((s) => !s); }}
              disabled={cluesLocked}
              className={"px-3 py-2 rounded-md bg-slate-600 text-white " + (cluesLocked ? 'opacity-50 cursor-not-allowed' : '')}
            >
              {showClues ? 'Hide Clues' : (cluesLocked ? `Show Clues (${triesLeft} tries left)` : 'Show Clues')}
            </button>
          </form>

          <div className="min-h-5 text-sm text-amber-200">{feedback}</div>

          {current && (revealed || cluesUnlocked > 0) ? (
            (() => {
              const fields = [
                { key: 'gender', label: 'Gender', value: current.gender ?? '—' },
                { key: 'age', label: 'Age', value: current.age ?? '—' },
                { key: 'clan', label: 'Clan', value: current.clan ?? '—' },
                { key: 'rank', label: 'Rank', value: current.rank ?? '—' },
                { key: 'affiliations', label: 'Affiliations', value: current.affiliations?.join(', ') ?? '—', colSpan: 2 },
                { key: 'nature', label: 'Nature', value: current.natureAffinity?.join(', ') ?? '—' },
                { key: 'firstAppearance', label: 'First Appearance', value: current.firstAppearance ?? '—' },
              ];

              const toShow = (revealed || cluesUnlocked > 0) ? fields : fields.slice(0, cluesUnlocked);

              return (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-200">
                  {toShow.length === 0 ? (
                    <div className="text-sm text-gray-400">No clues unlocked yet — make guesses to unlock clues.</div>
                  ) : null}
                  {toShow.map((f) => (
                    <div key={f.key} className={f.colSpan === 2 ? 'sm:col-span-2' : ''}>
                      <strong>{f.label}:</strong> {f.value}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : null}
        </div>

        {guesses.length > 0 ? (
          <div className="bg-white/5 dark:bg-white/3 rounded-xl p-6 shadow-sm mt-6">
            <div className="overflow-auto">
              <div className="grid grid-cols-8 gap-3 items-center mb-3">
                {[
                  'Name',
                  'Gender',
                  'Age',
                  'Clan',
                  'Affiliation',
                  'Rank',
                  'Nature',
                  'First Arc',
                ].map((h) => (
                  <div
                    key={h}
                    className="px-3 py-1 bg-white/90 dark:bg-gray-800 rounded-full text-xs shadow-md border border-gray-200 dark:border-gray-700 text-center"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {guesses.map(({ char, matches, ageComparison, arcComparison }, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-8 gap-3 items-center text-sm bg-white/5 p-3 rounded-lg shadow-inner"
                  >
                    <div className={`px-3 py-2 rounded-md font-semibold text-center ${matches.name ? 'bg-emerald-500 text-white shadow' : 'bg-red-500 text-white shadow'}`}>
                      {char.name}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.gender ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.gender ?? '—'}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.age ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.age ?? '—'}</span>
                        {ageComparison === 'higher' && <span className="text-lg">↑</span>}
                        {ageComparison === 'lower' && <span className="text-lg">↓</span>}
                      </div>
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.clan ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.clan ?? '—'}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.affiliations ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.affiliations?.join(', ') ?? '—'}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.rank ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.rank ?? '—'}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.nature ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      {char.natureAffinity?.join(', ') ?? '—'}
                    </div>

                    <div className={`px-3 py-2 rounded-md text-center ${matches.firstAppearance ? 'bg-emerald-500 text-white shadow' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                      <div className="flex items-center justify-center gap-1">
                        <span>{char.firstAppearance ?? '—'}</span>
                        {(typeof arcComparison !== 'undefined' && arcComparison !== null) ? (
                          arcComparison === 'later' ? <span className="text-lg" title="Target appears later than guessed">↑</span>
                          : arcComparison === 'earlier' ? <span className="text-lg" title="Target appears earlier than guessed">↓</span>
                          : null
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <footer className="mt-4 text-xs text-gray-500">Add images to <code>/public/images</code> and entries to <code>/public/characters.json</code>.</footer>
      </div>
    </main>
  );
}
