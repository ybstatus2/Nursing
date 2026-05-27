import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import { auth } from './firebase';
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

function AuthGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) {
    if (location.pathname !== '/') return <Navigate to="/" />;
    return <Login />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/lock" element={<AppLock />} />
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
            </Route>
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </ThemeProvider>
  );
}
