import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
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
    return () => { if (off) try { off(); } catch { /* ignore unsubscribe errors */ } };
  }, []);

  const loginWithProvider = useCallback(async (provider) => {
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
  }, [fb]);

  const loginWithGoogle = useCallback(() => loginWithProvider(fb?.googleProvider), [loginWithProvider, fb]);
  const loginWithGithub = useCallback(() => loginWithProvider(fb?.githubProvider), [loginWithProvider, fb]);
  const loginWithEmail = useCallback(async (email, password) => {
    if (!fb) throw new Error("Firebase no cargado");
    const { signInWithEmailAndPassword } = fb.authModule;
    return signInWithEmailAndPassword(fb.auth, email, password);
  }, [fb]);
  const registerWithEmail = useCallback(async (email, password, displayName) => {
    if (!fb) throw new Error("Firebase no cargado");
    const { createUserWithEmailAndPassword, updateProfile } = fb.authModule;
    const cred = await createUserWithEmailAndPassword(fb.auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });
    return cred;
  }, [fb]);
  const logout = useCallback(async () => {
    if (!fb) return;
    const { signOut } = fb.authModule;
    return signOut(fb.auth);
  }, [fb]);

  const value = useMemo(
    () => ({ user, loading, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, logout }),
    [user, loading, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
