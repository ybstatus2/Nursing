import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, query, where, addDoc, doc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import {
  Timer, Flag, Send, AlertTriangle, Grid3X3, ArrowLeft,
  ChevronLeft, ChevronRight, Eye, EyeOff, RotateCcw
} from 'lucide-react';

export default function SubjectTest() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('testId');
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({}); // true if bookmarked
  const [timeLeft, setTimeLeft] = useState(1200);
  const [showPalette, setShowPalette] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState({ name: 'Loading...', duration: 20, total: 0 });

  useEffect(() => {
    fetchQuestions();
  }, [subjectId, testId]);

  useEffect(() => {
    if (timeLeft <= 0) handleSubmit(true);
    const timer = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      if (testId) {
        const docRef = doc(db, "subject_tests", testId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          let qs = data.questions || [];
          if (data.shuffleQuestions) qs = [...qs].sort(() => Math.random() - 0.5);
          if (data.shuffleOptions) {
            qs = qs.map(q => {
              const correctText = q.options[q.correct];
              const opts = [...q.options].sort(() => Math.random() - 0.5);
              return { ...q, options: opts, correct: opts.indexOf(correctText) };
            });
          }
          setQuestions(qs);
          setTimeLeft((data.time_limit || 30) * 60);
          setTestInfo({ name: data.topic_name || `Test ${data.test_number || 1}`, duration: data.time_limit || 30, total: qs.length, testId: testId });
        }
      }
      else if (['daily_morning', 'daily_evening', 'norcet_100_days', '365_days', 'daily_challenge'].includes(subjectId)) {
        const q = query(collection(db, "subject_tests"), where("series_id", "==", subjectId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const latestDoc = snap.docs[snap.docs.length - 1];
          const data = latestDoc.data();
          let qs = data.questions || [];
          if (data.shuffleQuestions) qs = [...qs].sort(() => Math.random() - 0.5);
          setQuestions(qs);
          setTimeLeft((data.time_limit || 20) * 60);
          setTestInfo({ name: data.series_name || data.topic_name || subjectId, duration: data.time_limit || 20, total: qs.length, testId: latestDoc.id });
        }
      }
      else {
        const q = query(collection(db, "mcqs"), where("subject", "==", subjectId));
        const snap = await getDocs(q);
        const qs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setQuestions(qs.slice(0, 50));
        setTestInfo({ name: subjectId?.replace(/-/g, ' '), duration: 20, total: Math.min(qs.length, 50), testId: null });
      }
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const formatTime = (s) => {
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = s%60;
    return `${h>0?h+':':''}${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const handleAnswer = (optIndex) => {
    setAnswers({...answers, [currentQ]: optIndex});
  };

  // Bookmark toggle (save/remove from Firestore)
  const toggleBookmark = async () => {
    const q = questions[currentQ];
    if (!q || !auth.currentUser) return;
    const questionId = q.id || `${subjectId}_${currentQ}`;
    try {
      const bookRef = collection(db, 'bookmarks');
      const existingSnap = await getDocs(query(bookRef,
        where('userId', '==', auth.currentUser.uid),
        where('questionId', '==', questionId)));
      if (!existingSnap.empty) {
        // Remove bookmark
        existingSnap.forEach(async (d) => await deleteDoc(doc(db, 'bookmarks', d.id)));
        setReviewed(prev => ({ ...prev, [currentQ]: false }));
      } else {
        // Add bookmark
        await addDoc(bookRef, {
          userId: auth.currentUser.uid,
          questionId: questionId,
          question: q.question,
          options: q.options,
          correct: q.correct,
          subject: subjectId,
          createdAt: serverTimestamp()
        });
        setReviewed(prev => ({ ...prev, [currentQ]: true }));
      }
    } catch(e) { console.log("Bookmark error:", e.message); }
  };

  const clearAnswer = () => {
    const newAnswers = {...answers};
    delete newAnswers[currentQ];
    setAnswers(newAnswers);
  };

  const handleSubmit = async (auto = false) => {
    let score = 0, correct = 0, wrong = 0, skipped = 0;
    questions.forEach((q, i) => {
      if(answers[i] === undefined) skipped++;
      else if(answers[i] === q.correct) { score++; correct++; }
      else wrong++;
    });

    const result = {
      userId: auth.currentUser?.uid || 'anonymous',
      subject: subjectId,
      testId: testInfo.testId,
      testName: testInfo.name,
      score, total: questions.length, correct, wrong, skipped,
      percentage: Math.round((score/questions.length)*100),
      timeTaken: testInfo.duration * 60 - timeLeft,
      date: new Date().toISOString(),
      autoSubmitted: auto,
      answers, questions
    };

    try { await addDoc(collection(db, 'results'), result); } catch(e) { console.log(e); }
    navigate('/result', { replace: true, state: result });
  };

  if(loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading questions...</p>
      </div>
    </div>
  );

  if(questions.length === 0) return (
    <div className="h-screen flex items-center justify-center bg-gray-950">
      <div className="text-center text-gray-400">
        <AlertTriangle className="mx-auto mb-4" size={40} />
        <p>No questions found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-400">Go Back</button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const reviewedCount = Object.values(reviewed).filter(v => v).length;
  const notAnswered = questions.length - answeredCount;

  return (
    <div className="h-screen flex flex-col bg-gray-950">
      {/* Top Bar */}
      <div className="bg-gray-900/90 backdrop-blur-xl border-b border-gray-800 px-3 py-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => navigate(-1)} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <ArrowLeft size={16} />
          </button>
          <h2 className="text-xs font-bold truncate mx-2">{testInfo.name}</h2>
          <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1 rounded-lg ${timeLeft < 300 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-gray-800 text-yellow-400'}`}>
            <Timer size={14} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-green-400">{answeredCount} ✓</span>
            <span className="text-orange-400">{reviewedCount} ⚑</span>
            <span className="text-gray-400">{notAnswered} ✗</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowQuestionPaper(true)} className="w-7 h-7 bg-gray-800 rounded-lg flex items-center justify-center">
              <Eye size={14} />
            </button>
            <button onClick={() => setShowPalette(true)} className="px-2 py-1 bg-gray-800 rounded-lg text-xs font-bold flex items-center gap-1">
              <Grid3X3 size={12} /> Q{currentQ+1}/{questions.length}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-800 flex-shrink-0">
        <div className={`h-full transition-all duration-300 ${timeLeft < 300 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}
          style={{ width: `${((currentQ+1)/questions.length)*100}%` }}></div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* Question Card */}
          <div className="bg-gray-800/80 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded-lg">Q{currentQ+1}</span>
              <button onClick={toggleBookmark} className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${reviewed[currentQ] ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                <Flag size={12} fill={reviewed[currentQ] ? 'currentColor' : 'none'} />
                {reviewed[currentQ] ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
            <p className="text-base leading-relaxed text-gray-100">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2">
            {q.options?.map((opt, i) => (
              <button key={i} onClick={() => handleAnswer(i)}
                className={`w-full p-4 text-left rounded-xl font-medium transition-all border text-sm ${
                  answers[currentQ] === i 
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10' 
                    : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                }`}>
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mr-3 ${
                  answers[currentQ] === i ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'
                }`}>{String.fromCharCode(65 + i)}</span>
                {opt}
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setCurrentQ(p => Math.max(0, p-1))} disabled={currentQ === 0}
              className="flex-1 py-3 bg-gray-800 rounded-xl flex items-center justify-center gap-1 disabled:opacity-40 text-xs font-medium">
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={clearAnswer} className="px-4 py-3 bg-gray-800 rounded-xl text-xs text-gray-400 font-medium">
              <RotateCcw size={14} />
            </button>
            <button onClick={() => setCurrentQ(p => Math.min(questions.length-1, p+1))} disabled={currentQ === questions.length-1}
              className="flex-1 py-3 bg-blue-600 rounded-xl flex items-center justify-center gap-1 disabled:opacity-40 text-xs font-bold">
              Next <ChevronRight size={14} />
            </button>
            <button onClick={() => setShowSubmit(true)} className="px-5 py-3 bg-green-600 rounded-xl flex items-center gap-1 text-xs font-bold">
              <Send size={14} /> Submit
            </button>
          </div>

          <div className="h-4"></div>
        </div>
      </div>

      {/* Modals */}
      {showPalette && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowPalette(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-t-3xl sm:rounded-2xl p-5 w-full sm:max-w-md max-h-[80vh] overflow-y-auto animate-slideUp" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Question Palette</h3>
              <button onClick={() => setShowPalette(false)} className="text-2xl text-gray-400">&times;</button>
            </div>
            <div className="flex gap-3 mb-4 text-[10px] flex-wrap">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block"></span> Answered</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-yellow-500 inline-block"></span> Bookmarked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-gray-600 inline-block"></span> Not Visited</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => { setCurrentQ(i); setShowPalette(false); }}
                  className={`p-3 rounded-xl text-xs font-bold relative ${
                    reviewed[i] ? 'bg-yellow-500/30 border border-yellow-500 text-yellow-400' :
                    answers[i] !== undefined ? 'bg-green-500/30 border border-green-500 text-green-400' :
                    i === currentQ ? 'bg-blue-500/30 border border-blue-500 text-blue-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                  {i+1}
                  {reviewed[i] && <span className="absolute top-0.5 right-0.5 text-yellow-400 text-[8px]">⚑</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSubmit && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-sm animate-scaleIn">
            <AlertTriangle className="text-yellow-400 mx-auto mb-3" size={36} />
            <h3 className="font-bold text-center mb-2">Submit Test?</h3>
            <div className="bg-gray-700/50 rounded-xl p-3 mb-4 text-xs space-y-1">
              <div className="flex justify-between"><span>Total</span><span className="font-bold">{questions.length}</span></div>
              <div className="flex justify-between"><span className="text-green-400">Answered</span><span className="text-green-400 font-bold">{answeredCount}</span></div>
              <div className="flex justify-between"><span className="text-red-400">Not Answered</span><span className="text-red-400 font-bold">{notAnswered}</span></div>
            </div>
            {notAnswered > 0 && <p className="text-yellow-400 text-xs text-center mb-4">⚠️ {notAnswered} questions unanswered!</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowSubmit(false)} className="flex-1 py-3 bg-gray-700 rounded-xl text-xs font-bold">Cancel</button>
              <button onClick={() => handleSubmit()} className="flex-1 py-3 bg-green-600 rounded-xl text-xs font-bold">Submit Now</button>
            </div>
          </div>
        </div>
      )}

      {showQuestionPaper && (
        <div className="fixed inset-0 bg-gray-950 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-gray-900 p-4 flex items-center justify-between border-b border-gray-800">
            <h3 className="font-bold">All Questions</h3>
            <button onClick={() => setShowQuestionPaper(false)} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
              <EyeOff size={16} />
            </button>
          </div>
          <div className="p-4 space-y-4">
            {questions.map((q, i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-sm font-bold mb-2">Q{i+1}. {q.question}</p>
                <div className="space-y-1">
                  {q.options?.map((opt, j) => (
                    <div key={j} className="text-xs text-gray-400 p-1">({String.fromCharCode(65+j)}) {opt}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
