import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useTheme } from './ThemeContext';
import {
  Zap, Clock, BookOpen, Flame, Play, ArrowRight,
  Stethoscope, Activity, Heart, Pill, Baby, Brain,
  Building2, TrendingUp, FlaskConical, BookOpen as Book,
  Apple, Microscope, Shield, BarChart3, Star, Trophy
} from 'lucide-react';

const subjects = [
  { id: "medical-surgical-nursing", name: "Medical Surgical", icon: <Stethoscope size={18} />, color: "from-red-600 to-rose-600", bgLight: "bg-red-50", count: "87+" },
  { id: "first-aid-and-emergency", name: "First Aid & Emergency", icon: <Activity size={18} />, color: "from-orange-600 to-amber-600", bgLight: "bg-orange-50", count: "390+" },
  { id: "anatomy-and-physiology", name: "Anatomy & Physiology", icon: <Heart size={18} />, color: "from-pink-600 to-red-600", bgLight: "bg-pink-50", count: "600+" },
  { id: "pharmacology", name: "Pharmacology", icon: <Pill size={18} />, color: "from-purple-600 to-violet-600", bgLight: "bg-purple-50", count: "740+" },
  { id: "pediatric-nursing", name: "Pediatric Nursing", icon: <Baby size={18} />, color: "from-cyan-600 to-blue-600", bgLight: "bg-cyan-50", count: "780+" },
  { id: "mental-health-nursing", name: "Mental Health", icon: <Brain size={18} />, color: "from-indigo-600 to-purple-600", bgLight: "bg-indigo-50", count: "670+" },
  { id: "community-health-nursing", name: "Community Health", icon: <Building2 size={18} />, color: "from-emerald-600 to-teal-600", bgLight: "bg-emerald-50", count: "920+" },
  { id: "nursing-management", name: "Nursing Mgmt", icon: <TrendingUp size={18} />, color: "from-blue-600 to-indigo-600", bgLight: "bg-blue-50", count: "540+" },
  { id: "microbiology", name: "Microbiology", icon: <FlaskConical size={18} />, color: "from-lime-600 to-green-600", bgLight: "bg-lime-50", count: "510+" },
  { id: "research-and-statistics", name: "Research & Stats", icon: <BarChart3 size={18} />, color: "from-yellow-600 to-orange-600", bgLight: "bg-yellow-50", count: "420+" },
  { id: "nursing-foundation", name: "Nursing Foundation", icon: <Book size={18} />, color: "from-sky-600 to-blue-600", bgLight: "bg-sky-50", count: "980+" },
  { id: "nutrition", name: "Nutrition", icon: <Apple size={18} />, color: "from-green-600 to-emerald-600", bgLight: "bg-green-50", count: "360+" },
  { id: "biochemistry", name: "Biochemistry", icon: <Microscope size={18} />, color: "from-fuchsia-600 to-pink-600", bgLight: "bg-fuchsia-50", count: "300+" },
  { id: "pathology", name: "Pathology", icon: <Shield size={18} />, color: "from-slate-600 to-gray-600", bgLight: "bg-slate-50", count: "440+" },
  { id: "infection-control", name: "Infection Control", icon: <Shield size={18} />, color: "from-amber-600 to-yellow-600", bgLight: "bg-amber-50", count: "260+" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, time: 0 });
  const [recentTests, setRecentTests] = useState([]);

  const cardBg = darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';

  const startDailyChallenge = async () => {
    const todayStr = new Date().toISOString().slice(0,10);
    const q = query(collection(db, "subject_tests"), where("series_id", "==", "daily_challenge"), where("unlockDate", "==", todayStr), limit(1));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const doc = snap.docs[0];
      navigate(`/test/daily_challenge?testId=${doc.id}`);
    } else {
      alert("No daily challenge available today.");
    }
  };

  useEffect(() => {
    const u = auth.currentUser;
    setUser(u);
    if (u) loadDashboardData(u);
  }, []);

  const loadDashboardData = async (u) => {
    try {
      const q = query(collection(db, 'results'), where('userId', '==', u.uid));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => d.data());
      setStats({
        tests: results.length,
        avgScore: results.length ? Math.round(results.reduce((a,b) => a + (b.percentage||0), 0) / results.length) : 0,
        time: results.length * 30
      });

      const recentQ = query(collection(db, 'results'), where('userId', '==', u.uid), orderBy('date', 'desc'), limit(3));
      const recentSnap = await getDocs(recentQ);
      setRecentTests(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) { /* ignore */ }
  };

  const formatTime = (s) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-24`}>
      {/* Welcome & Stats */}
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 px-5 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Hello, {user?.email?.split('@')[0] || 'Student'} 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Ready to ace your exams?</p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-2xl">{user?.email?.[0]?.toUpperCase() || 'S'}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <Trophy className="text-yellow-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold text-white">{stats.tests}</div>
            <div className="text-[10px] text-gray-400">Tests</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <Star className="text-green-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold text-white">{stats.avgScore}%</div>
            <div className="text-[10px] text-gray-400">Avg Score</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-4 text-center backdrop-blur-sm border border-white/10">
            <Clock className="text-blue-400 mx-auto mb-1" size={20} />
            <div className="text-xl font-bold text-white">{formatTime(stats.time)}</div>
            <div className="text-[10px] text-gray-400">Practice</div>
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="px-4 -mt-4">
        <div onClick={startDailyChallenge}
          className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 shadow-xl shadow-orange-500/20 cursor-pointer active:scale-[0.98] transition-transform">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Flame className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Daily Challenge 🔥</h3>
                <p className="text-white/70 text-sm">10 questions • 5 minutes</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Zap size={16} className="text-blue-400" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate('/test/anatomy-and-physiology')} className={`${cardBg} border ${border} rounded-2xl p-4 text-left active:scale-95 transition-transform`}>
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center mb-2">
              <Zap size={18} className="text-blue-400" />
            </div>
            <h4 className="font-bold text-sm">Quick Practice</h4>
            <p className="text-xs text-gray-400 mt-1">10 min challenge</p>
          </button>
          <button onClick={() => navigate('/test-series')} className={`${cardBg} border ${border} rounded-2xl p-4 text-left active:scale-95 transition-transform`}>
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center mb-2">
              <BookOpen size={18} className="text-purple-400" />
            </div>
            <h4 className="font-bold text-sm">Mock Test</h4>
            <p className="text-xs text-gray-400 mt-1">Full length exam</p>
          </button>
          <button onClick={() => navigate('/performance')} className={`${cardBg} border ${border} rounded-2xl p-4 text-left active:scale-95 transition-transform`}>
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center mb-2">
              <TrendingUp size={18} className="text-red-400" />
            </div>
            <h4 className="font-bold text-sm">Weak Areas</h4>
            <p className="text-xs text-gray-400 mt-1">Improve score</p>
          </button>
          <button onClick={() => navigate('/study-materials')} className={`${cardBg} border ${border} rounded-2xl p-4 text-left active:scale-95 transition-transform`}>
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center mb-2">
              <BookOpen size={18} className="text-green-400" />
            </div>
            <h4 className="font-bold text-sm">Study Notes</h4>
            <p className="text-xs text-gray-400 mt-1">Revision material</p>
          </button>
        </div>
      </div>

      {/* Recent Tests */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Clock size={16} className="text-blue-400" /> Recent Tests
          </h3>
          <button onClick={() => navigate('/history')} className="text-xs text-blue-400 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>
        {recentTests.length > 0 ? (
          <div className="space-y-2">
            {recentTests.map((test, i) => (
              <div key={i} className={`${cardBg} border ${border} rounded-xl p-3 flex items-center gap-3 cursor-pointer`} onClick={() => navigate('/history')}>
                <div className={`w-2 h-10 ${test.percentage >= 60 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{test.testName || 'Test'}</h4>
                  <p className="text-xs text-gray-400">{new Date(test.date).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-bold text-green-400">{test.percentage}%</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${cardBg} border ${border} rounded-2xl p-6 text-center`}>
            <p className="text-sm text-gray-400">No tests taken yet</p>
            <button onClick={() => navigate('/subjects')} className="mt-2 text-blue-400 text-sm font-medium">Start a test →</button>
          </div>
        )}
      </div>

      {/* Subjects */}
      <div className="px-4 mt-5">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" /> Popular Subjects
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {subjects.slice(0, 6).map(s => (
            <div key={s.id} onClick={() => navigate(`/subject-tests/${s.id}`)}
              className={`${cardBg} border ${border} rounded-2xl p-4 active:scale-95 transition-transform cursor-pointer`}>
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center mb-3 text-white`}>
                {s.icon}
              </div>
              <h4 className="font-bold text-sm">{s.name}</h4>
              <p className="text-xs text-gray-400 mt-1">{s.count} MCQs</p>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/subjects')} className="w-full mt-3 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm text-white transition-all">
          View All Subjects
        </button>
      </div>
    </div>
  );
}
