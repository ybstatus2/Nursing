import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MessageCircle, Phone, Globe, ChevronRight } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="bg-gray-800 p-4 flex items-center gap-3">
        <button onClick={() => navigate('/dashboard')} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Help & Support</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={40} />
          </div>
          <h3 className="text-xl font-bold">How can we help?</h3>
          <p className="text-gray-400 text-sm mt-1">We're here to assist you</p>
        </div>

        {[
          { icon: <Mail />, label: 'Email Support', desc: 'rp@nursingprep.com', color: 'text-blue-400' },
          { icon: <Phone />, label: 'Call Us', desc: '+91-XXXXXXXXXX', color: 'text-green-400' },
          { icon: <Globe />, label: 'Website', desc: 'www.nursingprep.com', color: 'text-purple-400' },
        ].map((item, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center ${item.color}`}>
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">{item.label}</div>
              <div className="text-xs text-gray-400">{item.desc}</div>
            </div>
            <ChevronRight size={16} className="text-gray-500" />
          </div>
        ))}

        <div className="bg-gray-800 rounded-2xl p-4 mt-6">
          <h3 className="font-bold mb-3">Frequently Asked Questions</h3>
          {[
            { q: 'How to start a test?', a: 'Select a subject from dashboard and start practicing.' },
            { q: 'Can I pause a test?', a: 'Tests are timed. Timer continues in background.' },
            { q: 'How is score calculated?', a: 'Each correct answer gives 1 mark. No negative marking.' },
          ].map((faq, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <p className="text-sm font-bold text-blue-400">{faq.q}</p>
              <p className="text-xs text-gray-400 mt-1">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
