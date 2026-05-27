import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function Performance() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';

  useEffect(() => {
    if(auth.currentUser) loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const q = query(collection(db, 'results'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      const results = snap.docs.map(d => d.data());
      if(results.length > 0) {
        setStats({
          total: results.length,
          avg: Math.round(results.reduce((a,b) => a + (b.percentage||0), 0) / results.length),
          best: Math.max(...results.map(r => r.percentage||0))
        });
      }
    } catch(e) {
      console.log("Performance error:", e.message);
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20 p-4`}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-bold">Performance</h2>
      </div>
      <div className={`${cardBg} rounded-2xl p-5 mb-4`}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-blue-400" /> Overview</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><div className="text-3xl font-bold text-blue-400">{stats.total}</div><div className={`text-xs mt-1 ${subText}`}>Total Tests</div></div>
          <div><div className="text-3xl font-bold text-green-400">{stats.avg}%</div><div className={`text-xs mt-1 ${subText}`}>Avg Score</div></div>
          <div><div className="text-3xl font-bold text-yellow-400">{stats.best}%</div><div className={`text-xs mt-1 ${subText}`}>Best Score</div></div>
        </div>
      </div>
      {stats.total === 0 && <p className={`text-center ${subText} py-12`}>Complete tests to see your performance analytics!</p>}
    </div>
  );
}
