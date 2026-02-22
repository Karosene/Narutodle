/**
 * Friends utilities
 * Uses the same direct Supabase REST pattern as auth.ts
 */

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

const HEADERS = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
};

export interface FriendRow {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  updated_at: string;
  // joined fields (when fetching with select=*)
  from_user?: { id: string; nick: string };
  to_user?: { id: string; nick: string };
}

/**
 * Look up a user by username (nick) — returns their id or null.
 */
export async function findUserByUsername(username: string): Promise<{ id: string; nick: string } | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?nick=eq.${encodeURIComponent(username)}&select=id,nick&limit=1`,
    { headers: HEADERS }
  );
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0] ?? null;
}

/**
 * Get all friend rows where the current user is involved (sent or received).
 * Joins the other user's nick via Supabase embedded resource syntax isn't
 * available with anon REST for FK relations without views, so we fetch both
 * sides and merge usernames separately.
 */
export async function getFriendRows(userId: string): Promise<FriendRow[]> {
  const [sentRes, receivedRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/friends?from_user_id=eq.${userId}&select=*`, { headers: HEADERS }),
    fetch(`${SUPABASE_URL}/rest/v1/friends?to_user_id=eq.${userId}&select=*`, { headers: HEADERS }),
  ]);

  const sent: FriendRow[] = sentRes.ok ? await sentRes.json() : [];
  const received: FriendRow[] = receivedRes.ok ? await receivedRes.json() : [];
  return [...sent, ...received];
}

/**
 * Send a friend request from_user_id → to_user_id.
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string; row?: FriendRow }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/friends`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ from_user_id: fromUserId, to_user_id: toUserId, status: 'pending' }),
  });
  if (!res.ok) {
    const txt = await res.text();
    // unique constraint violation → already exists
    if (txt.includes('23505') || txt.includes('unique')) {
      return { success: false, error: 'Friend request already sent.' };
    }
    return { success: false, error: txt || 'Failed to send request.' };
  }
  const [row] = await res.json();
  return { success: true, row };
}

/**
 * Accept a friend request by id.
 */
export async function acceptFriendRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/friends?id=eq.${requestId}`,
    {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ status: 'accepted', updated_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) return { success: false, error: await res.text() };
  return { success: true };
}

/**
 * Decline a friend request by id.
 */
export async function declineFriendRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/friends?id=eq.${requestId}`,
    {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({ status: 'declined', updated_at: new Date().toISOString() }),
    }
  );
  if (!res.ok) return { success: false, error: await res.text() };
  return { success: true };
}

/**
 * Cancel / delete a friend request or remove a friend.
 */
export async function removeFriendRow(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/friends?id=eq.${requestId}`, {
    method: 'DELETE',
    headers: HEADERS,
  });
  if (!res.ok) return { success: false, error: await res.text() };
  return { success: true };
}

/**
 * Resolve a list of user IDs to { id, nick } objects in one request.
 */
export async function resolveUserNicks(
  ids: string[]
): Promise<Record<string, string>> {
  if (ids.length === 0) return {};
  const filter = ids.map(id => `id.eq.${id}`).join(',');
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?or=(${encodeURIComponent(filter)})&select=id,nick`,
    { headers: HEADERS }
  );
  if (!res.ok) return {};
  const rows: { id: string; nick: string }[] = await res.json();
  return Object.fromEntries(rows.map(r => [r.id, r.nick]));
}
