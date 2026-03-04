import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

// Standalone preview page for the win/loss screen — edit freely here
export default function WinScreenPreview() {
  const [mode, setMode] = useState<'win' | 'loss'>('win');
  const navigate = useNavigate();
  const isMe = mode === 'win';
  const winnerName = 'karosene0';
  const loserName = 'marek';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Preview toggle bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-4">
        <span className="text-slate-400 text-sm font-semibold">Preview:</span>
        <button
          onClick={() => setMode('win')}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mode === 'win' ? 'bg-yellow-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          🏆 Win Screen
        </button>
        <button
          onClick={() => setMode('loss')}
          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mode === 'loss' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
        >
          💀 Loss Screen
        </button>
      </div>

      {/* Screen content */}
      <div className="flex-1 bg-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background particles for win */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {isMe && (
            <>
              <div className="absolute top-10 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="absolute top-20 left-1/3 w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute top-16 right-1/4 w-4 h-4 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              <div className="absolute top-8 right-1/3 w-2 h-2 bg-yellow-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute top-32 left-[20%] w-3 h-3 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute top-24 right-[20%] w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-24 left-[30%] w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }} />
              <div className="absolute bottom-16 right-[30%] w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.7s' }} />
            </>
          )}
        </div>

        <div className="text-center z-10 px-8">
          {isMe ? (
            <>
              {/* WIN SCREEN */}
              <div className="mb-6 text-9xl animate-bounce">🏆</div>
              <h1 className="text-8xl font-black mb-4 bg-linear-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-lg">
                VICTORY!
              </h1>
              <p className="text-2xl text-yellow-300 font-semibold mb-2">
                🎉 <span className="text-white">{winnerName}</span> wins the battle!
              </p>
              <p className="text-slate-400 text-lg mb-10">All enemy shinobi have been defeated.</p>

              <div className="flex gap-3 flex-col items-center">
                <div className="flex gap-3">
                  <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl px-6 py-3 text-center">
                    <div className="text-yellow-400 text-2xl font-bold">+1</div>
                    <div className="text-slate-300 text-sm">Win</div>
                  </div>
                  <div className="bg-purple-500/20 border border-purple-500 rounded-xl px-6 py-3 text-center">
                    <div className="text-purple-400 text-2xl font-bold">+15 XP</div>
                    <div className="text-slate-300 text-sm">Experience</div>
                  </div>
                </div>
                <button onClick={() => navigate('/online-game')} className="mt-6 px-10 py-4 bg-linear-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-xl">
                  🎮 Play Again
                </button>
                <Link to="/" className="text-slate-400 hover:text-slate-200 transition text-sm mt-1">← Back to Home</Link>
              </div>
            </>
          ) : (
            <>
              {/* LOSS SCREEN */}
              <div className="mb-6 text-9xl">💀</div>
              <h1 className="text-8xl font-black mb-4 bg-linear-to-r from-slate-400 via-slate-300 to-slate-500 bg-clip-text text-transparent">
                DEFEAT
              </h1>
              <p className="text-2xl text-slate-300 font-semibold mb-2">
                <span className="text-white">{winnerName}</span> wins the battle.
              </p>
              <p className="text-slate-500 text-lg mb-4">All your shinobi have fallen.</p>
              <p className="text-slate-400 text-base mb-8">Better luck next time, <span className="text-slate-200 font-semibold">{loserName}</span>.</p>

              <div className="flex gap-3 flex-col items-center">
                <div className="flex gap-3">
                  <div className="bg-red-500/20 border border-red-500 rounded-xl px-6 py-3 text-center">
                    <div className="text-red-400 text-2xl font-bold">+1</div>
                    <div className="text-slate-300 text-sm">Loss</div>
                  </div>
                  <div className="bg-slate-600/40 border border-slate-500 rounded-xl px-6 py-3 text-center">
                    <div className="text-slate-300 text-2xl font-bold">+8 XP</div>
                    <div className="text-slate-400 text-sm">Experience</div>
                  </div>
                </div>
                <button onClick={() => navigate('/online-game')} className="mt-6 px-10 py-4 bg-linear-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-xl">
                  🔄 Try Again
                </button>
                <Link to="/" className="text-slate-400 hover:text-slate-200 transition text-sm mt-1">← Back to Home</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
