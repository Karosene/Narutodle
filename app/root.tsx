import {
  isRouteErrorResponse,
  Links,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useState } from "react";


import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="description" content="Narutodle - Test your Naruto knowledge with this fun character guessing game. Family-friendly fan-made quiz game." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/images/logo.png" />
        
        <Meta />
        <Links />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8126457532172588" crossOrigin="anonymous"></script>
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

import { Analytics } from "@vercel/analytics/react";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy" },
];

const gameLinks = [
  { to: "/", label: "Narutodle (Guess the Character)", icon: "🔮" },
  { to: "/characters", label: "Character Cards Gallery", icon: "🎴" },
  { to: "/play-game", label: "Play Card Game", icon: "⚔️" },
];

export default function App() {
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  const toggleGames = () => setGamesOpen((v) => !v);
  const closeGames = () => setGamesOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-backdrop-filter:bg-white/70 dark:supports-backdrop-filter:bg-slate-900/70">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
            <img src="/images/logo.png" alt="Narutodle Logo" className="w-12 h-9 select-none" />
            <span className="tracking-tight">Narutodle</span>
          </NavLink>
          <button
            type="button"
            onClick={toggle}
            className="sm:hidden inline-flex items-center px-3 py-2 rounded-full border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus-visible:outline-none focus:ring-0"
            aria-label="Toggle navigation"
            aria-expanded={open}
          >
            <span className="text-lg">☰</span>
          </button>
          <nav
            aria-label="Primary"
            className="hidden sm:flex flex-wrap items-center gap-2 text-sm font-semibold"
          >
            <div className="relative">
              <button
                type="button"
                onClick={toggleGames}
                className="px-3 py-2 rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1"
              >
                <span>🎮 Games</span>
                <span className={`transition-transform ${gamesOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {gamesOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={closeGames}
                  />
                  <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-20 py-2">
                    {gameLinks.map(({ to, label, icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={closeGames}
                        className={({ isActive }) =>
                          `block px-4 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                            isActive
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                              : "text-slate-700 dark:text-slate-200"
                          }`
                        }
                      >
                        <span className="mr-2">{icon}</span>
                        {label}
                      </NavLink>
                    ))}
                  </div>
                </>
              )}
            </div>
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-700 dark:text-slate-200"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className={`${open ? "max-h-96" : "max-h-0"} sm:hidden overflow-hidden transition-[max-height] duration-300`}>
          <nav aria-label="Mobile" className="px-4 pb-4 flex flex-col gap-2 text-sm font-semibold">
            <div className="border border-slate-200/70 dark:border-slate-800/80 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={toggleGames}
                className="w-full px-3 py-2 bg-white/90 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 flex items-center justify-between"
              >
                <span>🎮 Games</span>
                <span className={`transition-transform ${gamesOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {gamesOpen && (
                <div className="border-t border-slate-200/70 dark:border-slate-800/80">
                  {gameLinks.map(({ to, label, icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => { close(); closeGames(); }}
                      className={({ isActive }) =>
                        `block w-full px-5 py-2 text-sm transition hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                            : "text-slate-700 dark:text-slate-200"
                        }`
                      }
                    >
                      <span className="mr-2">{icon}</span>
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={close}
                className={({ isActive }) =>
                  `block w-full px-3 py-2 rounded-lg border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/70 transition hover:border-slate-300 dark:hover:border-slate-700 ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-700 dark:text-slate-200"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-6 border-t border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-700 dark:text-slate-300">
            <div className="font-semibold text-slate-900 dark:text-slate-100">Narutodle</div>
            <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
              <span>Naruto character guessing game</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">© {new Date().getFullYear()} Fan-made project</span>
            </div>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
            <p>Naruto and all related content are trademarks of Masashi Kishimoto and Shueisha. This is an unofficial fan-made project for entertainment purposes only.</p>
          </div>
        </div>
      </footer>

      <Analytics />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;  
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
