import { useState, useEffect } from 'react';

// Disable SSR entirely  runs client-side only, no service role key needed
export const ssr = false;

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

type UserWithProfile = {
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
};

type Tab = 'admins' | 'users' | 'settings';
const SESSION_KEY = 'narutodle_admin_session';

export default function Admin() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('admins');
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [addAdminError, setAddAdminError] = useState('');
  const [addAdminSuccess, setAddAdminSuccess] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const { email: saved, expiry } = JSON.parse(session);
        if (expiry > Date.now()) { setAdminEmail(saved); setIsLoggedIn(true); }
        else localStorage.removeItem(SESSION_KEY);
      } catch { localStorage.removeItem(SESSION_KEY); }
    }
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => { if (isLoggedIn) { fetchAdminEmails(); fetchUsers(); } }, [isLoggedIn]);

  const fetchAdminEmails = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/admin_users_main?select=email&order=email.asc`, { headers: HEADERS });
    if (res.ok) { const d = await res.json(); setAdminEmails(d.map((r: any) => r.email)); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [ur, pr] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/users?select=id,nick,email,created_at&order=created_at.desc`, { headers: HEADERS }),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?select=*`, { headers: HEADERS }),
      ]);
      const ud = ur.ok ? await ur.json() : [];
      const pd = pr.ok ? await pr.json() : [];
      const pm: Record<string, any> = {};
      pd.forEach((p: any) => { pm[p.user_id] = p; });
      setUsers(ud.map((u: any) => ({ ...u, profile: pm[u.id] })));
    } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/admin_settings_main?setting_key=eq.${encodeURIComponent(email)}&select=setting_value`,
        { headers: HEADERS }
      );
      const data = await res.json();
      if (!res.ok || !data?.length) { setLoginError('Invalid email or password'); setPassword(''); return; }
      const bcrypt = await import('bcryptjs');
      const valid = await bcrypt.compare(password, data[0].setting_value);
      if (!valid) { setLoginError('Invalid email or password'); setPassword(''); return; }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ email, expiry: Date.now() + 86400000 }));
      setAdminEmail(email);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setLoginError('Login failed. Please try again.');
    } finally { setIsLoggingIn(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false); setAdminEmail(''); setEmail(''); setPassword(''); setActiveTab('admins');
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingAdmin(true); setAddAdminError(''); setAddAdminSuccess('');
    try {
      const chk = await fetch(`${SUPABASE_URL}/rest/v1/admin_users_main?email=eq.${encodeURIComponent(newAdminEmail)}&select=id`, { headers: HEADERS });
      const ex = await chk.json();
      if (ex?.length) { setAddAdminError('Email already exists as admin'); return; }
      const bcrypt = await import('bcryptjs');
      const hash = await bcrypt.hash(newAdminPassword, 10);
      const ur = await fetch(`${SUPABASE_URL}/rest/v1/admin_users_main`, {
        method: 'POST', headers: { ...HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ email: newAdminEmail, created_by: adminEmail, notes: 'Added via admin panel' }),
      });
      if (!ur.ok) { setAddAdminError('Failed to add admin user'); return; }
      const sr = await fetch(`${SUPABASE_URL}/rest/v1/admin_settings_main`, {
        method: 'POST', headers: { ...HEADERS, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ setting_key: newAdminEmail, setting_value: hash, updated_by: adminEmail }),
      });
      if (!sr.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/admin_users_main?email=eq.${encodeURIComponent(newAdminEmail)}`, { method: 'DELETE', headers: HEADERS });
        setAddAdminError('Failed to save password'); return;
      }
      setAddAdminSuccess(`${newAdminEmail} added!`); setNewAdminEmail(''); setNewAdminPassword(''); fetchAdminEmails();
    } catch { setAddAdminError('An error occurred'); }
    finally { setIsAddingAdmin(false); }
  };

  const handleRemoveAdmin = async (em: string) => {
    if (!confirm(`Remove ${em} from admin access?`) || adminEmails.length <= 1) return;
    await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/admin_users_main?email=eq.${encodeURIComponent(em)}`, { method: 'DELETE', headers: HEADERS }),
      fetch(`${SUPABASE_URL}/rest/v1/admin_settings_main?setting_key=eq.${encodeURIComponent(em)}`, { method: 'DELETE', headers: HEADERS }),
    ]);
    fetchAdminEmails();
  };

  if (isCheckingAuth) return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
        <p className="text-slate-400">Checking access...</p>
      </div>
    </div>
  );

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-slate-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2"> Admin Panel</h1>
          <p className="text-slate-400">Enter credentials to continue</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
          {loginError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{loginError}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="admin@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="" required />
          </div>
          <button type="submit" disabled={isLoggingIn}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition">
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Logged in as: <span className="text-purple-400">{adminEmail}</span></p>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition">Logout</button>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 bg-slate-800/60 border border-slate-700 p-1 rounded-lg w-fit">
            {(['admins', 'users', 'settings'] as Tab[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab === 'users' ? `Users (${users.length})` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'admins' && (
          <div className="space-y-6">
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
              <form onSubmit={handleAddAdmin} className="space-y-4">
                {addAdminError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{addAdminError}</div>}
                {addAdminSuccess && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">{addAdminSuccess}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                    <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="newadmin@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                    <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Min. 8 characters" minLength={8} required />
                  </div>
                </div>
                <button type="submit" disabled={isAddingAdmin}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition">
                  {isAddingAdmin ? 'Adding...' : 'Add Admin'}
                </button>
              </form>
            </div>
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Current Admins</h2>
              <div className="space-y-2">
                {adminEmails.map(em => (
                  <div key={em} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                    <div>
                      <p className="text-white font-medium">{em}</p>
                      {em === adminEmail && <p className="text-sm text-purple-400">Currently logged in</p>}
                    </div>
                    {em !== adminEmail && adminEmails.length > 1 && (
                      <button onClick={() => handleRemoveAdmin(em)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">All Users ({users.length})</h2>
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {users.map(user => (
                    <button key={user.id} onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-4 rounded-lg border transition ${selectedUser?.id === user.id ? 'bg-purple-600/20 border-purple-500' : 'bg-slate-900/50 border-slate-700 hover:border-purple-500/50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                          {user.nick.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{user.nick}</p>
                          <p className="text-sm text-slate-400 truncate">{user.email}</p>
                        </div>
                        <div className="text-xs text-slate-500 shrink-0">{new Date(user.created_at).toLocaleDateString()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-3xl mb-4"></div>
                  <p className="text-slate-400">Select a user to view details</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1">
                  <div className="flex items-center gap-4 pb-4 mb-2 border-b border-slate-700">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                      {selectedUser.nick.charAt(0).toUpperCase()}
                    </div>
                    <div><h3 className="text-2xl font-bold text-white">{selectedUser.nick}</h3><p className="text-sm text-slate-400">{selectedUser.email}</p></div>
                  </div>
                  {[['User ID', selectedUser.id], ['Username', selectedUser.nick], ['Email', selectedUser.email], ['Joined', new Date(selectedUser.created_at).toLocaleString()]].map(([l, v]) => (
                    <div key={l} className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                      <span className="text-slate-400">{l}</span>
                      <span className="text-white font-mono text-sm text-right max-w-[60%] truncate">{v}</span>
                    </div>
                  ))}
                  {selectedUser.profile && (<>
                    <p className="text-sm font-semibold text-slate-300 pt-2">Stats</p>
                    {[['Level', selectedUser.profile.level ?? 0], ['XP', (selectedUser.profile.xp ?? 0).toLocaleString()], ['Games Played', selectedUser.profile.games_played ?? 0], ['Games Won', selectedUser.profile.games_won ?? 0], ['Score', (selectedUser.profile.total_score ?? 0).toLocaleString()], ...(selectedUser.profile.favorite_character ? [['Fav. Character', selectedUser.profile.favorite_character]] : [])].map(([l, v]) => (
                      <div key={l as string} className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">{l as string}</span><span className="text-white">{v as string|number}</span>
                      </div>
                    ))}
                  </>)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            <p className="text-slate-400">Settings will be added here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
