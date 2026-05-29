import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Edit3, Award, Clock, BookOpen, User } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ tests: 0, avg: 0, best: 0, time: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';

  useEffect(() => {
    const u = auth.currentUser;
    setUser(u);
    if (u) {
      setName(u.displayName || u.email?.split('@')[0] || '');
      loadStats(u);
    }
  }, []);

  const loadStats = async (u) => {
    const q = query(collection(db, 'results'), where('userId', '==', u.uid));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => d.data());
    if (results.length > 0) {
      setStats({
        tests: results.length,
        avg: Math.round(results.reduce((a,b) => a + (b.percentage||0), 0) / results.length),
        best: Math.max(...results.map(r => r.percentage||0)),
        time: results.reduce((a,b) => a + (b.timeTaken||0), 0)
      });
    }
  };

  const formatTime = (s) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      // Update Firebase Auth profile
      await updateProfile(user, { displayName: name });
      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), { name });
      setEditing(false);
    } catch(e) { alert('Update failed: ' + e.message); }
  };

  if (!user) return null;

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20`}>
      {/* Cover + Avatar */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 px-5 pt-8 pb-10">
        <button onClick={() => navigate(-1)} className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mb-4">
          <ArrowLeft size={16} className="text-white" />
        </button>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl font-black text-white ring-4 ring-white/20">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <button onClick={() => setEditing(!editing)} className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
              <Edit3 size={12} className="text-white" />
            </button>
          </div>
          <div className="text-white">
            {editing ? (
              <div className="flex items-center gap-2">
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="bg-white/10 rounded-lg px-2 py-1 text-white w-40" autoFocus />
                <button onClick={saveProfile} className="bg-green-500 px-3 py-1 rounded-lg text-xs font-bold">Save</button>
                <button onClick={() => setEditing(false)} className="bg-gray-500 px-3 py-1 rounded-lg text-xs font-bold">Cancel</button>
              </div>
            ) : (
              <h2 className="text-xl font-bold">{user.displayName || name || 'Student'}</h2>
            )}
            <p className="text-sm text-gray-300">{user.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Student</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: <Award className="text-yellow-400" size={18} />, label: 'Tests', value: stats.tests },
            { icon: <BookOpen className="text-blue-400" size={18} />, label: 'Best', value: `${stats.best}%` },
            { icon: <Award className="text-green-400" size={18} />, label: 'Avg', value: `${stats.avg}%` },
            { icon: <Clock className="text-purple-400" size={18} />, label: 'Time', value: formatTime(stats.time) }
          ].map((s, i) => (
            <div key={i} className={`${cardBg} rounded-xl p-3 text-center shadow-lg`}>
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="text-sm font-bold">{s.value}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Details */}
      <div className="px-4 mt-4">
        <div className={`${cardBg} rounded-2xl p-4`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><User size={16} className="text-blue-400" /> Account Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className={subText}>Email</span><span>{user.email}</span></div>
            <div className="flex justify-between"><span className={subText}>Name</span><span>{user.displayName || '-'}</span></div>
            <div className="flex justify-between"><span className={subText}>Member Since</span><span>{user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</span></div>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 mb-4">
        <button onClick={() => { auth.signOut(); navigate('/'); }} className="w-full py-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold text-sm">
          Logout
        </button>
      </div>
    </div>
  );
}
