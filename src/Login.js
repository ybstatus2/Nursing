import { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch(e) { 
      setError(e.message.includes('invalid') ? 'Invalid email or password' : e.message);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if(!email) { setError('Enter your email first'); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch(e) { setError(e.message); }
  };

  return (
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-3xl font-black">R</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            RPREP CBT
          </h1>
          <p className="text-gray-400 text-sm mt-1">Nursing Exam Preparation</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-300 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Reset Success */}
        {resetSent && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3 mb-4 text-green-300 text-sm">
            Password reset link sent to your email!
          </div>
        )}

        {!resetMode ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50"
            >
              <LogIn size={20} /> {loading ? 'Logging in...' : 'Login'}
            </button>
            <button type="button" onClick={() => setResetMode(true)} className="w-full text-center text-blue-400 text-sm">
              Forgot Password?
            </button>
          </form>
        ) : (
          /* Reset Form */
          <div className="space-y-4">
            <p className="text-gray-300 text-sm text-center">Enter your email to receive reset link</p>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button onClick={handleReset} className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white">
              Send Reset Link
            </button>
            <button onClick={() => { setResetMode(false); setResetSent(false); }} className="w-full text-center text-gray-400 text-sm">
              Back to Login
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-8">v1.0 • Secure Login</p>
      </div>
    </div>
  );
}
