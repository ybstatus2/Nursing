import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {
  User, Award, BookOpen, Clock, ArrowLeft, Edit3
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ tests: 0, avg: 0, best: 0, time: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    setUser(auth.currentUser);
    if(auth.currentUser) {
      setName(auth.currentUser.email?.split('@')[0] || '');
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    if(!auth.currentUser) return;
    try {
      const q = query(collection(db, 'results'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => d.data());
      if(results.length > 0) {
        setStats({
          tests: results.length,
          avg: Math.round(results.reduce((a,b) => a + b.percentage, 0) / results.length),
          best: Math.max(...results.map(r => r.percentage)),
          time: results.reduce((a,b) => a + (b.timeTaken || 0), 0)
        });
      }
    } catch(e) { console.log(e); }
  };

  const formatTime = (s) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if(!user) return null;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold">My Profile</h2>
        </div>

        {/* Avatar & Info */}
        <div className="flex items-center gap-4 mb-2">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-black shadow-lg">
            {user.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-gray-700 rounded-lg p-2 text-white w-full mb-1"
                autoFocus
              />
            ) : (
              <h3 className="font-bold text-xl">{name}</h3>
            )}
            <p className="text-gray-400 text-sm">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">Student</p>
          </div>
          <button 
            onClick={() => setEditing(!editing)}
            className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center"
          >
            <Edit3 size={18} className="text-blue-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 -mt-4 mb-6">
        <div className="bg-gray-800 rounded-2xl p-4 grid grid-cols-2 gap-3">
          <div className="text-center">
            <Award className="text-yellow-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold">{stats.tests}</div>
            <div className="text-xs text-gray-400">Tests Taken</div>
          </div>
          <div className="text-center">
            <BookOpen className="text-blue-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold">{stats.best}%</div>
            <div className="text-xs text-gray-400">Best Score</div>
          </div>
          <div className="text-center">
            <Award className="text-green-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold">{stats.avg}%</div>
            <div className="text-xs text-gray-400">Average</div>
          </div>
          <div className="text-center">
            <Clock className="text-purple-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold">{formatTime(stats.time)}</div>
            <div className="text-xs text-gray-400">Practice</div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="bg-gray-800 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <User size={16} className="text-blue-400" /> Account Details
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Member Since</span>
              <span>{new Date(user.metadata?.creationTime).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Login</span>
              <span>{new Date(user.metadata?.lastSignInTime).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
