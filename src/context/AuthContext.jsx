import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadFirebase } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fb, setFb] = useState(null);

  useEffect(() => {
    let off = null;
    (async () => {
      const loaded = await loadFirebase();
      setFb(loaded);
      const { onAuthStateChanged, getRedirectResult } = loaded.authModule;
      off = onAuthStateChanged(loaded.auth, (u) => {
        setUser(u);
        setLoading(false);
      });
      getRedirectResult(loaded.auth).catch(() => {});
    })();
    return () => { if (off) try { off(); } catch {} };
  }, []);

  const loginWithProvider = async (provider) => {
    if (!fb) throw new Error("Firebase no cargado");
    const { signInWithPopup, signInWithRedirect } = fb.authModule;
    try {
      return await signInWithPopup(fb.auth, provider);
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("popup-blocked")) {
        return signInWithRedirect(fb.auth, provider);
      }
      throw err;
    }
  };

  const loginWithGoogle = () => loginWithProvider(fb?.googleProvider);
  const loginWithGithub = () => loginWithProvider(fb?.githubProvider);
  const loginWithEmail = async (email, password) => {
    if (!fb) throw new Error("Firebase no cargado");
    const { signInWithEmailAndPassword } = fb.authModule;
    return signInWithEmailAndPassword(fb.auth, email, password);
  };
  const registerWithEmail = async (email, password, displayName) => {
    if (!fb) throw new Error("Firebase no cargado");
    const { createUserWithEmailAndPassword, updateProfile } = fb.authModule;
    const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  };
  const logout = async () => {
    if (!fb) return;
    const { signOut } = fb.authModule;
    return signOut(fb.auth);
  };

  const value = useMemo(
    () => ({ user, loading, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

