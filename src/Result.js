import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Home, RotateCcw, Share2, Trophy, Target, Clock, BarChart3, AlertCircle } from 'lucide-react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();
  const [result, setResult] = useState(location.state || null);
  const [loading, setLoading] = useState(!result);

  const testId = searchParams.get('testId');
  const mode = searchParams.get('mode');

  useEffect(() => {
    // If result already exists from state, skip fetch
    if (result && result.questions) return;

    if (testId && auth.currentUser) {
      fetchResultFromFirebase();
    } else {
      setLoading(false);
    }
  }, [testId, auth.currentUser]);

  const fetchResultFromFirebase = async () => {
    try {
      const q = query(
        collection(db, 'results'),
        where('testId', '==', testId),
        where('userId', '==', auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        // Use the latest result
        const data = snap.docs[snap.docs.length - 1].data();
        // If no questions data, fetch the test questions
        if (!data.questions) {
          const testDoc = await getDoc(doc(db, 'subject_tests', testId));
          if (testDoc.exists()) {
            data.questions = testDoc.data().questions || [];
          }
        }
        setResult(data);
      }
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!result || !result.questions) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center text-gray-400">
        <AlertCircle className="mx-auto mb-4" size={40} />
        <p>No results found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-400">Go Home</button>
      </div>
    </div>
  );

  const { score, total, correct, wrong, skipped, percentage, timeTaken, autoSubmitted, questions, answers } = result;
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D';
  const gradeColor = percentage >= 60 ? 'text-green-400' : 'text-red-400';

  const formatTime = (s) => {
    const m = Math.floor(s/60);
    const sec = s%60;
    return `${m}m ${sec}s`;
  };

  const shareResult = () => {
    const text = `🎉 I scored ${percentage}% (${score}/${total}) on RPREP CBT App! \n✅ ${correct} Correct | ❌ ${wrong} Wrong\n📚 Join me: https://rprep.online`;
    if (navigator.share) navigator.share({ title: 'My RPREP Result', text });
    else alert('Result copied!');
  };

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`h-screen overflow-y-auto ${darkMode ? 'bg-gray-950' : 'bg-gray-50'} pb-20`}>
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 px-5 pt-8 pb-8 text-center">
        {autoSubmitted && (
          <div className="bg-yellow-500/20 text-yellow-400 text-xs px-3 py-1 rounded-full inline-block mb-4">
            ⏰ Time's up! Auto-submitted
          </div>
        )}

        {/* Score Circle */}
        <div className="relative w-36 h-36 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={percentage >= 60 ? '#22c55e' : '#ef4444'} strokeWidth="8"
              strokeDasharray={`${percentage * 3.267} 326.7`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-black ${gradeColor}`}>{percentage}%</span>
            <span className={`text-lg font-bold mt-1 ${gradeColor}`}>{grade}</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white">{percentage >= 60 ? '🎉 Congratulations!' : '💪 Keep Practicing!'}</h2>
        <p className="text-gray-400 text-sm">{percentage >= 60 ? 'You passed the test!' : 'Better luck next time!'}</p>
      </div>

      {/* Stats Grid */}
      <div className="px-4 -mt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className={`${cardBg} rounded-2xl p-4 shadow-xl`}>
            <Trophy className="text-yellow-400 mb-2" size={20} />
            <div className="text-2xl font-bold">{score}/{total}</div>
            <div className="text-xs text-gray-400">Score</div>
          </div>
          <div className={`${cardBg} rounded-2xl p-4 shadow-xl`}>
            <Clock className="text-blue-400 mb-2" size={20} />
            <div className="text-2xl font-bold">{formatTime(timeTaken || 0)}</div>
            <div className="text-xs text-gray-400">Time</div>
          </div>
          <div className="bg-green-500/10 rounded-2xl p-4 border border-green-500/30">
            <CheckCircle className="text-green-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-green-400">{correct || 0}</div>
            <div className="text-xs text-gray-400">Correct</div>
          </div>
          <div className="bg-red-500/10 rounded-2xl p-4 border border-red-500/30">
            <XCircle className="text-red-400 mb-2" size={20} />
            <div className="text-2xl font-bold text-red-400">{wrong || 0}</div>
            <div className="text-xs text-gray-400">Wrong</div>
          </div>
        </div>
      </div>

      {/* Performance Bar */}
      <div className="px-4 mt-4">
        <div className={`${cardBg} rounded-2xl p-4`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><BarChart3 size={16} /> Performance</h3>
          {[
            { label: 'Correct', value: correct, color: 'bg-green-500' },
            { label: 'Wrong', value: wrong, color: 'bg-red-500' },
            { label: 'Skipped', value: skipped, color: 'bg-gray-500' }
          ].map((item, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="flex justify-between text-xs mb-1"><span>{item.label}</span><span>{item.value}</span></div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value/total)*100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solution View (if mode=solution) */}
      {mode === 'solution' && questions && (
        <div className="px-4 mt-4">
          <h3 className="font-bold text-sm mb-3">Answer Key</h3>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className={`${cardBg} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className="text-sm font-medium mb-2">{i+1}. {q.question}</p>
                {q.options?.map((opt, j) => (
                  <div key={j} className={`p-2 rounded-lg text-sm mb-1 ${
                    j === q.correct ? 'bg-green-500/20 text-green-400' :
                    answers?.[i] === j ? 'bg-red-500/20 text-red-400' : 'text-gray-400'
                  }`}>
                    {String.fromCharCode(65+j)}. {opt} {j === q.correct && ' ✓'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 mt-4 space-y-2">
        <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2">
          <Home size={18} /> Back to Home
        </button>
        {!mode && (
          <button onClick={() => navigate(-1)} className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-white flex items-center justify-center gap-2">
            <RotateCcw size={18} /> Retake Test
          </button>
        )}
        <button onClick={shareResult} className="w-full py-4 bg-green-600/20 border border-green-500/30 rounded-xl font-bold text-green-400 flex items-center justify-center gap-2">
          <Share2 size={18} /> Share Result
        </button>
      </div>
    </div>
  );
}
