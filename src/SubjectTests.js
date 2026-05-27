import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { 
  ArrowLeft, Play, FileText, X, BookOpen,
  CheckCircle, Clock, ChevronRight, Eye
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
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [completedTests, setCompletedTests] = useState({});

  useEffect(() => {
    fetchTests();
    fetchCompletedTests();
  }, [subjectId]);

  const fetchTests = async () => {
    try {
      const q = query(
        collection(db, "subject_tests"),
        where("subject_id", "==", subjectId),
        orderBy("test_number", "asc")
      );
      const snap = await getDocs(q);
      const testsList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTests(testsList);
    } catch(e) {
      console.log("Fetch error:", e.message);
    }
    setLoading(false);
  };

  const fetchCompletedTests = async () => {
    try {
      const q = query(
        collection(db, "results"),
        where("subject", "==", subjectId)
      );
      const snap = await getDocs(q);
      const completed = {};
      snap.docs.forEach(d => {
        const data = d.data();
        if(data.testId) completed[data.testId] = true;
      });
      setCompletedTests(completed);
    } catch(e) { console.log(e); }
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-900 to-gray-900 p-4 pt-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate('/subjects')} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold">{subjectName}</h2>
            <p className="text-xs text-gray-400">{tests.length} tests available</p>
          </div>
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <BookOpen className="mx-auto mb-3" size={40} />
            <p>No tests available yet</p>
            <p className="text-xs mt-2">Tests will appear here once uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map((test, i) => (
              <div
                key={test.id}
                onClick={() => handleTestClick(test)}
                className="bg-gray-800 rounded-2xl p-4 border border-gray-700 cursor-pointer active:bg-gray-700 transition-all hover:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Test Number Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      completedTests[test.id] 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {test.test_number || i+1}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">
                        {test.topic_name || `Test ${test.test_number || i+1}`}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {test.time_limit || 30} min
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={12} /> {test.total_questions || test.questions?.length || 0} Qs
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {completedTests[test.id] && (
                      <CheckCircle className="text-green-400" size={18} />
                    )}
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowPopup(false)}>
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex justify-end mb-2">
              <button onClick={() => setShowPopup(false)} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            {/* Test Info */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText className="text-blue-400" size={28} />
              </div>
              <h3 className="font-bold text-lg">{selectedTest.topic_name || `Test ${selectedTest.test_number}`}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {selectedTest.total_questions || selectedTest.questions?.length || 0} Questions • {selectedTest.time_limit || 30} Minutes
              </p>
              {completedTests[selectedTest.id] && (
                <span className="inline-block mt-2 text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full">
                  ✓ Already Completed
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={handleStartTest}
                className="w-full p-4 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Play size={18} /> Start Test
              </button>
              
              {completedTests[selectedTest.id] && (
                <button
                  onClick={handleViewSolution}
                  className="w-full p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl font-bold flex items-center justify-center gap-2 text-purple-400 active:scale-95 transition-transform"
                >
                  <Eye size={18} /> View Solution
                </button>
              )}
              
              <button
                onClick={() => setShowPopup(false)}
                className="w-full p-4 bg-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 text-gray-400 active:scale-95 transition-transform"
              >
                <X size={18} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
