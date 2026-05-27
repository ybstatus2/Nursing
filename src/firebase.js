import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const auth = getAuth(app);
export const db = getFirestore(app);
