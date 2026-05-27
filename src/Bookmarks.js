import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Bookmark } from 'lucide-react';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);
  const [error, setError] = useState('');
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';

  useEffect(() => { 
    if(auth.currentUser) loadBookmarks(); 
  }, []);

  const loadBookmarks = async () => {
    try {
      const q = query(collection(db, 'bookmarks'), where('userId', '==', auth.currentUser.uid));
      const snap = await getDocs(q);
      setBookmarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch(e) {
      console.log("Bookmarks permission error:", e.message);
      setError('Bookmarks feature coming soon! Firebase permissions being set up.');
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20 p-4`}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-bold">Bookmarks</h2>
      </div>
      {error ? (
        <div className="text-center py-12">
          <Bookmark size={48} className={`mx-auto mb-4 text-yellow-400`} />
          <p className={subText}>{error}</p>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark size={48} className={`mx-auto mb-4 ${subText}`} />
          <p className={subText}>No bookmarks yet</p>
          <p className={`text-xs ${subText} mt-1`}>Bookmark questions during tests to review later</p>
        </div>
      ) : (
        bookmarks.map((b, i) => (
          <div key={i} className={`${cardBg} rounded-xl p-4 mb-2 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className="text-sm">{b.question}</p>
          </div>
        ))
      )}
    </div>
  );
}
