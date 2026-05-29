import { initializeApp } from "firebase/app";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBB6wEYXCeu-IhgdkbD4zEaBmSJ9xkCXC0",
  authDomain: "nursingstudyvaultprep.firebaseapp.com",
  projectId: "nursingstudyvaultprep",
  storageBucket: "nursingstudyvaultprep.firebasestorage.app",
  messagingSenderId: "583546522601",
  appId: "1:583546522601:web:1165a7805c400b05235978"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Enable persistence so user stays logged in
setPersistence(auth, browserLocalPersistence).catch(console.error);

const db = getFirestore(app);

export { auth, db, app };
