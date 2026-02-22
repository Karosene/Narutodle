import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, getUserProfile, updateUserProfile, logoutUser, type Profile } from '../utils/auth';
import type { Route } from './+types/profile';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Profile - Narutodle' },
    { name: 'description', content: 'View your stats and customize your profile' },
  ];
};

const AVATAR_OPTIONS = [
  '/images/naruto.png',
  '/images/sasukeUchiha.png',
  '/images/sakuraHaruno.png',
  '/images/kakashiHatake.png',
  '/images/itachiUchiha.png',
  '/images/hinataHyuga.png',
  '/images/jiraiya.png',
  '/images/minato.png',
  '/images/kushina.png',
  '/images/obitoUchiha.png',
  '/images/madaraUchiha.png',
  '/images/hagoromoOtsutsuki.png',
  '/images/gaara.png',
  '/images/kaguyaOtsutsuki.png',
  '/images/tsunade.png',
  '/images/orochimaru.png',
  '/images/shikamaruNara.png',
  '/images/kurama.png',
];

function LevelBadge({ level, xp, size = 72 }: { level: number | null; xp?: number | null; size?: number }) {
  const stroke = Math.max(4, Math.round(size * 0.1));
  const radius = (size - stroke) / 2.3;
  const circumference = 2 * Math.PI * radius;
  const xpValue = xp ?? 0;
  const levelFromXp = (value: number) => {
    if (value <= 0) return 1;
    const scaled = (2 * value) / 5;
    return Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * scaled)) / 2));
  };
  const xpForLevel = (lvl: number) => (5 * (lvl - 1) * lvl) / 2;
  const currentLevel = level ?? levelFromXp(xpValue);
  const currentThreshold = xpForLevel(currentLevel);
  const nextThreshold = xpForLevel(currentLevel + 1);
  const progress = nextThreshold > currentThreshold
    ? Math.min(1, Math.max(0, (xpValue - currentThreshold) / (nextThreshold - currentThreshold)))
    : 0;
  const dash = `${(progress * circumference).toFixed(2)} ${circumference.toFixed(2)}`;
  const currentXpProgress = xpValue - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;

  return (
    <div style={{ width: size, height: size }} title={`${currentXpProgress}/${xpNeeded}XP`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#374151" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="#7c3aed" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={dash} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: 'relative', top: -size, height: size }} className="flex items-center justify-center">
        <div className="text-white font-semibold" style={{ fontSize: size * 0.35  }}>{level ?? '-'}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [favoriteCharacter, setFavoriteCharacter] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const user = getCurrentUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setCurrentUser(user);

      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        setDisplayName(userProfile.display_name);
        setFavoriteCharacter(userProfile.favorite_character || '');
        setSelectedAvatar(userProfile.profile_picture);
      }

      setLoading(false);
    };

    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    const user = getCurrentUser();
    if (!user) return;

    setSaving(true);
    const result = await updateUserProfile(user.id, {
      display_name: displayName,
      favorite_character: favoriteCharacter,
      profile_picture: selectedAvatar,
    });

    if (result.success) {
      const updated = await getUserProfile(user.id);
      if (updated) setProfile(updated);
      setEditing(false);
    } else {
      // surface error so user knows why save failed
      // also check browser console for detailed server response
      alert(`Save failed: ${result.error ?? 'unknown error'}`);
      console.error('[profile] updateUserProfile error:', result.error);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-slate-600 dark:text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">Profile not found</div>
      </div>
    );
  }

  const avgGuessesRaw = (profile as any)?.narutodle_avg_guesses;
  const avgGuesses = Number.isFinite(Number(avgGuessesRaw)) ? Number(avgGuessesRaw) : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${profile.profile_picture ? 'border-yellow-500' : 'border-orange-500'} shadow-lg`}>
                <img 
                  src={profile.profile_picture} 
                  alt="Profile" 
                  className="w-full h-full object-cover bg-slate-200 dark:bg-slate-800"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/logo.png';
                  }}
                />
              </div>
              {editing && (
                <button
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute bottom-0 right-0 bg-yellow-500 text-slate-900 p-2 rounded-full shadow-lg hover:bg-yellow-600 transition font-semibold"
                  title="Change avatar"
                >
                  ✏️
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Favorite Character
                    </label>
                    <input
                      type="text"
                      value={favoriteCharacter}
                      onChange={(e) => setFavoriteCharacter(e.target.value)}
                      placeholder="e.g., Naruto, Sasuke, Kakashi"
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {profile.display_name}
                      </h1>
                      {profile.favorite_character && (
                        <p className="text-slate-600 dark:text-slate-400">⭐ Favorite: {profile.favorite_character}</p>
                      )}
                    </div>
                    <div className="mr-auto ml-5">
                      <LevelBadge level={(profile as any)?.level ?? null} xp={(profile as any)?.xp ?? null} size={70} />
                    </div>
                  </div>

                  {/* Friend ID */}
                  {currentUser && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentUser.username);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      title="Copy Friend ID"
                      className="mt-3 inline-flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-2 cursor-pointer transition-colors group">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Friend ID</span>
                      <span className="text-sm font-mono text-white select-all">{currentUser.username}</span>
                      {copied ? (
                        <svg className="w-4 h-4 text-green-400 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="9" y="9" width="13" height="13" rx="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setDisplayName(profile.display_name);
                      setFavoriteCharacter(profile.favorite_character || '');
                      setSelectedAvatar(profile.profile_picture);
                      setShowAvatarPicker(false);
                    }}
                    className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 font-semibold transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg hover:bg-yellow-600 font-semibold transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Avatar Picker */}
          {showAvatarPicker && editing && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Choose Avatar</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {AVATAR_OPTIONS.map((avatar) => (
                  <button
                    key={avatar}
                    onClick={() => {
                      setSelectedAvatar(avatar);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-16 h-16 rounded-full overflow-hidden border-2 transition ${
                      selectedAvatar === avatar
                        ? 'border-orange-500 scale-110'
                        : 'border-slate-300 dark:border-slate-600 hover:border-orange-400'
                    }`}
                  >
                    <img
                      src={avatar}
                      alt="Avatar option"
                      className="w-full h-full object-cover bg-slate-200 dark:bg-slate-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/logo.png';
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Upload from your device</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setSelectedAvatar(String(reader.result || ''));
                      setShowAvatarPicker(false);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="text-sm text-slate-700 dark:text-slate-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Statistics</h2>
          
          {/* Narutodle Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-orange-500 dark:text-orange-400 mb-4">🍜 Narutodle</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-linear-to-br from-orange-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800/70 rounded-lg px-5 py-4 border border-orange-200 dark:border-slate-700">
                <div className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400 font-semibold">Games Played</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {(profile as any)?.narutodle_games_played ?? 0}
                </div>
              </div>
              <div className="bg-linear-to-br from-orange-50 to-yellow-50 dark:from-slate-800 dark:to-slate-800/70 rounded-lg px-5 py-4 border border-orange-200 dark:border-slate-700">
                <div className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400 font-semibold">Average Guesses</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {avgGuesses.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Card Game Stats */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-blue-500 dark:text-blue-400 mb-4">🎴 Card Game (Online)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-linear-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/70 rounded-lg px-5 py-4 border border-blue-200 dark:border-slate-700">
                <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">Games Played</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {((profile as any)?.cardgame_games_won ?? 0) + ((profile as any)?.cardgame_games_lost ?? 0)}
                </div>
              </div>
              <div className="bg-linear-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/70 rounded-lg px-5 py-4 border border-green-200 dark:border-slate-700">
                <div className="text-xs uppercase tracking-wide text-green-600 dark:text-green-400 font-semibold">Wins</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {(profile as any)?.cardgame_games_won ?? 0}
                </div>
              </div>
              <div className="bg-linear-to-br from-red-50 to-rose-50 dark:from-slate-800 dark:to-slate-800/70 rounded-lg px-5 py-4 border border-red-200 dark:border-slate-700">
                <div className="text-xs uppercase tracking-wide text-red-600 dark:text-red-400 font-semibold">Losses</div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  {(profile as any)?.cardgame_games_lost ?? 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
