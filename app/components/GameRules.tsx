import { useState } from 'react';

export function GameRules({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)}>
          {triggerButton}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-semibold"
        >
          📖 View Game Rules →
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 flex justify-between items-center">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                📖 Naruto Card Game - Rules
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 text-slate-700 dark:text-slate-300 text-left">
              {/* Game Flow */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">🎮 Priebeh hry</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Coinflipom sa rozhodne kto bude mat prvy tah</li>
                  <li>Kazdy hrac dostane 8 nahodnych kariet z databaze
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>jedna z kariet bude karta s Pasivnym utokom</li>
                    </ul>
                  </li>
                  <li>Tah zacina tym ze si hrac potiahne 1 booster z balicku
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>maximalny pocet booster kariet je 5</li>
                    </ul>
                  </li>
                  <li>Po zobrati booster karty ju moze hrac aktivovat alebo priamo pouzivat jutsu</li>
                  <li>Postup pouzivania jutsu:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>hrac klikne na postavu</li>
                      <li>vyberie ake jutsu chce pouzit</li>
                      <li>pokial vybere:
                        <ul className="list-none ml-6 mt-1">
                          <li>= heal, shield, buff - bude abilita pouzita na postavu seba samu alebo hracovu vybranu postavu</li>
                          <li>= poison, stun, chakra drain, nin/gen/tai-jutsu - bude abilita pouzita na vybranu kartu protihraca</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>Po pouziti jutsu sa konci tah hraca</li>
                  <li>Hra sa pokym niekto z hracov nema ziadne karty</li>
                </ol>
              </section>

              {/* Booster Cards */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">🎴 Booster karty</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Booster karta sa vzdy berie iba</li>
                  <li>Maximalny pocet booster kariet je 5</li>
                  <li>Vsetky booster karty su jednorazove a hned po pouziti sa smažú</li>
                  <li>Typy booster kariet:
                    <ul className="list-none ml-6 mt-2 space-y-1">
                      <li>= <span className="font-semibold">Heal:</span> Prida vybranej postave 15 health pointov (sanca 25%)</li>
                      <li>= <span className="font-semibold">Chakra Restore:</span> Doplni vybranej postave 20 chakry (sanca 20%)</li>
                      <li>= <span className="font-semibold">Jutsu Mastery:</span> Vybrana postava unlockne na 5 kol specialne Jutsu (sanca 15%)</li>
                      <li>= <span className="font-semibold">Jutsu Damage Boost:</span> Zvysi damage vybranej postave o 20% (sanca 10%)</li>
                      <li>= <span className="font-semibold">Splash Damage:</span> Umoznuje zautocit 1 utokom na 3 vybranych charakterov (sanca 10%)</li>
                      <li>= <span className="font-semibold">Jutsu recovery:</span> Zrusi cooldown vybraneho jutsu (sanca 10%)</li>
                      <li>= <span className="font-semibold">Double Attack:</span> Umoznuje hracovi pouzit 2 jutsu za 1 kolo (sanca 5%)</li>
                      <li>= <span className="font-semibold">Shield Pierce:</span> Umoznuje zautocit na vybranu kartu protihraca aj ked ma aktivny shield (sanca 5%)</li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* Chakra System */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">💙 Chakra system</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Na pouzitie nejakeho jutsu potrebuje hrac dany pocet chakry</li>
                  <li>Zakladne ma kazda postava 100 chakry</li>
                  <li>Doplnuje sa po 10 pointoch pred kazdym tahom hraca</li>
                  <li>Maximálny počet chakry je 100, ale použitím karty Chakra Restore sa dá doplniť aj nad 100</li>
                </ul>
              </section>

              {/* Jutsu System */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">⚡ Jutsu system</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Kazda postava ma 2 zakladne jutsu a 1 specialne jutsu ktora sa da odomknut pouzitim karty Jutsu Mastery</li>
                  <li>Kazde jutsu ma cooldown 2 kola</li>
                  <li>Su 3 typy jutsu:
                    <ul className="list-none ml-6 mt-2 space-y-1">
                      <li>= <span className="font-semibold">Ninjutsu</span>
                        <ul className="list-disc ml-6">
                          <li>Je silnejsie oproti Taijutsu</li>
                          <li>Je slabsie oproti genjutsu</li>
                        </ul>
                      </li>
                      <li>= <span className="font-semibold">Taijutsu</span>
                        <ul className="list-disc ml-6">
                          <li>Je silnejsie oproti Genjutsu</li>
                          <li>Je slabsie oproti Ninjutsu</li>
                        </ul>
                      </li>
                      <li>= <span className="font-semibold">Genjutsu</span>
                        <ul className="list-disc ml-6">
                          <li>Je silnejsie oproti Ninjutsu</li>
                          <li>Je slabsie oproti Taijutsu</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                  <li>Su 2 typy efektov pre jutsu:
                    <ul className="list-none ml-6 mt-2 space-y-1">
                      <li>= <span className="font-semibold">Jutsu pouzite na postavy hraca:</span>
                        <ul className="list-disc ml-6 mt-1">
                          <li><span className="font-semibold">Heal:</span> Prida zivoty postave zvolenej hracom</li>
                          <li><span className="font-semibold">Buff:</span> Zlepsuje utoky vsetkych postav hraca na urcity pocet kol</li>
                          <li><span className="font-semibold">Shields:</span>
                            <ul className="list-none ml-6">
                              <li>&gt; <span className="font-semibold">Normal Shield:</span> Dava postave nerozbitny stit ktory blokuje vsetko poskodenie na urcity pocet kol</li>
                              <li>&gt; <span className="font-semibold">Piercing Shield:</span> Dava postave stit ktory blokuje iba urcenu hodnotu poskodenia na urcity pocet kol</li>
                            </ul>
                          </li>
                        </ul>
                      </li>
                      <li>= <span className="font-semibold">Jutsu pouzite na postavy protihraca:</span>
                        <ul className="list-disc ml-6 mt-1">
                          <li><span className="font-semibold">Poison/Burn/Bleed:</span> Ubera urceny pocet zivotov vybranej postave na urcity pocet kol</li>
                          <li><span className="font-semibold">Stun:</span> Zamrazuje vybranu postavu na urcity pocet kol</li>
                          <li><span className="font-semibold">Chakra Drain:</span> Zoberie protihracovi dany pocet chakry</li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>
              </section>

              {/* Passive Abilities */}
              <section>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-3">🌟 Pasivne utoky</h3>
                <p className="mb-4 text-slate-600 dark:text-slate-400">Tieto postavy majú tzv. pasívne útoky. Tie netreba nijako aktivovať, lebo sa aktivujú automaticky</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><span className="font-semibold">Danzō Shimura</span> → ked zomre tak sa moze revivnut, ale musi to byt v tom kole co zomrel</li>
                  <li><span className="font-semibold">Tsunade Senju</span> → pri pouziti jutsu je 25% sanca ze prida 10 zivotov kazdej postave hraca</li>
                  <li><span className="font-semibold">Minato Namikaze</span> → pokial je pod utokom protihraca je 25% sanca ze sa mu mu vyhne pomocou Flying Raijin</li>
                  <li><span className="font-semibold">Hinata Hyūga</span> → pri taijutsu útoku má 50 % šancu, že dostane iba polovicu damage</li>
                  <li><span className="font-semibold">Shino Aburame</span> → pokial pouzije poison utok, je 25% sanca ze poison bude trva 1 kolo dlhsie</li>
                  <li><span className="font-semibold">Sasuke Uchiha</span> → po použití jutsu Kirin má 20 % šancu aktivovať teleport cez Rinnegan a vyhnúť sa nasledujúcemu útoku protihráča</li>
                  <li><span className="font-semibold">Kaguya Otsutsuki</span> → pokial je pod utokom protihraca 3-krat, jej regenerácia chakry sa zvýši z 10 na 20 bodov za kolo</li>

                </ul>
              </section>
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Close Rules
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
