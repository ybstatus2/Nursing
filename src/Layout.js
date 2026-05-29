import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useTheme } from './ThemeContext';
import {
  Menu, X, ChevronRight, LogOut, Bell, User, BookOpen, FileText,
  Clock, BarChart3, Bookmark, BookOpenCheck, Share2, Star, Sun, Moon,
  MessageCircle, Trophy, HelpCircle, Download, Heart, CheckCircle,
  Home, Settings
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
    sessionStorage.removeItem('rprep_unlocked');
    window.location.reload();
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
    } catch(e) { /* ignore */ }
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
    ...(auth.currentUser?.email === 'pbhupeshk2022@gmail.com' ? [{ icon: <Settings size={18} />, label: 'Admin Panel', path: '/admin' }] : []),
  ];

  const isActive = (id) => {
    if (id === "dashboard") return location.pathname === "/dashboard";
    if (id === "subjects") return location.pathname === "/subjects";
    if (id === "testSeries") return location.pathname === "/test-series";
    if (id === "results") return location.pathname === "/history" || location.pathname === "/result";
    return false;
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const headerBg = darkMode ? 'bg-gray-900/80 backdrop-blur-xl border-gray-800' : 'bg-white/80 backdrop-blur-xl border-gray-200 shadow-sm';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
  const navBg = darkMode ? 'bg-gray-900/90 backdrop-blur-xl border-gray-800' : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textColor = darkMode ? 'text-white' : 'text-gray-900';

  return (
    <div style={{height: '100dvh', display: 'flex', flexDirection: 'column'}} className={`${bg} ${textColor} relative`}>
      <header style={{flexShrink: 0}} className={`${headerBg} border-b px-4 py-3 flex items-center justify-between z-20`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowMenu(true)} className={`w-10 h-10 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl flex items-center justify-center transition-all active:scale-95`}>
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-lg font-black text-white">R</span>
            </div>
            <div>
              <span className="font-bold text-base">RPREP</span>
              <p className="text-[10px] text-gray-400">v{APP_VERSION}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className={`w-10 h-10 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl flex items-center justify-center relative transition-all active:scale-95`}>
            <Bell size={20} />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] flex items-center justify-center font-bold text-white animate-pulse">3</span>
          </button>
        </div>
      </header>

      <main style={{flex: 1, overflow: 'auto'}} className="pb-20">
        <Outlet />
      </main>

      <nav style={{position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40, paddingBottom: 'env(safe-area-inset-bottom, 0px)'}} className="px-4 pb-2 pt-1">
        <div className={`${navBg} border-t rounded-3xl shadow-2xl px-2 py-2 flex items-center justify-around mx-auto max-w-lg`}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive(tab.id) ? 'text-blue-400' : darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
              }`}>
              {isActive(tab.id) && <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-full" />}
              <span className="text-xl">{tab.icon}</span>
              <small className="text-[10px] font-semibold">{tab.label}</small>
            </button>
          ))}
        </div>
      </nav>

      {showMenu && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowMenu(false)} />
          <div className={`relative w-[300px] h-full shadow-2xl overflow-y-auto animate-slideInLeft ${cardBg} border-r ${cardBorder}`} onClick={e => e.stopPropagation()}>
            <div className={`p-5 border-b ${cardBorder}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-black text-white">R</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">RPREP CBT</h2>
                    <p className="text-xs text-gray-400">Nursing Exam Prep</p>
                  </div>
                </div>
                <button onClick={() => setShowMenu(false)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg flex items-center justify-center transition-all`}>
                  <X size={18} />
                </button>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-2xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg font-black text-white">
                  {auth.currentUser?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{auth.currentUser?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400 truncate">{auth.currentUser?.email}</p>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-1">
              {menuItems.map((item, i) => (
                <button key={i} onClick={() => { navigate(item.path); setShowMenu(false); }} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${hoverBg}`}>
                  <span className={subText}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <ChevronRight size={14} className={`ml-auto ${subText}`} />
                </button>
              ))}
            </div>

            <div className={`mx-4 p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-500" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full relative transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? 'left-6' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="p-3 space-y-1 mt-2">
              <button onClick={handleCheckUpdate} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${hoverBg}`}>
                <Download size={18} className={subText} />
                <span className="text-sm font-medium">Check for Updates</span>
                {updateStatus?.status === 'update_available' && (
                  <span className="ml-auto text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold">New</span>
                )}
              </button>
              <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${hoverBg}`}>
                <Share2 size={18} className="text-blue-400" />
                <span className="text-sm font-medium">Share App</span>
              </button>
              <button className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${hoverBg}`}>
                <Star size={18} className="text-yellow-400" />
                <span className="text-sm font-medium">Rate Us</span>
              </button>
            </div>

            <div className="p-4 mt-auto border-t border-gray-700">
              <div className="flex items-center gap-2 mb-3 px-1">
                <Heart size={14} className="text-red-400" />
                <span className="text-xs text-gray-500">Made with ❤️ by RPREP Team</span>
              </div>
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 font-medium text-sm transition-all">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {updateStatus?.status === 'update_available' && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className={`${cardBg} rounded-2xl p-6 w-full max-w-sm`}>
            <CheckCircle className="text-green-400 mx-auto mb-3" size={40} />
            <h3 className="font-bold text-center text-lg mb-2">Update Available! 🎉</h3>
            <p className={`text-sm text-center ${subText} mb-4`}>Version {updateStatus.latestVersion} is now available.</p>
            <div className="space-y-2">
              <a href={updateStatus.updateUrl} target="_blank" rel="noopener noreferrer"
                className="block w-full p-3 bg-green-600 rounded-xl text-center font-bold text-sm text-white">
                Download Update
              </a>
              {!updateStatus.forceUpdate && (
                <button onClick={() => setUpdateStatus(null)} className={`w-full p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl text-sm ${subText}`}>
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
            <button onClick={() => setUpdateStatus(null)} className="w-full p-3 bg-blue-600 rounded-xl font-bold text-sm text-white">OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
