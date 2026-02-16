# 🎮 Online Multiplayer Quick Start Guide

## What's Been Implemented

✅ **Database Schema** - Complete SQL schema for game sessions, state, and actions  
✅ **Game Session Management** - Create/join games with 6-character codes  
✅ **Lobby UI** - Beautiful lobby interface for creating and joining games  
✅ **Utility Functions** - Full API for managing online games  
✅ **UI Integration** - Link from play-game screen to online mode

## Installation Steps

### 1. Install Supabase Client Library

```bash
npm install @supabase/supabase-js
```

### 2. Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire contents of `db/online_game_schema.sql`
5. Click **Run** to execute

This creates:
- `online_game_sessions` - Stores game metadata
- `online_game_state` - Stores full game state  
- `online_game_actions` - Logs all actions
- Helper functions and indexes

### 3. Enable Supabase Realtime (Optional - for future implementation)

1. In Supabase Dashboard, go to **Database** > **Replication**
2. Find `online_game_state` table
3. Enable replication
4. This allows real-time broadcasting between players

### 4. Build and Run

```bash
npm run build
npm start
```

### 5. Test the System

1. Navigate to `/play-game` or `/card-game`
2. Click **"🌐 Play Online Multiplayer"**
3. Click **"Create Game"**
4. You'll get a 6-character code (e.g., "ABC123")
5. Open another browser (or incognito window)
6. Log in as a different user
7. Click **"Join Game"** and enter the code
8. Both players should connect!

## How It Works

### Creating a Game
1. Player clicks "Create Game"
2. System generates unique code (e.g., "XYZ789")
3. Creates record in `online_game_sessions` with status "waiting"
4. Host sees waiting screen with code to share
5. Polls database every 2 seconds for guest player

### Joining a Game
1. Player enters 6-character code
2. System finds session by code
3. Updates session with guest_user_id
4. Changes status from "waiting" to "active"
5. Redirects to game screen

### Game Code Generation
- 6 characters from: `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`
- Excludes similar characters (I, O, 0, 1) to prevent confusion
- Example codes: `ABC123`, `XYZ789`, `QWE456`

## Current Limitations

⚠️ **The actual online game play is not yet fully implemented!**

What you have now:
- Complete lobby system
- Game session creation/joining
- Database structure
- Utility functions

What's still needed:
- Full online-game.play.tsx route
- Supabase Realtime integration for move synchronization  
- Turn validation
- Reconnection handling
- Game end/winner logic

## Next Steps for Full Implementation

To complete the online multiplayer, you need to:

1. **Create online-game.play.tsx** (the actual game screen)
   - Load game state from database
   - Subscribe to Supabase Realtime channel
   - Disable UI when not your turn
   - Broadcast actions after each move

2. **Add Realtime Sync**
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const channel = supabase.channel(`game:${sessionId}`)
     .on('broadcast', { event: 'game_update' }, (payload) => {
       // Update local state when opponent moves
       setPlayers(payload.players)
     })
     .subscribe()
   
   // After each action:
   await saveGameState(newState)
   channel.send({
     type: 'broadcast',
     event: 'game_update',
     payload: newState
   })
   ```

3. **Add Turn Validation**
   - Disable all actions when it's opponent's turn
   - Show "Waiting for opponent..." message
   - Only enable UI on your turn

4. **Handle Edge Cases**
   - Player disconnection
   - Timeouts
   - Forfeit
   - Reconnection

## File Structure

```
db/
  └── online_game_schema.sql           # Database tables and functions

app/
  ├── utils/
  │   └── onlineGame.ts                # Session management utilities
  └── routes/
      ├── online-game.tsx              # Lobby/matchmaking screen
      └── online-game.play.tsx         # (TODO) Actual online game

ONLINE_MULTIPLAYER.md                  # Full technical documentation
ONLINE_MULTIPLAYER_QUICKSTART.md       # This guide
```

## Testing Checklist

- [ ] Can create a new game
- [ ] Game code is displayed
- [ ] Can copy game code to clipboard
- [ ] Can join game with valid code
- [ ] Error shown for invalid code
- [ ] Waiting screen shows while waiting for opponent
- [ ] Both players redirect when game starts
- [ ] Session appears in Supabase database
- [ ] Game state is saved correctly

## Troubleshooting

### "Failed to create game session"
- Check that SQL migration ran successfully
- Verify tables exist in Supabase
- Check browser console for errors

### "Game not found"
- Code might be incorrect (check for typos)
- Game might have already started
- Session might have expired

### Tables not found
- Run the SQL migration in Supabase SQL Editor
- Refresh Supabase dashboard
- Check that you're in the correct project

### Can't join game
- Make sure both users are logged in
- Check that the game code is correct (case-insensitive)
- Verify game status is "waiting" in database

## Support

For more details, see:
- `ONLINE_MULTIPLAYER.md` - Full technical documentation
- `db/online_game_schema.sql` - Database schema with comments
- `app/utils/onlineGame.ts` - API functions with JSDoc

Happy multiplayer gaming! 🎮🔥
