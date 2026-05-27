import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { ArrowLeft, BookOpen, Download, ExternalLink } from 'lucide-react';

export default function StudyMaterials() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const bg = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const materials = [
    { title: "Nursing Fundamentals", type: "PDF Notes", pages: 120, icon: "📘" },
    { title: "Pharmacology Guide", type: "Quick Revision", pages: 85, icon: "💊" },
    { title: "Anatomy Diagrams", type: "Visual Guide", pages: 60, icon: "🦴" },
    { title: "Previous Year Papers", type: "Solved Papers", pages: 200, icon: "📄" },
    { title: "Medical Terminology", type: "Glossary", pages: 45, icon: "📖" },
  ];

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20 p-4`}>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className={`w-8 h-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-xl font-bold">Study Materials</h2>
      </div>
      {materials.map((m, i) => (
        <div key={i} className={`${cardBg} rounded-2xl p-4 mb-3 border ${border} flex items-center gap-4`}>
          <div className="text-2xl">{m.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-sm">{m.title}</h3>
            <p className={`text-xs ${subText}`}>{m.type} • {m.pages} pages</p>
          </div>
          <Download size={20} className={subText} />
        </div>
      ))}
    </div>
  );
}
