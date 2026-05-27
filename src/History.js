import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Clock, CheckCircle, XCircle, ChevronRight, Calendar } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if(!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'results'),
        where('userId', '==', auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTests(results.sort((a,b) => new Date(b.date) - new Date(a.date)));
    } catch(e) { console.log(e); }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (s) => {
    const m = Math.floor(s/60);
    return `${m} min`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">Test History</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tests.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <Clock className="mx-auto mb-4" size={40} />
            <p>No tests taken yet</p>
            <button onClick={() => navigate('/subjects')} className="mt-4 text-blue-400">Start a test</button>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-400">{formatDate(test.date)}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    test.percentage >= 60 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {test.percentage}%
                  </span>
                </div>
                
                <h3 className="font-bold text-sm capitalize mb-2">{test.subject?.replace(/-/g, ' ')}</h3>
                
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-400" /> {test.correct || 0}</span>
                  <span className="flex items-center gap-1"><XCircle size={12} className="text-red-400" /> {test.wrong || 0}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(test.timeTaken || 0)}</span>
                </div>

                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${test.percentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${test.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
