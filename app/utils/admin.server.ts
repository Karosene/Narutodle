import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role client for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AdminUser {
  id: number;
  email: string;
  created_at: string;
  created_by: string;
  notes?: string;
}

// Hash password using bcrypt
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Admin login
export async function adminLogin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: admin, error } = await supabaseAdmin
      .from('admin_settings_main')
      .select('*')
      .eq('setting_key', email)
      .single();

    if (error || !admin) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValid = await verifyPassword(password, admin.setting_value);
    
    if (!isValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Store admin session in localStorage (client-side will handle this)
    return { success: true };
  } catch (err) {
    console.error('Admin login error:', err);
    return { success: false, error: 'Login failed' };
  }
}

// Check if email is admin
export async function isAdminEmail(email: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users_main')
      .select('id')
      .eq('email', email)
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
}

// Get all admin emails
export async function getAllAdminEmails(): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('admin_users_main')
      .select('email')
      .order('email', { ascending: true });

    if (error || !data) {
      return [];
    }

    return data.map(admin => admin.email);
  } catch {
    return [];
  }
}

// Add admin email
export async function addAdminEmail(email: string, password: string, addedBy: string = 'system'): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if email already exists
    const exists = await isAdminEmail(email);
    if (exists) {
      return { success: false, error: 'Email already exists as admin' };
    }

    const passwordHash = await hashPassword(password);

    // Insert into admin_users_main
    const { error: userError } = await supabaseAdmin
      .from('admin_users_main')
      .insert({
        email: email,
        created_by: addedBy,
        notes: 'Added via admin panel'
      });

    if (userError) {
      console.error('Error adding admin user:', userError);
      return { success: false, error: 'Failed to add admin email' };
    }

    // Insert into admin_settings_main
    const { error: settingsError } = await supabaseAdmin
      .from('admin_settings_main')
      .insert({
        setting_key: email,
        setting_value: passwordHash,
        updated_by: addedBy
      });

    if (settingsError) {
      console.error('Error adding admin password:', settingsError);
      // Rollback: remove from admin_users_main
      await supabaseAdmin.from('admin_users_main').delete().eq('email', email);
      return { success: false, error: 'Failed to add admin password' };
    }

    return { success: true };
  } catch (err) {
    console.error('Add admin email error:', err);
    return { success: false, error: 'Failed to add admin email' };
  }
}

// Remove admin email
export async function removeAdminEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Get count of admins
    const allAdmins = await getAllAdminEmails();
    
    // Prevent removing the last admin
    if (allAdmins.length <= 1) {
      return { success: false, error: 'Cannot remove the last admin' };
    }

    // Remove from admin_settings_main
    const { error: settingsError } = await supabaseAdmin
      .from('admin_settings_main')
      .delete()
      .eq('setting_key', email);

    if (settingsError) {
      console.error('Error removing admin password:', settingsError);
      return { success: false, error: 'Failed to remove admin password' };
    }

    // Remove from admin_users_main
    const { error: userError } = await supabaseAdmin
      .from('admin_users_main')
      .delete()
      .eq('email', email);

    if (userError) {
      console.error('Error removing admin user:', userError);
      // Note: password already deleted, but continuing anyway
    }

    return { success: true };
  } catch (err) {
    console.error('Remove admin email error:', err);
    return { success: false, error: 'Failed to remove admin email' };
  }
}

// Update admin password
export async function updateAdminPassword(email: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const passwordHash = await hashPassword(newPassword);

    const { error } = await supabaseAdmin
      .from('admin_settings_main')
      .update({
        setting_value: passwordHash,
        updated_at: new Date().toISOString()
      })
      .eq('setting_key', email);

    if (error) {
      console.error('Error updating password:', error);
      return { success: false, error: 'Failed to update password' };
    }

    return { success: true };
  } catch (err) {
    console.error('Update password error:', err);
    return { success: false, error: 'Failed to update password' };
  }
}

// User management functions
export interface UserWithProfile {
  id: string;
  nick: string;
  email: string;
  created_at: string;
  profile?: {
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
    narutodle_avg_guesses?: number;
  };
}

/**
 * Get all users from the database (without password hashes)
 */
export async function getAllUsers(): Promise<UserWithProfile[]> {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, nick, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return users || [];
  } catch (err) {
    console.error('Get all users error:', err);
    return [];
  }
}

/**
 * Get a single user with their profile details
 */
export async function getUserDetails(userId: string): Promise<UserWithProfile | null> {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, nick, email, created_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return null;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.log('No profile found for user:', userId);
    }

    return {
      ...user,
      profile: profile || undefined
    };
  } catch (err) {
    console.error('Get user details error:', err);
    return null;
  }
}

// Client-side helpers
export function getAdminSession() {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem('admin_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

export function setAdminSession(email: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin_session', JSON.stringify({ email, timestamp: Date.now() }));
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin_session');
}

export function isAdminLoggedIn(): boolean {
  const session = getAdminSession();
  if (!session) return false;
  
  // Session expires after 24 hours
  const dayInMs = 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - session.timestamp > dayInMs;
  
  if (isExpired) {
    clearAdminSession();
    return false;
  }
  
  return true;
}
