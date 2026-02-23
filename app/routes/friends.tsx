  import { useState, useEffect } from 'react';
import { getCurrentUser, getUserProfile, type Profile } from '~/utils/auth';
import {
  getFriendRows,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriendRow,
  findUserByUsername,
  resolveUserNicks,
  type FriendRow,
} from '~/utils/friends';

function LevelBadge({ level, xp, size = 50 }: { level: number | null; xp?: number | null; size?: number }) {
  const stroke = Math.max(4, Math.round(size * 0.13));
  const radius = (size - stroke) / 2.3;
  const circumference = 2 * Math.PI * radius;
  const xpValue = xp ?? 0;
  const levelFromXp = (v: number) => { if (v <= 0) return 1; const s = (2*v)/5; return Math.max(1, Math.floor((1+Math.sqrt(1+4*s))/2)); };
  const xpForLevel = (l: number) => (5*(l-1)*l)/2;
  const currentLevel = level ?? levelFromXp(xpValue);
  const ct = xpForLevel(currentLevel), nt = xpForLevel(currentLevel+1);
  const progress = nt > ct ? Math.min(1, Math.max(0, (xpValue-ct)/(nt-ct))) : 0;
  const dash = `${(progress*circumference).toFixed(2)} ${circumference.toFixed(2)}`;
  return (
    <div style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="#374151" strokeWidth={stroke} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke="#7c3aed" strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={dash} transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div style={{ position: 'relative', top: -size, height: size }} className="flex items-center justify-center">
        <div className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>{level ?? '-'}</div>
      </div>
    </div>
  );
}

export default function Friends() {
  const TAB_ORDER: ('friends' | 'pending' | 'add')[] = ['friends', 'pending', 'add'];
  const [tab, setTab] = useState<'friends' | 'pending' | 'add'>('friends');
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [animKey, setAnimKey] = useState(0);

  const switchTab = (next: 'friends' | 'pending' | 'add') => {
    if (next === tab) return;
    const dir = TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(tab) ? 'left' : 'right';
    setSlideDir(dir);
    setAnimKey(k => k + 1);
    setTab(next);
  };
  const [user, setUser] = useState<any>(null);
  const [rows, setRows] = useState<FriendRow[]>([]);
  const [nicks, setNicks] = useState<Record<string, string>>({});
  const [friendProfiles, setFriendProfiles] = useState<Record<string, Profile>>({});
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFriend, setNewFriend] = useState('');
  const [sendError, setSendError] = useState('');
  const [sending, setSending] = useState(false);

  async function loadData(u: any) {
    setLoading(true);
    const allRows = await getFriendRows(u.id);
    setRows(allRows);
    const ids = [...new Set(allRows.flatMap(r => [r.from_user_id, r.to_user_id]).filter(id => id !== u.id))];
    const [resolved, ...profileResults] = await Promise.all([
      resolveUserNicks(ids),
      ...ids.map(id => getUserProfile(id)),
    ]);
    setNicks(resolved as Record<string, string>);
    const profileMap: Record<string, Profile> = {};
    ids.forEach((id, i) => { if (profileResults[i]) profileMap[id] = profileResults[i] as Profile; });
    setFriendProfiles(profileMap);
    setLoading(false);
  }

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u) loadData(u);
    else setLoading(false);
  }, []);

  const accepted = rows.filter(r => r.status === 'accepted');
  const incoming = rows.filter(r => r.status === 'pending' && r.to_user_id === user?.id);
  const outgoing = rows.filter(r => r.status === 'pending' && r.from_user_id === user?.id);
  const pendingCount = incoming.length + outgoing.length;

  function otherNick(row: FriendRow): string {
    const otherId = row.from_user_id === user?.id ? row.to_user_id : row.from_user_id;
    return nicks[otherId] || otherId;
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = newFriend.trim();
    if (!trimmed) return;
    setSendError('');
    setSending(true);
    const target = await findUserByUsername(trimmed);
    if (!target) { setSendError(`User "${trimmed}" not found.`); setSending(false); return; }
    if (target.id === user.id) { setSendError("You can't add yourself."); setSending(false); return; }
    const { success, error } = await sendFriendRequest(user.id, target.id);
    if (!success) { setSendError(error || 'Failed to send request.'); }
    else { setNewFriend(''); await loadData(user); switchTab('pending'); }
    setSending(false);
  }

  async function handleAccept(id: string) {
    await acceptFriendRequest(id);
    await loadData(user);
  }

  async function handleDecline(id: string) {
    setConfirmDialog({ message: 'Decline this friend request?', onConfirm: async () => { await declineFriendRequest(id); await loadData(user); } });
  }

  async function handleCancel(id: string) {
    setConfirmDialog({ message: 'Cancel this friend request?', onConfirm: async () => { await removeFriendRow(id); await loadData(user); } });
  }

  async function handleRemove(id: string, nick: string) {
    setConfirmDialog({ message: `Remove ${nick} from your friends?`, onConfirm: async () => { await removeFriendRow(id); await loadData(user); } });
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 py-10">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h1 className="text-2xl font-bold text-white mb-2">Friends</h1>
          <p className="text-slate-400 mb-6">Sign in to connect with other players.</p>
          <a href="/login" className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl transition-colors">Sign In</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 py-10">
      <div className="mx-auto max-w-5xl px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Friends</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your friends and invitations</p>
        </div>
        {accepted.length > 0 && (
          <span className="text-xs font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full">{accepted.length} friend{accepted.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Tab bar */}
      <div className="mb-7">
        <div className="relative inline-flex items-center rounded-2xl bg-slate-900/80 border border-slate-800 p-1 gap-0.5 shadow-inner backdrop-blur-sm">
          <div
            className="absolute top-1 bottom-1 rounded-xl bg-slate-700/80 shadow-md border border-slate-600/30"
            style={{
              width: 'calc(33.333% - 2.67px)',
              transform: `translateX(${tab === 'friends' ? '0%' : tab === 'pending' ? '100%' : '200%'})`,
              transition: 'transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          />
          <button
            onClick={() => switchTab('friends')}
            className={`relative z-10 px-5 py-2.5 w-32 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-200 ${
              tab === 'friends' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            Friends
          </button>
          <button
            onClick={() => switchTab('pending')}
            className={`relative z-10 px-5 py-2.5 w-32 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5 ${
              tab === 'pending' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            Requests
            {pendingCount > 0 && (
              <span className="bg-amber-400 text-slate-900 text-xs rounded-full px-1.5 py-0.5 leading-none font-bold min-w-[18px] text-center">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => switchTab('add')}
            className={`relative z-10 px-5 py-2.5 w-32 whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-200 ${
              tab === 'add' ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}>
            Add Friend
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .slide-left  { animation: slideInLeft  0.22s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        .slide-right { animation: slideInRight 0.22s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
      `}</style>

      <div style={{overflow: 'hidden'}}>

      {/* ── FRIENDS TAB ── */}
      {tab === 'friends' && (
        <div key={`friends-${animKey}`} className={`${slideDir === 'left' ? 'slide-left' : 'slide-right'}`}>
          {loading ? (
            <div className="text-slate-500 py-16 text-center">Loading…</div>
          ) : accepted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-4xl mb-5 shadow-lg">👥</div>
              <p className="text-slate-300 font-semibold text-lg mb-1">No friends yet</p>
              <p className="text-slate-500 text-sm mb-6">Add someone to get started!</p>
              <button onClick={() => switchTab('add')} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-2xl text-sm transition-colors shadow-lg shadow-indigo-900/40">+ Add a Friend</button>
            </div>
          ) : (
            <ul className="space-y-2.5">
              {accepted.map((row) => {
                const nick = otherNick(row);
                const otherId = row.from_user_id === user?.id ? row.to_user_id : row.from_user_id;
                const fp = friendProfiles[otherId];
                const initials = nick.slice(0, 2).toUpperCase();
                const lvl = fp?.level ?? null;
                const xp = fp?.xp ?? null;
                return (
                  <li
                    key={row.id}
                    className="group flex items-center justify-between bg-slate-900/70 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-2xl px-4 py-3 transition-all duration-150 shadow-sm cursor-pointer"
                    onClick={() => setViewingId(otherId)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="shrink-0">
                        {fp?.profile_picture ? (
                          <img
                            src={fp.profile_picture}
                            alt={nick}
                            className="w-12 h-12 rounded-2xl object-cover bg-slate-700 shadow-md"
                            onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-900/40">{initials}</div>
                        )}
                      </div>
                      {/* Level badge */}
                      <div className="">
                        <LevelBadge level={lvl} xp={xp} size={40} />
                      </div>
                      <div>
                        <div className="font-semibold text-white leading-tight">{nick}</div>
                        <div className="text-xs text-slate-500">{fp?.favorite_character ? `⭐ ${fp.favorite_character}` : <span className="text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Friend</span>}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="opacity-0 group-hover:opacity-100 text-xs text-slate-500 transition-opacity">View profile →</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemove(row.id, nick); }}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-slate-800 hover:bg-red-600/80 border border-slate-700 hover:border-red-500/50 text-slate-400 hover:text-white rounded-xl text-xs font-medium transition-all duration-150">
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── REQUESTS TAB ── */}
      {tab === 'pending' && (
        <div key={`pending-${animKey}`} className={`${slideDir === 'left' ? 'slide-left' : 'slide-right'} space-y-5`}>
          {/* Incoming */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Incoming</h2>
              {incoming.length > 0 && <span className="ml-auto text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 rounded-full px-2 py-0.5 font-semibold">{incoming.length}</span>}
            </div>
            {loading ? (
              <div className="text-slate-500 py-8 text-center text-sm">Loading…</div>
            ) : incoming.length === 0 ? (
              <div className="text-slate-500 py-8 text-center text-sm">No incoming requests</div>
            ) : (
              <ul className="divide-y divide-slate-800/60">
                {incoming.map(row => {
                  const nick = nicks[row.from_user_id] || row.from_user_id;
                  return (
                    <li key={row.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-orange-900/30 shrink-0">{nick.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div className="font-semibold text-white text-sm">{nick}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{new Date(row.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleAccept(row.id)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm">Accept</button>
                        <button onClick={() => handleDecline(row.id)} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors">Decline</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Outgoing */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Sent</h2>
              {outgoing.length > 0 && <span className="ml-auto text-xs bg-slate-700 text-slate-400 border border-slate-600 rounded-full px-2 py-0.5 font-semibold">{outgoing.length}</span>}
            </div>
            {loading ? (
              <div className="text-slate-500 py-8 text-center text-sm">Loading…</div>
            ) : outgoing.length === 0 ? (
              <div className="text-slate-500 py-8 text-center text-sm">No sent requests</div>
            ) : (
              <ul className="divide-y divide-slate-800/60">
                {outgoing.map(row => {
                  const nick = nicks[row.to_user_id] || row.to_user_id;
                  return (
                    <li key={row.id} className="flex items-center justify-between px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-slate-600 to-slate-700 text-white flex items-center justify-center font-bold text-sm shrink-0">{nick.slice(0,2).toUpperCase()}</div>
                        <div>
                          <div className="font-semibold text-white text-sm">{nick}</div>
                          <div className="text-xs text-amber-400/80 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg>
                            Pending
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleCancel(row.id)} className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-colors">Cancel</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── ADD FRIEND TAB ── */}
      {tab === 'add' && (
        <div key={`add-${animKey}`} className={`${slideDir === 'left' ? 'slide-left' : 'slide-right'}`}>
          <div className="max-w-md mx-auto">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-slate-950/60">
              {/* Hero strip */}
              <div className="relative px-6 py-7 bg-linear-to-br from-indigo-600/90 via-indigo-600 to-violet-600 overflow-hidden">
                <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5 blur-2xl"></div>
                <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/5 blur-xl"></div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">Add a Friend</h2>
                  <p className="text-indigo-200 text-sm mt-0.5">They'll receive a request to accept or decline.</p>
                </div>
              </div>

              {/* Form */}
              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2.5">
                    Friend ID <span className="normal-case font-normal text-slate-600">— found on their profile page</span>
                  </label>
                  <div className={`flex items-center gap-3 bg-slate-800/80 border rounded-2xl px-4 py-3.5 transition-colors ${sendError ? 'border-red-500/60' : 'border-slate-700 focus-within:border-indigo-500/70'}`}>
                    <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                    <input
                      value={newFriend}
                      onChange={(e) => { setNewFriend(e.target.value); setSendError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend(e as any)}
                      className="flex-1 bg-transparent text-white placeholder-slate-600 outline-none text-sm"
                      placeholder="Enter username…"
                    />
                    {newFriend && (
                      <button type="button" onClick={() => { setNewFriend(''); setSendError(''); }} className="text-slate-600 hover:text-slate-300 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {sendError && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
                      {sendError}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={!newFriend.trim() || sending}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-900/40 hover:shadow-indigo-900/60">
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      Sending…
                    </span>
                  ) : 'Send Friend Request'}
                </button>

                <div className="flex items-start gap-3 bg-indigo-950/40 border border-indigo-900/40 rounded-2xl px-4 py-3.5">
                  <svg className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
                  </svg>
                  <p className="text-slate-500 text-xs leading-relaxed">The request will appear under <span className="text-slate-300 font-medium">Requests</span>. Once they accept, you'll both be added as friends automatically.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* ── CONFIRM DIALOG ── */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setConfirmDialog(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            </div>
            <p className="text-white font-semibold text-center mb-1">Are you sure?</p>
            <p className="text-slate-400 text-sm text-center mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="flex-1 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold transition-colors">
                Cancel
              </button>
              <button
                onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(null); }}
                className="flex-1 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-900/30">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FRIEND PROFILE MODAL ── */}
      {viewingId && (() => {
        const fp = friendProfiles[viewingId];
        const nick = nicks[viewingId] || viewingId;
        const initials = nick.slice(0, 2).toUpperCase();
        const cardGamesPlayed = ((fp as any)?.cardgame_games_won ?? 0) + ((fp as any)?.cardgame_games_lost ?? 0);
        const avgGuesses = (fp as any)?.narutodle_avg_guesses ?? 0;
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewingId(null)}
          >
            <div
              className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-linear-to-br from-indigo-900/60 via-slate-900 to-slate-900 rounded-t-3xl px-6 pt-8 pb-6 border-b border-slate-800">
                <button
                  onClick={() => setViewingId(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-5">
                  {fp?.profile_picture ? (
                    <img src={fp.profile_picture} alt={nick} className="w-20 h-20 rounded-2xl object-cover bg-slate-700 shadow-lg border-2 border-slate-700 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0">{initials}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-white truncate">{fp?.display_name || nick}</h2>
                    {fp?.favorite_character && <p className="text-slate-400 text-sm mt-0.5">⭐ {fp.favorite_character}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Friend</span>
                    </div>
                  </div>
                  <div className="shrink-0 mr-10">
                    <LevelBadge level={fp?.level ?? null} xp={fp?.xp ?? null} size={70} />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="px-6 py-5 space-y-5">
                {/* Narutodle */}
                <div>
                  <h3 className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">🍜 Narutodle</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3.5">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Games Played</div>
                      <div className="text-3xl font-bold text-white">{(fp as any)?.narutodle_games_played ?? 0}</div>
                    </div>
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3.5">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Avg Guesses</div>
                      <div className="text-3xl font-bold text-white">{avgGuesses > 0 ? avgGuesses.toFixed(1) : '—'}</div>
                    </div>
                  </div>
                </div>

                {/* Card Game */}
                <div>
                  <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">🎴 Card Game</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl px-4 py-3.5">
                      <div className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Played</div>
                      <div className="text-3xl font-bold text-white">{cardGamesPlayed}</div>
                    </div>
                    <div className="bg-slate-800/60 border border-emerald-900/40 rounded-2xl px-4 py-3.5">
                      <div className="text-xs text-emerald-500 uppercase tracking-wide font-semibold mb-1">Wins</div>
                      <div className="text-3xl font-bold text-white">{(fp as any)?.cardgame_games_won ?? 0}</div>
                    </div>
                    <div className="bg-slate-800/60 border border-red-900/30 rounded-2xl px-4 py-3.5">
                      <div className="text-xs text-red-500 uppercase tracking-wide font-semibold mb-1">Losses</div>
                      <div className="text-3xl font-bold text-white">{(fp as any)?.cardgame_games_lost ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-6 pb-6">
                <button
                  onClick={(e) => { e.stopPropagation(); const row = accepted.find(r => (r.from_user_id === viewingId || r.to_user_id === viewingId)); if (row) { handleRemove(row.id, nick); setViewingId(null); } }}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-red-600/30 border border-slate-700 hover:border-red-500/40 text-slate-500 hover:text-red-400 text-sm font-medium transition-all">
                  Remove Friend
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </div>
  );
}
