import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, ChevronRight } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [tests, setTests] = useState([]);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => {
    if (auth.currentUser) loadHistory();
  }, []);

  const loadHistory = async () => {
    const q = query(collection(db, 'results'), where('userId', '==', auth.currentUser.uid));
    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    results.sort((a, b) => new Date(b.date) - new Date(a.date));
    setTests(results);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (s) => Math.floor(s/60) + 'm';

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Test History</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tests.length === 0 ? (
          <div className="text-center py-16">
            <Clock className={`mx-auto mb-4 ${subText}`} size={48} />
            <p className={`text-lg font-medium ${subText}`}>No tests taken yet</p>
            <button onClick={() => navigate('/subjects')} className="mt-3 text-blue-400 font-medium">Start a test →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, i) => (
              <div key={i} className={`${cardBg} border ${border} rounded-2xl p-4 cursor-pointer`} onClick={() => navigate('/result', { state: test })}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar size={14} /> {formatDate(test.date)}
                    {test.autoSubmitted && <span className="text-yellow-400">(Auto)</span>}
                  </div>
                  <span className={`text-sm font-black ${test.percentage >= 60 ? 'text-green-400' : 'text-red-400'}`}>
                    {test.percentage}%
                  </span>
                </div>
                <h3 className="font-bold text-sm capitalize mb-2">{test.testName || test.subject?.replace(/-/g, ' ') || 'Test'}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> {test.correct}</span>
                  <span className="flex items-center gap-1"><XCircle size={12} className="text-red-400" /> {test.wrong}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(test.timeTaken || 0)}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${test.percentage >= 60 ? 'bg-green-500' : 'bg-red-500'} rounded-full`} style={{ width: `${test.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
