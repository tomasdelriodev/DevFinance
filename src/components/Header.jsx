export default function Header({ theme = "light", onToggleTheme }) {
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
      </div>
    </header>
  );
}
