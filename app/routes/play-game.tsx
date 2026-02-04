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
  const [coinFlipResult, setCoinFlipResult] = useState<string>('');
  const [showCoinFlip, setShowCoinFlip] = useState(false);
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
    
    // Find healers - characters with heal jutsu
    const healers = validCharacters.filter(char => {
      const charJutsu = jutsuData[char.name];
      if (!charJutsu) return false;
      return charJutsu.jutsus.some(jutsu => jutsu.effect?.type === 'heal');
    });
    
    if (charactersWithPassive.length < 2) {
      alert('Not enough characters with passive abilities!');
      return;
    }
    
    if (healers.length < 4) {
      alert('Not enough healer characters!');
      return;
    }

    const shuffledPassive = shuffleArray(charactersWithPassive);
    
    // Select passive characters first
    const selectedPassive1 = shuffledPassive[0];
    const selectedPassive2 = shuffledPassive[1];
    
    // Filter healers to exclude the already selected passive characters
    const availableHealers = healers.filter(h => h.name !== selectedPassive1.name && h.name !== selectedPassive2.name);
    const shuffledHealers = shuffleArray(availableHealers);
    
    // Get normal characters (excluding the selected passive and healers)
    const usedCharNames = new Set([
      selectedPassive1.name,
      selectedPassive2.name,
      shuffledHealers[0].name,
      shuffledHealers[1].name,
      shuffledHealers[2].name,
      shuffledHealers[3].name
    ]);
    const normalCharacters = validCharacters.filter(char => !usedCharNames.has(char.name));
    const shuffledNormal = shuffleArray(normalCharacters);
    
    // Ensure each player gets 1 passive + 2 healers + 6 normal characters
    const player1Chars = [selectedPassive1, shuffledHealers[0], shuffledHealers[1], ...shuffledNormal.slice(0, 6)];
    const player2Chars = [selectedPassive2, shuffledHealers[2], shuffledHealers[3], ...shuffledNormal.slice(6, 12)];
    
    const player1Hand = player1Chars.map((char, index) => convertToCard(char, index));
    const player2Hand = player2Chars.map((char, index) => convertToCard(char, index + 9));

    const coinFlip = Math.random() < 0.5 ? 0 : 1;
    const firstPlayer = coinFlip === 0 ? 'Player 1' : 'Player 2';
    
    setShowCoinFlip(true);
    setCoinFlipResult(`🪙 Coin Flip: ${firstPlayer} goes first!`);
    
    setTimeout(() => {
      setPlayers([
        { name: 'Player 1', hand: player1Hand },
        { name: 'Player 2', hand: player2Hand }
      ]);
      setCurrentPlayerIndex(coinFlip);
      setGameStarted(true);
      setShowCoinFlip(false);
      
      // Auto-draw first booster card only for the player whose turn it is
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * boosterDeck.length);
        const booster = boosterDeck[randomIndex];
        
        const newHands: [AttributeBoosterCard[], AttributeBoosterCard[]] = [[], []];
        newHands[coinFlip] = [booster];
        setBoosterHands(newHands);
        
        // Show animation for the card
        setNewlyDrawnCard({playerIndex: coinFlip, cardIndex: 0});
        setTimeout(() => setNewlyDrawnCard(null), 1500);
      }, 500);
    }, 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setPlayers([
      { name: 'Player 1', hand: [] },
      { name: 'Player 2', hand: [] }
    ]);
    setCoinFlipResult('');
    setCurrentBooster(null);
    setBoosterHands([[], []]);
    setSelectedBooster(null);
    setSelectingTarget(false);
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
        }
        break;
        
      case 'damage_boost':
        // Activate damage boost
        if (booster.effect.damageBoostPercent) {
          targetCard.damageBoostActive = true;
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
        
        // Process each status effect (poison/burn/bleed damage applies every turn)
        card.statusEffects = card.statusEffects.filter(effect => {
          switch (effect.type) {
            case 'poison':
            case 'burn':
            case 'bleed':
              // Apply damage
              card.currentHealth = Math.max(0, card.currentHealth - (effect.value || 0));
              break;
          }
          
          // Only decrement duration on player's own turn
          if (playerIndex === currentPlayerIndex) {
            effect.duration--;
          }
          return effect.duration > 0;
        });
        
        // Only decrement buff/shield/stun/mastery rounds for the OTHER player (when their turn is about to start)
        if (playerIndex !== currentPlayerIndex) {
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
          }
          
          // Decrement stun rounds
          if (card.stunRoundsLeft && card.stunRoundsLeft > 0) {
            card.stunRoundsLeft--;
          }
          
          // Decrement shield rounds
          if (card.shieldRoundsLeft && card.shieldRoundsLeft > 0) {
            card.shieldRoundsLeft--;
          }
        } else {
          // For current player's cards, decrement their double attack rounds (expires on their own turn)
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
        if (caster.damageBoostActive) {
          finalDamage = Math.floor(finalDamage * 1.5);
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
    
    // Update jutsus used this turn
    setJutsusUsedThisTurn(prev => prev + 1);
    
    // Check if caster has double attack active
    const hasDoubleAttack = caster.doubleAttackRoundsLeft && caster.doubleAttackRoundsLeft > 0;
    
    if (hasDoubleAttack && jutsusUsedThisTurn === 0) {
      setDoubleAttackCharacter({playerIndex: selectedCharacter.playerIndex, cardIndex: selectedCharacter.cardIndex});
      alert('Double Attack is active! You can use another jutsu from the same character.');
    } else {
      // Update players state first
      setPlayers(newPlayers);
      
      // End turn automatically after state update
      setTimeout(() => endTurn(), 100);
      
      setSelectedCharacter(null);
      setSelectedJutsu(null);
      setSelectingJutsuTarget(false);
      setIsSelectingSplashTargets(false);
      setSplashTargets([]);
      return;
    }
    
    setPlayers(newPlayers);
    setSelectedCharacter(null);
    setSelectedJutsu(null);
    setSelectingJutsuTarget(false);
    setIsSelectingSplashTargets(false);
    setSplashTargets([]);
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

  if (showCoinFlip) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-8xl animate-bounce mb-6">🪙</div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{coinFlipResult}</p>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-slate-50">
              🎴 Naruto Card Game
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Battle with your favorite Naruto characters!
            </p>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 dark:border-slate-800">
            <button 
              onClick={startGame}
              className="w-full bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all transform hover:scale-105 shadow-lg"
            >
              Start Game
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 dark:border-slate-800">
            <div className="text-center mb-6">
              <Link 
                to="/characters"
                className="inline-block text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                📖 View All Characters →
              </Link>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">How to Play:</h3>
            <ul className="space-y-3 text-slate-700 dark:text-slate-300">
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⚔️</span>
                <span>Each player gets 9 random character cards</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🪙</span>
                <span>Coin flip determines who goes first</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎯</span>
                <span>Take turns attacking opponent's cards</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎴</span>
                <span>Each turn: Draw a booster card → Use or skip it → Attack an opponent's card</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⚡</span>
                <span>Boosters can increase power, health, chakra, or change forms</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🛡️</span>
                <span>Characters have resistances that reduce or negate damage</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">💙</span>
                <span>Chakra regenerates each turn</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🏆</span>
                <span>Win by eliminating all opponent's cards!</span>
              </li>
            </ul>
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

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="h-[calc(100vh-2rem)] flex gap-3">
        {/* Player 1 Section - Left Side */}
        <div className="flex gap-3 h-full">
          {/* Player 1 Cards */}
          <div className="bg-slate-800 rounded-lg p-3 h-auto flex-1 flex flex-col max-w-xl">
            <div className="grid grid-cols-3 gap-3">
              {/* Passive ability card Box */}
              {players[0].hand.filter(card => card.passiveAbility).slice(0, 1).length > 0 && (
                <div className="border-2 border-blue-600 rounded-lg p-2 relative">
                  <div className="absolute -top-3 left-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md">
                      Passive ability cards
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {players[0].hand.filter(card => card.passiveAbility).slice(0, 1).map((card) => {
                      const index = players[0].hand.indexOf(card);
                      let isValidTarget = false;
                      if (selectingJutsuTarget && selectedJutsu) {
                        if (selectedJutsu.damage) {
                          isValidTarget = (currentPlayerIndex === 1);
                        }
                        else if (selectedJutsu.effect) {
                          const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                            selectedJutsu.effect.target === 'self' || 
                            selectedJutsu.effect.target === 'ally' || 
                            selectedJutsu.effect.target === 'all_allies';
                          const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                            selectedJutsu.effect.target === 'all_opponents';
                          
                          if (isHealOrAlly && currentPlayerIndex === 0) isValidTarget = true;
                          if (isOpponent && currentPlayerIndex === 1) isValidTarget = true;
                        }
                      }
                      const isSplashTarget = splashTargets.some(t => t.playerIndex === 0 && t.cardIndex === index);
                      
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div 
                            className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                            onClick={() => handleCharacterClick(0, index)}
                          >
                            <CharacterCardComponent 
                              card={card}
                              onClick={() => {}}
                              isSelectable={
                                (selectingTarget && currentPlayerIndex === 0) || 
                                (selectingJutsuTarget && isValidTarget) ||
                                (currentPlayerIndex === 0 && !selectingTarget && !selectingJutsuTarget)
                              }
                              isHealer={isHealer(card)}
                            />
                          </div>
                          {/* Active Effect Indicators */}
                          <div className="flex flex-wrap gap-1">
                            {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                              <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Mastery ({card.jutsuMasteryRoundsLeft})
                              </div>
                            )}
                            {card.damageBoostActive && (
                              <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                +Damage
                              </div>
                            )}
                            {card.splashDamageActive && (
                              <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Splash
                              </div>
                            )}
                            {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                              <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                x2 Attack ({card.doubleAttackRoundsLeft})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Healers Box */}
              {players[0].hand.filter(card => isHealer(card) && !card.passiveAbility).length > 0 && (
                <div className="col-span-2 border-2 border-green-600 rounded-lg p-2 relative">
                  <div className="absolute -top-3 left-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded-md">
                      Healers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {players[0].hand.filter(card => isHealer(card) && !card.passiveAbility).map((card) => {
                      const index = players[0].hand.indexOf(card);
                      let isValidTarget = false;
                      if (selectingJutsuTarget && selectedJutsu) {
                        if (selectedJutsu.damage) {
                          isValidTarget = (currentPlayerIndex === 1);
                        }
                        else if (selectedJutsu.effect) {
                          const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                            selectedJutsu.effect.target === 'self' || 
                            selectedJutsu.effect.target === 'ally' || 
                            selectedJutsu.effect.target === 'all_allies';
                          const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                            selectedJutsu.effect.target === 'all_opponents';
                          
                          if (isHealOrAlly && currentPlayerIndex === 0) isValidTarget = true;
                          if (isOpponent && currentPlayerIndex === 1) isValidTarget = true;
                        }
                      }
                      const isSplashTarget = splashTargets.some(t => t.playerIndex === 0 && t.cardIndex === index);
                      
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div 
                            className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                            onClick={() => handleCharacterClick(0, index)}
                          >
                            <CharacterCardComponent 
                              card={card}
                              onClick={() => {}}
                              isSelectable={
                                (selectingTarget && currentPlayerIndex === 0) || 
                                (selectingJutsuTarget && isValidTarget) ||
                                (currentPlayerIndex === 0 && !selectingTarget && !selectingJutsuTarget)
                              }
                              isHealer={isHealer(card)}
                            />
                          </div>
                          {/* Active Effect Indicators */}
                          <div className="flex flex-wrap gap-1">
                            {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                              <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Mastery ({card.jutsuMasteryRoundsLeft})
                              </div>
                            )}
                            {card.damageBoostActive && (
                              <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                +Damage
                              </div>
                            )}
                            {card.splashDamageActive && (
                              <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Splash
                              </div>
                            )}
                            {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                              <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                x2 Attack ({card.doubleAttackRoundsLeft})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Normal cards */}
              {players[0].hand.filter(card => !card.passiveAbility && !isHealer(card)).map((card) => {
                const index = players[0].hand.indexOf(card);
                // Determine if this card is a valid target
                let isValidTarget = false;
                if (selectingJutsuTarget && selectedJutsu) {
                  // Damage jutsus always target opponents (even if they have self-buff effects)
                  if (selectedJutsu.damage) {
                    isValidTarget = (currentPlayerIndex === 1);
                  }
                  // Effect-based targeting (only if no damage)
                  else if (selectedJutsu.effect) {
                    const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                      selectedJutsu.effect.target === 'self' || 
                      selectedJutsu.effect.target === 'ally' || 
                      selectedJutsu.effect.target === 'all_allies';
                    const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                      selectedJutsu.effect.target === 'all_opponents';
                    
                    if (isHealOrAlly && currentPlayerIndex === 0) isValidTarget = true;
                    if (isOpponent && currentPlayerIndex === 1) isValidTarget = true;
                  }
                }
                
                // Check if this card is a selected splash target
                const isSplashTarget = splashTargets.some(t => t.playerIndex === 0 && t.cardIndex === index);
                
                return (
                  <div key={index} className="flex flex-col gap-1">
                    <div 
                      className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                      onClick={() => handleCharacterClick(0, index)}
                    >
                      <CharacterCardComponent 
                        card={card}
                        onClick={() => {}}
                        isSelectable={
                          (selectingTarget && currentPlayerIndex === 0) || 
                          (selectingJutsuTarget && isValidTarget) ||
                          (currentPlayerIndex === 0 && !selectingTarget && !selectingJutsuTarget)
                        }
                        isHealer={isHealer(card)}
                      />
                    </div>
                    {/* Active Effect Indicators */}
                    <div className="flex flex-wrap gap-1">
                      {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                        <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Mastery ({card.jutsuMasteryRoundsLeft})
                        </div>
                      )}
                      {card.damageBoostActive && (
                        <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          +Damage
                        </div>
                      )}
                      {card.splashDamageActive && (
                        <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Splash
                        </div>
                      )}
                      {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                        <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                          x2 Attack ({card.doubleAttackRoundsLeft})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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
                <Link
                  to="/rules"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition text-center">
                  📖 Rules
                </Link>
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
          <div className="bg-slate-800 rounded-lg p-3 h-auto flex-1 flex flex-col max-w-xl">
            <div className="grid grid-cols-3 gap-3">
              {/* Healers Box */}
              {players[1].hand.filter(card => isHealer(card) && !card.passiveAbility).length > 0 && (
                <div className="col-span-2 border-2 border-green-600 rounded-lg p-2 relative">
                  <div className="absolute -top-3 left-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded-md">
                      Healers
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {players[1].hand.filter(card => isHealer(card) && !card.passiveAbility).map((card) => {
                      const index = players[1].hand.indexOf(card);
                      let isValidTarget = false;
                      if (selectingJutsuTarget && selectedJutsu) {
                        if (selectedJutsu.damage) {
                          isValidTarget = (currentPlayerIndex === 0);
                        }
                        else if (selectedJutsu.effect) {
                          const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                            selectedJutsu.effect.target === 'self' || 
                            selectedJutsu.effect.target === 'ally' || 
                            selectedJutsu.effect.target === 'all_allies';
                          const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                            selectedJutsu.effect.target === 'all_opponents';
                          
                          if (isHealOrAlly && currentPlayerIndex === 1) isValidTarget = true;
                          if (isOpponent && currentPlayerIndex === 0) isValidTarget = true;
                        }
                      }
                      const isSplashTarget = splashTargets.some(t => t.playerIndex === 1 && t.cardIndex === index);
                      
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div 
                            className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                            onClick={() => handleCharacterClick(1, index)}
                          >
                            <CharacterCardComponent 
                              card={card}
                              onClick={() => {}}
                              isSelectable={
                                (selectingTarget && currentPlayerIndex === 1) || 
                                (selectingJutsuTarget && isValidTarget) ||
                                (currentPlayerIndex === 1 && !selectingTarget && !selectingJutsuTarget)
                              }
                              isHealer={isHealer(card)}
                            />
                          </div>
                          {/* Active Effect Indicators */}
                          <div className="flex flex-wrap gap-1">
                            {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                              <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Mastery ({card.jutsuMasteryRoundsLeft})
                              </div>
                            )}
                            {card.damageBoostActive && (
                              <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                +Damage
                              </div>
                            )}
                            {card.splashDamageActive && (
                              <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Splash
                              </div>
                            )}
                            {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                              <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                x2 Attack ({card.doubleAttackRoundsLeft})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Passive ability card Box */}
              {players[1].hand.filter(card => card.passiveAbility).slice(0, 1).length > 0 && (
                <div className="border-2 border-blue-600 rounded-lg p-2 relative">
                  <div className="absolute -top-3 left-2">
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-600 text-white rounded-md">
                      Passive ability cards
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {players[1].hand.filter(card => card.passiveAbility).slice(0, 1).map((card) => {
                      const index = players[1].hand.indexOf(card);
                      let isValidTarget = false;
                      if (selectingJutsuTarget && selectedJutsu) {
                        if (selectedJutsu.damage) {
                          isValidTarget = (currentPlayerIndex === 0);
                        }
                        else if (selectedJutsu.effect) {
                          const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                            selectedJutsu.effect.target === 'self' || 
                            selectedJutsu.effect.target === 'ally' || 
                            selectedJutsu.effect.target === 'all_allies';
                          const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                            selectedJutsu.effect.target === 'all_opponents';
                          
                          if (isHealOrAlly && currentPlayerIndex === 1) isValidTarget = true;
                          if (isOpponent && currentPlayerIndex === 0) isValidTarget = true;
                        }
                      }
                      const isSplashTarget = splashTargets.some(t => t.playerIndex === 1 && t.cardIndex === index);
                      
                      return (
                        <div key={index} className="flex flex-col gap-1">
                          <div 
                            className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                            onClick={() => handleCharacterClick(1, index)}
                          >
                            <CharacterCardComponent 
                              card={card}
                              onClick={() => {}}
                              isSelectable={
                                (selectingTarget && currentPlayerIndex === 1) || 
                                (selectingJutsuTarget && isValidTarget) ||
                                (currentPlayerIndex === 1 && !selectingTarget && !selectingJutsuTarget)
                              }
                              isHealer={isHealer(card)}
                            />
                          </div>
                          {/* Active Effect Indicators */}
                          <div className="flex flex-wrap gap-1">
                            {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                              <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Mastery ({card.jutsuMasteryRoundsLeft})
                              </div>
                            )}
                            {card.damageBoostActive && (
                              <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                +Damage
                              </div>
                            )}
                            {card.splashDamageActive && (
                              <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Splash
                              </div>
                            )}
                            {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                              <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                                x2 Attack ({card.doubleAttackRoundsLeft})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Normal cards */}
              {players[1].hand.filter(card => !card.passiveAbility && !isHealer(card)).map((card) => {
                const index = players[1].hand.indexOf(card);
                // Determine if this card is a valid target
                let isValidTarget = false;
                if (selectingJutsuTarget && selectedJutsu) {
                  // Damage jutsus always target opponents (even if they have self-buff effects)
                  if (selectedJutsu.damage) {
                    isValidTarget = (currentPlayerIndex === 0);
                  }
                  // Effect-based targeting (only if no damage)
                  else if (selectedJutsu.effect) {
                    const isHealOrAlly = selectedJutsu.effect.type === 'heal' || 
                      selectedJutsu.effect.target === 'self' || 
                      selectedJutsu.effect.target === 'ally' || 
                      selectedJutsu.effect.target === 'all_allies';
                    const isOpponent = selectedJutsu.effect.target === 'opponent' || 
                      selectedJutsu.effect.target === 'all_opponents';
                    
                    if (isHealOrAlly && currentPlayerIndex === 1) isValidTarget = true;
                    if (isOpponent && currentPlayerIndex === 0) isValidTarget = true;
                  }
                }
                
                // Check if this card is a selected splash target
                const isSplashTarget = splashTargets.some(t => t.playerIndex === 1 && t.cardIndex === index);
                
                return (
                  <div key={index} className="flex flex-col gap-1">
                    <div 
                      className={`w-auto cursor-pointer ${isSplashTarget ? 'ring-4 ring-yellow-400 rounded-lg' : ''}`}
                      onClick={() => handleCharacterClick(1, index)}
                    >
                      <CharacterCardComponent 
                        card={card}
                        onClick={() => {}}
                        isSelectable={
                          (selectingTarget && currentPlayerIndex === 1) || 
                          (selectingJutsuTarget && isValidTarget) ||
                          (currentPlayerIndex === 1 && !selectingTarget && !selectingJutsuTarget)
                        }
                        isHealer={isHealer(card)}
                      />
                    </div>
                    {/* Active Effect Indicators */}
                    <div className="flex flex-wrap gap-1">
                      {card.jutsuMasteryRoundsLeft && card.jutsuMasteryRoundsLeft > 0 && (
                        <div className="bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Mastery ({card.jutsuMasteryRoundsLeft})
                        </div>
                      )}
                      {card.damageBoostActive && (
                        <div className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          +Damage
                        </div>
                      )}
                      {card.splashDamageActive && (
                        <div className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Splash
                        </div>
                      )}
                      {card.doubleAttackRoundsLeft && card.doubleAttackRoundsLeft > 0 && (
                        <div className="bg-yellow-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                          x2 Attack ({card.doubleAttackRoundsLeft})
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Splash Damage Target Selection UI */}
      {isSelectingSplashTargets && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-4 rounded-lg shadow-xl z-50 border-2 border-yellow-400">
          <p className="text-lg font-bold mb-2">💥 Splash Damage Active!</p>
          <p className="text-sm mb-3">Select up to 3 enemy targets ({splashTargets.length}/3 selected)</p>
          <div className="flex gap-2">
            <button
              onClick={executeSplashDamageJutsu}
              disabled={splashTargets.length === 0}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
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
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jutsu Selector Modal */}
      {showJutsuSelector && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setShowJutsuSelector(false)}>
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
                
                {/* Special Jutsu (only if mastery active) */}
                {players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].jutsuMasteryRoundsLeft && 
                 players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].jutsuMasteryRoundsLeft! > 0 && (
                  <div>
                    <div className="text-xs text-yellow-400 font-semibold mb-2">
                      ⚡ Special Jutsu Unlocked ({players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].jutsuMasteryRoundsLeft} rounds left)
                    </div>
                    {(() => {
                      const jutsu = jutsuData[players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex].name].upgradedJutsu;
                      const card = players[selectedCharacter.playerIndex].hand[selectedCharacter.cardIndex];
                      const onCooldown = card.jutsuCooldowns && card.jutsuCooldowns[jutsu.name] > 0;
                      const notEnoughChakra = card.currentChakra < jutsu.chakraCost;
                      
                      return (
                        <button
                          onClick={() => !onCooldown && !notEnoughChakra && handleJutsuSelect(jutsu)}
                          disabled={onCooldown || notEnoughChakra}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            onCooldown || notEnoughChakra
                              ? 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
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
                          {onCooldown && (
                            <p className="text-xs text-yellow-400 mt-1">Cooldown: {card.jutsuCooldowns![jutsu.name]} rounds</p>
                          )}
                          {notEnoughChakra && (
                            <p className="text-xs text-red-400 mt-1">Not enough chakra!</p>
                          )}
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
              )
            )}
            
            <button
              onClick={() => {
                setShowJutsuSelector(false);
                setShowPassiveTab(false);
              }}
              className="mt-4 w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
