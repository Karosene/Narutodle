import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { CharacterCardComponent } from '~/components/CharacterCard';
import type { CharacterCard, AttributeBoosterCard, CharacterJutsuData, Jutsu, StatusEffect, PassiveAbility } from '~/types/tcg';
import { boosterDeck } from '~/data/boosters';

interface Character {
  name: string;
  file: string;
  gender?: string;
  clan?: string;
  rank?: string;
  affiliations?: string[];
  natureAffinity?: string[];
}

interface Player {
  name: string;
  hand: CharacterCard[];
}

export default function PlayGame() {
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [attackTypes, setAttackTypes] = useState<Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>>({});
  const [jutsuData, setJutsuData] = useState<Record<string, CharacterJutsuData>>({});
  const [passiveAbilities, setPassiveAbilities] = useState<Record<string, PassiveAbility>>({});
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<[Player, Player]>([
    { name: 'Player 1', hand: [] },
    { name: 'Player 2', hand: [] }
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<0 | 1>(0);
  const [showNumberGuess, setShowNumberGuess] = useState(false);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [player1Guess, setPlayer1Guess] = useState<string>('');
  const [player2Guess, setPlayer2Guess] = useState<string>('');
  const [gameResult, setGameResult] = useState<string>('');
  const [pendingPlayers, setPendingPlayers] = useState<[Player, Player] | null>(null);
  const [currentBooster, setCurrentBooster] = useState<AttributeBoosterCard | null>(null);
  const [boosterHands, setBoosterHands] = useState<[AttributeBoosterCard[], AttributeBoosterCard[]]>([[], []]);
  const [selectedBooster, setSelectedBooster] = useState<{booster: AttributeBoosterCard, index: number} | null>(null);
  const [selectingTarget, setSelectingTarget] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [showJutsuSelector, setShowJutsuSelector] = useState(false);
  const [selectedJutsu, setSelectedJutsu] = useState<Jutsu | null>(null);
  const [selectingJutsuTarget, setSelectingJutsuTarget] = useState(false);
  const [showPassiveTab, setShowPassiveTab] = useState(false);
  const [jutsusUsedThisTurn, setJutsusUsedThisTurn] = useState(0);
  const [newlyDrawnCard, setNewlyDrawnCard] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [doubleAttackCharacter, setDoubleAttackCharacter] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [splashTargets, setSplashTargets] = useState<Array<{playerIndex: 0 | 1, cardIndex: number}>>([]);
  const [isSelectingSplashTargets, setIsSelectingSplashTargets] = useState(false);
  const [healedCard, setHealedCard] = useState<{playerIndex: 0 | 1, cardIndex: number} | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [guessAttempts, setGuessAttempts] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch('/attackTypes.json').then(res => res.json()),
      fetch('/characters.json').then(res => res.json()),
      fetch('/jutsusData.json').then(res => res.json()),
      fetch('/passiveAbilities.json').then(res => res.json())
    ])
      .then(([attackTypesData, charactersData, jutsusDataArray, passiveAbilitiesArray]: [Record<string, 'taijutsu' | 'ninjutsu' | 'genjutsu'>, Character[], CharacterJutsuData[], PassiveAbility[]]) => {
        setAttackTypes(attackTypesData);
        setAllCharacters(charactersData);
        
        // Convert jutsu array to object indexed by character name
        const jutsuMap: Record<string, CharacterJutsuData> = {};
        jutsusDataArray.forEach(charJutsu => {
          jutsuMap[charJutsu.name] = charJutsu;
        });
        setJutsuData(jutsuMap);
        
        // Convert passive abilities array to object indexed by character name
        const passiveMap: Record<string, PassiveAbility> = {};
        passiveAbilitiesArray.forEach(passive => {
          passiveMap[passive.characterName] = passive;
        });
        setPassiveAbilities(passiveMap);
        
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, []);

  const convertToCard = (char: Character, index: number): CharacterCard => {
    const clanName = char.clan && char.clan !== 'None' ? char.clan : undefined;
    
    // Get attack type from attackTypes.json, default to taijutsu if not found
    const attackType = attackTypes[char.name] || 'taijutsu';
    
    const card: CharacterCard = {
      id: `char-${index}`,
      name: char.name,
      clan: clanName,
      currentHealth: 100,
      currentChakra: 100,
      currentForm: 'default' as const,
      forms: {
        default: {
          name: 'Base Form',
          health: 100,
          maxChakra: 100,
          power: 50,
          attackType,
          resistances: {
            taijutsu: 'none',
            ninjutsu: 'none',
            genjutsu: 'none'
          },
          imageUrl: char.file
        }
      },
      boosters: []
    };
    
    // Add passive ability if character has one
    if (passiveAbilities[char.name]) {
      card.passiveAbility = passiveAbilities[char.name];
    }
    
    return card;
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const startGame = () => {
    // Filter characters to only include those in attackTypes.json (with complete jutsu data)
    const validCharacters = allCharacters.filter(char => attackTypes[char.name]);
    
    if (validCharacters.length < 18) {
      alert(`Not enough characters with complete jutsu data! Found ${validCharacters.length}, need 18.`);
      return;
    }

    // Separate characters by type
    const charactersWithPassive = validCharacters.filter(char => passiveAbilities[char.name]);
    
    // Find healers - characters with heal jutsu BUT WITHOUT passive abilities
    const healers = validCharacters.filter(char => {
      const charJutsu = jutsuData[char.name];
      if (!charJutsu) return false;
      const hasHealJutsu = charJutsu.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
      const hasPassive = passiveAbilities[char.name];
      return hasHealJutsu && !hasPassive; // Must have heal jutsu but NO passive ability
    });
    
    // Normal characters - no passive ability AND no heal jutsu
    const normalChars = validCharacters.filter(char => {
      const charJutsu = jutsuData[char.name];
      const hasPassive = passiveAbilities[char.name];
      const hasHealJutsu = charJutsu?.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
      return !hasPassive && !hasHealJutsu;
    });
    
    if (charactersWithPassive.length < 2) {
      alert('Not enough characters with passive abilities!');
      return;
    }
    
    if (healers.length < 4) {
      alert(`Not enough healer characters without passive abilities! Found ${healers.length}, need 4.`);
      return;
    }
    
    if (normalChars.length < 12) {
      alert(`Not enough normal characters! Found ${normalChars.length}, need 12.`);
      return;
    }

    // Shuffle and select
    const shuffledPassive = shuffleArray(charactersWithPassive);
    const shuffledHealers = shuffleArray(healers);
    const shuffledNormal = shuffleArray(normalChars);
    
    // Build player hands: 1 passive + 2 healers + 6 normal = 9 cards each
    const player1Chars = [
      shuffledPassive[0],      // 1 passive
      shuffledHealers[0],      // healer 1
      shuffledHealers[1],      // healer 2
      ...shuffledNormal.slice(0, 6)  // 6 normal
    ];
    
    const player2Chars = [
      shuffledPassive[1],      // 1 passive
      shuffledHealers[2],      // healer 1
      shuffledHealers[3],      // healer 2
      ...shuffledNormal.slice(6, 12)  // 6 normal
    ];
    
    // Validation
    if (player1Chars.length !== 9) {
      alert(`Error: Player 1 has ${player1Chars.length} cards instead of 9!`);
      return;
    }
    
    if (player2Chars.length !== 9) {
      alert(`Error: Player 2 has ${player2Chars.length} cards instead of 9!`);
      return;
    }
    
    if (player1Chars.some(c => !c)) {
      alert('Error: Player 1 has undefined characters!');
      return;
    }
    
    if (player2Chars.some(c => !c)) {
      alert('Error: Player 2 has undefined characters!');
      return;
    }
    
    const player1Hand = player1Chars.map((char, index) => convertToCard(char, index));
    const player2Hand = player2Chars.map((char, index) => convertToCard(char, index + 9));

    // Store the players and start the number guessing game
    setPendingPlayers([
      { name: 'Player 1', hand: player1Hand },
      { name: 'Player 2', hand: player2Hand }
    ]);
    
    // Generate random number between 0 and 50
    const randomNum = Math.floor(Math.random() * 51);
    setTargetNumber(randomNum);
    setShowNumberGuess(true);
    setPlayer1Guess('');
    setPlayer2Guess('');
    setGameResult('');
  };

  const handleGuessSubmit = async () => {
    const guess1 = parseInt(player1Guess);
    const guess2 = parseInt(player2Guess);

    if (isNaN(guess1) || isNaN(guess2)) {
      alert('Both players must enter valid numbers!');
      return;
    }

    if (guess1 < 0 || guess1 > 50 || guess2 < 0 || guess2 > 50) {
      alert('Guesses must be between 0 and 50!');
      return;
    }

    const newGuessAttempts = guessAttempts + 1;
    setGuessAttempts(newGuessAttempts);

    if (newGuessAttempts === 25) {
      // Save data to the database
      try {
        await fetch('/api/save-game-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guessCount: 25,
            gamesPlayed: 1,
          }),
        });
        alert('Game over! Maximum attempts reached. Data saved.');
      } catch (error) {
        console.error('Failed to save game data:', error);
        alert('Failed to save game data.');
      }

      // Reset the game
      setShowNumberGuess(false);
      setGameResult('');
      setGuessAttempts(0);
      return;
    }

    const distance1 = Math.abs(targetNumber - guess1);
    const distance2 = Math.abs(targetNumber - guess2);

    if (distance1 === distance2) {
      // Tie - generate new number and try again
      const newRandomNum = Math.floor(Math.random() * 51);
      setTargetNumber(newRandomNum);
      setPlayer1Guess('');
      setPlayer2Guess('');
      setGameResult(`🔁 Tie! Both were ${distance1} away. New number generated - guess again!`);
    } else {
      // Determine winner
      const winner: 0 | 1 = distance1 < distance2 ? 0 : 1;
      const winnerName = winner === 0 ? 'Player 1' : 'Player 2';

      setGameResult(`🎯 ${winnerName} was closer and goes first!`);

      // Start the game after showing result
      setTimeout(() => {
        if (pendingPlayers) {
          setPlayers(pendingPlayers);
          setCurrentPlayerIndex(winner);
          setGameStarted(true);
          setShowNumberGuess(false);

          // Auto-draw first booster card only for the player whose turn it is
          setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * boosterDeck.length);
            const booster = boosterDeck[randomIndex];

            const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [[], []];
            newHands[winner] = [booster];
            setBoosterHands(newHands);

            // Show animation for the card
            setNewlyDrawnCard({ playerIndex: winner, cardIndex: 0 });
            setTimeout(() => setNewlyDrawnCard(null), 1500);
          }, 500);
        }
      }, 3000);
    }
  };

  const resetGame = () => {
    setShowResetConfirm(true);
  };

  const confirmResetGame = () => {
    setGameStarted(false);
    setPlayers([
      { name: 'Player 1', hand: [] },
      { name: 'Player 2', hand: [] }
    ]);
    setShowNumberGuess(false);
    setGameResult('');
    setCurrentBooster(null);
    setBoosterHands([[], []]);
    setSelectedBooster(null);
    setSelectingTarget(false);
    setShowResetConfirm(false);
  };

  const applyBoosterToCharacter = (characterIndex: number) => {
    if (!selectedBooster) return;
    
    const { booster, index: boosterIndex } = selectedBooster;
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const targetCard = newPlayers[currentPlayerIndex].hand[characterIndex];
    
    // Apply effects based on booster type
    switch (booster.type) {
      case 'health':
        const maxHealth = targetCard.forms[targetCard.currentForm]?.health || 100;
        targetCard.currentHealth = Math.min(
          targetCard.currentHealth + (booster.effect.healthBoost || 0),
          maxHealth
        );
        break;
        
      case 'chakra':
        // Chakra Restore - cap at 100
        targetCard.currentChakra = Math.min(
          targetCard.currentChakra + (booster.effect.chakraBoost || 0),
          100
        );
        break;
        
      case 'jutsu_recovery':
        // Reset all jutsu cooldowns
        if (booster.effect.resetCooldowns && targetCard.jutsuCooldowns) {
          targetCard.jutsuCooldowns = {};
        }
        break;
        
      case 'jutsu_mastery':
        // Unlock special jutsu for specified rounds
        if (booster.effect.unlockSpecialJutsu && booster.effect.duration) {
          targetCard.jutsuMasteryRoundsLeft = booster.effect.duration;
          targetCard.boosters.push(booster);
        }
        break;
        
      case 'damage_boost':
        // Activate damage boost
        if (booster.effect.damageBoostPercent) {
          targetCard.damageBoostActive = true;
          targetCard.boosters.push(booster);
        }
        break;
        
      case 'splash_damage':
        // Activate splash damage (allows hitting 3 targets with one jutsu)
        targetCard.splashDamageActive = true;
        targetCard.boosters.push(booster);
        break;
        
      case 'double_attack':
        // For double attack, mark it on the card with 1 round duration
        targetCard.boosters.push(booster);
        targetCard.doubleAttackRoundsLeft = 1;
        break;
    }
    
    // Remove booster from hand
    const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [...boosterHands] as [AttributeBoosterCard[], AttributeBoosterCard[]];
    newHands[currentPlayerIndex] = newHands[currentPlayerIndex].filter((_, i) => i !== boosterIndex);
    setBoosterHands(newHands);
    
    setPlayers(newPlayers);
    setSelectedBooster(null);
    setSelectingTarget(false);
  };

  const handleBoosterClick = (booster: AttributeBoosterCard, index: number) => {
    setSelectedBooster({ booster, index });
    setSelectingTarget(true);
  };

  const canApplyBooster = (booster: AttributeBoosterCard, targetCard: CharacterCard): boolean => {
    switch (booster.type) {
      case 'health':
        const maxHealth = targetCard.forms[targetCard.currentForm]?.health || 100;
        return targetCard.currentHealth < maxHealth;
      
      case 'chakra':
        return targetCard.currentChakra < 100;
      
      case 'jutsu_recovery':
         return !!(targetCard.jutsuCooldowns && Object.keys(targetCard.jutsuCooldowns).length > 0);
      
      case 'jutsu_mastery':
        // Can apply if not already active
        return !targetCard.jutsuMasteryRoundsLeft || targetCard.jutsuMasteryRoundsLeft === 0;
      
      case 'damage_boost':
        // Can apply if not already active
        return !targetCard.damageBoostActive;
      
      case 'splash_damage':
      case 'double_attack':
        // Can apply if character doesn't already have this booster
        return !targetCard.boosters?.some(b => b.type === booster.type);
      
      default:
        return true;
    }
  };

  const regenerateChakra = () => {
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    
    // Regenerate chakra for all characters of both players
    newPlayers.forEach(player => {
      const aliveCount = player.hand.filter(card => card.currentHealth > 0).length;
      let regenAmount = 3; // default for 7-8 characters
      
      if (aliveCount >= 7) regenAmount = 3;
      else if (aliveCount >= 5) regenAmount = 5;
      else if (aliveCount >= 3) regenAmount = 10;
      else if (aliveCount === 2) regenAmount = 15;
      else if (aliveCount === 1) regenAmount = 30;
      
      player.hand.forEach(card => {
        // Regenerate chakra but cap at 100 (natural regen doesn't overflow)
        if (card.currentChakra < 100) {
          card.currentChakra = Math.min(card.currentChakra + regenAmount, 100);
        }
        // If chakra is above 100 (shouldn't happen with new logic), don't regenerate
      });
    });
    
    setPlayers(newPlayers);
  };

  const endTurn = () => {
    // Clear any in-progress jutsu selection when skipping/ending turn
    setSelectingJutsuTarget(false);
    setSelectedJutsu(null);
    setSelectedCharacter(null);
    setShowJutsuSelector(false);
    setIsSelectingSplashTargets(false);
    setSplashTargets([]);
    setShowPassiveTab(false);

    // Regenerate chakra for all characters
    regenerateChakra();
    
    // Process status effects and decrement cooldowns
    processStatusEffects();
    decrementCooldowns();
    
    // Reset jutsu counter for new turn
    setJutsusUsedThisTurn(0);
    setDoubleAttackCharacter(null);
    
    // Switch to next player
    const nextPlayer = currentPlayerIndex === 0 ? 1 : 0;
    setCurrentPlayerIndex(nextPlayer);
    
    // Auto-draw booster card for next player at start of their turn
    setTimeout(() => {
      const nextPlayerHand = boosterHands[nextPlayer];
      if (nextPlayerHand.length < 5) {
        const randomIndex = Math.floor(Math.random() * boosterDeck.length);
        const drawnBooster = boosterDeck[randomIndex];
        
        const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [...boosterHands] as [AttributeBoosterCard[], AttributeBoosterCard[]];
        newHands[nextPlayer] = [...nextPlayerHand, drawnBooster];
        setBoosterHands(newHands);
        setCurrentBooster(drawnBooster);
        
        // Trigger animation for newly drawn card
        setNewlyDrawnCard({playerIndex: nextPlayer, cardIndex: newHands[nextPlayer].length - 1});
        setTimeout(() => setNewlyDrawnCard(null), 1500);
      }
    }, 100);
  };

  const processStatusEffects = () => {
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    
    newPlayers.forEach((player, playerIndex) => {
      player.hand.forEach(card => {
        if (!card.statusEffects) card.statusEffects = [];
        
        // Process status effects only on affected player's own turn
        if (playerIndex === currentPlayerIndex) {
          card.statusEffects = card.statusEffects.filter(effect => {
            switch (effect.type) {
              case 'poison':
              case 'burn':
              case 'bleed':
                // Apply damage on affected player's turn
                card.currentHealth = Math.max(0, card.currentHealth - (effect.value || 0));
                break;
            }
            
            // Decrement duration
            effect.duration--;
            return effect.duration > 0;
          });
        }
        
        // Decrement buffs/shields/stuns/mastery only on the card owner's turn
        if (playerIndex === currentPlayerIndex) {
          // Decrement buff rounds
          if (card.buffRoundsLeft && card.buffRoundsLeft > 0) {
            card.buffRoundsLeft--;
            if (card.buffRoundsLeft === 0) {
              card.buffPowerIncrease = 0;
            }
          }
          
          // Decrement jutsu mastery rounds
          if (card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0) {
            card.jutsuMasteryRoundsLeft--;
            if (card.jutsuMasteryRoundsLeft === 0) {
              card.boosters = card.boosters?.filter(b => b.type !== 'jutsu_mastery') || [];
            }
          }
          
          // Decrement stun rounds
          if (card.stunRoundsLeft && card.stunRoundsLeft > 0) {
            card.stunRoundsLeft--;
          }
          
          // Decrement shield rounds
          if (card.shieldRoundsLeft && card.shieldRoundsLeft > 0) {
            card.shieldRoundsLeft--;
          }
          
          // Decrement double attack rounds (expires on their own turn)
          if (card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0) {
            card.doubleAttackRoundsLeft--;
            if (card.doubleAttackRoundsLeft === 0) {
              card.boosters = card.boosters?.filter(b => b.type !== 'double_attack') || [];
            }
          }
          
          // Reset damage suppress after one turn
          if (card.damageSuppressActive) {
            card.damageSuppressActive = false;
            card.damageSuppressAmount = 0;
          }
        }
      });
    });
    
    setPlayers(newPlayers);
  };

  const decrementCooldowns = () => {
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    
    // Only decrement cooldowns for the current player (whose turn is ending)
    newPlayers[currentPlayerIndex].hand.forEach(card => {
      if (!card.jutsuCooldowns) card.jutsuCooldowns = {};
      
      Object.keys(card.jutsuCooldowns).forEach(jutsuName => {
        if (card.jutsuCooldowns![jutsuName] > 0) {
          card.jutsuCooldowns![jutsuName]--;
        }
      });
    });
    
    setPlayers(newPlayers);
  };

  const calculateTypeAdvantage = (attackerType: 'taijutsu' | 'ninjutsu' | 'genjutsu', defenderType: 'taijutsu' | 'ninjutsu' | 'genjutsu'): number => {
    if (attackerType === 'ninjutsu') {
      if (defenderType === 'taijutsu') return 1.1; // +10%
      if (defenderType === 'genjutsu') return 0.9; // -10%
    } else if (attackerType === 'taijutsu') {
      if (defenderType === 'genjutsu' || defenderType === 'ninjutsu') return 1.1; // +10%
    } else if (attackerType === 'genjutsu') {
      if (defenderType === 'ninjutsu' || defenderType === 'taijutsu') return 1.1; // +10%
    }
    return 1.0; // No advantage
  };

  const handleCharacterClick = (playerIndex: 0 | 1, cardIndex: number) => {
    // If selecting booster target
    if (selectingTarget && currentPlayerIndex === playerIndex && selectedBooster) {
      const targetCard = players[playerIndex].hand[cardIndex];
      
      // Check if booster can be applied
      if (!canApplyBooster(selectedBooster.booster, targetCard)) {
        let message = '';
        switch (selectedBooster.booster.type) {
          case 'health':
            message = `${targetCard.name} already has full health!`;
            break;
          case 'chakra':
            message = `${targetCard.name} already has full chakra!`;
            break;
          case 'jutsu_recovery':
            message = `${targetCard.name} has no cooldowns to reset!`;
            break;
          case 'jutsu_mastery':
            message = `${targetCard.name} already has Jutsu Mastery active!`;
            break;
          case 'damage_boost':
            message = `${targetCard.name} already has Damage Boost active!`;
            break;
          case 'splash_damage':
            message = `${targetCard.name} already has Splash Damage!`;
            break;
          case 'double_attack':
            message = `${targetCard.name} already has Double Attack!`;
            break;
        }
        alert(message);
        return;
      }
      
      applyBoosterToCharacter(cardIndex);
      return;
    }
    
    // If selecting jutsu target
    if (selectingJutsuTarget && selectedJutsu && selectedCharacter) {
      // Validate target based on jutsu
      // If jutsu has damage, it always targets enemies (even if it also has a self-buff effect)
      if (selectedJutsu.damage) {
        const enemyPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        if (playerIndex !== enemyPlayerIndex) {
          alert('Damage jutsus must target enemy characters!');
          return;
        }
      }
      // Only check effect targeting if there's no damage component
      else if (selectedJutsu.effect) {
        const isHealEffect = selectedJutsu.effect.type === 'heal';
        const isSelfOrAllyTarget = selectedJutsu.effect.target === 'self' || selectedJutsu.effect.target === 'ally' || selectedJutsu.effect.target === 'all_allies';
        const isOpponentTarget = selectedJutsu.effect.target === 'opponent' || selectedJutsu.effect.target === 'all_opponents';
        
        // For heal effects or ally-targeted effects, only allow same player's characters
        if (isHealEffect || isSelfOrAllyTarget) {
          if (playerIndex !== currentPlayerIndex) {
            alert('This jutsu can only be used on your own characters!');
            return;
          }
        }
        
        // For opponent-targeted effects, only allow opponent's characters
        if (isOpponentTarget) {
          if (playerIndex === currentPlayerIndex) {
            alert('This jutsu can only be used on opponent characters!');
            return;
          }
        }
      }
      
      // Handle splash damage multi-target selection
      if (isSelectingSplashTargets) {
        const enemyPlayerIndex = currentPlayerIndex === 0 ? 1 : 0;
        if (playerIndex !== enemyPlayerIndex) {
          alert('Splash damage can only target enemy characters!');
          return;
        }
        
        // Check if target already selected
        const alreadySelected = splashTargets.some(
          t => t.playerIndex === playerIndex && t.cardIndex === cardIndex
        );
        
        if (alreadySelected) {
          // Remove from selection
          setSplashTargets(splashTargets.filter(
            t => !(t.playerIndex === playerIndex && t.cardIndex === cardIndex)
          ));
        } else if (splashTargets.length < 3) {
          // Add to selection (max 3 targets)
          setSplashTargets([...splashTargets, {playerIndex, cardIndex}]);
        }
        return;
      }
      
      useJutsuOnTarget(playerIndex, cardIndex);
      return;
    }
    
    // If it's current player's turn and clicking their own character to select jutsu
    if (currentPlayerIndex === playerIndex && !selectingTarget && !selectingJutsuTarget) {
      // If double attack is active, only allow the same character to be selected
      if (doubleAttackCharacter && (doubleAttackCharacter.playerIndex !== playerIndex || doubleAttackCharacter.cardIndex !== cardIndex)) {
        alert('Double Attack is active! You must use the second jutsu from the same character.');
        return;
      }
      
      const card = players[playerIndex].hand[cardIndex];
      
      // Check if character is defeated
      if (card.currentHealth === 0) {
        alert(`${card.name} is defeated and cannot use jutsus!`);
        return;
      }
      
      // Check if character is stunned
      if (card.stunRoundsLeft && card.stunRoundsLeft > 0) {
        alert(`${card.name} is stunned and cannot use jutsus for ${card.stunRoundsLeft} more round(s)!`);
        return;
      }
      
      setSelectedCharacter({ playerIndex, cardIndex });
      setShowJutsuSelector(true);
    }
  };

  const handleJutsuSelect = (jutsu: Jutsu) => {
    if (!selectedCharacter) return;
    
    const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    // Check cooldown
    if (!card.jutsuCooldowns) card.jutsuCooldowns = {};
    if (card.jutsuCooldowns[jutsu.name] && card.jutsuCooldowns[jutsu.name] > 0) {
      alert(`${jutsu.name} is on cooldown for ${card.jutsuCooldowns[jutsu.name]} more round(s)!`);
      return;
    }
    
    // Check chakra
    if (card.currentChakra < jutsu.chakraCost) {
      alert(`Not enough chakra! Need ${jutsu.chakraCost}, have ${card.currentChakra}`);
      return;
    }
    
    setSelectedJutsu(jutsu);
    
    // Check if jutsu needs target selection
    // Jutsus with damage always need target selection (even if they also have self-buff)
    // Some effects also need target selection
    const needsTargetSelection = jutsu.damage || 
      (jutsu.effect && ['heal', 'poison', 'burn', 'bleed', 'stun', 'chakra_drain'].includes(jutsu.effect.type));
    
    if (needsTargetSelection) {
      // Check if caster has splash damage active
      if (!selectedCharacter) return;
      const caster = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
      if (caster.splashDamageActive && jutsu.damage) {
        setIsSelectingSplashTargets(true);
        setSplashTargets([]);
      }
      setSelectingJutsuTarget(true);
      setShowJutsuSelector(false);
    } else {
      // Auto-apply effects like shield, buff, damage_suppress (on self)
      useJutsuAutomatic();
    }
  };

  const useJutsuAutomatic = () => {
    if (!selectedCharacter || !selectedJutsu) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    // Deduct chakra
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    // Set cooldown (2 rounds)
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    // Apply effect
    if (selectedJutsu.effect) {
      switch (selectedJutsu.effect.type) {
        case 'shield':
          caster.shieldRoundsLeft = selectedJutsu.effect.duration || 3;
          break;
        case 'buff':
          caster.buffRoundsLeft = selectedJutsu.effect.duration || 3;
          caster.buffPowerIncrease = selectedJutsu.effect.value || 10;
          break;
        case 'damage_suppress':
          caster.damageSuppressActive = true;
          caster.damageSuppressAmount = selectedJutsu.effect.value || 20;
          break;
      }
    }
    
    setPlayers(newPlayers);
    setSelectedCharacter(null);
    setSelectedJutsu(null);
    setShowJutsuSelector(false);
    
    // Increment jutsu counter
    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);
    
    // Check if this character has double attack booster active
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && newJutsuCount === 1) {
      // First jutsu with double attack - track this character
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      // Don't end turn, allow second jutsu from same character
    } else {
      // End turn (either no double attack, or already used 2 jutsus)
      setDoubleAttackCharacter(null);
      setTimeout(() => endTurn(), 500);
    }
  };

  const executeSplashDamageJutsu = () => {
    if (!selectedCharacter || !selectedJutsu || splashTargets.length === 0) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    
    // Deduct chakra once
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    // Set cooldown once (2 rounds)
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    // Deactivate splash damage after use
    caster.splashDamageActive = false;
    caster.boosters = caster.boosters?.filter(b => b.type !== 'splash_damage') || [];
    
    // Apply jutsu to each selected target
    const shouldApplyDamageBoost = caster.damageBoostActive;
    const damageBoostMultiplier = shouldApplyDamageBoost ? 1.5 : 1;

    splashTargets.forEach(target => {
      const targetCard = newPlayers[target.playerIndex].hand[target.cardIndex];
      
      // Check for passive abilities before damage
      let damageBlocked = false;
      
      // Check target's dodge passive
      if (targetCard.passiveAbility && targetCard.passiveAbility.trigger === 'on_being_attacked') {
        if (targetCard.passiveAbility.effect.type === 'dodge') {
          const attackTypes = targetCard.passiveAbility.effect.attackTypes || [];
          if (attackTypes.includes(selectedJutsu.jutsuType)) {
            if (Math.random() < targetCard.passiveAbility.chance) {
              alert(`${targetCard.name} dodged the attack using ${targetCard.passiveAbility.passiveName}!`);
              damageBlocked = true;
            }
          }
        }
      }
      
      // Check target's dodge next attack
      if (targetCard.dodgeNextAttack) {
        alert(`${targetCard.name} dodged the attack using Rinnegan!`);
        targetCard.dodgeNextAttack = false;
        damageBlocked = true;
      }
      
      if (!damageBlocked) {
        let finalDamage = selectedJutsu.damage || 0;
        
        // Apply buff from caster
        if (caster.buffRoundsLeft && caster.buffRoundsLeft > 0 && caster.buffPowerIncrease) {
          finalDamage += caster.buffPowerIncrease;
        }
        
        // Apply damage boost if active
        if (shouldApplyDamageBoost) {
          finalDamage = Math.floor(finalDamage * damageBoostMultiplier);
        }
        
        // Apply shield reduction
        if (targetCard.shieldRoundsLeft && targetCard.shieldRoundsLeft > 0) {
          finalDamage = Math.floor(finalDamage * 0.5);
        }
        
        // Apply damage suppress reduction
        if (targetCard.damageSuppressActive && targetCard.damageSuppressAmount) {
          finalDamage = Math.max(0, finalDamage - targetCard.damageSuppressAmount);
        }
        
        // Apply damage
        targetCard.currentHealth = Math.max(0, targetCard.currentHealth - finalDamage);
        
        // Check if target is defeated (don't remove from hand, just mark as defeated)
        if (targetCard.currentHealth === 0) {
          // Check for Sakura's passive (heal all allies when enemy is defeated)
          if (caster.passiveAbility && 
              caster.passiveAbility.trigger === 'after_using_jutsu' &&
              caster.passiveAbility.effect.type === 'heal_all_allies') {
            if (Math.random() < caster.passiveAbility.chance) {
              const healAmount = caster.passiveAbility.effect.value || 0;
              alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! All allies heal ${healAmount} HP!`);
              newPlayers[selectedCharacter.playerIndex].hand.forEach(ally => {
                const allyMaxHealth = ally.forms[ally.currentForm]?.health || 100;
                ally.currentHealth = Math.min(allyMaxHealth, ally.currentHealth + healAmount);
              });
            }
          }
        }
      }
    });
    
    // Deactivate damage boost after use (applies to all splash targets)
    if (shouldApplyDamageBoost) {
      caster.damageBoostActive = false;
      caster.boosters = caster.boosters?.filter(b => b.type !== 'damage_boost') || [];
    }

    // Update jutsus used this turn
    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);

    // Check if caster has double attack active
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;

    if (hasDoubleAttack && newJutsuCount === 1) {
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      alert('Double Attack is active! You can use another jutsu from the same character.');
      setPlayers(newPlayers);
      setSelectedCharacter(null);
      setSelectedJutsu(null);
      setSelectingJutsuTarget(false);
      setIsSelectingSplashTargets(false);
      setSplashTargets([]);
    } else {
      // Update players state first and end turn
      setPlayers(newPlayers);
      setSelectedCharacter(null);
      setSelectedJutsu(null);
      setSelectingJutsuTarget(false);
      setIsSelectingSplashTargets(false);
      setSplashTargets([]);
      setTimeout(() => endTurn(), 100);
      return;
    }
  };

  const useJutsuOnTarget = (targetPlayerIndex: 0 | 1, targetCardIndex: number) => {
    if (!selectedCharacter || !selectedJutsu) return;
    
    const newPlayers: [Player, Player] = [...players] as [Player, Player];
    const caster = newPlayers[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
    const target = newPlayers[targetPlayerIndex].hand[targetCardIndex];
    
    // Deduct chakra
    caster.currentChakra -= selectedJutsu.chakraCost;
    
    // Set cooldown (2 rounds)
    if (!caster.jutsuCooldowns) caster.jutsuCooldowns = {};
    caster.jutsuCooldowns[selectedJutsu.name] = 2;
    
    // Check for passive abilities before damage
    let damageBlocked = false;
    
    // Check target's dodge passive (Minato, Hinata, Neji)
    if (target.passiveAbility && target.passiveAbility.trigger === 'on_being_attacked') {
      if (target.passiveAbility.effect.type === 'dodge') {
        const attackTypes = target.passiveAbility.effect.attackTypes || [];
        if (attackTypes.includes(selectedJutsu.jutsuType)) {
          if (Math.random() < target.passiveAbility.chance) {
            alert(`${target.name} dodged the attack using ${target.passiveAbility.passiveName}!`);
            damageBlocked = true;
          }
        }
      }
    }
    
    // Check target's dodge next attack (Sasuke passive)
    if (target.dodgeNextAttack) {
      alert(`${target.name} dodged the attack using Rinnegan!`);
      target.dodgeNextAttack = false;
      damageBlocked = true;
    }
    
    // Calculate damage with type advantage
    let finalDamage = selectedJutsu.damage || 0;
    let targetsToHit: Array<{playerIndex: 0 | 1, cardIndex: number}> = [{playerIndex: targetPlayerIndex, cardIndex: targetCardIndex}];
    
    // Check Kaguya's passive - hit all enemies
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_jutsu' &&
        caster.passiveAbility.effect.type === 'hit_all_enemies') {
      if (Math.random() < caster.passiveAbility.chance) {
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Hitting all enemies!`);
        const enemyPlayerIndex = selectedCharacter.playerIndex === 0 ? 1 : 0;
        targetsToHit = newPlayers[enemyPlayerIndex].hand.map((_, idx) => ({
          playerIndex: enemyPlayerIndex,
          cardIndex: idx
        }));
      }
    }
    
    if (!damageBlocked && finalDamage > 0) {
      targetsToHit.forEach(targetInfo => {
        const currentTarget = newPlayers[targetInfo.playerIndex].hand[targetInfo.cardIndex];
        let damage = finalDamage;
        
        const typeMultiplier = calculateTypeAdvantage(
          selectedJutsu.jutsuType,
          currentTarget.forms[currentTarget.currentForm]?.attackType || 'taijutsu'
        );
        damage = Math.floor(damage * typeMultiplier);
        
        // Apply damage boost if active
        if (caster.damageBoostActive) {
          damage = Math.floor(damage * 1.2);
          // Deactivate damage boost after use
          caster.damageBoostActive = false;
          caster.boosters = caster.boosters?.filter(b => b.type !== 'damage_boost') || [];
        }
        
        // Apply buff if active
        if (caster.buffPowerIncrease) {
          damage += caster.buffPowerIncrease;
        }
        
        // Check Hagoromo's passive - bonus damage after Creation of All Things
        if (caster.passiveAbility && 
            caster.passiveAbility.trigger === 'after_using_creation' &&
            selectedJutsu.name === 'Creation of All Things') {
          if (Math.random() < caster.passiveAbility.chance) {
            damage += caster.passiveAbility.effect.value || 20;
            alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! +20 damage!`);
          }
        }
        
        // Check if target has shield
        if (currentTarget.shieldRoundsLeft && currentTarget.shieldRoundsLeft > 0) {
          damage = 0;
          alert(`${currentTarget.name}'s shield blocked the attack!`);
        } else {
          // Apply damage suppress if active (flat reduction)
          if (currentTarget.damageSuppressActive && currentTarget.damageSuppressAmount) {
            damage = Math.max(0, damage - currentTarget.damageSuppressAmount);
          }
          
          currentTarget.currentHealth = Math.max(0, currentTarget.currentHealth - damage);
          
          // Check Naruto's passive - counter damage
          if (currentTarget.passiveAbility && 
              currentTarget.passiveAbility.trigger === 'on_being_attacked' &&
              currentTarget.passiveAbility.effect.type === 'counter_damage') {
            if (Math.random() < currentTarget.passiveAbility.chance) {
              const counterDamage = currentTarget.passiveAbility.effect.value || 20;
              caster.currentHealth = Math.max(0, caster.currentHealth - counterDamage);
              alert(`${currentTarget.name} used Talk No Jutsu! Dealt ${counterDamage} damage back!`);
            }
          }
        }
      });
    }
    
    // Apply jutsu effects
    if (selectedJutsu.effect) {
      switch (selectedJutsu.effect.type) {
        case 'heal':
          // Check if target already has full health
          const targetMaxHealth = target.forms[target.currentForm]?.health || 100;
          if (target.currentHealth >= targetMaxHealth) {
            alert(`${target.name} already has full health! Jutsu wasted.`);
          } else {
            target.currentHealth = Math.min(
              target.currentHealth + (selectedJutsu.effect.value || 0),
              targetMaxHealth
            );
          }
          break;
        case 'buff':
          // If buff targets self, apply to caster
          if (selectedJutsu.effect.target === 'self') {
            caster.buffRoundsLeft = selectedJutsu.effect.duration || 3;
            caster.buffPowerIncrease = selectedJutsu.effect.value || 10;
          }
          break;
        case 'poison':
        case 'burn':
        case 'bleed':
          if (!target.statusEffects) target.statusEffects = [];
          let duration = selectedJutsu.effect.duration || 3;
          
          // Check Shino's passive - extend poison duration
          if (selectedJutsu.effect.type === 'poison' &&
              caster.passiveAbility && 
              caster.passiveAbility.trigger === 'after_using_poison') {
            if (Math.random() < caster.passiveAbility.chance) {
              duration += caster.passiveAbility.effect.value || 1;
              alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Poison lasts longer!`);
            }
          }
          
          target.statusEffects.push({
            type: selectedJutsu.effect.type,
            value: selectedJutsu.effect.value,
            duration: duration
          });
          break;
        case 'stun':
          target.stunRoundsLeft = selectedJutsu.effect.duration || 2;
          break;
        case 'chakra_drain':
          target.currentChakra = Math.max(0, target.currentChakra - (selectedJutsu.effect.value || 0));
          break;
      }
    }
    
    // Check Sasuke's passive after using Kirin
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_kirin' &&
        selectedJutsu.name === 'Kirin') {
      if (Math.random() < caster.passiveAbility.chance) {
        caster.dodgeNextAttack = true;
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! Will dodge next attack!`);
      }
    }
    
    // Check Tsunade's passive - heal all allies
    if (caster.passiveAbility && 
        caster.passiveAbility.trigger === 'after_using_jutsu' &&
        caster.passiveAbility.effect.type === 'heal_all_allies') {
      if (Math.random() < caster.passiveAbility.chance) {
        const healAmount = caster.passiveAbility.effect.value || 15;
        newPlayers[selectedCharacter.playerIndex].hand.forEach((ally) => {
          const allyMaxHealth = ally.forms[ally.currentForm]?.health || 100;
          ally.currentHealth = Math.min(
            ally.currentHealth + healAmount,
            allyMaxHealth
          );
        });
        alert(`${caster.name}'s ${caster.passiveAbility.passiveName} activated! All allies healed for ${healAmount} HP!`);
      }
    }
    
    setPlayers(newPlayers);
    
    // Check for game end condition (all characters defeated)
    const player0Alive = newPlayers[0].hand.filter(card => card.currentHealth > 0).length;
    const player1Alive = newPlayers[1].hand.filter(card => card.currentHealth > 0).length;
    
    if (player0Alive === 0) {
      setTimeout(() => {
        alert(`🎉 ${newPlayers[1].name} wins! ${newPlayers[0].name} has no characters left!`);
        resetGame();
      }, 500);
      return;
    }
    if (player1Alive === 0) {
      setTimeout(() => {
        alert(`🎉 ${newPlayers[0].name} wins! ${newPlayers[1].name} has no characters left!`);
        resetGame();
      }, 500);
      return;
    }
    
    setSelectedCharacter(null);
    setSelectedJutsu(null);
    setSelectingJutsuTarget(false);
    
    // Increment jutsu counter
    const newJutsuCount = jutsusUsedThisTurn + 1;
    setJutsusUsedThisTurn(newJutsuCount);
    
    // Check if this character has double attack booster active
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && newJutsuCount === 1) {
      // First jutsu with double attack - track this character
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      // Don't end turn, allow second jutsu from same character
    } else {
      // End turn (either no double attack, or already used 2 jutsus)
      setDoubleAttackCharacter(null);
      setTimeout(() => endTurn(), 500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading characters...</p>
        </div>
      </div>
    );
  }

  if (showNumberGuess) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-2xl w-full border-2 border-purple-500">
          <div className="text-center mb-8">
            <div className="text-7xl mb-4">🎲</div>
            <h2 className="text-4xl font-bold text-white mb-2">Number Guessing Game</h2>
            <p className="text-slate-300 text-lg">Guess a number between 0 and 50</p>
            <p className="text-purple-400 font-semibold mt-2">Closest guess goes first!</p>
          </div>
          
          {gameResult && (
            <div className="mb-6 p-8 bg-linear-to-br from-purple-600/30 to-blue-600/30 border-4 border-purple-500/50 rounded-2xl shadow-2xl">
              <p className="text-purple-200 text-xl font-semibold text-center mb-3">The number was:</p>
              <p className="text-white text-8xl font-bold text-center mb-4">{targetNumber}</p>
              <p className="text-white text-center text-lg font-semibold">{gameResult}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50">
              <h3 className="text-xl font-bold text-orange-400 mb-4 text-center">Player 1</h3>
              <input
                type="number"
                min="0"
                max="50"
                value={player1Guess}
                onChange={(e) => setPlayer1Guess(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-orange-500 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-orange-400"
                placeholder="?"
              />
            </div>
            
            <div className="bg-slate-700/30 p-6 rounded-lg border border-slate-600/50">
              <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">Player 2</h3>
              <input
                type="number"
                min="0"
                max="50"
                value={player2Guess}
                onChange={(e) => setPlayer2Guess(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border-2 border-cyan-500 rounded-lg text-white text-center text-2xl font-bold focus:outline-none focus:border-cyan-400"
                placeholder="?"
              />
            </div>
          </div>
          
          {!gameResult && (
            <button
              onClick={handleGuessSubmit}
              disabled={!player1Guess || !player2Guess}
              className="w-full px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Submit Guesses
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4">
              <div className="text-8xl mb-4 animate-bounce" style={{animationDuration: '2s'}}>🎴</div>
            </div>
            <h1 className="text-7xl font-black mb-4 bg-linear-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent">
              Naruto Card Game
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              Battle with your favorite Naruto characters in an epic card showdown!
            </p>
          </div>
          
          {/* Main Action Button */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <button 
              onClick={startGame}
              className="group relative px-12 py-6 bg-linear-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold text-2xl rounded-2xl transition-all transform hover:scale-110 hover:rotate-1 shadow-2xl hover:shadow-orange-500/50 border-4 border-white/20"
            >
              <span className="relative z-10">⚔️ Start Local Battle (2 Players)</span>
              <div className="absolute inset-0 bg-linear-to-r from-yellow-400 to-orange-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
            </button>
            
            <div className="text-center">
              <p className="text-slate-400 mb-2">Or play online with a friend</p>
              <Link
                to="/online-game"
                className="inline-block px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xl rounded-xl transition-all transform hover:scale-105 shadow-lg border-2 border-white/20"
              >
                🌐 Play Online Multiplayer
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* View Characters Card */}
            <div className="group bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50 hover:border-blue-500/50 transition-all hover:scale-105 hover:shadow-blue-500/20">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📖</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Character Gallery</h3>
                <p className="text-slate-400 mb-4">Explore all available characters and their abilities</p>
                <Link 
                  to="/characters"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  View All Characters →
                </Link>
              </div>
            </div>

            {/* Game Rules Card */}
            <div className="group bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-purple-500/20">
              <div className="text-center">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📜</div>
                <h3 className="text-2xl font-bold mb-3 text-white">Game Rules</h3>
                <p className="text-slate-400 mb-4">Learn the complete rules and mechanics of the game</p>
                <div className="flex flex-col gap-2">
                  <Link 
                    to="/rules"
                    className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    Rules →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* How to Play Section */}
          <div className="bg-linear-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-slate-700/50">
            <h3 className="text-3xl font-bold mb-6 text-center bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              ⚡ How to Play
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">⚔️</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Card Selection</h4>
                  <p className="text-slate-300 text-sm">Each player gets 9 random character cards with unique abilities</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">🎲</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Turn Order</h4>
                  <p className="text-slate-300 text-sm">Number guessing game determines who goes first</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">🎴</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Turn Actions</h4>
                  <p className="text-slate-300 text-sm">Draw booster → Use/Skip → Use jutsu on opponent's card</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">⚡</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Boosters</h4>
                  <p className="text-slate-300 text-sm">Power up with health, chakra, damage, or special abilities</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">🛡️</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Resistances</h4>
                  <p className="text-slate-300 text-sm">Characters have type resistances that reduce or negate damage</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">💙</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Chakra System</h4>
                  <p className="text-slate-300 text-sm">Chakra regenerates each turn for powerful jutsu attacks</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">🎯</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Strategic Combat</h4>
                  <p className="text-slate-300 text-sm">Use type advantages and special jutsus tactically</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-slate-700/20 rounded-xl hover:bg-slate-700/30 transition-colors border border-slate-600/30">
                <span className="mr-4 text-3xl shrink-0">🏆</span>
                <div>
                  <h4 className="font-bold text-white mb-1">Victory</h4>
                  <p className="text-slate-300 text-sm">Eliminate all opponent's cards to win the battle!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[currentPlayerIndex];
  const opponent = players[currentPlayerIndex === 0 ? 1 : 0];
  
  // Helper function to check if a card is a healer
  const isHealer = (card: CharacterCard): boolean => {
    const charJutsu = jutsuData[card.name];
    if (!charJutsu) return false;
    return charJutsu.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
  };

  // Helper function to determine if a card should be grayed out
  const isCardGrayedOut = (playerIndex: 0 | 1): boolean => playerIndex !== currentPlayerIndex;

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="flex gap-3 justify-center items-start">
        {/* Player 1 Section - Left Side */}
        <div className="flex gap-3 h-full">
          {/* Player 1 Cards */}
          <div className="bg-slate-800 rounded-lg p-3 w-auto h-fit flex flex-col">
            <div className="grid grid-cols-3 gap-3">
              {players[0].hand.map((card, index) => (
                <div
                  key={index}
                  className={`w-auto cursor-pointer ${isCardGrayedOut(0) ? 'opacity-50' : ''}`}
                  onClick={() => handleCharacterClick(0, index)}
                >
                  <CharacterCardComponent
                    card={card}
                    onClick={() => {}}
                    isSelectable={
                      (selectingTarget && currentPlayerIndex === 0) ||
                      (selectingJutsuTarget && currentPlayerIndex === 0) ||
                      (currentPlayerIndex === 0 && !selectingTarget && !selectingJutsuTarget)
                    }
                    isHealer={isHealer(card)}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Player 1 Attribute Card Box */}
          <div className="bg-slate-800 rounded-lg p-3 w-56 h-fit flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className=" text-lg font-bold text-white">Booster Hand ({boosterHands[0].length}/5)</h4>
            </div>
            <hr className="border-slate-600 mb-3" />
            <div className="space-y-2">
              {boosterHands[0].map((booster, index) => (
                <button
                  key={index}
                  onClick={() => handleBoosterClick(booster, index)}
                  disabled={currentPlayerIndex !== 0 || selectingTarget}
                  className={`border-2 rounded-lg p-2 w-full text-left transition-all h-16 ${
                    currentPlayerIndex === 0 && !selectingTarget
                      ? 'border-purple-500 hover:bg-purple-900 cursor-pointer'
                      : 'border-slate-600 opacity-50 cursor-not-allowed'
                  } ${
                    selectedBooster?.index === index && selectedBooster?.booster === booster ? 'bg-purple-800' : ''
                  } ${
                    newlyDrawnCard?.playerIndex === 0 && newlyDrawnCard?.cardIndex === index
                      ? 'animate-pulse ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/50'
                      : ''
                  }`}
                >
                  <h5 className="text-xs font-bold text-white mb-1">{booster.name}</h5>
                  <p className="text-[9px] text-slate-300 line-clamp-2">{booster.description}</p>
                </button>
              ))}
            </div>
            {selectingTarget && selectedBooster && currentPlayerIndex === 0 && (
              <button
                onClick={() => {
                  setSelectedBooster(null);
                  setSelectingTarget(false);
                }}
                className="mt-2 w-full px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Middle Section - Info + Draw */}
        <div className="flex-1 flex flex-col gap-3 h-full">
          {/* Game Info - Top */}
          <div className="bg-slate-800 rounded-lg p-5 w-56 mx-auto">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-3">Game Info</h3>
              <p className="text-slate-300 text-base mb-4">Turn: {currentPlayer.name}</p>
              {selectingTarget && (
                <p className="text-yellow-400 text-sm mb-2 font-semibold">
                  ⚡ Click a character to apply {selectedBooster?.booster.name}
                </p>
              )}
              {selectingJutsuTarget && selectedJutsu && (
                <p className="text-yellow-400 text-sm mb-2 font-semibold">
                  🎯 Select target for {selectedJutsu.name}
                </p>
              )}
              <div className="flex gap-2 justify-center flex-col">
                <button
                  onClick={endTurn}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition">
                  Skip Turn
                </button>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition">
                  Reset Game
                </button>
                <button
                  onClick={() => setShowRulesModal(true)}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition text-center">
                  📖 Rules
                </button>
                {isSelectingSplashTargets && (
                  <>
                    <hr className="border-slate-600 my-3" />
                    <div className="bg-purple-600 text-white px-4 py-3 rounded-lg shadow border-2 border-yellow-400">
                      <p className="text-sm font-bold mb-1">💥 Splash Damage Active!</p>
                      <p className="text-xs mb-2">Select up to 3 enemy targets ({splashTargets.length}/3 selected)</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={executeSplashDamageJutsu}
                          disabled={splashTargets.length === 0}
                          className={`w-full px-3 py-2 rounded-lg font-semibold transition ${
                            splashTargets.length === 0
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          Confirm ({splashTargets.length} targets)
                        </button>
                        <button
                          onClick={() => {
                            setIsSelectingSplashTargets(false);
                            setSplashTargets([]);
                            setSelectingJutsuTarget(false);
                            setSelectedJutsu(null);
                            setShowJutsuSelector(true);
                          }}
                          className="w-full px-3 py-2 bg-red-500 hover:bg-red-900 rounded-lg font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {selectingJutsuTarget && !isSelectingSplashTargets && selectedJutsu && (
                  <>
                    <hr className="border-slate-600 my-3" />
                    <div className="bg-blue-600 text-white px-4 py-3 rounded-lg shadow border-2 border-cyan-400">
                      <p className="text-sm font-bold mb-1">🎯 {selectedJutsu.name}</p>
                      <p className="text-xs mb-2">Select a target for this jutsu</p>
                      <button
                        onClick={() => {
                          setSelectingJutsuTarget(false);
                          setSelectedJutsu(null);
                          setSelectedCharacter(null);
                          setShowJutsuSelector(false);
                        }}
                        className="w-full px-3 py-2 bg-red-500 hover:bg-red-900 rounded-lg font-semibold transition"
                      >
                        Cancel Jutsu
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Player 2 Section - Right Side */}
        <div className="flex gap-3 h-full">
          {/* Player 2 Attribute Card Box */}
          <div className="bg-slate-800 rounded-lg p-3 w-56 h-fit flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-white">Booster Hand ({boosterHands[1].length}/5)</h4>
            </div>
            <hr className="border-slate-600 mb-3" />
            <div className="space-y-2">
              {boosterHands[1].map((booster, index) => (
                <button
                  key={index}
                  onClick={() => handleBoosterClick(booster, index)}
                  disabled={currentPlayerIndex !== 1 || selectingTarget}
                  className={`border-2 rounded-lg p-2 w-full text-left transition-all h-16 ${
                    currentPlayerIndex === 1 && !selectingTarget
                      ? 'border-purple-500 hover:bg-purple-900 cursor-pointer'
                      : 'border-slate-600 opacity-50 cursor-not-allowed'
                  } ${
                    selectedBooster?.index === index && selectedBooster?.booster === booster ? 'bg-purple-800' : ''
                  } ${
                    newlyDrawnCard?.playerIndex === 1 && newlyDrawnCard?.cardIndex === index
                      ? 'animate-pulse ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/50'
                      : ''
                  }`}
                >
                  <h5 className="text-xs font-bold text-white mb-1">{booster.name}</h5>
                  <p className="text-[9px] text-slate-300 line-clamp-2">{booster.description}</p>
                </button>
              ))}
            </div>
            {selectingTarget && selectedBooster && currentPlayerIndex === 1 && (
              <button
                onClick={() => {
                  setSelectedBooster(null);
                  setSelectingTarget(false);
                }}
                className="mt-2 w-full px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
          
          {/* Player 2 Hand */}
          <div className="bg-slate-800 rounded-lg p-3 w-auto h-fit flex flex-col">
            <div className="grid grid-cols-3 gap-3">
              {players[1].hand.map((card, index) => (
                <div
                  key={index}
                  className={`w-auto cursor-pointer ${isCardGrayedOut(1) ? 'opacity-50' : ''}`}
                  onClick={() => handleCharacterClick(1, index)}
                >
                  <CharacterCardComponent
                    card={card}
                    onClick={() => {}}
                    isSelectable={
                      (selectingTarget && currentPlayerIndex === 1) ||
                      (selectingJutsuTarget && currentPlayerIndex === 1) ||
                      (currentPlayerIndex === 1 && !selectingTarget && !selectingJutsuTarget)
                    }
                    isHealer={isHealer(card)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Jutsu Selector Modal */}
      {showJutsuSelector && selectedCharacter && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setShowJutsuSelector(false)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-purple-500" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">
              {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name}
            </h3>
            
            {/* Tabs - only show if character has passive */}
            {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowPassiveTab(false)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    !showPassiveTab
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Jutsus
                </button>
                <button
                  onClick={() => setShowPassiveTab(true)}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    showPassiveTab
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  Passive Ability
                </button>
              </div>
            )}
            
            {showPassiveTab && players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility ? (
              <div className="border-2 border-yellow-500 bg-yellow-900 bg-opacity-30 rounded-lg p-4">
                <h4 className="text-xl font-bold text-yellow-400 mb-2">
                  {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.passiveName}
                </h4>
                <p className="text-sm text-slate-200">
                  {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.description}
                </p>
                <p className="text-xs text-yellow-300 mt-2">
                  Activation Chance: {((players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].passiveAbility?.chance || 0) * 100).toFixed(0)}%
                </p>
              </div>
            ) : (
              jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name] && (
                <div className="space-y-3">
                  {/* Base Jutsus */}
                  {jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name].jutsus.map((jutsu, idx) => {
                  const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
                  const onCooldown = card.jutsuCooldowns && card.jutsuCooldowns[jutsu.name] > 0;
                  const notEnoughChakra = card.currentChakra < jutsu.chakraCost;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => !onCooldown && !notEnoughChakra && handleJutsuSelect(jutsu)}
                      disabled={onCooldown || notEnoughChakra}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        onCooldown || notEnoughChakra
                          ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                          : 'border-blue-500 bg-blue-900 hover:bg-blue-800 cursor-pointer'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-white">{jutsu.name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          jutsu.jutsuType === 'ninjutsu' ? 'bg-blue-600' :
                          jutsu.jutsuType === 'taijutsu' ? 'bg-red-600' : 'bg-purple-600'
                        } text-white`}>
                          {jutsu.jutsuType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{jutsu.description}</p>
                      <div className="flex gap-2 text-xs">
                        <span className="text-blue-400">Chakra: {jutsu.chakraCost}</span>
                        {jutsu.damage && <span className="text-red-400">Damage: {jutsu.damage}</span>}
                      </div>
                      {onCooldown && (
                        <p className="text-xs text-yellow-400 mt-1">Cooldown: {card.jutsuCooldowns![jutsu.name]} rounds</p>
                      )}
                      {notEnoughChakra && (
                        <p className="text-xs text-red-400 mt-1">Not enough chakra!</p>
                      )}
                    </button>
                  );
                })}
                
                {/* Divider between base and upgraded jutsus */}
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500 to-transparent"></div>
                  <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Upgraded Jutsu</span>
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-yellow-500 to-transparent"></div>
                </div>
                
                {/* Upgraded Jutsu (always shown, but disabled if mastery not active) */}
                {(() => {
                  const jutsu = jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name].upgradedJutsu;
                  const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
                  const hasMastery = card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0;
                  const onCooldown = card.jutsuCooldowns && card.jutsuCooldowns[jutsu.name] > 0;
                  const notEnoughChakra = card.currentChakra < jutsu.chakraCost;
                  const isDisabled = !hasMastery || onCooldown || notEnoughChakra;
                  
                  return (
                    <div>
                      {hasMastery && (
                        <div className="text-xs text-yellow-400 font-semibold mb-2">
                          ⚡ Special Jutsu Unlocked ({card.jutsuMasteryRoundsLeft} rounds left)
                        </div>
                      )}
                      <button
                        onClick={() => !isDisabled && handleJutsuSelect(jutsu)}
                        disabled={isDisabled}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isDisabled
                            ? 'border-gray-600 bg-gray-800/30 opacity-40 cursor-not-allowed'
                            : 'border-yellow-500 bg-yellow-900 hover:bg-yellow-800 cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white">{jutsu.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            jutsu.jutsuType === 'ninjutsu' ? 'bg-blue-600' :
                            jutsu.jutsuType === 'taijutsu' ? 'bg-red-600' : 'bg-purple-600'
                          } text-white`}>
                            {jutsu.jutsuType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mb-2">{jutsu.description}</p>
                        <div className="flex gap-2 text-xs">
                          <span className="text-blue-400">Chakra: {jutsu.chakraCost}</span>
                          {jutsu.damage && <span className="text-red-400">Damage: {jutsu.damage}</span>}
                        </div>
                        {!hasMastery && (
                          <p className="text-xs text-red-400 mt-1">⚡ Requires Jutsu Mastery booster!</p>
                        )}
                        {hasMastery && onCooldown && (
                          <p className="text-xs text-yellow-400 mt-1">Cooldown: {card.jutsuCooldowns![jutsu.name]} rounds</p>
                        )}
                        {hasMastery && notEnoughChakra && (
                          <p className="text-xs text-red-400 mt-1">Not enough chakra!</p>
                        )}
                      </button>
                    </div>
                  );
                })()}
              </div>
              )
            )}
            
            <button
              onClick={() => {
                setShowJutsuSelector(false);
                setShowPassiveTab(false);
                setSelectedCharacter(null);
                setSelectedJutsu(null);
                setSelectingJutsuTarget(false);
                setIsSelectingSplashTargets(false);
                setSplashTargets([]);
              }}
              className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setShowRulesModal(false)}>
          <div className="bg-linear-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl max-w-5xl w-full my-8 border border-slate-700/50 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-linear-to-br from-slate-800 to-slate-900 p-4 border-b border-slate-700/50 z-10">
              <div className="text-center">
                <div className="text-4xl mb-2">📜</div>
                <h1 className="text-3xl font-black mb-1 bg-linear-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  Game Rules
                </h1>
                <p className="text-sm text-slate-300 font-medium">
                  Complete guide to playing Naruto Card Game
                </p>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="absolute top-2 right-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
              >
                ✕ Close
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Game Setup */}
              <section>
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
              <section>
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
              <section>
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
              <section>
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
              <section>
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
              <section>
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
              <section>
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
              <section>
                <h2 className="text-3xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
                  <span className="text-4xl">🏆</span> Victory Condition
                </h2>
                <div className="bg-linear-to-r from-yellow-600/20 to-orange-600/20 p-6 rounded-lg border-2 border-yellow-500/50 text-slate-300">
                  <p className="text-2xl font-bold text-yellow-300 mb-3">Win by eliminating all opponent's characters!</p>
                  <p className="text-lg">Reduce all 9 of your opponent's character cards to 0 health to achieve victory.</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-red-500" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-3">Reset Game?</h2>
              <p className="text-slate-300 text-lg">Do you really want to reset the game? All progress will be lost.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmResetGame}
                className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
