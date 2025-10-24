// Firebase initialization and shared exports
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, GithubAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

// Preferir variables de entorno; usar tu config como fallback inmediato
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7zFJkDthQT2PS9TykkT2ZPjiNX_q2TnU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devfinance-985ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devfinance-985ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devfinance-985ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729052048220",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729052048220:web:a8b39aea0c543afd38af99",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NMN06GB25K",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
// Apple provider (needs Apple developer setup in Firebase Console)
export const appleProvider = new OAuthProvider("apple.com");

export const db = getFirestore(app);

// Optional: offline persistence
enableIndexedDbPersistence(db).catch(() => {
  // Ignored: could be multiple tabs open or unsupported browser
});

// Optional: Analytics (solo en navegador/https soportado)
export let analytics = null;
try {
  if (typeof window !== "undefined" && firebaseConfig.measurementId) {
    analytics = getAnalytics(app);
  }
} catch (_) {
  // Ignorar fallas en desarrollo no https
}
