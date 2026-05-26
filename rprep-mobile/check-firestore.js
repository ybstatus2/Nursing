import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBB6wEYXCeu-IhgdkbD4zEaBmSJ9xkCXC0",
  authDomain: "nursingstudyvaultprep.firebaseapp.com",
  databaseURL: "https://nursingstudyvaultprep-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nursingstudyvaultprep",
  storageBucket: "nursingstudyvaultprep.firebasestorage.app",
  messagingSenderId: "583546522601",
  appId: "1:583546522601:web:1165a7805c400b05235978"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const collections = [
  "subject_tests",
  "tests",
  "norcet_tests",
  "results",
  "app_config"
];

for (const name of collections) {
  try {
    const snap = await getDocs(query(collection(db, name), limit(5)));
    console.log("\nCOLLECTION:", name);
    console.log("Sample docs:", snap.size);
    snap.forEach(doc => {
      console.log("DOC ID:", doc.id);
      console.log(doc.data());
    });
  } catch (e) {
    console.log("\nERROR:", name);
    console.log(e.message);
  }
}
