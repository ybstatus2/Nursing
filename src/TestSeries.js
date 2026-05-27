import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { 
  Sun, Moon, Zap, Calendar, Play, Clock, 
  ChevronRight, Flame, Trophy, ArrowRight
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
  const [latestTests, setLatestTests] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestTests();
  }, []);

  const loadLatestTests = async () => {
    try {
      const testsData = {};
      for (const series of seriesList) {
        const q = query(
          collection(db, "subject_tests"),
          where("series_id", "==", series.id),
          orderBy("test_number", "desc"),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          testsData[series.id] = {
            id: doc.id,
            testNumber: doc.data().test_number,
            totalQuestions: doc.data().total_questions
          };
        }
      }
      setLatestTests(testsData);
    } catch(e) {
      console.log("Firebase fetch error:", e.message);
    }
    setLoading(false);
  };

  const handleStartTest = (seriesId) => {
    if (latestTests[seriesId]) {
      navigate(`/test/${seriesId}`);
    } else {
      alert("No test available yet for this series. Please try another.");
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-5 pt-6">
        <h2 className="text-xl font-bold mb-1">Test Series</h2>
        <p className="text-gray-400 text-sm">Choose your test and start practicing</p>
      </div>

      {/* Series Cards */}
      <div className="px-4 mt-4 space-y-4">
        {seriesList.map((series, i) => (
          <div
            key={i}
            className={`bg-gradient-to-br ${series.gradient} rounded-2xl p-4 border ${series.border} cursor-pointer active:scale-[0.98] transition-transform`}
            onClick={() => handleStartTest(series.id)}
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${series.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                {series.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base">{series.name}</h3>
                  {series.badge && (
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                      {series.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">{series.desc}</p>

                {/* Meta Info */}
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {series.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={12} /> {series.questions} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    ⏰ {series.time}
                  </span>
                </div>

                {/* Latest Test Info */}
                {latestTests[series.id] && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                      Test #{latestTests[series.id].testNumber}
                    </span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                      {latestTests[series.id].totalQuestions} MCQs
                    </span>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 self-center">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Features Section */}
      <div className="px-4 mt-6">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Flame size={16} className="text-orange-400" /> Why Test Series?
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: "🎯", title: "Daily Practice", desc: "Stay consistent" },
            { icon: "📊", title: "Track Progress", desc: "See improvement" },
            { icon: "🏆", title: "Leaderboard", desc: "Compete with others" },
            { icon: "💡", title: "Explanations", desc: "Learn from mistakes" },
          ].map((item, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3 text-center">
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
