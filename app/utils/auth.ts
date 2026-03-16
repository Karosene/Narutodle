/**
 * Authentication Utilities
 * Handles user authentication and session management
 */

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  profile_picture: string;
  games_played: number;
  games_won: number;
  total_score: number;
  favorite_character?: string;
  level?: number;
  xp?: number;
  cardgame_games_played?: number;
  cardgame_games_won?: number;
  cardgame_games_lost?: number;
  narutodle_games_played?: number;
  narutodle_total_guesses?: number;
  narutodle_avg_guesses?: number;
  custom_id?: string;
}

// Simple session storage for client-side
const SESSION_KEY = 'narutodle_user_session';

/**
 * Hash password using Web Crypto API (client-side)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new user
 */
export async function registerUser(username: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const passwordHash = await hashPassword(password);

    // Insert user
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nick: username,
        email,
        password_hash: passwordHash
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: error || 'Registration failed' };
    }

    const [user] = await response.json();

    // Create profile for the user
    const profResp = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: user.id,
        display_name: username,
        profile_picture: '/images/logo.png'
      })
    });

    if (!profResp.ok) {
      const txt = await profResp.text();
      console.error('[auth] create profile failed:', profResp.status, txt);
      return { success: false, error: `Failed to create profile (${profResp.status})` };
    }

    // Map backend `nick` to client `username` field shape
    const mappedUser = { id: user.id, username: user.nick, email: user.email } as User;

    // Store session and dispatch auth change
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(mappedUser));
      window.dispatchEvent(new Event('authChange'));
    }

    return { success: true, user: mappedUser };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

/**
 * Login user
 */
export async function loginUser(username: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
  try {
    const passwordHash = await hashPassword(password);

    // Query user with matching nick and password_hash
    const url = `${SUPABASE_URL}/rest/v1/users?nick=eq.${encodeURIComponent(username)}&password_hash=eq.${encodeURIComponent(passwordHash)}&select=id,nick,email`;
    const response = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[auth] login fetch failed:', response.status, text);
      return { success: false, error: `Login failed (${response.status})` };
    }

    const users = await response.json();

    if (users.length === 0) {
      return { success: false, error: 'Invalid username or password' };
    }

    // map backend `nick` to client `username` field shape
    const raw = users[0];
    const user = { id: raw.id, username: raw.nick, email: raw.email } as User;
    
    // Store session
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      window.dispatchEvent(new Event('authChange'));
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error' };
  }
}

/**
 * Get current user from session
 */
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) return null;
  
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

/**
 * Logout user
 */
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event('authChange'));
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) return null;

    const profiles = await response.json();
    return profiles.length > 0 ? profiles[0] : null;
  } catch {
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'user_id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?user_id=eq.${userId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      }
    );

    if (!response.ok) {
      const txt = await response.text();
      console.error('[auth] updateUserProfile failed:', response.status, txt);
      return { success: false, error: txt || `Update failed (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Network error' };
  }
}
