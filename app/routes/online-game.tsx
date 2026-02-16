import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getCurrentUser } from '../utils/auth';
import { createGameSession, joinGameSession, getGameSession, type OnlineGameSession } from '../utils/onlineGame';

type LobbyView = 'menu' | 'create' | 'join' | 'waiting';

export default function OnlineGame() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<LobbyView>('menu');
  const [gameCode, setGameCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [session, setSession] = useState<OnlineGameSession | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }
    setUser(currentUser);
  }, []);

  useEffect(() => {
    // Poll for opponent joining when in waiting view
    if (view === 'waiting' && session && session.status === 'waiting') {
      const interval = setInterval(async () => {
        const result = await getGameSession(session.id);
        if (result.success && result.session) {
          if (result.session.status === 'active') {
            // Opponent joined! Start game
            window.location.href = `/online-game/play?session=${result.session.id}`;
          }
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [view, session]);

  const handleCreateGame = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    const result = await createGameSession(user.id);
    
    if (result.success && result.session && result.gameCode) {
      setSession(result.session);
      setGameCode(result.gameCode);
      setView('waiting');
    } else {
      setError(result.error || 'Failed to create game');
    }
    
    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!user || !inputCode.trim()) {
      setError('Please enter a game code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const result = await joinGameSession(inputCode.toUpperCase(), user.id);
    
    if (result.success && result.session) {
      // Successfully joined, navigate to game
      window.location.href = `/online-game/play?session=${result.session.id}`;
    } else {
      setError(result.error || 'Failed to join game');
    }
    
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
            Online Multiplayer
          </h1>
          <p className="text-slate-300 text-xl">Play with friends anywhere!</p>
        </div>

        {/* Main Menu */}
        {view === 'menu' && (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Create Game */}
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50 hover:border-purple-500/50 transition-all">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Create Game</h2>
                  <p className="text-slate-400 text-sm">Host a game and share the code</p>
                </div>
                <button
                  onClick={handleCreateGame}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                >
                  {loading ? 'Creating...' : 'Create Game'}
                </button>
              </div>

              {/* Join Game */}
              <div className="bg-slate-700/30 p-6 rounded-xl border border-slate-600/50 hover:border-green-500/50 transition-all">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🔗</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Join Game</h2>
                  <p className="text-slate-400 text-sm">Enter a game code to join</p>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g., ABC123)"
                    maxLength={6}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:border-green-500 transition uppercase"
                  />
                  <button
                    onClick={handleJoinGame}
                    disabled={loading || !inputCode.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                  >
                    {loading ? 'Joining...' : 'Join Game'}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300 text-center">
                {error}
              </div>
            )}

            <div className="mt-8 text-center">
              <Link
                to="/play-game"
                className="text-slate-400 hover:text-white transition underline"
              >
                ← Back to Local Multiplayer
              </Link>
            </div>
          </div>
        )}

        {/* Waiting for Opponent */}
        {view === 'waiting' && session && (
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <div className="text-center">
              <div className="text-7xl mb-6 animate-bounce">⏳</div>
              <h2 className="text-3xl font-bold text-white mb-4">Waiting for Opponent...</h2>
              
              <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 p-6 rounded-xl border-2 border-purple-500/50 mb-6">
                <p className="text-slate-300 mb-4">Share this code with your friend:</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-slate-800 px-8 py-4 rounded-lg border-2 border-purple-500">
                    <span className="text-5xl font-mono font-black text-white tracking-widest">
                      {gameCode}
                    </span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition"
                  >
                    {copied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              </div>

              <p className="text-slate-400 mb-4">Game will start automatically when they join</p>
              
              <div className="flex items-center justify-center gap-2 text-slate-500 mb-6">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
              </div>

              <button
                onClick={() => {
                  setView('menu');
                  setSession(null);
                  setGameCode('');
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
