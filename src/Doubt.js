import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft, Send, MessageCircle, Clock } from 'lucide-react';

export default function Doubt() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('');
  const [recentDoubts, setRecentDoubts] = useState([]);
  const [loading, setLoading] = useState(false);

  const subjects = [
    'Medical Surgical Nursing', 'Pharmacology', 'Anatomy & Physiology',
    'Pediatric Nursing', 'Mental Health', 'Community Health', 'Other'
  ];

  useEffect(() => {
    loadRecentDoubts();
  }, []);

  const loadRecentDoubts = async () => {
    try {
      const q = query(
        collection(db, 'doubts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snap = await getDocs(q);
      const doubts = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        timeAgo: getTimeAgo(d.data().createdAt?.toDate() || new Date())
      }));
      setRecentDoubts(doubts);
    } catch(e) { console.log("Load doubts error:", e.message); }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60));
    if(diff < 1) return 'Just now';
    if(diff < 24) return `${diff}h ago`;
    return `${Math.floor(diff/24)}d ago`;
  };

  const handleSubmit = async () => {
    if(!question.trim()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'doubts'), {
        userId: auth.currentUser?.uid || 'anonymous',
        userEmail: auth.currentUser?.email || 'anonymous',
        subject: subject || 'General',
        question: question.trim(),
        createdAt: serverTimestamp(),
        status: 'pending',
        replies: []
      });
      setQuestion('');
      setSubject('');
      loadRecentDoubts();
      alert('✅ Doubt submitted successfully! We will respond soon.');
    } catch(e) {
      alert('Error: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate('/dashboard')} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Ask a Doubt</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gray-800 rounded-2xl p-4">
          <label className="text-sm text-gray-400 mb-2 block">Select Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)}
            className="w-full bg-gray-700 rounded-xl p-3 text-white">
            <option value="">Choose subject...</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="bg-gray-800 rounded-2xl p-4">
          <label className="text-sm text-gray-400 mb-2 block">Your Question</label>
          <textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="Type your doubt here..."
            className="w-full bg-gray-700 rounded-xl p-3 text-white h-32 resize-none" />
        </div>

        <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4">
          <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
            <MessageCircle size={16} /> Guidelines
          </h3>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>• Be specific with your question</li>
            <li>• Mention topic/chapter if applicable</li>
            <li>• Response within 24 hours</li>
            <li>• Check previous doubts before asking</li>
          </ul>
        </div>

        {/* Recent Doubts from Firebase */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-gray-400">Recent Doubts</h3>
          {recentDoubts.length > 0 ? recentDoubts.map((d, i) => (
            <div key={i} className="bg-gray-800 rounded-xl p-3">
              <p className="text-sm mb-1">{d.question}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">{d.subject}</span>
                <span className="flex items-center gap-1"><Clock size={10} /> {d.timeAgo}</span>
              </div>
            </div>
          )) : (
            <p className="text-xs text-gray-500 text-center py-4">No doubts yet. Ask the first one!</p>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-800 border-t border-gray-700 flex-shrink-0">
        <button onClick={handleSubmit} disabled={!question.trim() || loading}
          className="w-full p-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
          <Send size={18} /> {loading ? 'Submitting...' : 'Submit Doubt'}
        </button>
      </div>
    </div>
  );
}
