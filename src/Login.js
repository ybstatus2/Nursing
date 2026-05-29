import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import {
  LogIn, UserPlus, Mail, Lock, Eye, EyeOff,
  AlertCircle, ArrowRight, ArrowLeft
} from 'lucide-react';

// Detect native Capacitor environment
const isNative = window.location.protocol === 'capacitor:' || navigator.userAgent.includes('Capacitor');

export default function Login({ onLoginSuccess }) {
  const [step, setStep] = useState('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle Google redirect result on component mount
  useEffect(() => {
    if (isNative) {
      getRedirectResult(auth)
        .then(async (result) => {
          if (result) {
            await saveUserProfile(result.user, result.user.displayName);
            onLoginSuccess?.();
          }
        })
        .catch((e) => {
          console.log('Google redirect error:', e);
        });
    }
  }, []);

  const saveUserProfile = async (user, displayName) => {
    await setDoc(doc(db, 'users', user.uid), {
      name: displayName || name || 'User',
      email: user.email,
      photoURL: user.photoURL || '',
      createdAt: new Date().toISOString()
    }, { merge: true });
  };

  const handleGoogleSignIn = async () => {
    if (!isNative) {
      // Web version – fallback to popup (not used in APK, but kept for web testing)
      const provider = new GoogleAuthProvider();
      setLoading(true);
      setError('');
      try {
        const { signInWithPopup } = await import('firebase/auth');
        const result = await signInWithPopup(auth, provider);
        await saveUserProfile(result.user, result.user.displayName);
        onLoginSuccess?.();
      } catch(e) {
        if(e.code !== 'auth/popup-closed-by-user') setError(e.message);
      }
      setLoading(false);
      return;
    }

    // Native (APK) – use redirect
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // No need to navigate; redirect will come back and useEffect will handle it
    } catch(e) {
      console.log('Redirect error:', e);
      setError('Google Sign-In failed');
      setLoading(false);
    }
  };

  // ... (rest of the component remains exactly the same: handleLogin, handleRegister, handleForgotPassword, JSX)
  // I'll include the full file below to avoid duplication. But for brevity, I'm replacing the entire file with the final version.

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!email || !password) { setError('All fields required'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserProfile(result.user, result.user.displayName);
      onLoginSuccess?.();
    } catch(e) {
      setError(e.message.includes('invalid') ? 'Invalid credentials' : e.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(!name || !email || !password) { setError('All fields required'); return; }
    if(password.length < 6) { setError('Password min 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserProfile(result.user, name);
      onLoginSuccess?.();
    } catch(e) {
      setError(e.message.includes('email-already') ? 'Email already registered' : e.message);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if(!email) { setError('Enter your email first'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Reset link sent to your email!');
      setError('');
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30">
            <span className="text-4xl font-black text-white">R</span>
          </div>
          <h1 className="text-3xl font-black text-white">RPREP</h1>
          <p className="text-gray-400 text-sm mt-1">Nursing Exam Preparation</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} /> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 text-green-400 text-sm">
            {success}
          </div>
        )}

        {step === 'welcome' && (
          <div className="space-y-4 animate-fadeIn">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-4 bg-white hover:bg-gray-100 rounded-2xl font-semibold text-gray-800 flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <button onClick={() => { setStep('login'); resetForm(); }} className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all border border-gray-700">
              <Mail size={20} /> Login with Email
            </button>
            <button onClick={() => { setStep('register'); resetForm(); }} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all">
              <UserPlus size={20} /> Create Account
            </button>
          </div>
        )}

        {step === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-fadeIn">
            <button type="button" onClick={() => { setStep('welcome'); resetForm(); }} className="text-gray-400 flex items-center gap-1 text-sm mb-2">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'} <ArrowRight size={18} />
            </button>
            <button type="button" onClick={() => { setStep('forgot'); resetForm(); }} className="w-full text-center text-blue-400 text-sm">Forgot Password?</button>
          </form>
        )}

        {step === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
            <button type="button" onClick={() => { setStep('welcome'); resetForm(); }} className="text-gray-400 flex items-center gap-1 text-sm mb-2">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Create Account</h2>
            <div className="relative">
              <UserPlus className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-4 text-gray-500">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 'forgot' && (
          <div className="space-y-4 animate-fadeIn">
            <button type="button" onClick={() => { setStep('login'); resetForm(); }} className="text-gray-400 flex items-center gap-1 text-sm mb-2">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-400 text-sm">Enter email to receive reset link</p>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-500" size={18} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none" />
            </div>
            <button onClick={handleForgotPassword} disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white transition-all disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
