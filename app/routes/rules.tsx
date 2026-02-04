import { Link } from 'react-router';

export default function Rules() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/play-game"
          className="inline-block mb-6 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
        >
          ← Back to Game
        </Link>
        
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border-2 border-purple-500">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Naruto Card Game Rules</h1>
          
          {/* Booster Cards Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Booster Cards</h2>
            <ul className="text-slate-300 space-y-3 list-disc list-inside">
              <li>Can be used by clicking on the card and choosing a character they would like to use the card on</li>
              <li>They are one-time use cards that can help a player</li>
              <li>Player can hold only 5 booster cards at once</li>
              <li>If player doesn't have space for another booster card, the game will automatically skip player's move</li>
            </ul>
            
            <div className="mt-4 bg-slate-700 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Booster Card Types:</h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><strong className="text-green-400">Heal</strong> - Heals a chosen character for 25 health points (chance 30%)</li>
                <li><strong className="text-blue-400">Chakra Restore</strong> - Restores 40 chakra to a chosen character (chance 25%)</li>
                <li><strong className="text-yellow-400">Jutsu Recovery</strong> - Cancels cooldown on all jutsus of a chosen character (chance 15%)</li>
                <li><strong className="text-purple-400">Jutsu Mastery</strong> - Chosen character unlocks a special jutsu for 5 rounds (chance 15%)</li>
                <li><strong className="text-red-400">Jutsu Damage Boost</strong> - Increases damage on all jutsus of a chosen character by 20% (chance 5%)</li>
                <li><strong className="text-orange-400">Splash Damage</strong> - Next attack will deal damage to 3 chosen characters at once (chance 5%)</li>
                <li><strong className="text-pink-400">Double Attack</strong> - Allows a player to use 2 jutsus at once from the same character, active for 1 round (chance 5%)</li>
              </ul>
            </div>
          </section>

          {/* Chakra System Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Chakra System</h2>
            <ul className="text-slate-300 space-y-2 list-disc list-inside">
              <li>Chakra replenishes by 3 points per round when 7-8 characters are alive</li>
              <li>Chakra replenishes by 5 points per round when 5-6 characters are alive</li>
              <li>Chakra replenishes by 10 points per round when 3-4 characters are alive</li>
              <li>Chakra replenishes by 15 points per round when 2 characters are alive</li>
              <li>Chakra replenishes by 30 points per round when 1 character is alive</li>
              <li>Chakra stops replenishing at 100</li>
            </ul>
          </section>

          {/* Jutsu System Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Jutsu System</h2>
            <ul className="text-slate-300 space-y-2 list-disc list-inside mb-4">
              <li>Every jutsu has a 2 round cooldown</li>
              <li>2 base jutsus that can be used anytime</li>
              <li>1 special jutsu that can be used only when jutsu mastery card is active on that character</li>
            </ul>

            <div className="bg-slate-700 rounded-lg p-4 mb-4">
              <h3 className="text-xl font-semibold text-white mb-3">Attack Type Advantages:</h3>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><strong className="text-blue-400">Ninjutsu</strong> deals 10% more damage to <strong className="text-red-400">Taijutsu</strong> characters</li>
                <li><strong className="text-blue-400">Ninjutsu</strong> deals 10% less damage to <strong className="text-purple-400">Genjutsu</strong> characters</li>
                <li><strong className="text-red-400">Taijutsu</strong> deals 10% more damage to <strong className="text-purple-400">Genjutsu</strong> characters</li>
                <li><strong className="text-red-400">Taijutsu</strong> deals 10% less damage to <strong className="text-blue-400">Ninjutsu</strong> characters</li>
                <li><strong className="text-purple-400">Genjutsu</strong> deals 10% more damage to <strong className="text-blue-400">Ninjutsu</strong> characters</li>
                <li><strong className="text-purple-400">Genjutsu</strong> deals 10% less damage to <strong className="text-red-400">Taijutsu</strong> characters</li>
              </ul>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-xl font-semibold text-white mb-3">Jutsu Effects:</h3>
              <p className="text-slate-300 text-sm mb-3">Some effects will be used automatically when chosen (shield, damage suppress, buff), but some jutsus need a character to be chosen (heal, poison/burn/bleed, stun, chakra drain):</p>
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><strong>Heal</strong> - Heals a chosen character for a certain amount</li>
                <li><strong>Buff</strong> - Increases character's attack power for a certain amount of rounds</li>
                <li><strong>Shield</strong> - When active, it cancels all of opponent's attacks</li>
                <li><strong>Damage Suppress</strong> - When active, it decreases power of opponent's attacks</li>
                <li><strong>Poison/Burn/Bleed</strong> - Damages a character across multiple rounds</li>
                <li><strong>Stun</strong> - Disables the use of a character for certain amount of rounds</li>
                <li><strong>Chakra Drain</strong> - Deletes a certain amount of chakra from enemy character</li>
              </ul>
            </div>
          </section>

          {/* Passive Abilities Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Passive Abilities</h2>
            <p className="text-slate-300 mb-4">These characters have a passive ability that will be used automatically:</p>
            
            <div className="bg-slate-700 rounded-lg p-4">
              <ul className="text-slate-300 space-y-2 text-sm">
                <li><strong className="text-yellow-400">Tsunade</strong> - 20% chance she heals all of the player's cards after using a jutsu</li>
                <li><strong className="text-yellow-400">Minato</strong> - 25% chance he can dodge taijutsu or ninjutsu attack using Flying Raijin</li>
                <li><strong className="text-yellow-400">Hinata</strong> - 50% chance she can dodge a taijutsu attack using Byakugan</li>
                <li><strong className="text-yellow-400">Neji</strong> - 50% chance he can dodge a taijutsu attack using Byakugan</li>
                <li><strong className="text-yellow-400">Shino</strong> - 20% chance his poison attack lasts 1 round longer after using poison type jutsu</li>
                <li><strong className="text-yellow-400">Sasuke</strong> - 20% chance after using Kirin that he will dodge the next attack using Rinnegan</li>
                <li><strong className="text-yellow-400">Kaguya</strong> - 10% chance her attack will hit all alive enemy characters after using a jutsu</li>
                <li><strong className="text-yellow-400">Naruto</strong> - 20% chance he will use Talk No Jutsu damaging the character for 20 damage after being under attack</li>
                <li><strong className="text-yellow-400">Hagoromo</strong> - 20% chance after using Creation of All Things he will do 20 damage more</li>
              </ul>
            </div>
          </section>

          {/* Gameplay Section */}
          <section>
            <h2 className="text-2xl font-bold text-purple-400 mb-4">Gameplay</h2>
            <ol className="text-slate-300 space-y-3 list-decimal list-inside">
              <li>A coin is tossed to choose which player goes first</li>
              <li>Players get 8 random cards from database, 1 of the characters has to be a character with passive ability</li>
              <li>Players enter the game and first thing they do is take the booster card</li>
              <li>Once they've taken the card they can use it right away on likely character or save it for later
                <ul className="ml-8 mt-2 list-disc list-inside">
                  <li>Player can skip turn by clicking on skip turn button</li>
                </ul>
              </li>
              <li>Next they use jutsu by clicking on any character, their jutsus will pop up in a box with all 3 jutsu stacked below each other and player can choose what jutsu they want to use. Then player chooses own/enemy character the jutsu will be used on, it depends on the type of jutsu</li>
              <li>Once the player has used jutsu, it's player 2's turn</li>
            </ol>
            
            <div className="mt-4 bg-red-900 bg-opacity-30 border-2 border-red-500 rounded-lg p-4">
              <p className="text-white font-semibold">Game ends when one of the players has no cards alive!</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
