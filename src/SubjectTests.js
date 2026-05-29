import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from './firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import {
  ArrowLeft, Play, FileText, X, Clock, CheckCircle,
  ChevronRight, Eye, BookOpen
} from 'lucide-react';

const subjectNames = {
  "medical-surgical-nursing": "Medical Surgical Nursing",
  "first-aid-and-emergency": "First Aid & Emergency",
  "anatomy-and-physiology": "Anatomy & Physiology",
  "pharmacology": "Pharmacology",
  "pediatric-nursing": "Pediatric Nursing",
  "obstetrics-and-gynaecology": "Obstetrics & Gynaecology",
  "mental-health-nursing": "Mental Health Nursing",
  "community-health-nursing": "Community Health Nursing",
  "nursing-management": "Nursing Management",
  "microbiology": "Microbiology",
  "research-and-statistics": "Research & Statistics",
  "nursing-foundation": "Nursing Foundation",
  "nutrition": "Nutrition",
  "biochemistry": "Biochemistry",
  "pathology": "Pathology",
  "infection-control": "Infection Control",
};

export default function SubjectTests() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [completedTests, setCompletedTests] = useState({});

  const cardBg = darkMode ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const headerBg = darkMode ? 'bg-gray-900/80' : 'bg-white';

  useEffect(() => {
    fetchTests();
    fetchCompletedTests();
  }, [subjectId]);

  const fetchTests = async () => {
    try {
      const q = query(collection(db, "subject_tests"), where("subject_id", "==", subjectId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.test_number || 0) - (b.test_number || 0));
      setTests(list);
    } catch(e) { console.log(e); }
    setLoading(false);
  };

  const fetchCompletedTests = async () => {
    if(!auth.currentUser) return;
    const q = query(collection(db, "results"), where("userId", "==", auth.currentUser.uid), where("subject", "==", subjectId));
    const snap = await getDocs(q);
    const completed = {};
    snap.docs.forEach(d => {
      completed[d.data().testId || d.id] = true;
    });
    setCompletedTests(completed);
  };

  const handleTestClick = (test) => {
    setSelectedTest(test);
    setShowPopup(true);
  };

  const handleStartTest = () => {
    setShowPopup(false);
    navigate(`/test/${subjectId}?testId=${selectedTest.id}`);
  };

  const handleViewSolution = () => {
    setShowPopup(false);
    navigate(`/result?testId=${selectedTest.id}&mode=solution`);
  };

  const subjectName = subjectNames[subjectId] || subjectId?.replace(/-/g, ' ');

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      {/* Header */}
      <div className={`${headerBg} border-b ${border} px-4 py-4 flex items-center gap-3 flex-shrink-0`}>
        <button onClick={() => navigate('/subjects')} className={`w-9 h-9 ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} rounded-xl flex items-center justify-center transition-all`}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-lg font-bold">{subjectName}</h2>
          <p className={`text-xs ${subText}`}>{tests.length} tests available</p>
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className={`mx-auto mb-4 ${subText}`} size={48} />
            <p className={`text-lg font-medium ${subText}`}>No tests available yet</p>
            <p className="text-xs text-gray-400 mt-2">Check back later or try another subject</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, i) => (
              <div
                key={test.id}
                onClick={() => handleTestClick(test)}
                className={`${cardBg} border ${border} rounded-2xl p-4 cursor-pointer active:scale-[0.98] transition-all hover:border-gray-500`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      completedTests[test.id] ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {test.test_number || i+1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{test.topic_name || `Test ${test.test_number || i+1}`}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {test.time_limit || 30} min</span>
                        <span className="flex items-center gap-1"><FileText size={12} /> {test.total_questions || test.questions?.length || 0} Qs</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {completedTests[test.id] && <CheckCircle className="text-green-400" size={18} />}
                    <ChevronRight size={18} className="text-gray-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && selectedTest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-sm animate-scaleIn`} onClick={e => e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowPopup(false)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} rounded-lg flex items-center justify-center transition-all`}>
                <X size={16} />
              </button>
            </div>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="text-blue-400" size={28} />
              </div>
              <h3 className="font-bold text-lg">{selectedTest.topic_name || `Test ${selectedTest.test_number}`}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {selectedTest.total_questions || selectedTest.questions?.length || 0} Questions • {selectedTest.time_limit || 30} Minutes
              </p>
              {completedTests[selectedTest.id] && (
                <span className="inline-block mt-3 text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                  ✓ Completed
                </span>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handleStartTest}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <Play size={18} /> Start Test
              </button>
              
              {completedTests[selectedTest.id] && (
                <button
                  onClick={handleViewSolution}
                  className="w-full py-4 bg-purple-500/10 border border-purple-500/30 rounded-xl font-bold text-purple-400 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Eye size={18} /> View Solution
                </button>
              )}
              
              <button
                onClick={() => setShowPopup(false)}
                className="w-full py-4 bg-gray-700 hover:bg-gray-600 rounded-xl font-bold text-gray-300 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                <X size={18} /> Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
