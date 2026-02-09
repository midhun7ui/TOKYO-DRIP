import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAMU88flDPI1OsYPg0GxNk3FPswxG3mSeg",
  authDomain: "e-commerce-2644f.firebaseapp.com",
  projectId: "e-commerce-2644f",
  storageBucket: "e-commerce-2644f.firebasestorage.app",
  messagingSenderId: "43781880716",
  appId: "1:43781880716:web:220e9e4be9ab0ee356b4a9",
  measurementId: "G-908W7KZSDM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { app, auth, db, storage, analytics };
