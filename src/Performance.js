import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, BarChart3, TrendingUp, Award, Activity } from 'lucide-react';

export default function Performance() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0, recent: [] });

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { if(auth.currentUser) loadData(); }, []);

  const loadData = async () => {
    const q = query(collection(db, 'results'), where('userId', '==', auth.currentUser.uid));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => d.data());
    if(results.length > 0) {
      setStats({
        total: results.length,
        avg: Math.round(results.reduce((a,b) => a + (b.percentage||0), 0) / results.length),
        best: Math.max(...results.map(r => r.percentage||0)),
        recent: results.slice(-5).reverse()
      });
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Performance</h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Activity className="text-blue-400" size={20} />, label: 'Tests', value: stats.total },
            { icon: <TrendingUp className="text-green-400" size={20} />, label: 'Average', value: `${stats.avg}%` },
            { icon: <Award className="text-yellow-400" size={20} />, label: 'Best', value: `${stats.best}%` }
          ].map((s, i) => (
            <div key={i} className={`${cardBg} border ${border} rounded-2xl p-4 text-center`}>
              <div className="flex justify-center mb-2">{s.icon}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Tests Mini Chart */}
        <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} className="text-blue-400" /> Recent Tests</h3>
          {stats.recent.length > 0 ? (
            <div className="space-y-2">
              {stats.recent.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-16">{r.testName?.slice(0,10) || 'Test'}</span>
                  <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${r.percentage >= 60 ? 'bg-green-500' : 'bg-red-500'} rounded-full`} style={{width: `${r.percentage}%`}}></div>
                  </div>
                  <span className="text-xs font-bold w-10 text-right">{r.percentage}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${subText} text-center py-4`}>Complete tests to see analytics</p>
          )}
        </div>
      </div>
    </div>
  );
}
