import { useEffect, useMemo, useState } from "react";
import "./App.css";

import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  where
} from "firebase/firestore";

const APP_VERSION = 1;

const tabs = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "subjects", label: "Subjects", icon: "📚" },
  { id: "testSeries", label: "Test Series", icon: "📝" },
  { id: "results", label: "Results", icon: "📊" }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tests, setTests] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myDoubts, setMyDoubts] = useState([]);
  const [doubtForm, setDoubtForm] = useState({
    subject: "",
    question: ""
  });
  const [profile, setProfile] = useState(null);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    examPreparation: "RRB Nursing Superintendent"
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [marked, setMarked] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [updateInfo, setUpdateInfo] = useState(null);

  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        await loadTests();
        await loadResults(u.uid);
        await loadLeaderboard();
        await loadDoubts(u.uid);
        await loadProfile(u);
        // await checkAppUpdate(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (screen !== "exam" || !selectedTest) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, selectedTest, answers]);

  async function checkAppUpdate(showMessage = true) {
    try {
      const snap = await getDoc(doc(db, "app_config", "version"));
      if (!snap.exists()) {
        if (showMessage) alert("Update configuration not found");
        return;
      }

      const data = snap.data();

      if (Number(data.latestVersion || 1) > APP_VERSION) {
        setUpdateInfo(data);
      } else {
        if (showMessage) alert("Your app is already up to date");
      }
    } catch (e) {
      console.log(e);
      if (showMessage) alert("Update check failed: " + e.message);
    }
  }

  async function loadTests() {
    setLoading(true);
    try {
      const q = query(collection(db, "subject_tests"), orderBy("test_number", "asc"));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTests(list);
    } catch (e) {
      alert("Tests load error: " + e.message);
    }
    setLoading(false);
  }

  async function loadDoubts(uid) {
    try {
      const q = query(collection(db, "doubts"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyDoubts(list.reverse());
    } catch (e) {
      console.log("Doubts load error:", e);
    }
  }

  async function submitDoubt() {
    try {
      if (!doubtForm.subject.trim() || !doubtForm.question.trim()) {
        return alert("Subject aur doubt question enter karo");
      }

      await addDoc(collection(db, "doubts"), {
        userId: user.uid,
        userName: profileForm.name || user.email?.split("@")[0] || "RPrep Student",
        email: user.email || "",
        subject: doubtForm.subject.trim(),
        question: doubtForm.question.trim(),
        status: "Pending",
        answer: "",
        createdAt: serverTimestamp()
      });

      setDoubtForm({ subject: "", question: "" });
      await loadDoubts(user.uid);
      alert("Doubt submitted successfully");
    } catch (e) {
      alert("Doubt submit error: " + e.message);
    }
  }

  async function loadLeaderboard() {
    try {
      const snap = await getDocs(collection(db, "results"));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const users = {};

      all.forEach(r => {
        const uid = r.userId || r.uid || r.email || "unknown";
        if (!users[uid]) {
          users[uid] = {
            userId: uid,
            name: r.userName || r.name || r.email || "RPrep Student",
            email: r.email || "",
            tests: 0,
            totalScore: 0,
            bestScore: 0
          };
        }

        const percentage = Number(r.percentage || 0);
        users[uid].tests += 1;
        users[uid].totalScore += percentage;
        users[uid].bestScore = Math.max(users[uid].bestScore, percentage);
      });

      const list = Object.values(users)
        .map(u => ({
          ...u,
          averageScore: u.tests ? Math.round(u.totalScore / u.tests) : 0
        }))
        .sort((a, b) => b.bestScore - a.bestScore || b.averageScore - a.averageScore || b.tests - a.tests)
        .slice(0, 50);

      setLeaderboard(list);
    } catch (e) {
      console.log("Leaderboard load error:", e);
    }
  }

  async function loadResults(uid) {
    try {
      const q = query(collection(db, "results"), where("userId", "==", uid));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyResults(list.reverse());
    } catch (e) {
      console.log(e);
    }
  }

  async function loadProfile(u) {
    try {
      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      const baseProfile = {
        name: u.displayName || "",
        email: u.email || "",
        phone: "",
        address: "",
        examPreparation: "RRB Nursing Superintendent"
      };

      const data = snap.exists() ? { ...baseProfile, ...snap.data() } : baseProfile;

      setProfile(data);
      setProfileForm({
        name: data.name || "",
        phone: data.phone || "",
        address: data.address || "",
        examPreparation: data.examPreparation || "RRB Nursing Superintendent"
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function saveProfile() {
    try {
      const { setDoc } = await import("firebase/firestore");
      const data = {
        ...profileForm,
        email: user.email || "",
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), data, { merge: true });
      setProfile(data);
      setEditProfile(false);
      alert("Profile saved successfully");
      setIsEditingProfile(false);
    } catch (e) {
      alert("Profile save error: " + e.message);
    }
  }

  const subjects = useMemo(() => {
    const map = {};
    tests.forEach(t => {
      if (!map[t.subject_id]) {
        map[t.subject_id] = {
          id: t.subject_id,
          name: t.subject_name || t.subject_id,
          count: 0
        };
      }
      map[t.subject_id].count++;
    });
    return Object.values(map);
  }, [tests]);

  function todayDateString() {
    return new Date().toISOString().slice(0, 10);
  }

  function isUnlocked(test) {
    if (!test.unlockDate) return true;
    return String(test.unlockDate) <= todayDateString();
  }

  function openSeries(seriesId, seriesName, mode = "allUnlocked") {
    setSelectedSubject({
      id: seriesId,
      name: seriesName,
      isSeries: true,
      mode
    });
    setScreen("testList");
  }

  const subjectTests = useMemo(() => {
    if (!selectedSubject) return [];

    let list = tests.filter(t => {
      if (selectedSubject.isSeries) {
        return t.series_id === selectedSubject.id;
      }
      return t.subject_id === selectedSubject.id;
    });

    if (selectedSubject.isSeries) {
      list = list.filter(isUnlocked);

      if (selectedSubject.mode === "todayOnly") {
        list = list.filter(t => String(t.unlockDate || "") === todayDateString());
      }
    }

    return list.sort((a, b) => Number(a.test_number || 0) - Number(b.test_number || 0));
  }, [tests, selectedSubject]);

  const totalTests = tests.length;
  const totalSubjects = subjects.length;
  const bestScore = myResults.length
    ? Math.max(...myResults.map(r => Number(r.percentage || 0)))
    : 0;

  async function handleAuth() {
    try {
      if (!email || !password) return alert("Email aur password enter karo");

      if (authMode === "signup") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e) {
      alert(e.message);
    }
  }

  async function googleLogin() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (e) {
      alert(e.message);
    }
  }


  async function logout() {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setScreen("login");
    } catch (e) {
      alert("Logout error: " + e.message);
    }
  }

  function goTab(tab) {
    setMenuOpen(false);
    setScreen(tab);
    setSelectedSubject(null);
    setSelectedTest(null);
    setResult(null);
  }

  function openSubject(subject) {
    setSelectedSubject(subject);
    setScreen("testList");
  }

  function startTest(test) {
    const qs = Array.isArray(test.questions) ? test.questions : [];
    if (!qs.length) return alert("Is test me questions nahi mile");

    setSelectedTest(test);
    setCurrentQ(0);
    setAnswers(new Array(qs.length).fill(null));
    setMarked([]);
    setTimeLeft((test.time_limit || qs.length) * 60);
    setScreen("exam");
  }

  function selectAnswer(index) {
    const copy = [...answers];
    copy[currentQ] = index;
    setAnswers(copy);
  }

  function clearResponse() {
    const copy = [...answers];
    copy[currentQ] = null;
    setAnswers(copy);
  }

  function saveAndNext() {
    if (currentQ < selectedTest.questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  }

  function confirmSubmitTest() {
    const total = selectedTest?.questions?.length || 0;
    const attempted = answers.filter(a => a !== null).length;
    const markedCount = marked.length;

    const ok = window.confirm(
      `Submit Test?\n\nTotal Questions: ${total}\nAttempted: ${attempted}\nNot Attempted: ${total - attempted}\nMarked: ${markedCount}`
    );

    if (ok) submitTest();
  }

  function toggleMark() {
    setMarked(prev =>
      prev.includes(currentQ)
        ? prev.filter(i => i !== currentQ)
        : [...prev, currentQ]
    );
  }

  async function submitTest() {
    if (!selectedTest) return;

    const qs = selectedTest.questions || [];
    let correct = 0;

    qs.forEach((q, i) => {
      if (answers[i] === Number(q.correct)) correct++;
    });

    const finalResult = {
      userId: user?.uid || "",
      userEmail: user?.email || "",
      testId: selectedTest.id,
      subject_id: selectedTest.subject_id,
      subject_name: selectedTest.subject_name,
      topic_name: selectedTest.topic_name || "",
      test_number: selectedTest.test_number,
      score: correct,
      total: qs.length,
      percentage: Math.round((correct / qs.length) * 100),
      answers,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "results"), finalResult);
      await loadResults(user.uid);
    } catch (e) {
      console.log(e);
    }

    setResult({ ...finalResult, questions: qs });
    setScreen("result");
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (showSplash) {
    return (
      <div className="splashScreen">
        <div className="splashLogoBox">
          <span className="splashIcon">🩺</span>
          <h1>RPrep</h1>
          <p>Your Nursing Success Partner</p>
        </div>
      </div>
    );
  }

  if (loading) return <div className="center">Loading RPrep...</div>;

  if (!user) {
    return (
      <div className="authPage">
        <div className="authCard">
          <div className="loginLogo">
            <span className="loginLogoIcon">🩺</span>
            <div>
              <h1>RPrep</h1>
              <p>Your Nursing Success Partner</p>
            </div>
          </div>
          <p>Professional Nursing Exam Preparation</p>

          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" />
          <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />

          <button className="primary" onClick={handleAuth}>
            {authMode === "login" ? "Login" : "Create Account"}
          </button>

          <button className="google" onClick={googleLogin}>Continue with Google</button>

          <button className="linkBtn" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
            {authMode === "login" ? "New user? Signup" : "Already have account? Login"}
          </button>
        </div>
      </div>
    );
  }

  const q = selectedTest?.questions?.[currentQ];

  return (
    <div className="app">
      {updateInfo && (
        <div className="updateBox">
          <b>New update available</b>
          <p>{updateInfo.message || "Please update RPrep app."}</p>
          <button onClick={() => window.open(updateInfo.apkUrl || updateInfo.downloadUrl, "_blank")}>
            Update Now
          </button>
        </div>
      )}

      {screen !== "exam" && (
        <header className="topbar">
          <div className="headerBrand">
            <span className="headerLogoIcon">🩺</span>
            <div>
              <h2>RPrep</h2>
              <small>Your Nursing Success Partner</small>
            </div>
          </div>

  
          <div className="topUserArea">
            <button className="hamburgerBtn" onClick={() => setMenuOpen(!menuOpen)}>☰</button>

            {menuOpen && (
              <div className="userMenu">
                <button onClick={() => { setScreen("profile"); setMenuOpen(false); }}>👤 Profile</button>
                <button onClick={() => { setScreen("results"); setMenuOpen(false); }}>📊 Scorecard</button>
                <button onClick={() => { setScreen("leaderboard"); setMenuOpen(false); }}>🏆 Leaderboard</button>
                <button onClick={() => { setScreen("doubt"); setMenuOpen(false); }}>❓ Doubt Page</button>
                <button onClick={() => { setScreen("about"); setMenuOpen(false); }}>ℹ️ About Us</button>
                <button onClick={() => { setScreen("contact"); setMenuOpen(false); }}>📞 Contact Us</button>
                <button onClick={() => { setScreen("privacy"); setMenuOpen(false); }}>🔐 Privacy Policy</button>
                <button onClick={() => { setScreen("terms"); setMenuOpen(false); }}>📄 Terms & Conditions</button>
                <button onClick={() => { setScreen("disclaimer"); setMenuOpen(false); }}>⚠️ Disclaimer</button>
                <button onClick={() => { setScreen("faq"); setMenuOpen(false); }}>❔ FAQ</button>
                <button onClick={() => { checkAppUpdate(); setMenuOpen(false); }}>🔄 Check Update</button>
                <button className="logoutMenuBtn" onClick={logout}>🚪 Logout</button>
              </div>
            )}
          </div>
        </header>
      )}


      {screen === "home" && (
        <main className="homePage withNav">
          <section className="homeHero">
            <div className="heroContent">
              <span className="heroBadge">✨ Welcome to RPrep ✨</span>
              <h1>
                Every Nurse Was Once a Student <br />
                Who <span>Never Gave Up</span>
              </h1>
              <p>
                Join India's most loved nursing exam preparation platform. Get inspired daily,
                stay motivated, and crack your dream nursing exam with confidence.
              </p>

              <div className="heroActions">
                <button onClick={() => setScreen("subjects")}>Start Free Preparation →</button>
                <button className="outlineBtn" onClick={() => setScreen("testSeries")}>Explore Exams ↓</button>
              </div>
            </div>
          </section>

          <section className="motivationSection">
            <h2>✨ <span>Nursing Motivation</span> That Moves You ✨</h2>

            <div className="quoteGrid">
              <div className="quoteCard">
                <div className="quoteIcon">❤️</div>
                <p>"Nurses are the heart of healthcare. Your dedication today saves lives tomorrow."</p>
                <b>— Florence Nightingale</b>
              </div>

              <div className="quoteCard">
                <div className="quoteIcon">⭐</div>
                <p>"The best way to find yourself is to lose yourself in the service of others."</p>
                <b>— Mahatma Gandhi</b>
              </div>

              <div className="quoteCard">
                <div className="quoteIcon">📈</div>
                <p>"Success comes from what you do consistently. Practice daily and keep improving."</p>
                <b>— RPrep Team</b>
              </div>
            </div>
          </section>

          <section className="examsSection">
            <h2>📚 <span>Nursing Exams</span> We Cover 📚</h2>

            <div className="examGrid">
              <div className="examCard">
                <h3>🩺 NORCET</h3>
                <p>AIIMS Nursing Officer Recruitment Common Eligibility Test</p>
                <span>10,000+ MCQs</span>
              </div>

              <div className="examCard">
                <h3>🏥 RRB Nursing</h3>
                <p>Railway Recruitment Board Nursing Exams</p>
                <span>8,000+ MCQs</span>
              </div>

              <div className="examCard">
                <h3>🎓 AIIMS Nursing</h3>
                <p>All India Institute of Medical Sciences Nursing Entrance</p>
                <span>7,500+ MCQs</span>
              </div>

              <div className="examCard">
                <h3>📋 PGIMER Nursing</h3>
                <p>Postgraduate Institute of Medical Education & Research</p>
                <span>5,000+ MCQs</span>
              </div>

              <div className="examCard">
                <h3>🎯 DSSSB Nursing</h3>
                <p>Delhi Subordinate Services Board Nursing Officer</p>
                <span>4,000+ MCQs</span>
              </div>

              <div className="examCard">
                <h3>📚 State Nursing Exams</h3>
                <p>All State Nursing Recruitment Exams Covered</p>
                <span>15,000+ MCQs</span>
              </div>
            </div>
          </section>

          <section className="successSection">
            <h2>💬 <span>Success Stories</span> From Our Students 💬</h2>

            <div className="successGrid">
              <div className="successCard">
                <div className="studentAvatar">👩‍⚕️</div>
                <div className="stars">★★★★★</div>
                <p>"RPrep changed my preparation. Daily practice helped me stay consistent."</p>
                <b>Priya Sharma</b>
                <small>NORCET Aspirant</small>
              </div>

              <div className="successCard">
                <div className="studentAvatar">👨‍⚕️</div>
                <div className="stars">★★★★★</div>
                <p>"Best platform for nursing preparation. Clean design and useful test practice."</p>
                <b>Rahul Verma</b>
                <small>RRB Nursing Aspirant</small>
              </div>
            </div>
          </section>

          <section className="homeCta">
            <h2>🎯 Ready to Start Your Nursing Journey?</h2>
            <p>Join aspiring nurses who trust RPrep for their exam preparation.</p>
            <button onClick={() => setScreen("subjects")}>Start Preparing for Free →</button>
          </section>
        </main>
      )}


      {screen === "subjects" && (
        <main className="page withNav">
          <h2>All Subjects</h2>
          <p className="muted">Choose a subject and start CBT practice.</p>

          <section className="seriesGrid">
            {subjects.map((s, index) => (
              <div className="seriesCard" key={s.id}>
                <div>
                  <div className="seriesIcon">
                    {["📚","🧠","💊","🩺","🏥","👶","❤️","🧬","🦠","📋"][index % 10]}
                  </div>
                  <h3>{s.name}</h3>
                  <p>Practice topic-wise CBT tests and improve your nursing exam score.</p>
                </div>

                <button onClick={() => openSubject(s)}>
                  {s.count} Tests Available →
                </button>
              </div>
            ))}
          </section>
        </main>
      )}

      {screen === "testList" && (
        <main className="page withNav">
          <button className="back" onClick={() => setScreen("subjects")}>← Back</button>
          <h2>{selectedSubject?.name}</h2>
          <p className="muted">Select test to begin.</p>

          <div className="list">
            {subjectTests.length === 0 && (
              <div className="empty">
                {selectedSubject?.isSeries
                  ? "Aaj ka test abhi available nahi hai. Please unlock date ke according test add karo."
                  : "No tests available"}
              </div>
            )}

            {subjectTests.map(t => (
              <button className="testCard" key={t.id} onClick={() => startTest(t)}>
                <b>Test {t.test_number}</b>
                <span>{t.topic_name || t.subject_name}</span>
                <small>{t.total_questions || t.questions?.length || 0} Questions • {t.time_limit || t.questions?.length || 0} min</small>
              </button>
            ))}
          </div>
        </main>
      )}

      {screen === "testSeries" && (
        <main className="page withNav">
          <h2>Test Series</h2>

          <section className="seriesGrid">
            <div className="seriesCard">
              <div className="seriesIcon">🌅</div>
              <h3>Daily Morning Test</h3>
              <p>Start your day with daily CBT practice.</p>
              <button onClick={() => openSeries("daily_morning", "Daily Morning Test", "todayOnly")}>Open Test</button>
            </div>

            <div className="seriesCard">
              <div className="seriesIcon">🌙</div>
              <h3>Daily Evening Test</h3>
              <p>Revise and practice every evening.</p>
              <button onClick={() => openSeries("daily_evening", "Daily Evening Test", "todayOnly")}>Open Test</button>
            </div>

            <div className="seriesCard">
              <div className="seriesIcon">🔥</div>
              <h3>365 Days Challenge</h3>
              <p>One year complete nursing exam preparation.</p>
              <button onClick={() => openSeries("365_days", "365 Days Challenge", "allUnlocked")}>Open Challenge</button>
            </div>

            <div className="seriesCard">
              <div className="seriesIcon">🎯</div>
              <h3>NORCET 100 Days Challenge</h3>
              <p>High-yield NORCET focused test practice.</p>
              <button onClick={() => openSeries("norcet_100_days", "NORCET 100 Days Challenge", "allUnlocked")}>Open Challenge</button>
            </div>
          </section>
        </main>
      )}


      {screen === "leaderboard" && (
        <main className="page withNav">
          <h2>Leaderboard</h2>
          <p className="muted">Top students based on saved test performance.</p>

          <section className="leaderHero">
            <div>
              <small>🏆 Live Ranking</small>
              <h1>Top Performers</h1>
              <p>Ranking updates from Firestore test results.</p>
            </div>
          </section>

          <div className="leaderList">
            {leaderboard.length === 0 && <div className="empty">No leaderboard data yet</div>}

            {leaderboard.map((u, index) => (
              <div className="leaderItem" key={u.userId}>
                <div className="rankBadge">{index + 1}</div>
                <div className="leaderInfo">
                  <b>{u.name}</b>
                  <span>{u.tests} Tests • Avg {u.averageScore}%</span>
                </div>
                <strong>{u.bestScore}%</strong>
              </div>
            ))}
          </div>
        </main>
      )}

      {screen === "infoPages" && (
        <main className="page withNav">
          <h2>Info Pages</h2>
          <p className="muted">Important app information and exam guidance.</p>
          <div className="infoGrid">
            <button>About RPrep</button>
            <button>Exam Syllabus</button>
            <button>Privacy Policy</button>
            <button>Terms & Conditions</button>
            <button>Contact Support</button>
          </div>
        </main>
      )}


      {screen === "doubt" && (
        <main className="page withNav">
          <h2>Doubt Support</h2>
          <p className="muted">Submit your nursing exam doubt and track reply status.</p>

          <section className="doubtHero">
            <div>
              <small>❓ Ask Doubt</small>
              <h1>Get Study Support</h1>
              <p>Your submitted doubts will be saved securely in Firestore.</p>
            </div>
          </section>

          <section className="doubtFormCard">
            <label>Subject / Topic</label>
            <input
              value={doubtForm.subject}
              onChange={(e) => setDoubtForm({ ...doubtForm, subject: e.target.value })}
              placeholder="Example: Anatomy, MSN, Pharmacology"
            />

            <label>Your Doubt</label>
            <textarea
              value={doubtForm.question}
              onChange={(e) => setDoubtForm({ ...doubtForm, question: e.target.value })}
              placeholder="Write your question here..."
              rows="5"
            />

            <button onClick={submitDoubt}>Submit Doubt</button>
          </section>

          <h3 className="sectionHeading">My Doubts</h3>

          <div className="doubtList">
            {myDoubts.length === 0 && <div className="empty">No doubts submitted yet</div>}

            {myDoubts.map(d => (
              <div className="doubtItem" key={d.id}>
                <div className="doubtTop">
                  <b>{d.subject}</b>
                  <span>{d.status || "Pending"}</span>
                </div>
                <p>{d.question}</p>
                {d.answer && (
                  <div className="doubtAnswer">
                    <strong>Answer:</strong>
                    <p>{d.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      )}

      {screen === "about" && (
        <main className="page withNav">
          <h2>About Us</h2>
          <section className="infoCard">
            <p><b>RPrep</b> is an educational nursing exam preparation platform created for nursing students and government job aspirants in India.</p>
            <p>Our main purpose is to provide simple, organized and exam-oriented practice support for nursing competitive exams such as RRB Nursing Superintendent, NORCET, AIIMS Nursing Officer, DSSSB Nursing Officer, PGIMER Nursing, ESIC Nursing and other state-level nursing recruitment exams.</p>
            <p>RPrep focuses on MCQ practice, subject-wise tests, daily practice challenges, test series, score tracking and performance improvement. The platform is designed to help students revise important nursing topics in a structured way.</p>
            <p>We aim to make nursing exam preparation easier by providing a clean mobile-friendly learning experience, useful practice questions and regular study support.</p>
            <p>RPrep is not an official government website. It is an independent educational platform made only for learning, practice and guidance.</p>
          </section>
        </main>
      )}

      {screen === "contact" && (
        <main className="page withNav">
          <h2>Contact Us</h2>
          <section className="infoCard">
            <p>If you have any question, suggestion, feedback, correction request or support-related query, you can contact the RPrep team.</p>
            <p>We welcome feedback from students, teachers and nursing aspirants so that we can improve our content and app experience.</p>
            <p><b>Email Support:</b> support@rprep.online</p>
            <p><b>Website:</b> rprep.online</p>
            <p><b>Purpose of Contact:</b></p>
            <ul>
              <li>App login or account related help</li>
              <li>Profile or test result related query</li>
              <li>Question correction or answer explanation request</li>
              <li>Content suggestion for nursing exams</li>
              <li>General feedback and improvement suggestions</li>
            </ul>
            <p>We try to respond to genuine queries as soon as possible.</p>
          </section>
        </main>
      )}


      {screen === "privacy" && (
        <main className="page withNav">
          <h2>Privacy Policy</h2>
          <p className="muted">Last updated: 2026</p>

          <section className="policyCard">
            <h3>Introduction</h3>
            <p>RPrep respects user privacy and is committed to protecting personal information collected through the app.</p>

            <h3>Information We Collect</h3>
            <p>We may collect name, email address, phone number, address, exam preference, test results, scorecard data and submitted doubts.</p>

            <h3>How We Use Data</h3>
            <p>Data is used for login, profile management, score tracking, leaderboard ranking, doubt support and improving app experience.</p>

            <h3>Data Storage</h3>
            <p>User data may be stored using Firebase Authentication and Firestore. We do not sell personal information.</p>

            <h3>Advertisements</h3>
            <p>If ads are enabled in future, third-party ad partners may use cookies or similar technologies according to their own policies.</p>

            <h3>Contact</h3>
            <p>For privacy questions, contact us at support@rprep.online.</p>
          </section>
        </main>
      )}

      {screen === "terms" && (
        <main className="page withNav">
          <h2>Terms & Conditions</h2>
          <p className="muted">Please read these terms carefully.</p>

          <section className="policyCard">
            <h3>Acceptance</h3>
            <p>By using RPrep, you agree to these Terms & Conditions.</p>

            <h3>Educational Purpose</h3>
            <p>RPrep provides nursing exam preparation material, practice tests, score tracking and learning support for educational use.</p>

            <h3>User Account</h3>
            <p>You are responsible for maintaining account security and for activity under your login.</p>

            <h3>Content Use</h3>
            <p>App content must not be copied, resold, reproduced or misused without permission.</p>

            <h3>Accuracy</h3>
            <p>We try to keep content accurate, but users should verify important exam information from official notifications.</p>

            <h3>Updates</h3>
            <p>RPrep may update features, content and terms when required.</p>
          </section>
        </main>
      )}

      {screen === "disclaimer" && (
        <main className="page withNav">
          <h2>Disclaimer</h2>
          <p className="muted">Important educational disclaimer.</p>

          <section className="policyCard">
            <h3>Educational Information</h3>
            <p>RPrep content is provided for nursing exam preparation and learning support only.</p>

            <h3>No Official Affiliation</h3>
            <p>RPrep is not officially affiliated with RRB, AIIMS, NORCET, PGIMER, DSSSB or any government recruitment body.</p>

            <h3>No Selection Guarantee</h3>
            <p>Using RPrep does not guarantee selection, rank, appointment or exam qualification.</p>

            <h3>Content Verification</h3>
            <p>Users should verify important details from official exam websites, notifications and standard nursing textbooks.</p>

            <h3>External Links</h3>
            <p>RPrep may contain external links. We are not responsible for external website content or policies.</p>
          </section>
        </main>
      )}


      {screen === "faq" && (
        <main className="page withNav">
          <h2>FAQ</h2>
          <p className="muted">Frequently asked questions about RPrep.</p>

          <section className="faqList">
            <div className="faqItem">
              <h3>What is RPrep?</h3>
              <p>RPrep is a nursing exam preparation app designed for practice tests, score tracking, test series, doubt support and exam-focused preparation.</p>
            </div>

            <div className="faqItem">
              <h3>Which exams are covered?</h3>
              <p>RPrep focuses on RRB Nursing Superintendent, NORCET, Staff Nurse, Nursing Officer, Nursing Tutor and other government nursing exams.</p>
            </div>

            <div className="faqItem">
              <h3>Is RPrep officially connected with RRB or AIIMS?</h3>
              <p>No. RPrep is an independent educational platform and is not officially affiliated with RRB, AIIMS, NORCET or any government recruitment body.</p>
            </div>

            <div className="faqItem">
              <h3>Where is my test score saved?</h3>
              <p>Your test score is saved securely in your account and shown in the Scorecard section.</p>
            </div>

            <div className="faqItem">
              <h3>How can I submit a doubt?</h3>
              <p>You can open the Doubt Support page from the menu and submit your subject-wise question.</p>
            </div>

            <div className="faqItem">
              <h3>Does RPrep guarantee selection?</h3>
              <p>No. RPrep helps with preparation and practice, but exam success depends on your study, official exam pattern and competition.</p>
            </div>
          </section>
        </main>
      )}

      {screen === "results" && (
        <main className="page withNav">
          <h2>My Scorecard</h2>
          <p className="muted">Track your exam practice performance.</p>

          <section className="scoreHero cleanScoreHero">
            <div>
              <small>Overall Performance</small>
              <h1>{myResults.length ? Math.round(myResults.reduce((a,r)=>a+Number(r.percentage||0),0)/myResults.length) : 0}%</h1>
              <p>Average Score</p>
            </div>

            <div className="scoreCircle">
              <b>{bestScore}%</b>
              <span>Best</span>
            </div>
          </section>

          <section className="scoreStatsGrid">
            <div><span>📝</span><b>{myResults.length}</b><small>Tests Attempted</small></div>
            <div><span>✅</span><b>{myResults.reduce((a,r)=>a+Number(r.score||0),0)}</b><small>Total Correct</small></div>
            <div><span>📚</span><b>{myResults.reduce((a,r)=>a+Number(r.total||0),0)}</b><small>Questions Attempted</small></div>
            <div><span>🏆</span><b>{bestScore}%</b><small>Best Score</small></div>
          </section>

          <h3 className="sectionHeading">Recent Test History</h3>

          <div className="scoreHistory">
            {myResults.length === 0 && <div className="empty">No results yet</div>}

            {myResults.map(r => (
              <div className="scoreHistoryItem" key={r.id}>
                <div>
                  <b>{r.subject_name || "Nursing Test"}</b>
                  <span>Test {r.test_number || "-"} • {r.score}/{r.total}</span>
                </div>
                <strong>{r.percentage}%</strong>
              </div>
            ))}
          </div>
        </main>
      )}

      {screen === "profile" && (
        <main className="page">
          <h2>Profile</h2>

          <section className="profileCard">
            <div className="profileAvatar">
              {(profileForm.name || user?.email || "U").charAt(0).toUpperCase()}
            </div>

            <h3>{profileForm.name || "Student Name"}</h3>
            <p>{user?.email}</p>

            <div className="profileInfo">
              <div><b>Phone</b><span>{profileForm.phone || "Not added"}</span></div>
              <div><b>Address</b><span>{profileForm.address || "Not added"}</span></div>
              <div><b>Exam</b><span>{profileForm.examPreparation || "Not selected"}</span></div>
            </div>

            <button className="primaryBtn" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              {isEditingProfile ? "Close Edit" : "Edit Profile"}
            </button>
          </section>

          {isEditingProfile && (
            <section className="formCard">
              <label>User Name</label>
              <input
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                placeholder="Enter your name"
              />

              <label>Email ID</label>
              <input value={user?.email || ""} disabled />

              <label>Phone</label>
              <input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                placeholder="Enter phone number"
              />

              <label>Address</label>
              <textarea
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Enter your address"
                rows="3"
              />

              <label>Exam Preparation</label>
              <select
                value={profileForm.examPreparation}
                onChange={(e) => setProfileForm({ ...profileForm, examPreparation: e.target.value })}
              >
                <option>RRB Nursing Superintendent</option>
                <option>NORCET</option>
                <option>AIIMS Nursing Officer</option>
                <option>ESIC Nursing Officer</option>
                <option>DSSSB Nursing Officer</option>
                <option>CHO</option>
                <option>Staff Nurse</option>
                <option>Nursing Tutor</option>
                <option>Other Government Nursing Exam</option>
              </select>

              <button className="primaryBtn" onClick={saveProfile}>
                Save Profile
              </button>
            </section>
          )}

          <button className="logoutBtn" onClick={logout}>Logout</button>
        </main>
      )}


      {screen === "exam" && q && (
        <main className="cbtExam">
          <header className="cbtHeader">
            <div>
              <b>{selectedTest.subject_name || "Nursing CBT"}</b>
              <span>{selectedTest.topic_name || "Practice Test"}</span>
            </div>
            <div className="cbtTimer">⏱ {formatTime(timeLeft)}</div>
          </header>

          <section className="cbtSummary">
            <div><b>{selectedTest.questions.length}</b><span>Total</span></div>
            <div><b>{answers.filter(a => a !== null).length}</b><span>Answered</span></div>
            <div><b>{selectedTest.questions.length - answers.filter(a => a !== null).length}</b><span>Not Answered</span></div>
            <div><b>{marked.length}</b><span>Marked</span></div>
          </section>

          <section className="cbtQuestionCard">
            <div className="cbtQuestionTop">
              <span>Question {currentQ + 1} of {selectedTest.questions.length}</span>
              <button onClick={toggleMark}>
                {marked.includes(currentQ) ? "Unmark Review" : "Mark for Review"}
              </button>
            </div>

            <small>{q.topic || selectedTest.topic_name || "Nursing Exam"}</small>
            <h3>{q.question}</h3>

            <div className="cbtOptions">
              {q.options?.map((op, i) => (
                <button
                  key={i}
                  className={answers[currentQ] === i ? "cbtOption selected" : "cbtOption"}
                  onClick={() => selectAnswer(i)}
                >
                  <b>{String.fromCharCode(65 + i)}</b>
                  <span>{op}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="cbtControls fourBtns">
            <button disabled={currentQ === 0} onClick={() => setCurrentQ(currentQ - 1)}>
              Previous
            </button>

            <button onClick={clearResponse}>
              Clear
            </button>

            <button className="saveNextBtn" onClick={saveAndNext}>
              Save & Next
            </button>

            <button className="submitCbtBtn" onClick={confirmSubmitTest}>
              Submit
            </button>
          </section>

          <section className="cbtPaletteBox">
            <h3>Question Palette</h3>

            <div className="cbtLegend">
              <span><i className="answered"></i>Answered</span>
              <span><i className="notAnswered"></i>Not Answered</span>
              <span><i className="marked"></i>Marked</span>
              <span><i className="current"></i>Current</span>
            </div>

            <div className="cbtPalette">
              {selectedTest.questions.map((_, i) => {
                let cls = "";
                if (i === currentQ) cls = "current";
                else if (marked.includes(i)) cls = "marked";
                else if (answers[i] !== null) cls = "answered";
                else cls = "notAnswered";

                return (
                  <button key={i} onClick={() => setCurrentQ(i)} className={cls}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      )}


      {screen === "result" && result && (
        <main className="resultPage">
          <section className="resultHero">
            <small>Test Completed</small>
            <h1>{result.percentage}%</h1>
            <p>{result.subject_name || "Nursing Practice Test"}</p>
          </section>

          <section className="resultStatsGrid">
            <div><span>✅</span><b>{result.score}</b><small>Correct</small></div>
            <div><span>❌</span><b>{result.total - result.score}</b><small>Wrong / Skipped</small></div>
            <div><span>📝</span><b>{result.total}</b><small>Total Questions</small></div>
            <div><span>🎯</span><b>{result.percentage}%</b><small>Percentage</small></div>
          </section>

          <section className="resultActions">
            <button onClick={() => setScreen("home")}>Go Home</button>
            <button onClick={() => setScreen("results")}>View Scorecard</button>
            <button onClick={() => setScreen("subjects")}>Practice More</button>
          </section>

          <h3 className="sectionHeading">Solutions & Review</h3>

          <div className="solutionList">
            {result.questions.map((item, i) => {
              const userAns = answers[i];
              const correctAns = Number(item.correct);
              const isCorrect = userAns === correctAns;

              return (
                <div className={isCorrect ? "solutionItem correct" : "solutionItem wrong"} key={i}>
                  <div className="solutionTop">
                    <b>Q{i + 1}. {item.question}</b>
                    <span>{isCorrect ? "Correct" : "Review"}</span>
                  </div>

                  <p><strong>Your Answer:</strong> {userAns !== null ? item.options[userAns] : "Not answered"}</p>
                  <p><strong>Correct Answer:</strong> {item.options[correctAns]}</p>

                  {item.explanation && (
                    <div className="explanationBox">
                      <strong>Explanation:</strong>
                      <p>{item.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      )}

      {screen !== "exam" && screen !== "result" && (
        <nav className="bottomNav">
          {tabs.map(t => (
            <button key={t.id} onClick={() => goTab(t.id)} className={screen === t.id ? "active" : ""}>
              <span>{t.icon}</span>
              <small>{t.label}</small>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
