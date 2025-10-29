// Lazy Firebase loader to reduce initial bundle size
// Consumers call loadFirebase() to get initialized SDK modules on demand.

let cached = null;

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA7zFJkDthQT2PS9TykkT2ZPjiNX_q2TnU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devfinance-985ee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devfinance-985ee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devfinance-985ee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "729052048220",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:729052048220:web:a8b39aea0c543afd38af99",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-NMN06GB25K",
};

export async function loadFirebase() {
  if (cached) return cached;

  const { initializeApp } = await import("firebase/app");
  const app = initializeApp(firebaseConfig);

  const authModule = await import("firebase/auth");
  const firestoreModule = await import("firebase/firestore");
  let analytics = null;
  try {
    const { getAnalytics } = await import("firebase/analytics");
    if (typeof window !== "undefined" && firebaseConfig.measurementId) {
      analytics = getAnalytics(app);
    }
  } catch {}

  const auth = authModule.getAuth(app);
  const googleProvider = new authModule.GoogleAuthProvider();
  const githubProvider = new authModule.GithubAuthProvider();

  const db = firestoreModule.getFirestore(app);
  try {
    await firestoreModule.enableIndexedDbPersistence(db);
  } catch {}

  cached = { app, auth, googleProvider, githubProvider, db, analytics, authModule, firestoreModule };
  return cached;
}
