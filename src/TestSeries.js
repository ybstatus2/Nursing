import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { 
  Sun, Moon, Zap, Calendar, Play, Clock, 
  Flame, Trophy
} from 'lucide-react';

const seriesList = [
  {
    id: "daily_morning",
    name: "Daily Morning Test",
    desc: "Start your day with 25 MCQs",
    icon: <Sun size={28} />,
    color: "from-orange-500 to-yellow-500",
    gradient: "from-orange-900/40 to-yellow-900/40",
    border: "border-orange-500/30",
    time: "7:00 AM",
    questions: 25,
    duration: "20 min"
  },
  {
    id: "daily_evening",
    name: "Daily Evening Test",
    desc: "End your day with practice",
    icon: <Moon size={28} />,
    color: "from-blue-500 to-indigo-500",
    gradient: "from-blue-900/40 to-indigo-900/40",
    border: "border-blue-500/30",
    time: "7:00 PM",
    questions: 25,
    duration: "20 min"
  },
  {
    id: "norcet_100_days",
    name: "NORCET 100 Challenge",
    desc: "100 days intensive preparation",
    icon: <Trophy size={28} />,
    color: "from-purple-500 to-pink-500",
    gradient: "from-purple-900/40 to-pink-900/40",
    border: "border-purple-500/30",
    time: "Anytime",
    questions: 100,
    duration: "100 min",
    badge: "🔥 Popular"
  },
  {
    id: "365_days",
    name: "365 Days Challenge",
    desc: "Complete year preparation plan",
    icon: <Calendar size={28} />,
    color: "from-green-500 to-emerald-500",
    gradient: "from-green-900/40 to-emerald-900/40",
    border: "border-green-500/30",
    time: "Daily",
    questions: 100,
    duration: "100 min",
    badge: "📅 Year Long"
  }
];

export default function TestSeries() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [latestTests, setLatestTests] = useState({});

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { loadLatestTests(); }, []);

  const loadLatestTests = async () => {
    try {
      const testsData = {};
      for (const series of seriesList) {
        const q = query(
          collection(db, "subject_tests"),
          where("series_id", "==", series.id),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();
          testsData[series.id] = {
            id: doc.id,
            testNumber: data.test_number,
            totalQuestions: data.total_questions || data.questions?.length || 0
          };
        }
      }
      setLatestTests(testsData);
    } catch(e) { console.log(e); }
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-24`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 via-gray-900 to-gray-900 px-5 pt-8 pb-6">
        <h2 className="text-2xl font-bold text-white">Test Series</h2>
        <p className="text-gray-400 text-sm mt-1">Daily practice for consistent improvement</p>
      </div>

      {/* Series Cards */}
      <div className="px-4 -mt-4 space-y-4">
        {seriesList.map((series, i) => (
          <div
            key={i}
            onClick={() => navigate(`/test-series-tests/${series.id}`)}
            className={`bg-gradient-to-br ${series.gradient} rounded-2xl p-5 border ${series.border} cursor-pointer active:scale-[0.98] transition-all hover:shadow-xl backdrop-blur-sm`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${series.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {series.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white text-base">{series.name}</h3>
                  {series.badge && (
                    <span className="text-[10px] bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">
                      {series.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/60 mb-3">{series.desc}</p>

                <div className="flex items-center gap-3 text-xs text-white/60 mb-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {series.duration}</span>
                  <span className="flex items-center gap-1"><Zap size={12} /> {series.questions} Qs</span>
                  <span className="flex items-center gap-1">⏰ {series.time}</span>
                </div>

                {latestTests[series.id] ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full">
                      Test #{latestTests[series.id].testNumber}
                    </span>
                    <span className="text-[10px] bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full">
                      {latestTests[series.id].totalQuestions} MCQs
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-white/40">No tests uploaded yet</p>
                )}
              </div>

              <div className="flex-shrink-0 self-center">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Play size={18} className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" /> Why Test Series?
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🎯", title: "Daily Practice", desc: "Stay consistent" },
            { icon: "📊", title: "Track Progress", desc: "See improvement" },
            { icon: "🏆", title: "Leaderboard", desc: "Compete with others" },
            { icon: "💡", title: "Explanations", desc: "Learn from mistakes" },
          ].map((item, i) => (
            <div key={i} className={`${cardBg} border ${border} rounded-xl p-3 text-center`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <h4 className="text-xs font-bold">{item.title}</h4>
              <p className="text-[10px] text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
