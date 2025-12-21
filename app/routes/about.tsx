export function meta() {
  return [
    { title: "About | Narutodle" },
    {
      name: "description",
      content: "Learn what Narutodle is, how we curate content, and our commitment to quality and safety.",
    },
  ];
}

export default function About() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-12 space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400">About</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Narutodle, explained</h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
          A fan-made Naruto character guessing game built to be fast, fair, and family-friendly.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-800/60 p-4 sm:p-5 text-sm">
        <div className="font-semibold mb-2 text-amber-900 dark:text-amber-100">Copyright Notice</div>
        <p className="text-amber-900 dark:text-amber-100">
          Naruto and all related characters, names, and imagery are trademarks and copyrights of Masashi Kishimoto, Shueisha, and their respective owners. This is a non-commercial fan-made project for educational and entertainment purposes only. We do not claim ownership of any copyrighted materials. All character data is used under fair use for transformative purposes.
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Quality & originality</h2>
          <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Character data is manually curated, verified, and deduped to ensure accuracy.</li>
            <li>Game mechanics, hints, and UI are original creations designed for this site.</li>
            <li>Images are carefully selected to remain family-friendly; no violent, hateful, or adult material.</li>
            <li>All content and copy are written specifically for Narutodle to provide unique value.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">User trust</h2>
          <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Clear navigation to Home, About, Contact, and Privacy keeps the site easy to audit.</li>
            <li>No sign-ups required; we do not collect personal data beyond basic analytics.</li>
            <li>Issues or takedown requests? Reach us through the Contact page anytime.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Performance & access</h2>
          <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Optimized assets keep pages quick on desktop and mobile.</li>
            <li>Semantic headings, labels, and alt text improve accessibility.</li>
            <li>Core navigation and content stay readable even if JS is delayed.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Content cadence</h2>
          <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>New characters and hints are added in batches; stale entries are pruned.</li>
            <li>We monitor for broken images and replace them quickly.</li>
            <li>Patch notes are summarized on Home when gameplay tweaks ship.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
