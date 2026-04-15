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

type Tab = 'admins' | 'users' | 'settings';
type JutsuFormState = {
  name: string; description: string;
  jutsuType: 'ninjutsu' | 'taijutsu' | 'genjutsu';
  chakraCost: string; damage: string; hasEffect: boolean;
  effectType: string; effectValue: string; effectDuration: string;
  effectTarget: string; effectInvulnerable: string;
};
const emptyJutsuForm = (): JutsuFormState => ({
  name: '', description: '', jutsuType: 'ninjutsu', chakraCost: '', damage: '',
  hasEffect: false, effectType: 'poison', effectValue: '', effectDuration: '',
  effectTarget: 'opponent', effectInvulnerable: 'none',
});

const SEL_CLS = 'w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 appearance-none';
const INP_CLS = 'w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500';

function SelectWrapper({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: any }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className={SEL_CLS}>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function JutsuFormFields({ label, form, onChange }: { label: string; form: JutsuFormState; onChange: (f: JutsuFormState) => void }) {
  return (
    <div className="bg-slate-900/60 rounded-xl border border-slate-700/80 p-4 space-y-3">
      <h4 className="text-xs font-bold text-purple-400 uppercase tracking-widest">{label}</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Name</label>
          <input value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} className={INP_CLS} placeholder="e.g. Rasengan" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Jutsu Type</label>
          <SelectWrapper value={form.jutsuType} onChange={v => onChange({ ...form, jutsuType: v as JutsuFormState['jutsuType'] })}>
            <option value="ninjutsu">Ninjutsu</option>
            <option value="taijutsu">Taijutsu</option>
            <option value="genjutsu">Genjutsu</option>
          </SelectWrapper>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Chakra Cost</label>
          <input type="number" value={form.chakraCost} onChange={e => onChange({ ...form, chakraCost: e.target.value })} className={INP_CLS} placeholder="e.g. 25" min={0} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Damage</label>
          <input type="number" value={form.damage} onChange={e => onChange({ ...form, damage: e.target.value })} className={INP_CLS} placeholder="e.g. 30" min={0} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
          <textarea value={form.description} onChange={e => onChange({ ...form, description: e.target.value })} className={`${INP_CLS} resize-none`} rows={2} placeholder="Describe the jutsu..." />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
        <input type="checkbox" checked={form.hasEffect} onChange={e => onChange({ ...form, hasEffect: e.target.checked })} className="w-4 h-4 accent-purple-500 rounded" />
        <span className="text-sm text-slate-300 font-medium">Has Effect</span>
      </label>
      {form.hasEffect && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 border-t border-slate-700/50">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Effect Type</label>
            <SelectWrapper value={form.effectType} onChange={v => onChange({ ...form, effectType: v })}>
              {['poison','stun','heal','buff','damage_suppress','shield','chakra_drain','burn','bleed'].map(t => <option key={t} value={t}>{t}</option>)}
            </SelectWrapper>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Value</label>
            <input type="number" value={form.effectValue} onChange={e => onChange({ ...form, effectValue: e.target.value })} className={INP_CLS} placeholder="0" min={0} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Duration (turns)</label>
            <input type="number" value={form.effectDuration} onChange={e => onChange({ ...form, effectDuration: e.target.value })} className={INP_CLS} placeholder="optional" min={1} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Target</label>
            <SelectWrapper value={form.effectTarget} onChange={v => onChange({ ...form, effectTarget: v })}>
              {['self','opponent','all-opponents','all-allies'].map(t => <option key={t} value={t}>{t}</option>)}
            </SelectWrapper>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Invulnerable</label>
            <SelectWrapper value={form.effectInvulnerable} onChange={v => onChange({ ...form, effectInvulnerable: v })}>
              {['none','ninjutsu','taijutsu','genjutsu','all'].map(t => <option key={t} value={t}>{t}</option>)}
            </SelectWrapper>
          </div>
        </div>
      )}
    </div>
  );
}

type CharFilters = {
  jutsus: 'all' | 'with' | 'without';
  passives: 'all' | 'with' | 'without';
  gender: string;
  rank: string;
  clan: string;
  affiliation: string;
  nature: string;
  team: string;
  ageMin: string;
  ageMax: string;
};
const defaultCharFilters = (): CharFilters => ({
  jutsus: 'all', passives: 'all', gender: '', rank: '', clan: '', affiliation: '', nature: '', team: '', ageMin: '', ageMax: '',
});

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

  // Character management state
  const [characters, setCharacters] = useState<any[]>([]);
  const [charLoading, setCharLoading] = useState(false);
  const [charSearch, setCharSearch] = useState('');
  const [charMode, setCharMode] = useState<'list' | 'form'>('list');
  const [editingChar, setEditingChar] = useState<any | null>(null);
  const [charError, setCharError] = useState('');
  const [charSuccess, setCharSuccess] = useState('');
  const [isSavingChar, setIsSavingChar] = useState(false);
  const [charForm, setCharForm] = useState({
    name: '', file: '', gender: 'Male', age: '', height: '', clan: '',
    team: '', rank: '', first_appearance: '', affiliations: '', nature_affinity: '', aliases: '',
  });

  // Character editor panel & jutsu state
  const [charEditorOpen, setCharEditorOpen] = useState(false);
  const [charEditTab, setCharEditTab] = useState<'info' | 'jutsus'>('info');
  const [jutsuForm1, setJutsuForm1] = useState<JutsuFormState>(emptyJutsuForm());
  const [jutsuForm2, setJutsuForm2] = useState<JutsuFormState>(emptyJutsuForm());
  const [jutsuFormUpg, setJutsuFormUpg] = useState<JutsuFormState>(emptyJutsuForm());
  const [hasUpgradedJutsu, setHasUpgradedJutsu] = useState(false);
  const [jutsusLoading, setJutsusLoading] = useState(false);
  const [jutsusSaving, setJutsusSaving] = useState(false);
  const [jutsuError, setJutsuError] = useState('');
  const [jutsuSuccess, setJutsuSuccess] = useState('');
  const [charNamesWithJutsus, setCharNamesWithJutsus] = useState<Set<string>>(new Set());
  const [charNamesWithPassives, setCharNamesWithPassives] = useState<Set<string>>(new Set());
  const [charFilters, setCharFilters] = useState<CharFilters>(defaultCharFilters());
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const filteredUsers = users.filter((user) => {
    const q = charSearch.toLowerCase();
    return (
      user.nick.toLowerCase().includes(q)
    )
  }); 

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
  useEffect(() => { if (isLoggedIn && activeTab === 'settings') { fetchCharactersAdmin(); } }, [isLoggedIn, activeTab]);

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

  const fetchCharactersAdmin = async () => {
    setCharLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/characters?select=*&order=name.asc&limit=1000`,
        { headers: HEADERS }
      );
      if (res.ok) setCharacters(await res.json());
    } finally { setCharLoading(false); }
  };

  const fetchJutsuNames = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/jutsus?select=character_name&limit=1000`, { headers: HEADERS });
    if (res.ok) { const d = await res.json(); setCharNamesWithJutsus(new Set(d.map((r: any) => r.character_name))); }
  };

  const fetchPassiveNames = async () => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/passive_abilities?select=character_name&limit=1000`, { headers: HEADERS });
    if (res.ok) { const d = await res.json(); setCharNamesWithPassives(new Set(d.map((r: any) => r.character_name))); }
  };

  const handleNewCharacter = () => {
    setEditingChar(null);
    setCharEditTab('info');
    setCharForm({ name: '', file: '', gender: 'Male', age: '', height: '', clan: '', team: '', rank: '', first_appearance: '', affiliations: '', nature_affinity: '', aliases: '' });
    setCharMode('form'); setCharError(''); setCharSuccess('');
  };

  const handleEditCharacter = (char: any) => {
    setEditingChar(char);
    setCharEditTab('info');
    setJutsuError(''); setJutsuSuccess('');
    setCharForm({
      name: char.name ?? '',
      file: char.file ?? '',
      gender: char.gender ?? 'Male',
      age: char.age ?? '',
      height: char.height ?? '',
      clan: char.clan ?? '',
      team: char.team ?? '',
      rank: char.rank ?? '',
      first_appearance: char.first_appearance ?? '',
      affiliations: Array.isArray(char.affiliations) ? char.affiliations.join(', ') : (char.affiliations ?? ''),
      nature_affinity: Array.isArray(char.nature_affinity) ? char.nature_affinity.join(', ') : (char.nature_affinity ?? ''),
      aliases: Array.isArray(char.aliases) ? char.aliases.join(', ') : (char.aliases ?? ''),
    });
    setCharMode('form'); setCharError(''); setCharSuccess('');
  };

  const handleSaveCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChar(true); setCharError(''); setCharSuccess('');
    try {
      const payload: any = {
        name: charForm.name.trim(),
        file: charForm.file.trim(),
        gender: charForm.gender,
        age: charForm.age.trim(),
        height: charForm.height.trim(),
        clan: charForm.clan.trim() || 'None',
        team: charForm.team.trim() || 'None',
        rank: charForm.rank.trim() || 'None',
        first_appearance: charForm.first_appearance.trim(),
        affiliations: charForm.affiliations.split(',').map((s: string) => s.trim()).filter(Boolean),
        nature_affinity: charForm.nature_affinity.split(',').map((s: string) => s.trim()).filter(Boolean),
        aliases: charForm.aliases.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      let res: Response;
      if (editingChar) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/characters?name=eq.${encodeURIComponent(editingChar.name)}`, {
          method: 'PATCH', headers: { ...HEADERS, 'Prefer': 'return=minimal' }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/characters`, {
          method: 'POST', headers: { ...HEADERS, 'Prefer': 'return=minimal' }, body: JSON.stringify(payload),
        });
      }
      if (res.ok) {
        setCharSuccess(editingChar ? 'Character updated!' : 'Character added!');
        fetchCharactersAdmin();
        if (!editingChar) setCharForm({ name: '', file: '', gender: 'Male', age: '', height: '', clan: '', team: '', rank: '', first_appearance: '', affiliations: '', nature_affinity: '', aliases: '' });
        else setEditingChar({ ...editingChar, ...payload });
      } else {
        const err = await res.text();
        setCharError(`Failed to save: ${err}`);
      }
    } catch { setCharError('An error occurred'); }
    finally { setIsSavingChar(false); }
  };

  const handleDeleteCharacter = async (name: string) => {
    if (!confirm(`Delete character "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/characters?name=eq.${encodeURIComponent(name)}`, { method: 'DELETE', headers: HEADERS });
    if (res.ok) fetchCharactersAdmin();
  };

  const jutsuToForm = (j: any): JutsuFormState => ({
    name: j?.name ?? '', description: j?.description ?? '',
    jutsuType: j?.jutsuType ?? 'ninjutsu',
    chakraCost: j?.chakraCost?.toString() ?? '', damage: j?.damage?.toString() ?? '',
    hasEffect: !!j?.effect,
    effectType: j?.effect?.type ?? 'poison',
    effectValue: j?.effect?.value?.toString() ?? '',
    effectDuration: j?.effect?.duration?.toString() ?? '',
    effectTarget: j?.effect?.target ?? 'opponent',
    effectInvulnerable: j?.effect?.invulnerable ?? 'none',
  });

  const formToJutsu = (f: JutsuFormState) => ({
    name: f.name.trim(), description: f.description.trim(), jutsuType: f.jutsuType,
    chakraCost: Number(f.chakraCost) || 0,
    ...(f.damage ? { damage: Number(f.damage) } : {}),
    ...(f.hasEffect ? { effect: {
      type: f.effectType, value: Number(f.effectValue) || 0,
      ...(f.effectDuration ? { duration: Number(f.effectDuration) } : {}),
      target: f.effectTarget, invulnerable: f.effectInvulnerable,
    }} : {}),
  });

  const fetchCharacterJutsus = async (charName: string) => {
    setJutsusLoading(true); setJutsuError(''); setJutsuSuccess('');
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/jutsus?character_name=eq.${encodeURIComponent(charName)}&select=*`, { headers: HEADERS });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const row = data[0];
          const arr = row.jutsus ?? [];
          setJutsuForm1(arr[0] ? jutsuToForm(arr[0]) : emptyJutsuForm());
          setJutsuForm2(arr[1] ? jutsuToForm(arr[1]) : emptyJutsuForm());
          if (row.upgraded_jutsu) { setJutsuFormUpg(jutsuToForm(row.upgraded_jutsu)); setHasUpgradedJutsu(true); }
          else { setJutsuFormUpg(emptyJutsuForm()); setHasUpgradedJutsu(false); }
        } else {
          setJutsuForm1(emptyJutsuForm()); setJutsuForm2(emptyJutsuForm());
          setJutsuFormUpg(emptyJutsuForm()); setHasUpgradedJutsu(false);
        }
      }
    } finally { setJutsusLoading(false); }
  };

  const handleSaveJutsus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChar) return;
    setJutsusSaving(true); setJutsuError(''); setJutsuSuccess('');
    try {
      const payload = {
        character_name: editingChar.name,
        jutsus: [formToJutsu(jutsuForm1), formToJutsu(jutsuForm2)],
        upgraded_jutsu: hasUpgradedJutsu ? formToJutsu(jutsuFormUpg) : null,
      };
      const chk = await fetch(`${SUPABASE_URL}/rest/v1/jutsus?character_name=eq.${encodeURIComponent(editingChar.name)}&select=character_name`, { headers: HEADERS });
      const exists = chk.ok ? await chk.json() : [];
      let res: Response;
      if (exists.length > 0) {
        res = await fetch(`${SUPABASE_URL}/rest/v1/jutsus?character_name=eq.${encodeURIComponent(editingChar.name)}`, {
          method: 'PATCH', headers: { ...HEADERS, 'Prefer': 'return=minimal' }, body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${SUPABASE_URL}/rest/v1/jutsus`, {
          method: 'POST', headers: { ...HEADERS, 'Prefer': 'return=minimal' }, body: JSON.stringify(payload),
        });
      }
      if (res.ok) setJutsuSuccess('Jutsus saved successfully!');
      else { const err = await res.text(); setJutsuError(`Failed to save jutsus: ${err}`); }
    } catch { setJutsuError('An error occurred while saving'); }
    finally { setJutsusSaving(false); }
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
          {/* Hidden dummy inputs to trick browser autofill */}
          <input type="text" style={{display:'none'}} aria-hidden="true" />
          <input type="password" style={{display:'none'}} aria-hidden="true" />
          {loginError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{loginError}</div>}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              autoComplete="off" readOnly onFocus={e => e.target.removeAttribute('readOnly')}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="admin@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="new-password" readOnly onFocus={e => e.target.removeAttribute('readOnly')}
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
              <form onSubmit={handleAddAdmin} className="space-y-4" autoComplete="off">
                <input type="text" style={{display:'none'}} aria-hidden="true" />
                <input type="password" style={{display:'none'}} aria-hidden="true" />
                {addAdminError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{addAdminError}</div>}
                {addAdminSuccess && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">{addAdminSuccess}</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Email</label>
                    <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)}
                      autoComplete="off" readOnly onFocus={e => e.target.removeAttribute('readOnly')}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                      placeholder="newadmin@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                    <input type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)}
                      autoComplete="new-password" readOnly onFocus={e => e.target.removeAttribute('readOnly')}
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
              <input
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
                placeholder="Search users..."
                className='w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 mb-2'
              />    
              {loading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
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
                        <span className="text-slate-400">{l as string}</span><span className="text-white">{v as string | number}</span>
                      </div>
                    ))}
                  </>)}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <button
              onClick={() => { setCharEditorOpen(true); if (!charLoading && characters.length === 0) fetchCharactersAdmin(); fetchJutsuNames(); fetchPassiveNames(); }}
              className="w-full bg-slate-800/90 rounded-2xl border border-slate-700 hover:border-purple-500/50 transition-all duration-200 group text-left"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-2xl shrink-0 group-hover:bg-purple-500/25 transition">
                    🥷
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Character Editor</h2>
                    <p className="text-sm text-slate-400">
                      {charLoading ? 'Loading...' : `${characters.length} characters in database`}
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        )}

        {/* Character Editor full-screen overlay */}
        {charEditorOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥷</span>
                <div>
                  <h2 className="text-xl font-bold text-white">Character Editor</h2>
                  <p className="text-xs text-slate-400">{characters.length} characters in database</p>
                </div>
              </div>
              <button
                onClick={() => { setCharEditorOpen(false); setCharMode('list'); setCharError(''); setCharSuccess(''); setJutsuError(''); setJutsuSuccess(''); }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-5xl mx-auto">
                <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6">
                {charMode === 'list' ? (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white">All Characters</h3>
                      <button onClick={handleNewCharacter}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition text-sm">
                        + Add Character
                      </button>
                    </div>
                    {(() => {
                      const activeCount = [
                        charFilters.jutsus !== 'all', charFilters.passives !== 'all',
                        charFilters.gender !== '', charFilters.rank !== '',
                        charFilters.clan !== '', charFilters.affiliation !== '',
                        charFilters.nature !== '', charFilters.team !== '',
                        charFilters.ageMin !== '', charFilters.ageMax !== '',
                      ].filter(Boolean).length;
                      return (
                        <div className="flex gap-2 mb-3">
                          <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input type="text" value={charSearch} onChange={e => setCharSearch(e.target.value)}
                              placeholder="Search characters..."
                              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
                          </div>
                          <button type="button" onClick={() => setFilterPanelOpen(o => !o)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition whitespace-nowrap ${
                              activeCount > 0 || filterPanelOpen
                                ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                            }`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                            </svg>
                            Filters
                            {activeCount > 0 && (
                              <span className="bg-purple-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{activeCount}</span>
                            )}
                          </button>
                        </div>
                      );
                    })()}
                    {filterPanelOpen && (
                      <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 mb-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">Filters</span>
                          <button type="button" onClick={() => setCharFilters(defaultCharFilters())}
                            className="text-xs text-purple-400 hover:text-purple-300 transition">Clear all</button>
                        </div>
                        {/* Data Presence */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Data</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 w-16 shrink-0">Jutsus</span>
                              <div className="flex gap-1">
                                {([['all','All'],['with','⚡ Has'],['without','⚡ None']] as [string,string][]).map(([v,l]) => (
                                  <button key={v} type="button" onClick={() => setCharFilters(f => ({...f, jutsus: v as 'all'|'with'|'without'}))}
                                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${charFilters.jutsus === v ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{l}</button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-300 w-16 shrink-0">Passives</span>
                              <div className="flex gap-1">
                                {([['all','All'],['with','🛡 Has'],['without','🛡 None']] as [string,string][]).map(([v,l]) => (
                                  <button key={v} type="button" onClick={() => setCharFilters(f => ({...f, passives: v as 'all'|'with'|'without'}))}
                                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${charFilters.passives === v ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{l}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Gender */}
                        {(() => {
                          const vals = [...new Set(characters.map((c: any) => c.gender).filter(Boolean))].sort() as string[];
                          if (!vals.length) return null;
                          return (
                            <div>
                              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</p>
                              <div className="flex flex-wrap gap-1">
                                {vals.map(v => (
                                  <button key={v} type="button" onClick={() => setCharFilters(f => ({...f, gender: f.gender === v ? '' : v}))}
                                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${charFilters.gender === v ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}>{v}</button>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                        {/* Age range */}
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Age</p>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" placeholder="Min" value={charFilters.ageMin}
                              onChange={e => setCharFilters(f => ({...f, ageMin: e.target.value}))}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500" />
                            <span className="text-slate-500 text-sm shrink-0">–</span>
                            <input type="number" min="0" placeholder="Max" value={charFilters.ageMax}
                              onChange={e => setCharFilters(f => ({...f, ageMax: e.target.value}))}
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500 placeholder-slate-500" />
                          </div>
                        </div>
                        {/* Rank / Clan / Nature / Team / Affiliation dropdowns */}
                        {(() => {
                          const rankVals = [...new Set(characters.map((c: any) => c.rank).filter(Boolean))].sort() as string[];
                          const clanVals = [...new Set(characters.map((c: any) => c.clan).filter(Boolean))].sort() as string[];
                          const natureVals = [...new Set(characters.flatMap((c: any) => Array.isArray(c.nature_affinity) ? c.nature_affinity : (c.nature_affinity ? [c.nature_affinity] : [])))].filter(Boolean).sort() as string[];
                          const teamVals = [...new Set(characters.flatMap((c: any) => Array.isArray(c.team) ? c.team : (c.team ? [c.team] : [])))].filter(Boolean).sort() as string[];
                          const affVals = [...new Set(characters.flatMap((c: any) => Array.isArray(c.affiliations) ? c.affiliations : (c.affiliations ? [c.affiliations] : [])))].filter(Boolean).sort() as string[];
                          return (
                            <div className="grid grid-cols-2 gap-3">
                              {rankVals.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Rank</p>
                                  <SelectWrapper value={charFilters.rank} onChange={v => setCharFilters(f => ({...f, rank: v}))}>
                                    <option value="">All ranks</option>
                                    {rankVals.map(v => <option key={v} value={v}>{v}</option>)}
                                  </SelectWrapper>
                                </div>
                              )}
                              {clanVals.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Clan</p>
                                  <SelectWrapper value={charFilters.clan} onChange={v => setCharFilters(f => ({...f, clan: v}))}>
                                    <option value="">All clans</option>
                                    {clanVals.map(v => <option key={v} value={v}>{v}</option>)}
                                  </SelectWrapper>
                                </div>
                              )}
                              {natureVals.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Nature Affinity</p>
                                  <SelectWrapper value={charFilters.nature} onChange={v => setCharFilters(f => ({...f, nature: v}))}>
                                    <option value="">All natures</option>
                                    {natureVals.map(v => <option key={v} value={v}>{v}</option>)}
                                  </SelectWrapper>
                                </div>
                              )}
                              {teamVals.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Team</p>
                                  <SelectWrapper value={charFilters.team} onChange={v => setCharFilters(f => ({...f, team: v}))}>
                                    <option value="">All teams</option>
                                    {teamVals.map(v => <option key={v} value={v}>{v}</option>)}
                                  </SelectWrapper>
                                </div>
                              )}
                              {affVals.length > 0 && (
                                <div className="col-span-2">
                                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Affiliation</p>
                                  <SelectWrapper value={charFilters.affiliation} onChange={v => setCharFilters(f => ({...f, affiliation: v}))}>
                                    <option value="">All affiliations</option>
                                    {affVals.map(v => <option key={v} value={v}>{v}</option>)}
                                  </SelectWrapper>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {charLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-900/80">
                            <tr className="text-left text-slate-400">
                              <th className="py-3 px-4 font-semibold">Name</th>
                              <th className="py-3 px-4 font-semibold hidden md:table-cell">Gender</th>
                              <th className="py-3 px-4 font-semibold hidden md:table-cell">Clan</th>
                              <th className="py-3 px-4 font-semibold hidden sm:table-cell">Rank</th>
                              <th className="py-3 px-4 font-semibold hidden lg:table-cell">Affiliation</th>
                              <th className="py-3 px-4 font-semibold text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {characters
                              .filter((c: any) => {
                                if (!c.name?.toLowerCase().includes(charSearch.toLowerCase())) return false;
                                if (charFilters.jutsus === 'with' && !charNamesWithJutsus.has(c.name)) return false;
                                if (charFilters.jutsus === 'without' && charNamesWithJutsus.has(c.name)) return false;
                                if (charFilters.passives === 'with' && !charNamesWithPassives.has(c.name)) return false;
                                if (charFilters.passives === 'without' && charNamesWithPassives.has(c.name)) return false;
                                if (charFilters.gender && c.gender !== charFilters.gender) return false;
                                if (charFilters.rank && c.rank !== charFilters.rank) return false;
                                if (charFilters.clan && c.clan !== charFilters.clan) return false;
                                if (charFilters.affiliation) {
                                  const affs: string[] = Array.isArray(c.affiliations) ? c.affiliations : (c.affiliations ? [c.affiliations] : []);
                                  if (!affs.includes(charFilters.affiliation)) return false;
                                }
                                if (charFilters.nature) {
                                  const nats: string[] = Array.isArray(c.nature_affinity) ? c.nature_affinity : (c.nature_affinity ? [c.nature_affinity] : []);
                                  if (!nats.includes(charFilters.nature)) return false;
                                }
                                if (charFilters.team) {
                                  const teams: string[] = Array.isArray(c.team) ? c.team : (c.team ? [c.team] : []);
                                  if (!teams.includes(charFilters.team)) return false;
                                }
                                if (charFilters.ageMin !== '') { const a = parseInt(c.age); if (isNaN(a) || a < parseInt(charFilters.ageMin)) return false; }
                                if (charFilters.ageMax !== '') { const a = parseInt(c.age); if (isNaN(a) || a > parseInt(charFilters.ageMax)) return false; }
                                return true;
                              })
                              .map(char => (
                                <tr key={char.name} className="hover:bg-slate-700/30 transition">
                                  <td className="py-3 px-4 font-medium text-white">{char.name}</td>
                                  <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{char.gender}</td>
                                  <td className="py-3 px-4 text-slate-300 hidden md:table-cell">{char.clan}</td>
                                  <td className="py-3 px-4 hidden sm:table-cell">
                                    <span className="px-2 py-0.5 bg-slate-700/60 rounded-full text-slate-300 text-xs">{char.rank}</span>
                                  </td>
                                  <td className="py-3 px-4 text-slate-300 text-sm hidden lg:table-cell">
                                    {Array.isArray(char.affiliations) ? char.affiliations.join(', ') : char.affiliations}
                                  </td>
                                  <td className="py-3 px-4">
                                    <div className="flex gap-2 justify-end">
                                      <button onClick={() => handleEditCharacter(char)}
                                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/30 hover:border-blue-500 text-blue-400 hover:text-white text-xs font-semibold rounded-lg transition">
                                        Edit
                                      </button>
                                      <button onClick={() => handleDeleteCharacter(char.name)}
                                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white text-xs font-semibold rounded-lg transition">
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {characters.filter((c: any) => {
                              if (!c.name?.toLowerCase().includes(charSearch.toLowerCase())) return false;
                              if (charFilters.jutsus === 'with' && !charNamesWithJutsus.has(c.name)) return false;
                              if (charFilters.jutsus === 'without' && charNamesWithJutsus.has(c.name)) return false;
                              if (charFilters.passives === 'with' && !charNamesWithPassives.has(c.name)) return false;
                              if (charFilters.passives === 'without' && charNamesWithPassives.has(c.name)) return false;
                              if (charFilters.gender && c.gender !== charFilters.gender) return false;
                              if (charFilters.rank && c.rank !== charFilters.rank) return false;
                              if (charFilters.clan && c.clan !== charFilters.clan) return false;
                              if (charFilters.affiliation) {
                                const affs: string[] = Array.isArray(c.affiliations) ? c.affiliations : (c.affiliations ? [c.affiliations] : []);
                                if (!affs.includes(charFilters.affiliation)) return false;
                              }
                              if (charFilters.nature) {
                                const nats: string[] = Array.isArray(c.nature_affinity) ? c.nature_affinity : (c.nature_affinity ? [c.nature_affinity] : []);
                                if (!nats.includes(charFilters.nature)) return false;
                              }
                              if (charFilters.team) {
                                const teams: string[] = Array.isArray(c.team) ? c.team : (c.team ? [c.team] : []);
                                if (!teams.includes(charFilters.team)) return false;
                              }
                              if (charFilters.ageMin !== '') { const a = parseInt(c.age); if (isNaN(a) || a < parseInt(charFilters.ageMin)) return false; }
                              if (charFilters.ageMax !== '') { const a = parseInt(c.age); if (isNaN(a) || a > parseInt(charFilters.ageMax)) return false; }
                              return true;
                            }).length === 0 && !charLoading && (
                          <div className="text-center py-12 text-slate-400">No characters found</div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-white">
                        {editingChar ? `Editing: ${editingChar.name}` : 'New Character'}
                      </h3>
                      <button type="button" onClick={() => { setCharMode('list'); setCharError(''); setCharSuccess(''); setJutsuError(''); setJutsuSuccess(''); }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-sm">
                        ← Back
                      </button>
                    </div>

                    {editingChar && (
                      <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl mb-5 w-fit border border-slate-700/60">
                        {(['info', 'jutsus'] as const).map(t => (
                          <button key={t} type="button"
                            onClick={() => { setCharEditTab(t); if (t === 'jutsus') fetchCharacterJutsus(editingChar.name); }}
                            className={`px-5 py-2 rounded-lg font-semibold text-sm transition ${charEditTab === t ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30' : 'text-slate-400 hover:text-white'}`}>
                            {t === 'info' ? '📋 Character Info' : '⚡ Jutsus'}
                          </button>
                        ))}
                      </div>
                    )}

                    {(!editingChar || charEditTab === 'info') && (
                      <form onSubmit={handleSaveCharacter} className="space-y-4">
                        {charError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{charError}</div>}
                        {charSuccess && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">{charSuccess}</div>}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Name *</label>
                            <input type="text" value={charForm.name} onChange={e => setCharForm(f => ({ ...f, name: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 disabled:opacity-40"
                              placeholder="e.g. Naruto Uzumaki" required disabled={!!editingChar} />
                            {editingChar && <p className="text-xs text-slate-500 mt-1">Name is used as the identifier and cannot be changed</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Image File</label>
                            <input type="text" value={charForm.file} onChange={e => setCharForm(f => ({ ...f, file: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="/images/naruto.png" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Gender</label>
                            <div className="relative">
                              <select value={charForm.gender} onChange={e => setCharForm(f => ({ ...f, gender: e.target.value }))}
                                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-purple-500 appearance-none pr-10">
                                <option>Male</option>
                                <option>Female</option>
                              </select>
                              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Age</label>
                            <input type="text" value={charForm.age} onChange={e => setCharForm(f => ({ ...f, age: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. 17 or Unknown" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Height (cm)</label>
                            <input type="text" value={charForm.height} onChange={e => setCharForm(f => ({ ...f, height: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. 147.5 or Unknown" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Clan</label>
                            <input type="text" value={charForm.clan} onChange={e => setCharForm(f => ({ ...f, clan: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Uzumaki Clan or None" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Team</label>
                            <input type="text" value={charForm.team} onChange={e => setCharForm(f => ({ ...f, team: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Team Kakashi or None" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">Rank</label>
                            <input type="text" value={charForm.rank} onChange={e => setCharForm(f => ({ ...f, rank: e.target.value }))}
                              list="rank-suggestions"
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Genin, Jōnin, Kage" />
                            <datalist id="rank-suggestions">
                              {['Genin', 'Chūnin', 'Jōnin', 'Kage', 'Anbu', 'Tokubetsu Jōnin', 'None'].map(r => <option key={r} value={r} />)}
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">First Appearance</label>
                            <input type="text" value={charForm.first_appearance} onChange={e => setCharForm(f => ({ ...f, first_appearance: e.target.value }))}
                              list="arc-suggestions"
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Land of Waves" />
                            <datalist id="arc-suggestions">
                              {['Land of Waves', 'Chūnin Exams', 'Konoha Crush', 'Sasuke Recovery Mission', 'Kazekage Rescue Mission', 'Tenchi Bridge Reconnaissance Mission', 'Itachi Pursuit Mission', 'Tale of Jiraiya the Gallant', "Pain's Assault", 'Five Kage Summit', 'Fourth Shinobi World War', 'Fated Battle Between Brothers', 'Akatsuki Suppression Mission', 'Search for Tsunade'].map(arc => <option key={arc} value={arc} />)}
                            </datalist>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Affiliations <span className="text-slate-500 font-normal">(comma-separated)</span>
                            </label>
                            <input type="text" value={charForm.affiliations} onChange={e => setCharForm(f => ({ ...f, affiliations: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Konohagakure, Akatsuki" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Nature Affinity <span className="text-slate-500 font-normal">(comma-separated)</span>
                            </label>
                            <input type="text" value={charForm.nature_affinity} onChange={e => setCharForm(f => ({ ...f, nature_affinity: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Wind Release, Fire Release" />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2">
                              Aliases <span className="text-slate-500 font-normal">(comma-separated)</span>
                            </label>
                            <input type="text" value={charForm.aliases} onChange={e => setCharForm(f => ({ ...f, aliases: e.target.value }))}
                              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                              placeholder="e.g. Naruto, Hero of the Hidden Leaf" />
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button type="submit" disabled={isSavingChar}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition">
                            {isSavingChar ? 'Saving...' : (editingChar ? 'Update Character' : 'Add Character')}
                          </button>
                          <button type="button" onClick={() => { setCharMode('list'); setCharError(''); setCharSuccess(''); }}
                            className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {editingChar && charEditTab === 'jutsus' && (
                      <form onSubmit={handleSaveJutsus} className="space-y-4">
                        {jutsuError && <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg text-sm">{jutsuError}</div>}
                        {jutsuSuccess && <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg text-sm">{jutsuSuccess}</div>}
                        {jutsusLoading ? (
                          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" /></div>
                        ) : (
                          <>
                            <JutsuFormFields label="Jutsu 1" form={jutsuForm1} onChange={setJutsuForm1} />
                            <JutsuFormFields label="Jutsu 2" form={jutsuForm2} onChange={setJutsuForm2} />
                            <div className="bg-slate-900/60 rounded-xl border border-slate-700/80 p-4">
                              <label className="flex items-center gap-3 cursor-pointer select-none mb-4">
                                <input type="checkbox" checked={hasUpgradedJutsu} onChange={e => setHasUpgradedJutsu(e.target.checked)} className="w-4 h-4 accent-purple-500 rounded" />
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Upgraded Jutsu (when boosted)</span>
                              </label>
                              {hasUpgradedJutsu && <JutsuFormFields label="Upgraded Jutsu" form={jutsuFormUpg} onChange={setJutsuFormUpg} />}
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button type="submit" disabled={jutsusSaving}
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition">
                                {jutsusSaving ? 'Saving...' : 'Save Jutsus'}
                              </button>
                            </div>
                          </>
                        )}
                      </form>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

