import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Clock } from 'lucide-react';

export default function MockTests() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`h-full flex flex-col ${bg}`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Mock Tests</h2>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Clock size={48} className={subText} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
          <p className={`${subText} max-w-xs mx-auto`}>
            Full-length mock tests are being prepared. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
