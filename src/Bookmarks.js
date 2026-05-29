import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Bookmark, Trash2, Eye } from 'lucide-react';

export default function Bookmarks() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [bookmarks, setBookmarks] = useState([]);

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  useEffect(() => { if(auth.currentUser) loadBookmarks(); }, []);

  const loadBookmarks = async () => {
    const q = query(collection(db, 'bookmarks'), where('userId', '==', auth.currentUser.uid));
    const snap = await getDocs(q);
    setBookmarks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const removeBookmark = async (id) => {
    await deleteDoc(doc(db, 'bookmarks', id));
    loadBookmarks();
  };

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Bookmarks</h2>
      </div>

      <div className="p-4">
        {bookmarks.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className={`mx-auto mb-4 ${subText}`} size={48} />
            <p className={`text-lg font-medium ${subText}`}>No bookmarks yet</p>
            <p className="text-xs text-gray-400 mt-2">Bookmark questions during tests to review later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b, i) => (
              <div key={i} className={`${cardBg} border ${border} rounded-2xl p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">{b.question}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">{b.subject || 'General'}</span>
                    </div>
                  </div>
                  <button onClick={() => removeBookmark(b.id)} className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
