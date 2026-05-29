import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Play, Clock, FileText, Lock, CheckCircle } from 'lucide-react';

const seriesNames = {
  daily_morning: "Daily Morning Test",
  daily_evening: "Daily Evening Test",
  "365_days": "365 Days Challenge",
  "norcet_100_days": "NORCET 100 Challenge"
};

export default function TestSeriesTests() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800/80' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const headerBg = darkMode ? 'bg-gray-900/80' : 'bg-white';

  useEffect(() => { fetchTests(); }, [seriesId]);

  const fetchTests = async () => {
    try {
      const q = query(collection(db, "subject_tests"), where("series_id", "==", seriesId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.test_number || 0) - (b.test_number || 0));
      setTests(list);
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const todayDateString = () => new Date().toISOString().slice(0, 10);

  const isUnlocked = (test) => {
    if (!test.unlockDate) return true;
    return test.unlockDate <= todayDateString();
  };

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      {/* Header */}
      <div className={`${headerBg} border-b ${border} px-4 py-4 flex items-center gap-3 flex-shrink-0`}>
        <button onClick={() => navigate('/test-series')} className={`w-9 h-9 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl flex items-center justify-center transition-all`}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold">{seriesNames[seriesId] || seriesId}</h2>
          <p className={`text-xs ${subText}`}>{tests.length} tests available</p>
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <FileText className={`mx-auto mb-4 ${subText}`} size={48} />
            <p className={`text-lg font-medium ${subText}`}>No tests uploaded yet</p>
            <p className="text-xs text-gray-400 mt-2">Upload tests from admin panel</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, i) => {
              const unlocked = isUnlocked(test);
              return (
                <div
                  key={test.id}
                  onClick={() => unlocked ? navigate(`/test/${seriesId}?testId=${test.id}`) : null}
                  className={`${cardBg} border ${border} rounded-2xl p-4 ${unlocked ? 'cursor-pointer active:scale-[0.98] hover:border-gray-500 transition-all' : 'opacity-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        unlocked ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                        {test.test_number || i+1}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{test.topic_name || `Day ${test.test_number || i+1}`}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {test.time_limit || 20} min</span>
                          <span className="flex items-center gap-1"><FileText size={12} /> {test.total_questions || test.questions?.length || 0} Qs</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {unlocked ? (
                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                          <Play size={18} className="text-green-400 ml-0.5" />
                        </div>
                      ) : (
                        <Lock size={18} className="text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
