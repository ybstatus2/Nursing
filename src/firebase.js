import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  browserLocalPersistence, 
  setPersistence,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

// Initialize persistence immediately
setPersistence(auth, browserLocalPersistence).catch(console.error);

const db = getFirestore(app);
const messaging = getMessaging(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, messaging, app, googleProvider };

export async function requestFCMToken(userId) {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: "clTBG2m0CxjIUFvMlcfmVTVmZSJKSRCl-kZJaJkb1Gk"
      });
      return token;
    }
  } catch(e) {
    console.log('FCM error:', e.message);
  }
  return null;
}

export function onMessageListener(callback) {
  return onMessage(messaging, (payload) => callback(payload));
}
