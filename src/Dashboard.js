import { useTheme } from "./ThemeContext";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Zap, TrendingUp, Clock, BookOpen, 
  Brain, Flame, ChevronRight, Play,
  Lightbulb, ArrowRight, Target
} from 'lucide-react';

export default function Dashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ tests: 0, avgScore: 0, time: 0 });
  const [recentTests, setRecentTests] = useState([]);
  const [dailyQuote] = useState({
    text: "The best way to predict the future is to create it.",
    author: "Abraham Lincoln"
  });

  useEffect(() => {
    setUser(auth.currentUser);
    if(auth.currentUser) {
      loadStats();
      loadRecentTests();
    }
  }, []);

  const loadStats = async () => {
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const results = snap.docs.map(d => d.data());
      setStats({
        tests: results.length,
        avgScore: results.length > 0 
          ? Math.round(results.reduce((a,b) => a + (b.percentage || 0), 0) / results.length) 
          : 0,
        time: results.reduce((a,b) => a + (b.timeTaken || 0), 0)
      });
    } catch(e) { console.log("Stats error:", e.message); }
  };

  const loadRecentTests = async () => {
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(3)
      );
      const snap = await getDocs(q);
      const tests = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        date: new Date(d.data().date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      }));
      setRecentTests(tests);
    } catch(e) { console.log("Recent tests error:", e.message); }
  };

  const formatTime = (s) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const quickActions = [
    { icon: <Zap size={20} />, title: "Quick Practice", desc: "10 min challenge", color: "from-yellow-500 to-orange-500", path: "/test/anatomy-and-physiology" },
    { icon: <Target size={20} />, title: "Mock Test", desc: "Full length exam", color: "from-purple-500 to-violet-500", path: "/test-series" },
    { icon: <Brain size={20} />, title: "Weak Areas", desc: "Improve score", color: "from-red-500 to-pink-500", path: "/performance" },
    { icon: <BookOpen size={20} />, title: "Study Tips", desc: "Expert guidance", color: "from-blue-500 to-cyan-500", path: "/study-materials" },
  ];

  return (
    <div className={`h-full overflow-y-auto pb-20 ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 p-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back,</h1>
            <p className="text-xl font-bold text-blue-400">{user?.email?.split('@')[0] || 'Student'} 👋</p>
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-lg font-black">
            {user?.email?.[0]?.toUpperCase() || 'S'}
          </div>
        </div>

        {/* Stats from Firebase */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold">{stats.tests}</div>
            <div className="text-[10px] text-gray-400">Tests</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-400">{stats.avgScore}%</div>
            <div className="text-[10px] text-gray-400">Avg Score</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{formatTime(stats.time)}</div>
            <div className="text-[10px] text-gray-400">Practice</div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <div className="flex items-start gap-2">
            <Lightbulb className="text-yellow-400 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-sm italic text-gray-300">"{dailyQuote.text}"</p>
              <p className="text-xs text-gray-500 mt-1">— {dailyQuote.author}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-2">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.path)}
              className={`bg-gradient-to-br ${item.color} p-4 rounded-2xl active:scale-95 transition-transform cursor-pointer`}
            >
              <div className="bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                {item.icon}
              </div>
              <h3 className="font-bold text-sm">{item.title}</h3>
              <p className="text-xs text-white/70 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Challenge */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-2xl p-4 border border-orange-500/30 cursor-pointer" onClick={() => navigate('/test/anatomy-and-physiology')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/30 rounded-xl flex items-center justify-center">
                <Flame className="text-orange-400" size={24} />
              </div>
              <div>
                <h3 className="font-bold">🔥 Daily Challenge</h3>
                <p className="text-xs text-gray-400 mt-1">10 questions • 5 minutes</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity from Firebase */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <Clock size={18} className="text-blue-400" /> Recent Tests
          </h3>
          <button onClick={() => navigate('/history')} className="text-xs text-blue-400 flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>
        {recentTests.length > 0 ? (
          <div className="space-y-2">
            {recentTests.map((test, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3 cursor-pointer" onClick={() => navigate('/history')}>
                <div className={`w-2 h-10 ${test.percentage >= 60 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full`}></div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{test.testName || test.subject || 'Test'}</h4>
                  <p className="text-xs text-gray-400">{test.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${test.percentage >= 60 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {test.percentage}%
                  </span>
                  <ChevronRight size={14} className="text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-4 text-center text-xs text-gray-400">
            <p>No tests taken yet. Start practicing!</p>
            <button onClick={() => navigate('/subjects')} className="text-blue-400 mt-2 block">Browse Subjects →</button>
          </div>
        )}
      </div>

      {/* Study Tip */}
      <div className="px-4 mt-4 mb-24">
        <div className="bg-blue-900/30 rounded-2xl p-4 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="text-blue-400" size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-blue-400">📚 Study Tip</h4>
              <p className="text-xs text-gray-300 mt-1">
                Practice 50 MCQs daily to improve retention. Focus on weak areas identified in performance analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
