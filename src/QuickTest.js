import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { 
  Zap, Timer, Target, BookOpen, ArrowRight,
  Stethoscope, Heart, Pill, Brain
} from 'lucide-react';

export default function QuickTest() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const popularSubjects = [
      { id: "anatomy-and-physiology", name: "Anatomy", icon: <Heart />, color: "from-pink-600 to-red-600", desc: "Quick 20 Qs" },
      { id: "pharmacology", name: "Pharmacology", icon: <Pill />, color: "from-purple-600 to-violet-600", desc: "Quick 20 Qs" },
      { id: "medical-surgical-nursing", name: "Med-Surgical", icon: <Stethoscope />, color: "from-red-600 to-rose-600", desc: "Quick 15 Qs" },
      { id: "mental-health-nursing", name: "Mental Health", icon: <Brain />, color: "from-indigo-600 to-purple-600", desc: "Quick 20 Qs" },
    ];
    setSubjects(popularSubjects);
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Zap className="text-yellow-400" size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Quick Practice</h2>
            <p className="text-xs text-gray-400">Short tests for rapid revision</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {subjects.map((s, i) => (
          <div
            key={i}
            onClick={() => navigate(`/test/${s.id}`)}
            className={`bg-gradient-to-r ${s.color} rounded-2xl p-5 active:scale-[0.98] transition-transform cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  {s.icon}
                </div>
                <div>
                  <h3 className="font-bold">{s.name}</h3>
                  <p className="text-xs text-white/70">{s.desc}</p>
                </div>
              </div>
              <ArrowRight size={20} />
            </div>
          </div>
        ))}

        <div className="bg-gray-800 rounded-2xl p-4 mt-4">
          <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
            <Target size={16} className="text-green-400" /> Benefits of Quick Tests
          </h3>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
              Shorter duration - complete in 15-20 minutes
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              Focus on specific topics
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
              Instant results with explanations
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
