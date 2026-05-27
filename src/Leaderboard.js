import { useState, useEffect } from 'react';
import { Trophy, Medal, User } from 'lucide-react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [timeFilter, setTimeFilter] = useState('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const snap = await getDocs(collection(db, 'results'));
      const results = snap.docs.map(d => d.data());
      const userScores = {};
      results.forEach(r => {
        const key = r.userId || 'anonymous';
        if(!userScores[key]) userScores[key] = { name: key, score: 0, tests: 0 };
        userScores[key].score += r.percentage || 0;
        userScores[key].tests += 1;
      });
      const sorted = Object.values(userScores)
        .map(u => ({ ...u, avg: Math.round(u.score / u.tests) }))
        .sort((a,b) => b.avg - a.avg)
        .slice(0, 20);
      setLeaders(sorted);
    } catch(e) { console.log(e); }
  };

  const getRankIcon = (index) => {
    if(index === 0) return <Trophy className="text-yellow-400" size={20} />;
    if(index === 1) return <Medal className="text-gray-300" size={20} />;
    if(index === 2) return <Medal className="text-amber-600" size={20} />;
    return <span className="text-gray-500 font-bold">{index + 1}</span>;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Leaderboard</h2>
        <div className="flex bg-gray-800 rounded-xl p-1 mb-4">
          {['weekly', 'monthly', 'alltime'].map(f => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize ${
                timeFilter === f ? 'bg-blue-600' : 'text-gray-400'
              }`}
            >
              {f === 'alltime' ? 'All Time' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Top 3 */}
        {leaders.slice(0, 3).length > 0 && (
          <div className="flex items-end justify-center gap-3 mb-6 h-40">
            {[1,0,2].map(pos => {
              const leader = leaders[pos];
              if(!leader) return null;
              return (
                <div key={pos} className="text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-2">
                    <User size={24} />
                  </div>
                  <div className={`${pos === 0 ? 'h-24 bg-yellow-500' : pos === 1 ? 'h-16 bg-gray-400' : 'h-20 bg-amber-600'} w-16 rounded-t-xl mx-auto flex items-end justify-center pb-2`}>
                    <span className="text-xs font-black text-gray-900">{pos+1}</span>
                  </div>
                  <p className="text-xs font-bold mt-1 truncate w-16">{leader.name?.slice(0,8)}</p>
                  <p className="text-xs text-gray-400">{leader.avg}%</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {leaders.map((leader, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(i)}
              </div>
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{leader.name?.slice(0,12)}</p>
                <p className="text-xs text-gray-400">{leader.tests} tests</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-400">{leader.avg}%</p>
                <p className="text-xs text-gray-400">avg</p>
              </div>
            </div>
          ))}
          {leaders.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              <Trophy className="mx-auto mb-4" size={40} />
              <p>No data yet. Start practicing!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
