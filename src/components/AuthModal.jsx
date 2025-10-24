import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ open = false, onClose = () => {} }) {
  const { user, loginWithGoogle, loginWithGithub, loginWithEmail, registerWithEmail } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (open && user) {
      onClose();
    }
  }, [user, open, onClose]);

  const title = useMemo(() => (mode === "login" ? "Iniciar sesión" : "Crear cuenta"), [mode]);

  if (!open) return null;

  const handleEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (mode === "login") {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password, name.trim());
      }
    } catch (err) {
      const code = err?.code || "auth/error";
      let msg = "Ocurrió un error";
      if (code.includes("wrong-password")) msg = "Contraseña inválida";
      else if (code.includes("user-not-found")) msg = "No existe un usuario con ese email";
      else if (code.includes("email-already-in-use")) msg = "Ese email ya está registrado";
      else if (code.includes("popup-blocked")) msg = "El navegador bloqueó el popup. Permítelo o usa otro método.";
      else if (code.includes("popup-closed-by-user")) msg = "Popup cerrado antes de completar";
      else if (err?.message) msg = err.message;
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleProvider = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      const code = err?.code || "auth/error";
      let msg = "Ocurrió un error con el proveedor";
      if (code.includes("popup-blocked")) msg = "El navegador bloqueó el popup. Permite popups o reintenta.";
      else if (code.includes("account-exists-with-different-credential")) msg = "Tu email ya está vinculado a otro método. Inicia sesión con ese método.";
      else if (err?.message) msg = err.message;
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal-card">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">{title}</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="d-grid gap-2 mb-3">
          <button disabled={busy} className="btn btn-outline-dark" onClick={() => handleProvider(loginWithGoogle)}>
            {busy ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="fa-brands fa-google me-2" />
            )}
            Continuar con Google
          </button>
          <button disabled={busy} className="btn btn-outline-dark" onClick={() => handleProvider(loginWithGithub)}>
            {busy ? (
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ) : (
              <i className="fa-brands fa-github me-2" />
            )}
            Continuar con GitHub
          </button>
        </div>

        <div className="text-center text-muted small mb-2">o con email</div>

        <form onSubmit={handleEmail} className="d-grid gap-2">
          {mode === "register" && (
            <input
              type="text"
              className="form-control"
              placeholder="Nombre (opcional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          )}
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />
          <input
            type="password"
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            required
          />
          {error && <div className="text-danger small">{error}</div>}
          <button className="btn btn-primary d-inline-flex align-items-center" disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>}
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <div className="text-center mt-3">
          {mode === "login" ? (
            <button className="btn btn-link p-0" onClick={() => setMode("register")} disabled={busy}>
              ¿No tienes cuenta? Crear una
            </button>
          ) : (
            <button className="btn btn-link p-0" onClick={() => setMode("login")} disabled={busy}>
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
