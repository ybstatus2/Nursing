import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { auth } from './firebase';
import SplashScreen from './SplashScreen';
import Layout from './Layout';
import Login from './Login';
import AppLock from './AppLock';
import Dashboard from './Dashboard';
import Subjects from './Subjects';
import QuickTest from './QuickTest';
import SubjectTests from './SubjectTests';
import SubjectTest from './SubjectTest';
import TestSeries from './TestSeries';
import TestSeriesTests from './TestSeriesTests';
import Result from './Result';
import Profile from './Profile';
import Doubt from './Doubt';
import Support from './Support';
import Leaderboard from './Leaderboard';
import History from './History';
import Performance from './Performance';
import Bookmarks from './Bookmarks';
import MockTests from './MockTests';
import StudyMaterials from './StudyMaterials';
import Admin from './Admin';

function AppContent() {
  const [appState, setAppState] = useState('splash');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (!u) {
        setAppState('login');
        sessionStorage.removeItem('rprep_unlocked');
      }
    });
    return unsubscribe;
  }, []);

  const handleSplashFinish = () => {
    if (user) {
      const isUnlocked = sessionStorage.getItem('rprep_unlocked');
      if (!isUnlocked) {
        setAppState('lock');
      } else {
        setAppState('main');
      }
    } else {
      setAppState('login');
    }
  };

  const handleLoginSuccess = () => {
    // Always go to lock screen after login
    setAppState('lock');
  };

  const handleUnlock = () => {
    sessionStorage.setItem('rprep_unlocked', 'true');
    setAppState('main');
  };

  if (appState === 'splash') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }
  if (appState === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }
  if (appState === 'lock') {
    return <AppLock onUnlock={handleUnlock} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/subject-tests/:subjectId" element={<SubjectTests />} />
        <Route path="/quick-test" element={<QuickTest />} />
        <Route path="/test/:subjectId" element={<SubjectTest />} />
        <Route path="/test-series" element={<TestSeries />} />
        <Route path="/test-series-tests/:seriesId" element={<TestSeriesTests />} />
        <Route path="/result" element={<Result />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/doubt" element={<Doubt />} />
        <Route path="/support" element={<Support />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/mock-tests" element={<MockTests />} />
        <Route path="/study-materials" element={<StudyMaterials />} />
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
