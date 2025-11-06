import type { Route } from "./+types/home";
import { useEffect, useMemo, useRef, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Narutodle — Guess the character" },
    { name: "description", content: "Guess a random Naruto character on each refresh." },
  ];
}

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
  return s.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export default function Home() {
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
    { char: Character; matches: Record<string, boolean> }[]
  >([]);
  const mounted = useRef(false);

  useEffect(() => {
    // fetch characters from public folder
    fetch("/characters.json")
      .then((r) => r.json())
      .then((data: Character[]) => {
        // dedupe characters by normalized name (prefer entries with an image/file)
        const map = new Map<string, Character>();
        for (const c of data) {
          const key = normalize(c.name);
          const existing = map.get(key);
          if (!existing) {
            map.set(key, c);
            continue;
          }
          // prefer the entry that has a file set
          const existingHasFile = !!existing.file && existing.file.trim() !== "";
          const cHasFile = !!c.file && c.file.trim() !== "";
          if (!existingHasFile && cHasFile) {
            map.set(key, c);
            continue;
          }
          // otherwise keep the existing (first) entry
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

  // compute suggestions as user types
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
        // exclude already-guessed characters
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

  // close suggestions on outside click
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
    // clear feedback when idx changes
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

    // find guessed character in the database
    const guessed = characters.find((c) =>
      [c.name, ...(c.aliases || [])].map(normalize).includes(n)
    );

    if (!guessed) {
      setFeedback("Character not found in database.");
      return;
    }

    // helper for array overlap
    const arrayOverlap = (a?: string[], b?: string[]) => {
      if (!a || !b) return false;
      const A = a.map(normalize);
      const B = b.map(normalize);
      return A.some((x) => B.includes(x));
    };

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
    setGuesses((s) => [{ char: guessed, matches }, ...s].slice(0, 20));

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
    // avoid same
    if (next === idx) next = (next + 1) % characters.length;
    setIdx(next);
  }

  return (
    <main className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-2">Narutodle</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Refresh the page (or press New) to get a new character — type your guess and submit.</p>

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
              className="flex-1 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/5"
              placeholder="Who is this?"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
              aria-controls="suggestions-list"
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 ? (
              <div id="suggestions-list" role="listbox" className="absolute left-0 right-0 mt-12 z-50 bg-white/95 dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200 dark:border-gray-700">
                {suggestions.map((s, i) => (
                  <div
                    key={s.name + i}
                    role="option"
                    aria-selected={i === activeSuggestion}
                    onMouseDown={(ev) => {
                      // use mouseDown to avoid losing focus before click
                      ev.preventDefault();
                      setGuess(s.name);
                      setShowSuggestions(false);
                      setActiveSuggestion(-1);
                      // keep focus on input for further typing
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
            <button type="button" onClick={() => setShowClues((s) => !s)} className="px-3 py-2 rounded-md bg-slate-600 text-white">{showClues ? 'Hide Clues' : 'Show Clues'}</button>
          </form>

          <div className="min-h-5 text-sm text-amber-200">{feedback}</div>

          {/* Clues / categories */}
          {current && (showClues || revealed) ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-200">
              <div><strong>Gender:</strong> {current.gender ?? '—'}</div>
              <div><strong>Age:</strong> {current.age ?? '—'}</div>
              <div><strong>Clan:</strong> {current.clan ?? '—'}</div>
              <div><strong>Rank:</strong> {current.rank ?? '—'}</div>
              <div className="sm:col-span-2"><strong>Affiliations:</strong> {current.affiliations?.join(', ') ?? '—'}</div>
              <div><strong>Nature:</strong> {current.natureAffinity?.join(', ') ?? '—'}</div>
              <div><strong>First Appearance:</strong> {current.firstAppearance ?? '—'}</div>
            </div>
          ) : null}

          {/* Guesses history and comparison grid */}
          {guesses.length > 0 ? (
            <div className="mt-6 overflow-auto">
              {/* Header pills */}
              <div className="flex gap-3 items-center mb-3 flex-wrap">
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
                    className="px-3 py-1 bg-white/90 dark:bg-gray-800 rounded-full text-xs shadow-md border border-gray-200 dark:border-gray-700"
                  >
                    {h}
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                {guesses.map(({ char, matches }, i) => (
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
                      {char.age ?? '—'}
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
                      {char.firstAppearance ?? '—'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <footer className="mt-4 text-xs text-gray-500">Add images to <code>/public/images</code> and entries to <code>/public/characters.json</code>.</footer>
      </div>
    </main>
  );
}
