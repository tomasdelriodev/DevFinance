import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";

export default function Header({ theme = "light", onToggleTheme, localMode = false }) {
  const { user, loginWithGoogle, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [keepLocal, setKeepLocal] = useState(() => localStorage.getItem("keepLocalCache") === "true");
  const [avatarOk, setAvatarOk] = useState(true);

  useEffect(() => {
    localStorage.setItem("keepLocalCache", keepLocal ? "true" : "false");
  }, [keepLocal]);

  useEffect(() => {
    // Reset fallback when photoURL changes
    setAvatarOk(true);
  }, [user?.photoURL]);
  return (
    <header className="mb-5">
      <div className="container d-flex align-items-center">
        <h1 className="fw-bold m-0 brand">DevFinance</h1>
        <div className="ms-auto d-flex align-items-center gap-2">
          <nav className="chart-nav d-none d-sm-flex gap-2">
            <a href="#balance-chart" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1">
              <i className="fa-solid fa-chart-column me-1" aria-hidden="true" />
              Balance
            </a>
            <a href="#category-chart" className="btn btn-outline-secondary btn-sm rounded-pill px-3 py-1">
              <i className="fa-solid fa-chart-pie me-1" aria-hidden="true" />
              Categorías
            </a>
          </nav>
          <nav className="chart-nav d-flex d-sm-none gap-2">
            <a
              href="#balance-chart"
              className="btn btn-outline-secondary btn-sm rounded-pill px-2 py-1"
              aria-label="Ir al gráfico de balance"
              title="Balance"
            >
              <i className="fa-solid fa-chart-column" aria-hidden="true" />
            </a>
            <a
              href="#category-chart"
              className="btn btn-outline-secondary btn-sm rounded-pill px-2 py-1"
              aria-label="Ir al gráfico por categorías"
              title="Categorías"
            >
              <i className="fa-solid fa-chart-pie" aria-hidden="true" />
            </a>
          </nav>
          {!user ? (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowAuth(true)}
              title="Iniciar sesión"
            >
              Entrar
            </button>
          ) : (
            <div className="d-flex align-items-center gap-2">
              {user.photoURL && avatarOk ? (
                <img
                  src={user.photoURL}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarOk(false)}
                  style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <i className="fa-regular fa-circle-user" />
              )}
              <span className="d-none d-sm-inline">{user.displayName || user.email}</span>
              <div className="form-check form-switch m-0 d-none d-md-flex align-items-center">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="keepLocalCacheSwitch"
                  checked={keepLocal}
                  onChange={(e) => setKeepLocal(e.target.checked)}
                  title="Mantener datos locales al cerrar sesión"
                />
                <label className="form-check-label small ms-1" htmlFor="keepLocalCacheSwitch">
                  Mantener datos locales
                </label>
              </div>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={logout} title="Cerrar sesión">
                Salir
              </button>
            </div>
          )}
          <button
            type="button"
            className="btn btn-primary icon-btn"
            aria-label="Cambiar modo de color"
            title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={onToggleTheme}
          >
            <i className={`fa-solid ${theme === "dark" ? "fa-sun" : "fa-moon"}`} aria-hidden="true" />
          </button>
        </div>
        {!user && localMode && (
          <div className="mt-2 text-end">
            <span className="badge bg-secondary">Sin sesión (local)</span>
          </div>
        )}
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    </header>
  );
}
