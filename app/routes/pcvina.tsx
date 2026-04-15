import { useState, useEffect } from "react";

const SUPABASE_URL = 'https://ttphcrctvvnrdxtsquso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0cGhjcmN0dnZucmR4dHNxdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2NjI2NTIsImV4cCI6MjA4NjIzODY1Mn0.8sq6_4TQF8S3sFytFm0xI4eCLq4ECwBAEXfiR1Qeksc';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

type User = {
    id: string;
    nick: string;
    email: string;
    created_at: string;
    profile?: {
        custom_id: string;
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

export default function Pcvina() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const [charSearch, setCharSearch] = useState('');
    

    useEffect(() => {fetchUsers()}, [])

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

    const filteredUsers = users.filter((user) => {
        const q = charSearch.toLowerCase();
        return (
            user.nick.toLowerCase().includes(q)
        )
    }); 

    return(
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
            <div className="max-w-6xl mx-auto flex justify-center flex-col">
                <h2 className="text-xl font-bold text-white mb-4">User Count: {users.length}</h2>
                <input
                    value={charSearch}
                    onChange={(e) => setCharSearch(e.target.value)}
                    placeholder="Search users..."
                    />    
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                        {filteredUsers.map(user => (
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
                                <img src={selectedUser.profile?.profile_picture || ""} alt={`${selectedUser.nick}'s avatar`} className="w-16 h-16 rounded-full" />
                                <div><h3 className="text-2xl font-bold text-white">{selectedUser.nick}</h3><p className="text-sm text-slate-400">{selectedUser.email}</p></div>
                            </div>
                            {[['User ID', selectedUser.id], ['Username', selectedUser.nick], ['Custom ID', selectedUser.profile?.custom_id], ['Email', selectedUser.email], ['Joined', new Date(selectedUser.created_at).toLocaleString()]].map(([l, v]) => (
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
            </div>    
        </div>
    )
}