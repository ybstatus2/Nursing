import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { useTheme } from './ThemeContext';
import {
  ArrowLeft, Upload, Layers, RefreshCw, Trash2, PlayCircle,
  Settings, AlertCircle, Zap, Shuffle, Code, BarChart3, Plus, Minus, Send
} from 'lucide-react';

const ADMIN_EMAILS = ["pbhupeshk2022@gmail.com", "pbhupeshk2021@gmail.com"];

const SUBJECTS = [
  { id: "medical-surgical-nursing", name: "Medical Surgical Nursing" },
  { id: "obstetrics-and-gynaecology", name: "Obstetrics & Gynaecology" },
  { id: "pediatric-nursing", name: "Pediatric Nursing" },
  { id: "mental-health-nursing", name: "Mental Health Nursing" },
  { id: "community-health-nursing", name: "Community Health Nursing" },
  { id: "nursing-management", name: "Nursing Management" },
  { id: "anatomy-and-physiology", name: "Anatomy & Physiology" },
  { id: "pharmacology", name: "Pharmacology" },
  { id: "microbiology", name: "Microbiology" },
  { id: "research-and-statistics", name: "Research & Statistics" },
  { id: "nursing-foundation", name: "Nursing Foundation" },
  { id: "nutrition", name: "Nutrition" },
  { id: "biochemistry", name: "Biochemistry" },
  { id: "pathology", name: "Pathology" },
  { id: "infection-control", name: "Infection Control" },
  { id: "first-aid-and-emergency", name: "First Aid & Emergency" }
];

const SERIES = {
  daily_morning: "Daily Morning Test",
  daily_evening: "Daily Evening Test",
  "365_days": "365 Days Challenge",
  "norcet_100_days": "NORCET 100 Days Challenge",
  daily_challenge: "Daily Challenge"
};

const SAMPLE_JSON = JSON.stringify([
  {
    "question": "What is the normal range of hemoglobin in adult males?",
    "options": ["12-14 g/dL","14-16 g/dL","13-17 g/dL","10-12 g/dL"],
    "correct": 2,
    "explanation": "Normal hemoglobin for adult males is 13-17 g/dL.",
    "topic": "Hematology"
  },
  {
    "question": "Which vitamin is essential for blood clotting?",
    "options": ["Vitamin A","Vitamin B","Vitamin C","Vitamin K"],
    "correct": 3,
    "explanation": "Vitamin K is necessary for synthesis of clotting factors.",
    "topic": "Nutrition"
  }
], null, 2);

export default function Admin() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('upload');
  const [message, setMessage] = useState('');
  const [allTests, setAllTests] = useState([]);
  const [shuffleStats, setShuffleStats] = useState(null);
  const [notifyTitle, setNotifyTitle] = useState('📚 RPREP Daily Challenge');
  const [notifyBody, setNotifyBody] = useState("Today's challenge is ready! Complete your daily test now.");

  // Local state for increment/decrement
  const [dailyTime, setDailyTime] = useState(5);
  const [subjectTime, setSubjectTime] = useState(30);
  const [subjectNum, setSubjectNum] = useState(1);
  const [seriesTime, setSeriesTime] = useState(30);
  const [seriesNum, setSeriesNum] = useState(1);
  const [autoTime, setAutoTime] = useState(100);
  const [autoTotal, setAutoTotal] = useState(100);

  useEffect(() => {
    const u = auth.currentUser;
    if (u && ADMIN_EMAILS.includes(u.email)) {
      setUser(u);
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  useEffect(() => {
    if (tab === 'manage') loadAllTests();
  }, [tab]);

  const loadAllTests = async () => {
    const q = query(collection(db, 'subject_tests'), orderBy('uploaded_at', 'desc'));
    const snap = await getDocs(q);
    setAllTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  if (!user) return null;

  const today = () => new Date().toISOString().slice(0, 10);

  // ========== SHUFFLE LOGIC ==========
  const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const shuffleAnswers = (boxId) => {
    const textarea = document.getElementById(boxId);
    if (!textarea) return;
    const raw = textarea.value;
    try {
      const questions = JSON.parse(raw);
      if (!Array.isArray(questions)) throw new Error('Not an array');
      const shuffled = questions.map(q => {
        const correctIdx = q.correct;
        const opts = [...q.options];
        const correctText = opts[correctIdx];
        const shuffledOpts = shuffleArray(opts);
        const newCorrect = shuffledOpts.indexOf(correctText);
        return { ...q, options: shuffledOpts, correct: newCorrect };
      });
      textarea.value = JSON.stringify(shuffled, null, 2);
      const total = shuffled.length;
      const counts = [0,0,0,0];
      shuffled.forEach(q => counts[q.correct] = (counts[q.correct]||0) + 1);
      const percentages = counts.map(c => total ? ((c/total)*100).toFixed(1) : 0);
      setShuffleStats({ total, counts, percentages, distribution: percentages.map(p => `${p}%`).join(' | ') });
    } catch(e) { showMsg('Invalid JSON for shuffle'); }
  };

  const validateQuestions = (boxId) => {
    const textarea = document.getElementById(boxId);
    if (!textarea) return;
    const raw = textarea.value;
    try {
      const questions = JSON.parse(raw);
      if (!Array.isArray(questions)) { showMsg('JSON must be an array'); return; }
      let errors = [];
      questions.forEach((q, i) => {
        if (!q.question || typeof q.question !== 'string') errors.push(`Q${i+1}: missing/invalid question`);
        if (!Array.isArray(q.options) || q.options.length !== 4) errors.push(`Q${i+1}: must have exactly 4 options`);
        if (typeof q.correct !== 'number' || q.correct < 0 || q.correct > 3) errors.push(`Q${i+1}: correct must be 0-3`);
      });
      if (errors.length > 0) showMsg(`Validation errors:\n${errors.join('\n')}`);
      else showMsg(`✅ Valid! ${questions.length} questions ready.`);
    } catch(e) { showMsg('Invalid JSON format'); }
  };

  // ========== UPLOAD HANDLERS (unchanged) ==========
  const uploadDailyChallenge = async (e) => {
    e.preventDefault();
    const form = e.target;
    const questionsText = form.questions.value;
    let questions;
    try { questions = JSON.parse(questionsText); if (!Array.isArray(questions) || questions.length === 0) throw new Error(); } catch { showMsg('Invalid JSON array'); return; }
    try {
      const oldSnap = await getDocs(query(collection(db, 'subject_tests'), where('series_id', '==', 'daily_challenge'), where('unlockDate', '==', today())));
      oldSnap.forEach(async (d) => await deleteDoc(doc(db, 'subject_tests', d.id)));
      await addDoc(collection(db, 'subject_tests'), { series_id: 'daily_challenge', series_name: 'Daily Challenge', test_number: 1, topic_name: `Daily Challenge - ${today()}`, time_limit: dailyTime, unlockDate: today(), total_questions: questions.length, questions: questions, shuffleQuestions: true, uploaded_at: serverTimestamp(), uploaded_by: user.email });
      showMsg('✅ Daily Challenge updated!'); form.reset(); setDailyTime(5);
    } catch(e) { showMsg('Error: ' + e.message); }
  };

  const uploadSubjectTest = async (e) => {
    e.preventDefault();
    const form = e.target;
    const sid = form.subjectId.value;
    const topic = form.topic.value || sid;
    let questions;
    try { questions = JSON.parse(form.questions.value); if (!Array.isArray(questions) || questions.length === 0) throw new Error(); } catch { showMsg('Invalid JSON array'); return; }
    try {
      await addDoc(collection(db, 'subject_tests'), { subject_id: sid, subject_name: SUBJECTS.find(s => s.id === sid)?.name || sid, topic_name: topic, test_number: subjectNum, time_limit: subjectTime, total_questions: questions.length, questions: questions, uploaded_at: serverTimestamp(), uploaded_by: user.email });
      showMsg('✅ Subject test uploaded!'); form.reset(); setSubjectTime(30); setSubjectNum(1);
    } catch(e) { showMsg('Error: ' + e.message); }
  };

  const uploadSeriesTest = async (e) => {
    e.preventDefault();
    const form = e.target;
    const sid = form.seriesId.value;
    const topic = form.topic.value || `${SERIES[sid]} - Day ${seriesNum}`;
    const unlockDate = form.unlockDate.value || today();
    let questions;
    try { questions = JSON.parse(form.questions.value); if (!Array.isArray(questions) || questions.length === 0) throw new Error(); } catch { showMsg('Invalid JSON array'); return; }
    try {
      await addDoc(collection(db, 'subject_tests'), { series_id: sid, series_name: SERIES[sid], test_number: seriesNum, topic_name: topic, time_limit: seriesTime, unlockDate: unlockDate, total_questions: questions.length, questions: questions, shuffleQuestions: true, shuffleOptions: true, uploaded_at: serverTimestamp(), uploaded_by: user.email });
      showMsg('✅ Series test uploaded!'); form.reset(); setSeriesTime(30); setSeriesNum(1);
    } catch(e) { showMsg('Error: ' + e.message); }
  };

  const autoGenerate = async (e) => {
    e.preventDefault();
    const form = e.target;
    const sid = form.seriesId.value;
    const unlockDate = form.unlockDate.value || today();
    const weightStr = form.weightage.value;
    let weightage;
    try { weightage = JSON.parse(weightStr); } catch { showMsg('Invalid weightage JSON'); return; }
    const sum = Object.values(weightage).reduce((a,b) => a + Number(b), 0);
    if (sum !== autoTotal) { showMsg(`Weightage total (${sum}) must equal ${autoTotal}`); return; }
    showMsg('⏳ Generating...');
    try {
      let selected = [];
      for (const [subId, count] of Object.entries(weightage)) {
        const q = query(collection(db, 'subject_tests'), where('subject_id', '==', subId));
        const snap = await getDocs(q);
        const pool = [];
        snap.forEach(d => { const data = d.data(); if (data.series_id) return; if (Array.isArray(data.questions)) pool.push(...data.questions.map(q => ({ ...q, subject: subId }))); });
        if (pool.length < count) { showMsg(`Not enough questions for ${subId}: need ${count}, have ${pool.length}`); return; }
        selected.push(...shuffleArray(pool).slice(0, count));
      }
      selected.sort(() => Math.random() - 0.5);
      const existingSnap = await getDocs(query(collection(db, 'subject_tests'), where('series_id', '==', sid)));
      const tnum = existingSnap.size + 1;
      await addDoc(collection(db, 'subject_tests'), { series_id: sid, series_name: SERIES[sid], test_number: tnum, topic_name: `${SERIES[sid]} - Day ${tnum}`, time_limit: autoTime, unlockDate: unlockDate, total_questions: selected.length, questions: selected, shuffleQuestions: true, shuffleOptions: true, autoGenerated: true, weightage: weightage, uploaded_at: serverTimestamp(), uploaded_by: user.email });
      showMsg(`✅ Generated ${SERIES[sid]} Test #${tnum} with ${selected.length} questions`); form.reset(); setAutoTime(100); setAutoTotal(100);
    } catch(e) { showMsg('Error: ' + e.message); }
  };

  const fillWeightage = (mode) => {
    const ta = document.getElementById('weightage');
    if (mode === '365') ta.value = JSON.stringify({"medical-surgical-nursing":25,"pharmacology":12,"mental-health-nursing":10,"pediatric-nursing":10,"obstetrics-and-gynaecology":10,"community-health-nursing":8,"nursing-management":7,"anatomy-and-physiology":6,"nursing-foundation":5,"research-and-statistics":3,"microbiology":2,"nutrition":2}, null, 2);
    else if (mode === 'norcet') ta.value = JSON.stringify({"medical-surgical-nursing":30,"pharmacology":15,"mental-health-nursing":12,"pediatric-nursing":10,"obstetrics-and-gynaecology":10,"community-health-nursing":8,"nursing-management":5,"anatomy-and-physiology":4,"nursing-foundation":3,"research-and-statistics":3}, null, 2);
  };

  const deleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    await deleteDoc(doc(db, 'subject_tests', id));
    loadAllTests();
    showMsg('Test deleted');
  };

  const sendNotification = async () => {
    try {
      const response = await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic 4dfflk3esuc6vrwofw3pcr4qk"
        },
        body: JSON.stringify({
          app_id: "e1b2bf29-31d8-4087-b3a7-829c02fa7e4c",
          headings: { en: notifyTitle },
          contents: { en: notifyBody },
          included_segments: ["All"]
        })
      });
      if (response.ok) showMsg("✅ Notification sent successfully!");
      else showMsg("❌ Failed to send notification");
    } catch(e) { showMsg("Error: " + e.message); }
  };

  const bg = darkMode ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const border = darkMode ? 'border-gray-700' : 'border-gray-200';

  const tabsList = [
    { id: 'daily', icon: <Zap size={16} />, label: 'Daily Challenge' },
    { id: 'upload', icon: <Upload size={16} />, label: 'Subject Upload' },
    { id: 'series', icon: <Layers size={16} />, label: 'Series Upload' },
    { id: 'auto', icon: <RefreshCw size={16} />, label: 'Auto Generate' },
    { id: 'manage', icon: <Settings size={16} />, label: 'Manage Tests' },
    { id: 'notify', icon: <Send size={16} />, label: 'Notify Users' },
  ];

  const renderActions = (boxId) => (
    <div className="flex gap-2 mt-2 flex-wrap">
      <button type="button" onClick={() => { document.getElementById(boxId).value = SAMPLE_JSON; setShuffleStats(null); }} className="px-3 py-1 bg-gray-700 rounded-lg text-xs flex items-center gap-1"><Code size={12} /> Sample</button>
      <button type="button" onClick={() => validateQuestions(boxId)} className="px-3 py-1 bg-blue-700 rounded-lg text-xs flex items-center gap-1"><BarChart3 size={12} /> Validate</button>
      <button type="button" onClick={() => shuffleAnswers(boxId)} className="px-3 py-1 bg-green-700 rounded-lg text-xs flex items-center gap-1"><Shuffle size={12} /> Shuffle Answers</button>
    </div>
  );

  const NumInput = ({ value, onChange, min = 1, max = 999 }) => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center"><Minus size={14} /></button>
      <span className="w-12 text-center font-mono">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center"><Plus size={14} /></button>
    </div>
  );

  return (
    <div className={`h-screen overflow-y-auto ${bg}`}>
      <div className={`${darkMode ? 'bg-gray-900/80' : 'bg-white'} border-b ${border} px-4 py-4 flex items-center gap-3 sticky top-0 z-10`}>
        <button onClick={() => navigate('/dashboard')} className={`w-9 h-9 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center`}>
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-auto">{user.email}</span>
      </div>

      <div className="flex gap-2 p-4 overflow-x-auto">
        {tabsList.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-600'}`}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div className="mx-4 mb-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {message}
        </div>
      )}

      <div className="p-4">
        {tab === 'daily' && (
          <form onSubmit={uploadDailyChallenge} className={`${cardBg} border ${border} rounded-2xl p-4 space-y-4`}>
            <h3 className="font-bold text-lg">Daily Challenge</h3>
            <div className="flex items-center gap-3"><span className="text-sm">Time Limit (min):</span><NumInput value={dailyTime} onChange={setDailyTime} min={1} max={180} /></div>
            <textarea id="dailyQuestions" name="questions" rows="10" placeholder='Paste JSON array of MCQs' className="w-full bg-transparent border-b border-gray-700 p-2 font-mono text-sm" />
            {renderActions('dailyQuestions')}
            {shuffleStats && <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded-lg">Shuffle Stats: {shuffleStats.distribution} (Total: {shuffleStats.total})</div>}
            <button type="submit" className="w-full py-3 bg-orange-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"><Zap size={16} /> Update Daily Challenge</button>
          </form>
        )}

        {tab === 'upload' && (
          <form onSubmit={uploadSubjectTest} className={`${cardBg} border ${border} rounded-2xl p-4 space-y-4`}>
            <h3 className="font-bold text-lg">Upload Subject Test</h3>
            <select name="subjectId" className="w-full bg-transparent border-b border-gray-700 p-2">{SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <input name="topic" placeholder="Topic Name (optional)" className="w-full bg-transparent border-b border-gray-700 p-2" />
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm">Test Number</span><NumInput value={subjectNum} onChange={setSubjectNum} /></div>
              <div><span className="text-sm">Time Limit (min)</span><NumInput value={subjectTime} onChange={setSubjectTime} /></div>
            </div>
            <textarea id="subjectQuestions" name="questions" rows="10" placeholder='Paste JSON array of MCQs' className="w-full bg-transparent border-b border-gray-700 p-2 font-mono text-sm" />
            {renderActions('subjectQuestions')}
            {shuffleStats && <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded-lg">Shuffle Stats: {shuffleStats.distribution} (Total: {shuffleStats.total})</div>}
            <button type="submit" className="w-full py-3 bg-blue-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"><Upload size={16} /> Upload Test</button>
          </form>
        )}

        {tab === 'series' && (
          <form onSubmit={uploadSeriesTest} className={`${cardBg} border ${border} rounded-2xl p-4 space-y-4`}>
            <h3 className="font-bold text-lg">Upload Series Test</h3>
            <select name="seriesId" className="w-full bg-transparent border-b border-gray-700 p-2">{Object.entries(SERIES).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm">Test/Day Number</span><NumInput value={seriesNum} onChange={setSeriesNum} /></div>
              <div><span className="text-sm">Time Limit (min)</span><NumInput value={seriesTime} onChange={setSeriesTime} /></div>
            </div>
            <input name="topic" placeholder="Topic Name (auto: Series - Day X)" className="w-full bg-transparent border-b border-gray-700 p-2" />
            <input name="unlockDate" type="date" defaultValue={today()} className="w-full bg-transparent border-b border-gray-700 p-2" />
            <textarea id="seriesQuestions" name="questions" rows="10" placeholder='Paste JSON array of MCQs' className="w-full bg-transparent border-b border-gray-700 p-2 font-mono text-sm" />
            {renderActions('seriesQuestions')}
            {shuffleStats && <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded-lg">Shuffle Stats: {shuffleStats.distribution} (Total: {shuffleStats.total})</div>}
            <button type="submit" className="w-full py-3 bg-purple-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"><Upload size={16} /> Upload Series Test</button>
          </form>
        )}

        {tab === 'auto' && (
          <form onSubmit={autoGenerate} className={`${cardBg} border ${border} rounded-2xl p-4 space-y-4`}>
            <h3 className="font-bold text-lg">Auto Generate Test (Mixed Subjects)</h3>
            <select name="seriesId" className="w-full bg-transparent border-b border-gray-700 p-2">
              <option value="365_days">365 Days Challenge</option>
              <option value="norcet_100_days">NORCET 100 Days Challenge</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-sm">Total Questions</span><NumInput value={autoTotal} onChange={setAutoTotal} min={10} max={500} /></div>
              <div><span className="text-sm">Time Limit (min)</span><NumInput value={autoTime} onChange={setAutoTime} min={10} max={500} /></div>
            </div>
            <input name="unlockDate" type="date" defaultValue={today()} className="w-full bg-transparent border-b border-gray-700 p-2" />
            <textarea id="weightage" name="weightage" rows="8" placeholder='Weightage JSON...' className="w-full bg-transparent border-b border-gray-700 p-2 font-mono text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => fillWeightage('365')} className="px-3 py-1 bg-gray-700 rounded-lg text-xs">365 Weightage</button>
              <button type="button" onClick={() => fillWeightage('norcet')} className="px-3 py-1 bg-gray-700 rounded-lg text-xs">NORCET Weightage</button>
            </div>
            <button type="submit" className="w-full py-3 bg-green-600 rounded-xl font-bold text-white flex items-center justify-center gap-2"><PlayCircle size={16} /> Generate Test (Interleaved Subjects)</button>
          </form>
        )}

        {tab === 'manage' && (
          <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
            <h3 className="font-bold text-lg mb-3">All Tests</h3>
            <button onClick={loadAllTests} className="mb-4 px-4 py-2 bg-gray-700 rounded-lg text-sm">Refresh List</button>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {allTests.map(test => (
                <div key={test.id} className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{test.series_name || test.subject_name || 'Unknown'} {test.test_number ? ` - Test #${test.test_number}` : ''}</p>
                      <p className="text-xs text-gray-400">{test.topic_name} | {test.total_questions || test.questions?.length || 0} Qs</p>
                    </div>
                    <button onClick={() => deleteTest(test.id)} className="p-2 bg-red-500/10 rounded-lg text-red-400"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {allTests.length === 0 && <p className="text-sm text-gray-400">No tests found</p>}
            </div>
          </div>
        )}

        {tab === 'notify' && (
          <div className={`${cardBg} border ${border} rounded-2xl p-4 space-y-4`}>
            <h3 className="font-bold text-lg">Send Push Notification</h3>
            <input value={notifyTitle} onChange={e => setNotifyTitle(e.target.value)} placeholder="Title" className="w-full bg-transparent border-b border-gray-700 p-2" />
            <textarea value={notifyBody} onChange={e => setNotifyBody(e.target.value)} rows="3" placeholder="Message body" className="w-full bg-transparent border-b border-gray-700 p-2" />
            <button onClick={sendNotification} className="w-full py-3 bg-green-600 rounded-xl font-bold text-white flex items-center justify-center gap-2">
              <Send size={16} /> Send Notification
            </button>
            <p className="text-xs text-gray-400">Queues a notification for all users (Cloud Function required to send).</p>
          </div>
        )}
      </div>
    </div>
  );
}
