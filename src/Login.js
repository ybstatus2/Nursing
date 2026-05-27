import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, requestFCMToken } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { 
  LogIn, Mail, Lock, Eye, EyeOff, AlertCircle, UserPlus
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
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
      requestFCMToken(result.user.uid).then(token => {
        if(token) updateDoc(doc(db, "users", result.user.uid), { fcmToken: token });
      });
      navigate("/lock");
    } catch(e) { 
      setError(e.message.includes('invalid') ? 'Invalid email or password' : e.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(!name || !email || !password) { setError('Please fill all fields'); return; }
    if(password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Save user profile
      await setDoc(doc(db, 'users', result.user.uid), {
        name,
        email,
        createdAt: new Date().toISOString()
      });
      requestFCMToken(result.user.uid).then(token => {
        if(token) updateDoc(doc(db, "users", result.user.uid), { fcmToken: token });
      });
      navigate("/lock");
    } catch(e) { 
      setError(e.message.includes('email-already') ? 'Email already registered' : e.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Save user if new
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString()
      }, { merge: true });
      requestFCMToken(result.user.uid).then(token => {
        if(token) updateDoc(doc(db, "users", result.user.uid), { fcmToken: token });
      });
      navigate("/lock");
    } catch(e) {
      if(e.code !== 'auth/popup-closed-by-user') {
        setError(e.message);
      }
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
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-y-auto">
      <div className="w-full max-w-sm">
        {/* Logo & Title */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
            <span className="text-3xl font-black">R</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            RPREP CBT
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {isRegister ? 'Create your account' : resetMode ? 'Reset Password' : 'Nursing Exam Preparation'}
          </p>
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
          /* Login / Register Form */
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3">
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 bg-white hover:bg-gray-100 rounded-xl font-medium text-gray-800 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-700"></div>
              <span className="text-gray-500 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            {/* Name Field - Register Only */}
            {isRegister && (
              <div className="relative">
                <UserPlus className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50"
            >
              {isRegister ? <UserPlus size={20} /> : <LogIn size={20} />}
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
            </button>

            {/* Toggle Login/Register */}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }} className="w-full text-center text-blue-400 text-sm">
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Create one"}
            </button>

            {/* Forgot Password */}
            {!isRegister && (
              <button type="button" onClick={() => { setResetMode(true); setError(''); }} className="w-full text-center text-gray-400 text-sm">
                Forgot Password?
              </button>
            )}
          </form>
        ) : (
          /* Reset Password Form */
          <div className="space-y-4">
            <p className="text-gray-300 text-sm text-center">Enter your email to receive reset link</p>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button onClick={handleReset} className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white">
              Send Reset Link
            </button>
            <button onClick={() => { setResetMode(false); setResetSent(false); setError(''); }} className="w-full text-center text-gray-400 text-sm">
              Back to Login
            </button>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">v1.0 • Secure Authentication</p>
      </div>
    </div>
  );
}
