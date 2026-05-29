import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Trophy, Medal, User } from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [leaders, setLeaders] = useState([]);
  const [filter, setFilter] = useState('alltime');

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const snap = await getDocs(collection(db, 'results'));
    const users = {};
    snap.docs.forEach(d => {
      const r = d.data();
      const uid = r.userId || 'anon';
      if (!users[uid]) users[uid] = { name: uid, score: 0, tests: 0, best: 0 };
      users[uid].score += r.percentage || 0;
      users[uid].tests += 1;
      users[uid].best = Math.max(users[uid].best, r.percentage || 0);
    });
    const list = Object.values(users).map(u => ({ ...u, avg: Math.round(u.score / u.tests) })).sort((a,b) => b.avg - a.avg);
    setLeaders(list.slice(0, 20));
  };

  const getMedal = (i) => {
    if (i === 0) return <Trophy className="text-yellow-400" size={24} />;
    if (i === 1) return <Medal className="text-gray-300" size={24} />;
    if (i === 2) return <Medal className="text-amber-600" size={24} />;
    return <span className="text-gray-500 font-bold">{i+1}</span>;
  };

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Leaderboard</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Top 3 Podium */}
        {leaders.slice(0, 3).length > 0 && (
          <div className="flex items-end justify-center gap-4 mb-8 h-40">
            {[1,0,2].map(pos => {
              const l = leaders[pos];
              if (!l) return null;
              return (
                <div key={pos} className="text-center">
                  <div className="w-14 h-14 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2 ring-2 ring-gray-500">
                    <User size={28} className="text-gray-400" />
                  </div>
                  <div className={`${pos === 0 ? 'h-24 bg-yellow-500' : pos === 1 ? 'h-16 bg-gray-400' : 'h-20 bg-amber-600'} w-16 rounded-t-xl mx-auto flex items-end justify-center pb-2`}>
                    <span className="text-xs font-black text-gray-900">{pos+1}</span>
                  </div>
                  <p className="text-xs font-bold mt-1 truncate w-16">{l.name?.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{l.avg}%</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Leaderboard List */}
        <div className="space-y-2">
          {leaders.map((l, i) => (
            <div key={i} className={`${cardBg} border ${border} rounded-xl p-3 flex items-center gap-3`}>
              <div className="w-8 h-8 flex items-center justify-center">{getMedal(i)}</div>
              <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center"><User size={18} /></div>
              <div className="flex-1">
                <p className="text-sm font-bold">{l.name?.slice(0, 12)}</p>
                <p className="text-xs text-gray-400">{l.tests} tests</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-400">{l.avg}%</p>
                <p className="text-xs text-gray-400">avg</p>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="text-center py-16">
              <Trophy className={`mx-auto mb-4 ${subText}`} size={48} />
              <p className={`text-lg font-medium ${subText}`}>No data yet</p>
              <p className="text-xs text-gray-400 mt-1">Start practicing to appear on leaderboard!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
