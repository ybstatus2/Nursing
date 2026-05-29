import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Send, Clock, MessageCircle } from 'lucide-react';

export default function Doubt() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [loading, setLoading] = useState(false);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const subjects = ['Medical Surgical', 'Pharmacology', 'Anatomy', 'Pediatric', 'Mental Health', 'Other'];

  useEffect(() => { loadRecentDoubts(); }, []);

  const loadRecentDoubts = async () => {
    const q = query(collection(db, 'doubts'), orderBy('createdAt', 'desc'), limit(10));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data(), time: getTimeAgo(d.data().createdAt?.toDate()) }));
    setRecentDoubts(list);
  };

  const getTimeAgo = (date) => {
    if (!date) return 'Just now';
    const diff = Math.floor((new Date() - date) / 3600000);
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff/24)}d ago`;
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'doubts'), {
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email,
        subject, question: question.trim(),
        createdAt: serverTimestamp(), status: 'pending'
      });
      setQuestion(''); setSubject('');
      loadRecentDoubts();
      alert('✅ Doubt submitted!');
    } catch(e) { alert('Error: ' + e.message); }
    setLoading(false);
  };

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Ask a Doubt</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-transparent text-sm p-2 border-b border-gray-700 mb-3">
            <option value="">Select subject</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Type your doubt..." className="w-full bg-transparent text-sm p-2 h-28 resize-none" />
          <button onClick={handleSubmit} disabled={loading || !question.trim()} className="w-full py-3 mt-3 bg-blue-600 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50">
            <Send size={16} /> {loading ? 'Submitting...' : 'Submit Doubt'}
          </button>
        </div>

        <div>
          <h3 className="font-bold text-sm mb-2">Recent Doubts</h3>
          {recentDoubts.length === 0 ? (
            <p className={`text-sm ${subText} text-center py-4`}>No doubts yet</p>
          ) : (
            recentDoubts.map(d => (
              <div key={d.id} className={`${cardBg} border ${border} rounded-xl p-3 mb-2`}>
                <p className="text-sm">{d.question}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{d.subject || 'General'}</span>
                  <span className="flex items-center gap-1"><Clock size={10} /> {d.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
