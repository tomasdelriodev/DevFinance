import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  auth,
  googleProvider,
  githubProvider,
  appleProvider,
} from "../lib/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    // Captura resultado de redirect si ocurrió (no rompe si no hubo)
    getRedirectResult(auth).catch(() => {});
    return () => unsub();
  }, []);

  const loginWithProvider = async (provider) => {
    try {
      return await signInWithPopup(auth, provider);
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("popup-blocked")) {
        // Fallback a redirect cuando el popup está bloqueado
        return signInWithRedirect(auth, provider);
      }
      throw err;
    }
  };

  const loginWithGoogle = () => loginWithProvider(googleProvider);
  const loginWithGithub = () => loginWithProvider(githubProvider);
  const loginWithApple = () => signInWithPopup(auth, appleProvider);

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  const registerWithEmail = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  };
  const logout = () => signOut(auth);

  const value = useMemo(
    () => ({ user, loading, loginWithGoogle, loginWithGithub, loginWithApple, loginWithEmail, registerWithEmail, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
