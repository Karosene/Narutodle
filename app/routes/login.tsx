import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, loginUser, registerUser } from '../utils/auth';
import type { Route } from './+types/login';

export const meta: Route.MetaFunction = () => {
  return [
    { title: 'Login - Narutodle' },
    { name: 'description', content: 'Login or register to track your progress' },
  ];
};

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already logged in
    const user = getCurrentUser();
    if (user) {
      navigate('/profile');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const result = await loginUser(username, password);
        if (result.success) {
          // Small delay to ensure auth state updates before navigation
          setTimeout(() => navigate('/profile'), 100);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // Register
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const result = await registerUser(username, email, password);
        if (result.success) {
          // Small delay to ensure auth state updates before navigation
          setTimeout(() => navigate('/profile'), 100);
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <img 
              src="/images/logo.png" 
              alt="Narutodle Logo" 
              className="w-20 h-16 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {isLogin ? 'Login to track your progress' : 'Register to save your stats'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-bold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setUsername('');
              }}
              className="text-sm text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-semibold"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => navigate('/')}
              className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Your stats and progress will be saved to your account</p>
        </div>
      </div>
    </div>
  );
}
