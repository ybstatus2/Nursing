import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ChevronRight, Stethoscope, Activity, Heart, 
  Pill, Baby, Users, Brain, Building2, TrendingUp, 
  FlaskConical, BookOpen, Apple, Microscope, Shield,
  BarChart3, Filter
} from 'lucide-react';

const allSubjects = [
  { id: "medical-surgical-nursing", name: "Medical Surgical Nursing", icon: <Stethoscope />, questions: 87, color: "bg-red-500" },
  { id: "first-aid-and-emergency", name: "First Aid & Emergency", icon: <Activity />, questions: 390, color: "bg-orange-500" },
  { id: "anatomy-and-physiology", name: "Anatomy & Physiology", icon: <Heart />, questions: 600, color: "bg-pink-500" },
  { id: "pharmacology", name: "Pharmacology", icon: <Pill />, questions: 740, color: "bg-purple-500" },
  { id: "pediatric-nursing", name: "Pediatric Nursing", icon: <Baby />, questions: 780, color: "bg-cyan-500" },
  { id: "obstetrics-and-gynaecology", name: "Obstetrics & Gynaecology", icon: <Users />, questions: 850, color: "bg-teal-500" },
  { id: "mental-health-nursing", name: "Mental Health Nursing", icon: <Brain />, questions: 670, color: "bg-indigo-500" },
  { id: "community-health-nursing", name: "Community Health Nursing", icon: <Building2 />, questions: 920, color: "bg-emerald-500" },
  { id: "nursing-management", name: "Nursing Management", icon: <TrendingUp />, questions: 540, color: "bg-blue-500" },
  { id: "microbiology", name: "Microbiology", icon: <FlaskConical />, questions: 510, color: "bg-lime-500" },
  { id: "research-and-statistics", name: "Research & Statistics", icon: <BarChart3 />, questions: 420, color: "bg-yellow-500" },
  { id: "nursing-foundation", name: "Nursing Foundation", icon: <BookOpen />, questions: 980, color: "bg-sky-500" },
  { id: "nutrition", name: "Nutrition", icon: <Apple />, questions: 360, color: "bg-green-500" },
  { id: "biochemistry", name: "Biochemistry", icon: <Microscope />, questions: 300, color: "bg-fuchsia-500" },
  { id: "pathology", name: "Pathology", icon: <Shield />, questions: 440, color: "bg-slate-500" },
  { id: "infection-control", name: "Infection Control", icon: <Shield />, questions: 260, color: "bg-amber-500" },
];

export default function Subjects() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = allSubjects.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-4">All Subjects</h2>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => navigate(`/subject-tests/${s.id}`)}
              className="bg-gray-800 rounded-2xl p-4 flex items-center gap-4 active:bg-gray-700 transition-all"
            >
              <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-white`}>
                {s.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.questions}+ MCQs</p>
              </div>
              <ChevronRight size={20} className="text-gray-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
