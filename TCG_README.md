# Naruto Trading Card Game

A browser-based trading card game featuring Naruto characters with unique abilities, forms, and battle mechanics.

## Features

### Core Gameplay
- **8-Card Hand**: Each player starts with 8 random character cards from a deck of 16 unique Naruto characters
- **First Turn Battle**: Players select one card each; highest power goes first
- **Turn Structure**:
  1. Draw a booster card from the attribute deck
  2. Choose to use the booster on a character or skip it
  3. Attack an opponent's character
  4. End turn (chakra regenerates automatically)

### Character System
- **Forms**: Many characters have multiple forms (e.g., Naruto: Sage Mode → Kurama Sage Mode)
- **Stats**: Power, Health, Max Chakra
- **Attack Types**: Taijutsu, Ninjutsu, Genjutsu
- **Resistances**: Characters can have half or full resistance to specific attack types
  - Hyuga clan: Full taijutsu resistance (Rotation defense)
  - Uchiha clan: Full genjutsu resistance (Sharingan)
  - Obito: Full taijutsu resistance (Kamui intangibility)

### Attribute Booster Cards
- **Weapons**: Kunai, Shuriken, Explosive Tags (+5 to +12 Power)
- **Health**: Medical Kits, Medical Ninjutsu (+20 to +35 HP)
- **Chakra**: Chakra Recovery, Nature Energy (+30 to +50 Chakra)
- **Power**: Chakra Enhancement, Sage Chakra (+10 to +15 Power)
- **Form Change**: Transform character to upgraded form (if available)
- **Hybrid**: Soldier Pills provide both health and chakra

### Combat Mechanics
- **Damage Calculation**: Attack power modified by defender's resistances
  - Full resistance: 0 damage
  - Half resistance: 50% damage
  - No resistance: 100% damage
- **Chakra Regeneration**: +10 chakra per turn (up to max)
- **Victory Condition**: Eliminate all opponent's cards

## Characters Included

### Uchiha Clan
- Sasuke (MS → Rinnegan)
- Obito (Kamui → Juubito)
- Madara (EMS → Rinnegan)
- Itachi (MS → Edo Tensei)
- Kakashi (Copy Ninja → Double Sharingan)

### Uzumaki Clan
- Naruto (Sage Mode → Kurama Sage Mode)
- Pain/Nagato (Six Paths)

### Hyuga Clan
- Neji (Byakugan Master)
- Hinata (Byakugan)

### Sannin
- Jiraiya (Toad Sage)
- Orochimaru (Snake Sage)
- Tsunade (Medical Ninja → Hundred Healings)

### Others
- Rock Lee (Taijutsu Master → Eight Gates)
- Sakura (Medical Ninja → Hundred Healings)
- Gaara (Sand Shield → One-Tail)
- Minato (Yellow Flash → KCM)

## Technical Stack
- **Frontend**: React + TypeScript
- **Routing**: React Router
- **Styling**: Custom CSS with gradient animations
- **State Management**: React hooks (useState)

## File Structure
```
app/
├── types/tcg.ts                 # TypeScript interfaces
├── data/
│   ├── characters.ts           # Character deck definitions
│   └── boosters.ts             # Attribute booster deck
├── utils/gameLogic.ts          # Game mechanics & calculations
├── components/
│   ├── CharacterCard.tsx       # Character card component
│   └── BoosterCard.tsx         # Booster card component
└── routes/
    ├── tcg.tsx                 # Main game component
    └── tcg.css                 # Game styling
```

## How to Play

1. Navigate to `/tcg` route
2. Click "Start Game" to begin
3. Each player selects one card for the first turn battle
4. On your turn:
   - Click "Draw Booster Card"
   - Click a character to apply the booster (or click "Skip Booster")
   - Select your attacking character
   - Select opponent's defending character
5. Game continues until one player has no cards left

## Game Balance
- Characters range from 70-99 power
- Form upgrades provide significant stat boosts
- Resistances create strategic depth
- Booster cards can swing battles
- Chakra system (future feature ready)

## Future Enhancements (from tcgNaruto.txt)
- [ ] Multiplayer over LAN with PHP backend
- [ ] Attack animations
- [ ] More character forms
- [ ] Enhanced chakra mechanics
- [ ] Sound effects and music
- [ ] Card collection/deck building mode

## Credits
Based on game design specifications from tcgNaruto.txt
Characters and concepts from Naruto series by Masashi Kishimoto
