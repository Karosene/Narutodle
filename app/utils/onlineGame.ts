/**
 * Online Multiplayer Game Utilities
 * Handles game session creation, joining, and state management
 */

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

export interface OnlineGameSession {
  id: string;
  game_code: string;
  host_user_id: string;
  guest_user_id: string | null;
  status: 'waiting' | 'active' | 'finished' | 'abandoned';
  current_player_index: number;
  winner_user_id: string | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface GameState {
  id?: string;
  session_id: string;
  players: any; // JSONB
  pending_players?: any; // JSONB - players waiting for game to start
  booster_hands: any; // JSONB
  booster_deck?: any;
  jutsu_cooldowns?: any;
  game_started: boolean;
  show_number_guess: boolean;
  target_number?: number;
  player1_guess?: string;
  player2_guess?: string;
  guessing_player_index?: 0 | 1 | null;
  guess_timer?: number;
  jutsus_used_this_turn: number;
  selected_character?: any;
  selected_jutsu?: any;
  selected_booster?: any;
  selecting_target: boolean;
  selecting_jutsu_target: boolean;
  is_selecting_splash_targets: boolean;
  splash_targets?: any;
  newly_drawn_card?: any;
  double_attack_character?: any;
  healed_card?: any;
  updated_at?: string;
}

/**
 * Generate a random 6-character game code
 */
function generateGameCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new online game session
 */
export async function createGameSession(hostUserId: string): Promise<{ success: boolean; session?: OnlineGameSession; gameCode?: string; error?: string }> {
  try {
    const gameCode = generateGameCode();
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/online_game_sessions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        game_code: gameCode,
        host_user_id: hostUserId,
        status: 'waiting',
        last_activity_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create game session:', error);
      return { success: false, error: 'Failed to create game session' };
    }

    const sessions = await response.json();
    return { success: true, session: sessions[0], gameCode };
  } catch (error) {
    console.error('Error creating game session:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Join an existing game session by code
 */
export async function joinGameSession(gameCode: string, guestUserId: string): Promise<{ success: boolean; session?: OnlineGameSession; error?: string }> {
  try {
    // First, check if the game exists and is waiting
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?game_code=eq.${gameCode}&status=eq.waiting`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!checkResponse.ok) {
      return { success: false, error: 'Failed to find game' };
    }

    const sessions = await checkResponse.json();
    if (!sessions || sessions.length === 0) {
      return { success: false, error: 'Game not found or already started' };
    }

    const session = sessions[0];

    // Update the session to add the guest player
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?id=eq.${session.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          guest_user_id: guestUserId,
          status: 'active',
          last_activity_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      return { success: false, error: 'Failed to join game' };
    }

    const updatedSessions = await updateResponse.json();
    return { success: true, session: updatedSessions[0] };
  } catch (error) {
    console.error('Error joining game session:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get game session by ID
 */
export async function getGameSession(sessionId: string): Promise<{ success: boolean; session?: OnlineGameSession; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?id=eq.${sessionId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch session' };
    }

    const sessions = await response.json();
    if (!sessions || sessions.length === 0) {
      return { success: false, error: 'Session not found' };
    }

    return { success: true, session: sessions[0] };
  } catch (error) {
    console.error('Error fetching game session:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Update game session
 */
export async function updateGameSession(
  sessionId: string,
  updates: Partial<OnlineGameSession>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?id=eq.${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updates,
          last_activity_at: new Date().toISOString()
        })
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to update session' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating game session:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Save game state to database
 */
export async function saveGameState(state: GameState): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if state already exists
    const checkResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_state?session_id=eq.${state.session_id}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const existing = await checkResponse.json();
    const method = existing && existing.length > 0 ? 'PATCH' : 'POST';
    const url = existing && existing.length > 0
      ? `${SUPABASE_URL}/rest/v1/online_game_state?session_id=eq.${state.session_id}`
      : `${SUPABASE_URL}/rest/v1/online_game_state`;

    const response = await fetch(url, {
      method,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(state)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to save game state:', error);
      return { success: false, error: 'Failed to save game state' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving game state:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Load game state from database
 */
export async function loadGameState(sessionId: string): Promise<{ success: boolean; state?: GameState; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_state?session_id=eq.${sessionId}`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to load game state' };
    }

    const states = await response.json();
    if (!states || states.length === 0) {
      return { success: false, error: 'Game state not found' };
    }

    return { success: true, state: states[0] };
  } catch (error) {
    console.error('Error loading game state:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Log a game action
 */
export async function logGameAction(
  sessionId: string,
  userId: string,
  actionType: string,
  actionData: any,
  turnNumber: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/online_game_actions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        action_type: actionType,
        action_data: actionData,
        turn_number: turnNumber
      })
    });

    if (!response.ok) {
      return { success: false, error: 'Failed to log action' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging game action:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Delete game session (for cleanup or cancellation)
 */
export async function deleteGameSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?id=eq.${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to delete session' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting game session:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get user's online game statistics
 */
export async function getUserOnlineStats(userId: string): Promise<{
  success: boolean;
  stats?: {
    gamesPlayed: number;
    wins: number;
    losses: number;
  };
  error?: string;
}> {
  try {
    // Get all finished games where user was host or guest
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/online_game_sessions?or=(host_user_id.eq.${userId},guest_user_id.eq.${userId})&status=eq.finished`,
      {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch stats' };
    }

    const sessions: OnlineGameSession[] = await response.json();
    
    const gamesPlayed = sessions.length;
    const wins = sessions.filter(s => s.winner_user_id === userId).length;
    const losses = sessions.filter(s => s.winner_user_id && s.winner_user_id !== userId).length;

    return {
      success: true,
      stats: {
        gamesPlayed,
        wins,
        losses
      }
    };
  } catch (error) {
    console.error('Error fetching user online stats:', error);
    return { success: false, error: 'Network error' };
  }
}
