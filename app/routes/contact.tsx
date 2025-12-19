export function meta() {
  return [
    { title: "Contact | Narutodle" },
    {
      name: "description",
      content: "How to reach the Narutodle team for feedback, takedowns, or accessibility questions.",
    },
  ];
}

const contacts = [
  { label: "Email", value: "adrianberta08@gmail.com", href: "mailto:adrianberta08@gmail.com" },
];

export default function Contact() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 sm:py-12 space-y-8">
      <div className="space-y-3 text-center">
        <p className="text-xs sm:text-sm font-semibold tracking-wide text-indigo-600 dark:text-indigo-400">Contact</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold">We are easy to reach</h1>
        <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300">
          Questions, takedown requests, or accessibility issues? Choose a channel below and we will respond promptly.
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {contacts.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="flex items-center justify-between rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 px-4 sm:px-5 py-4 sm:py-5 shadow-sm transition hover:border-indigo-400/70 hover:shadow active:scale-[0.98]"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{c.label}</div>
              <div className="text-slate-700 dark:text-slate-300 text-sm break-all">{c.value}</div>
            </div>
            <span aria-hidden className="text-lg">↗</span>
          </a>
        ))}
      </div>

      <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 dark:bg-amber-900/20 dark:border-amber-800/60 p-4 sm:p-5 text-sm text-amber-900 dark:text-amber-100">
        <div className="font-semibold mb-2">Content responsibility</div>
        <p>
          Narutodle avoids adult, hateful, or violent content. If you see an issue with an image or description, please
          send the character name and screenshot via email so we can correct it quickly.
        </p>
      </div>
    </section>
  );
}
