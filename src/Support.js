import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeContext';
import { ArrowLeft, Mail, Phone, Globe, MessageCircle } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const subText = darkMode ? 'text-gray-400' : 'text-gray-500';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';
  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';

  const faqs = [
    { q: 'How to start a test?', a: 'Select a subject from home or subjects tab, then choose a test.' },
    { q: 'Can I pause a test?', a: 'Tests are timed. Closing the app may lose progress.' },
    { q: 'Is there negative marking?', a: 'No, each correct answer gives 1 mark.' },
  ];

  return (
    <div className={`h-full overflow-y-auto ${bg} pb-20`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3`}>
        <button onClick={() => navigate(-1)} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Help & Support</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className={`${cardBg} border ${border} rounded-2xl p-4 space-y-3`}>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center"><Mail className="text-blue-400" size={18} /></div>
            <div><p className="font-medium text-sm">Email</p><p className={`text-xs ${subText}`}>support@rprep.online</p></div>
          </div>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center"><Globe className="text-green-400" size={18} /></div>
            <div><p className="font-medium text-sm">Website</p><p className={`text-xs ${subText}`}>www.rprep.online</p></div>
          </div>
        </div>

        <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><MessageCircle size={16} className="text-blue-400" /> FAQs</h3>
          {faqs.map((faq, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-sm font-medium text-blue-400">{faq.q}</p>
              <p className={`text-xs ${subText} mt-1`}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
