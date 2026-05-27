import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Layout from './Layout';
import Login from './Login';
import Dashboard from './Dashboard';
import Subjects from './Subjects';
import QuickTest from './QuickTest';
import SubjectTests from './SubjectTests';
import SubjectTest from './SubjectTest';
import TestSeries from './TestSeries';
import Result from './Result';
import Profile from './Profile';
import Doubt from './Doubt';
import Support from './Support';
import Leaderboard from './Leaderboard';
import Performance from "./Performance";
import Bookmarks from "./Bookmarks";
import MockTests from "./MockTests";
import StudyMaterials from "./StudyMaterials";
import History from './History';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/subject-tests/:subjectId" element={<SubjectTests />} />
            <Route path="/quick-test" element={<QuickTest />} />
            <Route path="/test/:subjectId" element={<SubjectTest />} />
            <Route path="/test-series" element={<TestSeries />} />
            <Route path="/result" element={<Result />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/doubt" element={<Doubt />} />
            <Route path="/support" element={<Support />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/mock-tests" element={<MockTests />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
