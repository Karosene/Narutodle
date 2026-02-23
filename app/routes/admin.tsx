import { useState } from 'react';
import { Form, useLoaderData, useActionData, useNavigate } from 'react-router';
import type { Route } from './+types/admin';

// Define type locally to avoid server-only import in component
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

// Server-side action to handle form submissions
export async function action({ request }: Route.ActionArgs) {
  // Import server functions only in server context
  const { adminLogin, addAdminEmail, removeAdminEmail } = await import('~/utils/admin.server');
  
  const formData = await request.formData();
  const actionType = formData.get('_action') as string;

  if (actionType === 'login') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const result = await adminLogin(email, password);
    
    if (result.success) {
      // Set session cookie and redirect
      return Response.json({ success: true }, {
        headers: {
          'Set-Cookie': `admin_session=${email}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${24 * 60 * 60}`,
        }
      });
    }
    
    return { success: false, error: result.error };
  }

  if (actionType === 'logout') {
    return Response.json({ success: true }, {
      headers: {
        'Set-Cookie': 'admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
      }
    });
  }

  if (actionType === 'addAdmin') {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const result = await addAdminEmail(email, password);
    return result;
  }

  if (actionType === 'removeAdmin') {
    const email = formData.get('email') as string;
    const result = await removeAdminEmail(email);
    return result;
  }

  return { success: false, error: 'Unknown action' };
}

// Server-side loader to check session and get data
export async function loader({ request }: Route.LoaderArgs) {
  // Import server functions only in server context
  const { getAllAdminEmails, getAllUsers } = await import('~/utils/admin.server');
  
  const cookieHeader = request.headers.get('Cookie');
  const adminEmail = cookieHeader?.split(';').find(c => c.trim().startsWith('admin_session='))?.split('=')[1];

  if (!adminEmail) {
    return { isLoggedIn: false, adminEmail: null, adminEmails: [], users: [] };
  }

  const [adminEmails, users] = await Promise.all([
    getAllAdminEmails(),
    getAllUsers()
  ]);
  
  return { isLoggedIn: true, adminEmail, adminEmails, users };
}

export default function Admin() {
  const { isLoggedIn, adminEmail, adminEmails, users } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'admins' | 'users' | 'settings'>('admins');
  const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);

  // Handle logout redirect
  if (actionData?.success && !isLoggedIn) {
    navigate('/admin', { replace: true });
  }

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-8 w-full max-w-md border border-slate-700">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">🔐 Admin Panel</h1>
            <p className="text-slate-400">Enter credentials to continue</p>
          </div>

          <Form method="post" className="space-y-4" autoComplete="off">
            <input type="hidden" name="_action" value="login" />
            
            {actionData && !actionData.success && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                {actionData.error || 'Login failed'}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                autoComplete="off"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                autoComplete="off"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition cursor-pointer relative z-10"
            >
              Login
            </button>
          </Form>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">
              Logged in as: <span className="text-purple-400">{adminEmail}</span>
            </p>
          </div>
          <Form method="post">
            <input type="hidden" name="_action" value="logout" />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
            >
              Logout
            </button>
          </Form>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 bg-slate-800/60 border border-slate-700 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('admins')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'admins'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin Users
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Users ({users?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Admin Users Tab */}
        {activeTab === 'admins' && (
          <div className="space-y-6">
            {/* Add Admin Form */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Add New Admin</h2>
              
              <Form method="post" className="space-y-4">
                <input type="hidden" name="_action" value="addAdmin" />
                
                {actionData && actionData.success && (
                  <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">
                    Admin added successfully!
                  </div>
                )}

                {actionData && !actionData.success && actionData.error && (
                  <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {actionData.error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="off"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="newadmin@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="Min. 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                  Add Admin
                </button>
              </Form>
            </div>

            {/* Admin List */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">Current Admins</h2>
              
              <div className="space-y-2">
                {adminEmails.length === 0 ? (
                  <p className="text-slate-400">No admin users found.</p>
                ) : (
                  adminEmails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                    >
                      <div>
                        <p className="text-white font-medium">{email}</p>
                        {email === adminEmail && (
                          <p className="text-sm text-purple-400">Currently logged in</p>
                        )}
                      </div>
                      
                      {email !== adminEmail && adminEmails.length > 1 && (
                        <Form method="post">
                          <input type="hidden" name="_action" value="removeAdmin" />
                          <input type="hidden" name="email" value={email} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!confirm(`Remove ${email} from admin access?`)) {
                                e.preventDefault();
                              }
                            }}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
                          >
                            Remove
                          </button>
                        </Form>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User List */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">All Users ({users?.length || 0})</h2>
              
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {!users || users.length === 0 ? (
                  <p className="text-slate-400">No users found.</p>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left p-4 rounded-lg border transition ${
                        selectedUser?.id === user.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-slate-900/50 border-slate-700 hover:border-purple-500/50 hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          {user.nick.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{user.nick}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* User Details */}
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
              <h2 className="text-xl font-bold text-white mb-4">User Details</h2>
              
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-3xl mb-4">
                    👤
                  </div>
                  <p className="text-slate-400">Select a user to view details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* User Header */}
                  <div className="flex items-center gap-4 pb-6 border-b border-slate-700">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {selectedUser.nick.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{selectedUser.nick}</h3>
                      <p className="text-sm text-slate-400">{selectedUser.email}</p>
                    </div>
                  </div>

                  {/* Account Info */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-3">Account Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">User ID</span>
                        <span className="text-white font-mono text-sm">{selectedUser.id}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Username</span>
                        <span className="text-white">{selectedUser.nick}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Email</span>
                        <span className="text-white">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-slate-400">Created</span>
                        <span className="text-white">{new Date(selectedUser.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Stats */}
                  {selectedUser.profile && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-3">Profile & Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">Display Name</span>
                          <span className="text-white">{selectedUser.profile.display_name}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">Level</span>
                          <span className="text-white font-bold">{selectedUser.profile.level || 0}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">XP</span>
                          <span className="text-white">{selectedUser.profile.xp?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">Total Games</span>
                          <span className="text-white">{selectedUser.profile.games_played || 0}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">Games Won</span>
                          <span className="text-green-400 font-semibold">{selectedUser.profile.games_won || 0}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                          <span className="text-slate-400">Total Score</span>
                          <span className="text-yellow-400 font-semibold">{selectedUser.profile.total_score?.toLocaleString() || 0}</span>
                        </div>
                        {selectedUser.profile.favorite_character && (
                          <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                            <span className="text-slate-400">Favorite Character</span>
                            <span className="text-white">{selectedUser.profile.favorite_character}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Game Stats */}
                      {(selectedUser.profile.cardgame_games_played || 0) > 0 && (
                        <div className="mt-4">
                          <h5 className="text-xs font-semibold text-purple-400 mb-2">Card Game Stats</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 bg-slate-900/30 rounded text-sm">
                              <span className="text-slate-400">Games Played</span>
                              <span className="text-white">{selectedUser.profile.cardgame_games_played || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900/30 rounded text-sm">
                              <span className="text-slate-400">Wins</span>
                              <span className="text-green-400">{selectedUser.profile.cardgame_games_won || 0}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-slate-900/30 rounded text-sm">
                              <span className="text-slate-400">Losses</span>
                              <span className="text-red-400">{selectedUser.profile.cardgame_games_lost || 0}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Narutodle Stats */}
                      {(selectedUser.profile.narutodle_games_played || 0) > 0 && (
                        <div className="mt-4">
                          <h5 className="text-xs font-semibold text-orange-400 mb-2">Narutodle Stats</h5>
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 bg-slate-900/30 rounded text-sm">
                              <span className="text-slate-400">Games Played</span>
                              <span className="text-white">{selectedUser.profile.narutodle_games_played || 0}</span>
                            </div>
                            {selectedUser.profile.narutodle_avg_guesses && (
                              <div className="flex justify-between p-2 bg-slate-900/30 rounded text-sm">
                                <span className="text-slate-400">Avg. Guesses</span>
                                <span className="text-white">{selectedUser.profile.narutodle_avg_guesses.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!selectedUser.profile && (
                    <div className="text-center py-8">
                      <p className="text-slate-400 text-sm">No profile data available</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Settings</h2>
            <p className="text-slate-400">Settings will be added here...</p>
          </div>
        )}
      </div>
    </div>
  );
}
