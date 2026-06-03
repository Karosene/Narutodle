import {
  isRouteErrorResponse,
  Links,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { useState, useEffect } from "react";
import { getCurrentUser, getUserProfile } from "./utils/auth";
import { getFriendRows } from "./utils/friends";


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
  { to: "/characters", label: "Character Cards" },
  { to: "/friends", label: "Friends" },
];

// const gameLinks = [
//   { to: "/", label: "Narutodle (Guess the Character)", icon: "🔮" },
//   { to: "/play-game", label: "Play Card Game", icon: "⚔️" },
// ];

export default function App() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [gamesOpen, setGamesOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const isAdminRoute = location.pathname === '/admin';

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);
  const toggleGames = () => setGamesOpen((v) => !v);
  const closeGames = () => setGamesOpen(false);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        const profile = await getUserProfile(currentUser.id);
        setUserProfile(profile);
        const rows = await getFriendRows(currentUser.id);
        const incoming = rows.filter(r => r.status === 'pending' && r.to_user_id === currentUser.id);
        setPendingCount(incoming.length);
      } else {
        setUserProfile(null);
        setPendingCount(0);
      }
    };
    
    loadUser();

    // Listen for auth changes (login/logout)
    const handleAuthChange = () => {
      loadUser();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur supports-backdrop-filter:bg-white/70 dark:supports-backdrop-filter:bg-slate-900/70">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition">
            <img src="/images/logo.png" alt="Narutodle Logo" className="w-12 h-9 select-none" />
            <span className="tracking-tight">Narutodle</span> 
          </NavLink>
          <nav
            aria-label="Primary"
            className="hidden sm:flex flex-wrap items-center gap-2 text-sm font-semibold"
          >
            {/* Games dropdown hidden temporarily */}
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
                <span className="flex items-center gap-1.5">
                  {label}
                  {to === '/friends' && pendingCount > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-xs rounded-full px-1.5 py-0.5 leading-none font-bold min-w-[18px] text-center">{pendingCount}</span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {isAdminRoute ? (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-purple-600/20 border border-purple-500/50 text-purple-300">
                <span className="text-xl">🔐</span>
                <span className="hidden md:inline text-sm font-semibold">Admin Panel</span>
              </div>
            ) : (
              <NavLink
                to={user ? "/profile" : "/login"}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-full transition hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                title={user ? "Profile" : "Login"}
              >
                {user && userProfile ? (
                  <img
                    src={userProfile.profile_picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-orange-400"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/logo.png';
                    }}
                  />
                ) : (
                  <span className="text-xl">🔐</span>
                )}
                <span className="hidden md:inline text-sm font-semibold">
                  {user ? user.username || "Profile" : "Login"}
                </span>
              </NavLink>
            )}
            <button
              type="button"
              onClick={toggle}
              className="sm:hidden inline-flex items-center px-3 py-2 rounded-full border border-slate-200/70 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus-visible:outline-none focus:ring-0"
              aria-label="Toggle navigation"
              aria-expanded={open}
            >
              <span className="text-lg">☰</span>
            </button>
          </div>
        </div>
        <div className={`${open ? "max-h-96" : "max-h-0"} sm:hidden overflow-hidden transition-[max-height] duration-300`}>
          <nav aria-label="Mobile" className="px-4 pb-4 flex flex-col gap-2 text-sm font-semibold">
            {/* Games dropdown hidden temporarily */}
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
                <span className="flex items-center gap-1.5">
                  {label}
                  {to === '/friends' && pendingCount > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-xs rounded-full px-1.5 py-0.5 leading-none font-bold min-w-[18px] text-center">{pendingCount}</span>
                  )}
                </span>
              </NavLink>
            ))}
            {isAdminRoute ? (
              <div className="block w-full px-3 py-2 rounded-lg border border-purple-500/50 bg-purple-600/20 text-purple-300 font-semibold">
                🔐 Admin Panel
              </div>
            ) : (
              <NavLink
                to={user ? "/profile" : "/login"}
                onClick={close}
                className="block w-full px-3 py-2 rounded-lg border border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-semibold transition hover:bg-orange-100 dark:hover:bg-orange-900/50"
              >
                {user && userProfile ? (
                  <div className="flex items-center gap-2">
                    <img
                      src={userProfile.profile_picture}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border-2 border-orange-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/logo.png';
                      }}
                    />
                    <span>{user.username || 'Profile'}</span>
                  </div>
                ) : (
                  <span>🔐 Login</span>
                )}
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 flex flex-col gap-8">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row gap-10 sm:gap-0 sm:justify-between">
            {/* Left: logo + brand + description */}
            <div className="flex flex-col gap-3 max-w-xs">
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" alt="Narutodle Logo" className="w-10 h-8 select-none" />
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">Narutodle</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                A Naruto-themed guessing game. Test your knowledge of characters, jutsus, and the ninja world.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
                Naruto and all related content are trademarks of Masashi Kishimoto and Shueisha. Unofficial fan-made project.
              </p>
            </div>
            {/* Right: nav links column */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">Pages</span>
              <NavLink to="/about" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">About</NavLink>
              <NavLink to="/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</NavLink>
              <NavLink to="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</NavLink>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="border-t border-slate-200/70 dark:border-slate-800/80 pt-6 flex justify-end">
            <span className="text-xs text-slate-500 dark:text-slate-500">© {new Date().getFullYear()} Fan-made project</span>
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
