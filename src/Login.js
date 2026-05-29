import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowRight
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  const saveUserProfile = async (user, displayName) => {
    await setDoc(doc(db, 'users', user.uid), {
      name: displayName || name || 'User',
      email: user.email,
      createdAt: new Date().toISOString()
    }, { merge: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill all fields');
      return;
    }
    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user, result.user.displayName);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserProfile(result.user, name);
      }
      onLoginSuccess?.();
    } catch (e) {
      setError(
        e.message.includes('invalid-credential') ? 'Invalid email or password' :
        e.message.includes('email-already') ? 'Email already registered' :
        e.message
      );
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) { setError('Enter your email first'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Reset link sent to your email!');
      setError('');
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-2xl shadow-blue-500/30 mb-5">
            <span className="text-4xl font-black text-white">R</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">RPREP</h1>
          <p className="text-gray-400 text-sm mt-2">Your Nursing Success Partner</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-800">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-gray-800/50 p-1 rounded-xl">
            <button
              onClick={() => { setIsLogin(true); setShowForgot(false); resetForm(); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${isLogin && !showForgot ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setShowForgot(false); resetForm(); }}
              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${!isLogin && !showForgot ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-green-400 text-sm">
              {success}
            </div>
          )}

          {showForgot ? (
            /* Forgot Password Form */
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Reset Password</h3>
              <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                onClick={() => { setShowForgot(false); setError(''); }}
                className="w-full text-center text-gray-400 text-sm hover:text-white"
              >
                Back to Login
              </button>
            </div>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-500" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
                <ArrowRight size={18} />
              </button>

              {isLogin && (
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setError(''); }}
                  className="w-full text-center text-gray-400 text-sm hover:text-white"
                >
                  Forgot Password?
                </button>
              )}
            </form>
          )}
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Secure Authentication • v1.0
        </p>
      </div>
    </div>
  );
}
