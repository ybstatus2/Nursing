import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export default app;
