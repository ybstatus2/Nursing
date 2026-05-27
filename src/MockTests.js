import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { ArrowLeft, FileText, Clock, Play } from 'lucide-react';

export default function MockTests() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const mockTests = [
    { name: "NORCET Full Mock", questions: 200, time: "3 hrs", icon: "🏥" },
    { name: "RRB Nursing Mock", questions: 150, time: "2.5 hrs", icon: "🚂" },
    { name: "AIIMS Mock Test", questions: 100, time: "2 hrs", icon: "🎓" },
    { name: "PGIMER Mock", questions: 120, time: "2 hrs", icon: "📋" },
  ];

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20 p-4`}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-bold">Mock Tests</h2>
      </div>
      {mockTests.map((t, i) => (
        <div key={i} className={`${cardBg} rounded-2xl p-4 mb-3 border ${border} cursor-pointer active:scale-[0.98] transition-transform`} onClick={() => navigate('/test/anatomy-and-physiology')}>
          <div className="flex items-center gap-4">
            <div className="text-3xl">{t.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold">{t.name}</h3>
              <div className={`flex items-center gap-3 text-xs ${subText} mt-1`}>
                <span className="flex items-center gap-1"><FileText size={12} /> {t.questions} Qs</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {t.time}</span>
              </div>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Play size={18} className="text-blue-400 ml-0.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
