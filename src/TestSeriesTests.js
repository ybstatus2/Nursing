import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Play, Clock, FileText, Lock } from 'lucide-react';

const seriesNames = {
  daily_morning: "Daily Morning Test",
  daily_evening: "Daily Evening Test",
  "365_days": "365 Days Challenge",
  "norcet_100_days": "NORCET 100 Challenge"
};

export default function TestSeriesTests() {
  const { seriesId } = useParams();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
  }, [seriesId]);

  const fetchTests = async () => {
    try {
      const q = query(
        collection(db, "subject_tests"),
        where("series_id", "==", seriesId),
        // order removed
      );
      const snap = await getDocs(q);
      const testsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log(`${seriesId}: ${testsList.length} tests found`, testsList);
      setTests(testsList);
    } catch(e) {
      console.error("Fetch error:", e.message);
    }
    setLoading(false);
  };

  const todayDateString = () => new Date().toISOString().slice(0, 10);

  const isUnlocked = (test) => {
    if (!test.unlockDate) return true;
    return test.unlockDate <= todayDateString();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-4 pt-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/test-series')} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold">{seriesNames[seriesId] || seriesId}</h2>
            <p className="text-xs text-gray-400">{tests.length} tests available</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <FileText className="mx-auto mb-3" size={40} />
            <p>No tests uploaded yet</p>
            <p className="text-xs mt-2">Upload tests from admin panel</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map((test, i) => {
              const unlocked = isUnlocked(test);
              return (
                <div
                  key={test.id}
                  onClick={() => unlocked ? navigate(`/test/${seriesId}?testId=${test.id}`) : null}
                  className={`bg-gray-800 rounded-2xl p-4 border border-gray-700 ${unlocked ? 'cursor-pointer active:bg-gray-700' : 'opacity-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${unlocked ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'}`}>
                        {test.test_number || i+1}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm">{test.topic_name || `Day ${test.test_number || i+1}`}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={12} /> {test.time_limit || 20} min</span>
                          <span className="flex items-center gap-1"><FileText size={12} /> {test.total_questions || test.questions?.length || 0} Qs</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {unlocked ? (
                        <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
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
