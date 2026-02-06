import { Link } from 'react-router';

export default function Rules() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="text-7xl mb-4">📜</div>
          </div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Game Rules
          </h1>
          <p className="text-xl text-slate-300 font-medium mb-6">
            Complete guide to playing Naruto Card Game
          </p>
          <Link 
            to="/play-game"
            className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            ← Back to Menu
          </Link>
        </div>

        <div className="space-y-8">
          {/* Game Setup */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-orange-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">🎴</span> Game Setup
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">1. Card Distribution</p>
                <p className="mb-3">Each player receives 9 random character cards:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>1 character with a passive ability</li>
                  <li>2 healer characters (without passive abilities)</li>
                  <li>6 normal characters (no passive, no heal)</li>
                </ul>
              </div>
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">2. Starting Player</p>
                <p>A number guessing game determines who goes first:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>A random number between 0 and 50 is generated</li>
                  <li>Both players guess the number</li>
                  <li>The player with the closest guess goes first</li>
                  <li>If both are equidistant, a new number is generated and players guess again</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Turn Structure */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-blue-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">🔄</span> Turn Structure
            </h2>
            <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
              <p className="text-slate-300 mb-4 text-lg">Each turn consists of three phases:</p>
              <ol className="list-decimal list-inside space-y-4 text-slate-300">
                <li className="font-semibold text-white text-lg">
                  Draw Phase
                  <p className="font-normal ml-6 mt-2 text-base">Draw one booster card from the deck</p>
                </li>
                <li className="font-semibold text-white text-lg">
                  Booster Phase
                  <p className="font-normal ml-6 mt-2 text-base">Choose to either use the booster card on one of your characters or skip it</p>
                </li>
                <li className="font-semibold text-white text-lg">
                  Action Phase
                  <p className="font-normal ml-6 mt-2 text-base">Select one of your characters and use a jutsu on an opponent's character (or ally for healing jutsus)</p>
                </li>
              </ol>
            </div>
          </section>

          {/* Booster Cards */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-green-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">⚡</span> Booster Cards
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-colors">
                <p className="font-semibold text-green-300 mb-2 text-lg">💚 Health Boost</p>
                <p className="text-slate-400">Restores health to a character</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-colors">
                <p className="font-semibold text-blue-300 mb-2 text-lg">💙 Chakra Boost</p>
                <p className="text-slate-400">Restores chakra to a character</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-colors">
                <p className="font-semibold text-purple-300 mb-2 text-lg">🔄 Jutsu Recovery</p>
                <p className="text-slate-400">Resets all jutsu cooldowns</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-cyan-500/50 transition-colors">
                <p className="font-semibold text-cyan-300 mb-2 text-lg">✨ Jutsu Mastery</p>
                <p className="text-slate-400">Unlocks upgraded jutsu for 3 rounds</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-red-500/50 transition-colors">
                <p className="font-semibold text-red-300 mb-2 text-lg">⚡ Damage Boost</p>
                <p className="text-slate-400">Next jutsu deals 50% more damage (one-time use)</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-orange-500/50 transition-colors">
                <p className="font-semibold text-orange-300 mb-2 text-lg">💥 Splash Damage</p>
                <p className="text-slate-400">Next damage jutsu hits up to 3 targets (one-time use)</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-amber-500/50 transition-colors">
                <p className="font-semibold text-amber-300 mb-2 text-lg">⚔️ Double Attack</p>
                <p className="text-slate-400">Character can use 2 jutsus in one turn</p>
              </div>
            </div>
          </section>

          {/* Jutsus */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-purple-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">🎯</span> Jutsus
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Jutsu Types</p>
                <ul className="space-y-2">
                  <li className="text-base"><span className="text-red-400 font-semibold">⚔️ Taijutsu:</span> Physical attacks</li>
                  <li className="text-base"><span className="text-blue-400 font-semibold">🌀 Ninjutsu:</span> Chakra-based techniques</li>
                  <li className="text-base"><span className="text-purple-400 font-semibold">👁️ Genjutsu:</span> Illusion-based attacks</li>
                </ul>
              </div>
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Chakra Cost</p>
                <p>Each jutsu requires a certain amount of chakra. Chakra regenerates by 10 points at the start of each turn.</p>
              </div>
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Cooldowns</p>
                <p>Some powerful jutsus have cooldown periods. The cooldown counter decreases by 1 at the start of each of your turns.</p>
              </div>
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Upgraded Jutsus</p>
                <p>When a character has the Jutsu Mastery booster active, they can use their upgraded (more powerful) jutsu.</p>
              </div>
            </div>
          </section>

          {/* Combat Mechanics */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-red-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">⚔️</span> Combat Mechanics
            </h2>
            <div className="space-y-4 text-slate-300">
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Type Advantages</p>
                <ul className="space-y-2 ml-4">
                  <li>• Taijutsu beats Genjutsu (2x damage)</li>
                  <li>• Ninjutsu beats Taijutsu (2x damage)</li>
                  <li>• Genjutsu beats Ninjutsu (2x damage)</li>
                </ul>
              </div>
              <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50">
                <p className="font-semibold text-white mb-3 text-lg">Resistances</p>
                <p className="mb-3">Characters can have resistances to specific jutsu types:</p>
                <ul className="space-y-2 ml-4">
                  <li>• <span className="text-yellow-400 font-semibold">Partial Resistance:</span> Reduces damage by 50%</li>
                  <li>• <span className="text-green-400 font-semibold">Full Resistance:</span> Negates all damage (100% reduction)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Status Effects */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">💫</span> Status Effects
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-colors">
                <p className="font-semibold text-green-300 mb-2 text-lg">🛡️ Shield</p>
                <p className="text-slate-400">Reduces incoming damage by 50% for a set number of rounds</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-blue-500/50 transition-colors">
                <p className="font-semibold text-blue-300 mb-2 text-lg">⚡ Stun</p>
                <p className="text-slate-400">Character cannot use jutsus for specified rounds</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-purple-500/50 transition-colors">
                <p className="font-semibold text-purple-300 mb-2 text-lg">☠️ Poison</p>
                <p className="text-slate-400">Takes damage at the start of affected player's turn</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-orange-500/50 transition-colors">
                <p className="font-semibold text-orange-300 mb-2 text-lg">🔥 Burn</p>
                <p className="text-slate-400">Takes fire damage at the start of affected player's turn</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-red-500/50 transition-colors">
                <p className="font-semibold text-red-300 mb-2 text-lg">🩸 Bleed</p>
                <p className="text-slate-400">Takes bleed damage at the start of affected player's turn</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/50 hover:border-green-500/50 transition-colors">
                <p className="font-semibold text-green-300 mb-2 text-lg">↑ Buff</p>
                <p className="text-slate-400">Increases attack power for a set number of rounds</p>
              </div>
            </div>
          </section>

          {/* Passive Abilities */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-pink-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">✨</span> Passive Abilities
            </h2>
            <div className="bg-slate-700/30 p-5 rounded-lg border border-slate-600/50 text-slate-300">
              <p className="mb-3">One character per player has a passive ability that can trigger automatically during the game.</p>
              <p className="mb-3 font-semibold text-white">Passive abilities have:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>A <span className="text-yellow-400 font-semibold">trigger condition</span> (e.g., after using a jutsu, at turn start)</li>
                <li>An <span className="text-yellow-400 font-semibold">activation chance</span> (shown as a percentage)</li>
                <li>A <span className="text-yellow-400 font-semibold">special effect</span> when activated</li>
              </ul>
            </div>
          </section>

          {/* Victory Condition */}
          <section className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
              <span className="text-4xl">🏆</span> Victory Condition
            </h2>
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 p-6 rounded-lg border-2 border-yellow-500/50 text-slate-300">
              <p className="text-2xl font-bold text-yellow-300 mb-3">Win by eliminating all opponent's characters!</p>
              <p className="text-lg">Reduce all 9 of your opponent's character cards to 0 health to achieve victory.</p>
            </div>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 text-center">
          <Link 
            to="/play-game"
            className="inline-block px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-2xl"
          >
            ⚔️ Start Playing Now
          </Link>
        </div>
      </div>
    </div>
  );
}
