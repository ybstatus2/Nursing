import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, XCircle, Home, RotateCcw, Share2, 
  Trophy, Target, Clock, BarChart3, Download,
  AlertCircle, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('summary'); // summary | details
  const { 
    score, total, correct, wrong, skipped, 
    percentage, timeTaken, answers, questions, 
    subject, autoSubmitted 
  } = location.state || {};

  if(!questions) return (
    <div className="h-full flex items-center justify-center bg-gray-900">
      <div className="text-center text-gray-400">
        <AlertCircle className="mx-auto mb-4" size={40} />
        <p>No results found</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-blue-400">Go Home</button>
      </div>
    </div>
  );

  const formatTime = (s) => {
    const m = Math.floor(s/60);
    const sec = s%60;
    return `${m}m ${sec}s`;
  };

  const getGrade = (pct) => {
    if(pct >= 90) return { grade: 'A+', color: 'text-green-400', bg: 'bg-green-500/20' };
    if(pct >= 80) return { grade: 'A', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if(pct >= 70) return { grade: 'B', color: 'text-cyan-400', bg: 'bg-cyan-500/20' };
    if(pct >= 60) return { grade: 'C', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if(pct >= 50) return { grade: 'D', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { grade: 'F', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 pt-8">
        {autoSubmitted && (
          <div className="bg-yellow-500/20 text-yellow-400 text-xs p-2 rounded-lg mb-4 text-center">
            ⏰ Time's up! Test auto-submitted.
          </div>
        )}
        
        {/* Score Circle */}
        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#1f2937" strokeWidth="8" />
              <circle 
                cx="60" cy="60" r="52" fill="none" 
                stroke={percentage >= 60 ? '#22c55e' : '#ef4444'} 
                strokeWidth="8" 
                strokeDasharray={`${percentage * 3.267} 326.7`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${gradeInfo.color}`}>{percentage}%</span>
              <span className={`text-lg font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-1">
          {percentage >= 60 ? '🎉 Congratulations!' : '💪 Keep Practicing!'}
        </h2>
        <p className="text-gray-400 text-center text-sm">
          {percentage >= 60 ? 'You passed the test!' : 'Better luck next time!'}
        </p>
      </div>

      {/* View Toggle */}
      <div className="flex bg-gray-800 mx-4 rounded-xl p-1 mb-4">
        <button 
          onClick={() => setViewMode('summary')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${viewMode === 'summary' ? 'bg-blue-600' : 'text-gray-400'}`}
        >
          Summary
        </button>
        <button 
          onClick={() => setViewMode('details')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${viewMode === 'details' ? 'bg-blue-600' : 'text-gray-400'}`}
        >
          Details
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-20">
        {viewMode === 'summary' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-800 rounded-2xl p-4">
                <Trophy className="text-yellow-400 mb-2" size={20} />
                <div className="text-2xl font-bold">{score}/{total}</div>
                <div className="text-xs text-gray-400">Score</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-4">
                <Clock className="text-blue-400 mb-2" size={20} />
                <div className="text-2xl font-bold">{formatTime(timeTaken || 0)}</div>
                <div className="text-xs text-gray-400">Time Taken</div>
              </div>
              <div className="bg-green-900/30 rounded-2xl p-4 border border-green-500/30">
                <CheckCircle className="text-green-400 mb-2" size={20} />
                <div className="text-2xl font-bold text-green-400">{correct || 0}</div>
                <div className="text-xs text-gray-400">Correct</div>
              </div>
              <div className="bg-red-900/30 rounded-2xl p-4 border border-red-500/30">
                <XCircle className="text-red-400 mb-2" size={20} />
                <div className="text-2xl font-bold text-red-400">{wrong || 0}</div>
                <div className="text-xs text-gray-400">Wrong</div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-800 rounded-2xl p-4 mb-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><BarChart3 size={18} /> Performance</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Correct</span><span className="text-green-400">{correct}</span></div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{width: `${(correct/total)*100}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Wrong</span><span className="text-red-400">{wrong}</span></div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{width: `${(wrong/total)*100}%`}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1"><span>Skipped</span><span className="text-gray-400">{skipped}</span></div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-500 rounded-full" style={{width: `${(skipped/total)*100}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Detailed Question Review */
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className={`p-4 rounded-2xl border ${
                answers[i] === q.correct_answer 
                  ? 'bg-green-900/20 border-green-500/30' 
                  : answers[i] === undefined
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-red-900/20 border-red-500/30'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">Q{i+1}</span>
                  {answers[i] === q.correct_answer ? 
                    <CheckCircle className="text-green-400" size={16} /> : 
                    answers[i] === undefined ?
                    <span className="text-xs text-gray-500">Skipped</span> :
                    <XCircle className="text-red-400" size={16} />
                  }
                </div>
                <p className="text-sm mb-3">{q.question}</p>
                {q.options?.map((opt, j) => (
                  <div key={j} className={`p-2 rounded-lg text-xs mb-1 ${
                    j === q.correct_answer ? 'bg-green-500/20 text-green-300' :
                    j === answers[i] && j !== q.correct_answer ? 'bg-red-500/20 text-red-300' :
                    'bg-gray-700/30 text-gray-400'
                  }`}>
                    {String.fromCharCode(65+j)}. {opt}
                    {j === q.correct_answer && ' ✓'}
                    {j === answers[i] && j !== q.correct_answer && ' ✗'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 flex gap-3">
        <button onClick={() => navigate('/dashboard')} className="flex-1 p-3 bg-gray-700 rounded-xl flex items-center justify-center gap-2 text-sm">
          <Home size={18} /> Home
        </button>
        <button onClick={() => navigate(`/test/${subject || 'anatomy-and-physiology'}`)} className="flex-1 p-3 bg-blue-600 rounded-xl flex items-center justify-center gap-2 text-sm font-bold">
          <RotateCcw size={18} /> Retake
        </button>
      </div>
    </div>
  );
}
