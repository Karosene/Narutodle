# Online Multiplayer Implementation Guide

## Overview
This document explains how the online multiplayer system works for the Naruto Card Game.

## Architecture

### 1. Database Tables (db/online_game_schema.sql)
- **online_game_sessions**: Stores game metadata, players, and status
- **online_game_state**: Stores full game state as JSONB for synchronization  
- **online_game_actions**: Logs all player actions for verification

### 2. Game Flow

#### Creating a Game
1. Player clicks "Create Game" on `/online-game`
2. System generates unique 6-character code (e.g., "ABC123")
3. Creates session in `online_game_sessions` table with status "waiting"
4. Host waits on lobby screen showing the code
5. Polls database every 2 seconds to check if guest joined

#### Joining a Game
1. Player enters game code on `/online-game`
2. System finds session by code
3. Updates session with guest_user_id and status "active"  
4. Both players redirect to `/online-game/play?session={id}`

#### Playing the Game
1. Load game session and create initial game state
2. Subscribe to Supabase Realtime channel for that session
3. **Current player** makes actions, updates local state, then broadcasts to database
4. **Opponent** receives realtime updates and syncs their local state
5. Turn-based validation ensures only current player can act

### 3. Supabase Realtime Integration

The game uses Supabase Realtime Channels for instant synchronization:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Subscribe to game session channel
const channel = supabase.channel(`game:${sessionId}`)
  .on('broadcast', { event: 'game_update' }, (payload) => {
    // Update local game state when opponent takes action
    syncGameState(payload.state)
  })
  .subscribe()

// Broadcast action to opponent
channel.send({
  type: 'broadcast',
  event: 'game_update',
  payload: { state: currentGameState }
})
```

### 4. State Synchronization

After every action (attack, jutsu, booster, end turn):
1. Update local state
2. Save state to `online_game_state` table
3. Broadcast update event to Realtime channel
4. Opponent receives event and updates their UI

### 5. Installation Steps

#### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

#### Run Database Migration
Execute the SQL in `db/online_game_schema.sql` in your Supabase SQL Editor

#### Configure Realtime
In Supabase Dashboard:
1. Go to Database > Replication
2. Enable replication for `online_game_state` table
3. This allows real-time broadcasting

### 6. Files Created

- `db/online_game_schema.sql` - Database schema
- `app/utils/onlineGame.ts` - Game session utilities
- `app/routes/online-game.tsx` - Lobby/matchmaking UI
- `app/routes/online-game.play.tsx` - Online game play (TODO: full implementation)

### 7. Next Steps for Full Implementation

The current implementation provides:
✅ Database schema
✅ Game session creation/joining with codes
✅ Lobby UI
✅ Utility functions for database operations

Still needed for production:
- [ ] Full online-game.play.tsx with Realtime sync
- [ ] Reconnection handling
- [ ] Timeout/forfeit mechanics
- [ ] Game history/replay
- [ ] Matchmaking improvements
- [ ] Mobile optimization
- [ ] Chat (optional)

### 8. How to Adapt play-game.tsx for Online Mode

Key changes needed:
1. **Load game state from database** instead of local initialization
2. **Add Realtime subscription** to sync opponent's actions
3. **Validate turn** - disable UI when not your turn
4. **Broadcast actions** after every state change
5. **Save state** to database after each action
6. **Handle disconnections** - save state, allow reconnect

Example pattern:
```typescript
// Instead of this (local):
setPlayers(newPlayers)

// Do this (online):
const newState = { ...gameState, players: newPlayers }
await saveGameState(newState)
channel.send({ type: 'broadcast', event: 'game_update', payload: newState })
setPlayers(newPlayers)
```

### 9. Testing

1. Open two browser windows (or use incognito)
2. Log in as different users in each
3. Create game in window 1, note the code
4. Join game in window 2 with the code
5. Both should connect to same game session

### 10. Security Considerations

- **Turn validation**: Server-side validation prevents cheating
- **Action logging**: All moves logged in `online_game_actions`
- **Session timeout**: Games abandoned after 24 hours
- **Rate limiting**: Consider adding to prevent spam

## Quick Start

1. Run the SQL in Supabase: `db/online_game_schema.sql`
2. Install dependencies: `npm install @supabase/supabase-js`
3. Build and start: `npm run build && npm start`
4. Navigate to `/online-game` to create/join games
5. Share the 6-character code with your friend

---

**Need Help?** Check Supabase Realtime docs: https://supabase.com/docs/guides/realtime
