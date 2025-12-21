export function meta() {
  return [
    { title: "Privacy | Narutodle" },
    {
      name: "description",
      content: "Learn how Narutodle handles cookies, analytics, and data for this Naruto guessing game.",
    },
  ];
}

export default function Privacy() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-12 space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400">Privacy</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold">Your data, simplified</h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
          Narutodle is designed to be lightweight and transparent. We minimize data collection and keep gameplay
          available without an account.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4 text-sm text-slate-700 dark:text-slate-300">
        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">What we collect</h2>
          <ul className="list-disc list-inside space-y-1 sm:space-y-1.5">
            <li>Anonymous analytics via Vercel Analytics to understand page performance.</li>
            <li>No account system and no personal identifiers are required to play.</li>
            <li>Guesses stay in memory for the current session only.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Advertising and third-party cookies</h2>
          <ul className="list-disc list-inside space-y-1 sm:space-y-1.5">
            <li>We use Google AdSense to display advertisements on this site.</li>
            <li>Third parties (including Google) may place and read cookies on your browser, or use web beacons to collect information, in the course of ads being served.</li>
            <li>Google uses cookies to serve ads based on your prior visits to this website or other websites.</li>
            <li>You may opt out of personalized advertising by visiting <a className="text-indigo-600 dark:text-indigo-300 font-semibold" href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Ads Settings</a>.</li>
            <li>For more information about how Google uses data, visit <a className="text-indigo-600 dark:text-indigo-300 font-semibold" href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">How Google uses data when you use our partners' sites or apps</a>.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Cookies and storage</h2>
          <ul className="list-disc list-inside space-y-1 sm:space-y-1.5">
            <li>This site uses cookies for analytics and advertising purposes.</li>
            <li>Third-party advertising partners may set cookies; you can disable them via your browser settings.</li>
            <li>Images are served from our /public/images directory to avoid remote tracking pixels.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Content standards</h2>
          <ul className="list-disc list-inside space-y-1 sm:space-y-1.5">
            <li>No adult, hateful, or violent imagery is allowed.</li>
            <li>We respond quickly to takedown or correction requests submitted via Contact.</li>
            <li>External links are limited and selected for safety; report any issue you see.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
          <h2 className="text-base sm:text-lg font-semibold mb-2">Questions</h2>
          <p>
            Reach out any time at <a className="text-indigo-600 dark:text-indigo-300 font-semibold break-all" href="mailto:adrianberta08@gmail.com">adrianberta08@gmail.com</a>. We typically respond within 48 hours.
          </p>
        </article>
      </div>
    </section>
  );
}
