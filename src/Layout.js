import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useTheme } from './ThemeContext';
import { 
  Menu, X, ChevronRight, LogOut,
  Bell, User, BookOpen, FileText,
  Clock, BarChart3, Bookmark, BookOpenCheck,
  Share2, Star, Sun, Moon, MessageCircle,
  Trophy, HelpCircle, Download, Heart,
  CheckCircle
} from 'lucide-react';

const APP_VERSION = "1.0";
const APP_VERSION_CODE = 1;

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  useEffect(() => {
    checkAppVersion();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const checkAppVersion = async () => {
    try {
      const docRef = doc(db, 'app_config', 'version');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.latestVersionCode > APP_VERSION_CODE) {
          setUpdateStatus({
            status: 'update_available',
            latestVersion: data.latestVersion,
            forceUpdate: data.forceUpdate,
            updateUrl: data.updateUrl || '#',
            releaseNotes: data.releaseNotes || ''
          });
        }
      }
    } catch(e) { console.log("Version check:", e.message); }
  };

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking');
    try {
      const docRef = doc(db, 'app_config', 'version');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.latestVersionCode > APP_VERSION_CODE) {
          setUpdateStatus({
            status: 'update_available',
            latestVersion: data.latestVersion,
            forceUpdate: data.forceUpdate,
            updateUrl: data.updateUrl || '#',
            releaseNotes: data.releaseNotes || ''
          });
        } else {
          setUpdateStatus({ status: 'uptodate' });
        }
      } else {
        setUpdateStatus({ status: 'uptodate' });
      }
    } catch(e) {
      setUpdateStatus({ status: 'uptodate' });
    }
  };

  const tabs = [
    { id: "dashboard", label: "Home", icon: "🏠", path: "/dashboard" },
    { id: "subjects", label: "Subjects", icon: "📚", path: "/subjects" },
    { id: "testSeries", label: "Test Series", icon: "📝", path: "/test-series" },
    { id: "results", label: "Results", icon: "📊", path: "/history" },
  ];

  const menuItems = [
    { icon: <User size={18} />, label: 'My Profile', path: '/profile' },
    { icon: <Trophy size={18} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <BarChart3 size={18} />, label: 'Performance', path: '/performance' },
    { icon: <Bookmark size={18} />, label: 'Bookmarks', path: '/bookmarks' },
    { icon: <Clock size={18} />, label: 'Test History', path: '/history' },
    { icon: <MessageCircle size={18} />, label: 'Doubts', path: '/doubt' },
    { icon: <BookOpenCheck size={18} />, label: 'Mock Tests', path: '/mock-tests' },
    { icon: <BookOpen size={18} />, label: 'Study Materials', path: '/study-materials' },
    { icon: <HelpCircle size={18} />, label: 'Help & Support', path: '/support' },
  ];

  const isActive = (id) => {
    if(id === "dashboard") return location.pathname === "/dashboard";
    if(id === "subjects") return location.pathname === "/subjects";
    if(id === "testSeries") return location.pathname === "/test-series";
    if(id === "results") return location.pathname === "/history" || location.pathname === "/result";
    return false;
  };

  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const headerBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const navBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-lg';

  return (
    <div style={{height: '100dvh', display: 'flex', flexDirection: 'column'}} className={`${bg} ${textColor}`}>
      {/* Header */}
      <header style={{flexShrink: 0}} className={`${headerBg} border-b px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className={`w-9 h-9 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩺</span>
            <div>
              <span className="font-bold text-sm">RPrep</span>
              <p className={`text-[10px] ${subText}`}>v{APP_VERSION}</p>
            </div>
          </div>
        </div>
        <button className={`w-9 h-9 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center relative`}>
          <Bell size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main style={{flex: 1, overflow: 'auto'}} className="pb-16">
        <Outlet context={{ darkMode }} />
      </main>

      {/* Bottom Navigation */}
      <nav style={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40}} className={`${navBg} border-t px-2 py-2 flex items-center justify-around safe-bottom`}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all ${
              isActive(tab.id) ? 'text-blue-400 bg-blue-500/10' : darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
            <span className="text-xl">{tab.icon}</span>
            <small className="text-[10px] font-medium">{tab.label}</small>
          </button>
        ))}
      </nav>

      {/* Hamburger Menu */}
      {showMenu && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setShowMenu(false)}>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div style={{width: 280, height: '100%', overflow: 'auto'}} className={`relative shadow-2xl ${cardBg}`} onClick={e => e.stopPropagation()}>
            <div className={`p-5 border-b ${cardBorder}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🩺</span>
                  <div>
                    <span className="font-bold text-sm">RPrep</span>
                    <p className={`text-[10px] ${subText}`}>v{APP_VERSION}</p>
                  </div>
                </div>
                <button onClick={() => setShowMenu(false)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className={`p-4 border-b ${cardBorder}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-black text-white">
                  {auth.currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-bold text-sm">{auth.currentUser?.email?.split('@')[0]}</p>
                  <p className={`text-xs ${subText}`}>{auth.currentUser?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-1">
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => { navigate(item.path); setShowMenu(false); }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${hoverBg}`}>
                  <span className={subText}>{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  <ChevronRight size={14} className={`ml-auto ${subText}`} />
                </button>
              ))}
            </div>

            <div className="px-4 mb-2">
              <button onClick={handleCheckUpdate} className={`w-full flex items-center gap-3 p-3 rounded-xl ${hoverBg}`}>
                <Download size={18} className={subText} />
                <span className="text-sm">Check for Updates</span>
              </button>
            </div>

            <div className={`mx-4 p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-2">
                {darkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-500" />}
                <span className="text-sm">Dark Mode</span>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full relative ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${darkMode ? 'left-6' : 'left-0.5'}`}></div>
              </button>
            </div>

            <div className="px-4 space-y-2 mt-4 mb-2">
              <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${hoverBg}`}>
                <Share2 size={18} className="text-blue-400" /><span className="text-sm">Share App</span>
              </button>
              <button className={`w-full flex items-center gap-3 p-3 rounded-xl ${hoverBg}`}>
                <Star size={18} className="text-yellow-400" /><span className="text-sm">Rate Us</span>
              </button>
            </div>

            <div className={`mx-4 p-3 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-100'} mb-4`}>
              <div className="flex items-center gap-2">
                <Heart size={14} className="text-red-400" />
                <span className={`text-xs ${subText}`}>Made with ❤️ by RPREP Team</span>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-sm">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateStatus?.status === 'update_available' && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-sm`}>
            <CheckCircle className="text-green-400 mx-auto mb-3" size={40} />
            <h3 className="font-bold text-center text-lg mb-2">Update Available! 🎉</h3>
            <p className={`text-sm text-center ${subText} mb-4`}>Version {updateStatus.latestVersion} is now available.</p>
            {updateStatus.releaseNotes && (
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-xl p-3 mb-4 text-xs ${subText}`}>
                <p className="font-bold mb-1">What's New:</p>
                <p>{updateStatus.releaseNotes}</p>
              </div>
            )}
            <div className="space-y-2">
              <a href={updateStatus.updateUrl} target="_blank" rel="noopener noreferrer"
                className="block w-full p-3 bg-green-600 rounded-xl text-center font-bold text-sm text-white">
                Download Update
              </a>
              {!updateStatus.forceUpdate && (
                <button onClick={() => setUpdateStatus(null)}
                  className={`w-full p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl text-sm ${subText}`}>
                  Later
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {updateStatus?.status === 'uptodate' && updateStatus !== 'checking' && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4" onClick={() => setUpdateStatus(null)}>
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-xs`} onClick={e => e.stopPropagation()}>
            <CheckCircle className="text-green-400 mx-auto mb-3" size={40} />
            <h3 className="font-bold text-center mb-2">You're Up-to-Date! ✅</h3>
            <p className={`text-sm text-center ${subText} mb-4`}>Version {APP_VERSION} is the latest.</p>
            <button onClick={() => setUpdateStatus(null)}
              className="w-full p-3 bg-blue-600 rounded-xl font-bold text-sm text-white">
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
