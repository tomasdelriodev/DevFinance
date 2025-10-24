import { useMemo, useState, useEffect } from "react";

export default function TransactionTable({
  transactions = [],
  filteredTransactions = [],
  startDate = "",
  endDate = "",
  setStartDate,
  setEndDate,
  deleteTransaction,
}) {
  const INITIAL_LIMIT = 10;
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [sortOrder, setSortOrder] = useState("desc"); // desc: más reciente, asc: más antiguo
  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  const { rows, totalBalance, filteredBalance } = useMemo(() => {
    const parseAnyDate = (t) => {
      // Priorizar fecha con hora si existe
      if (t.date) {
        const d = new Date(t.date);
        if (!isNaN(d)) return d;
      }
      // Luego fecha sin hora (medianoche local)
      if (t.dateOnly) return new Date(t.dateOnly + "T00:00:00");
      // Último recurso: id como timestamp si es numérico
      if (t.id && !isNaN(Number(t.id))) return new Date(Number(t.id));
      return null;
    };
    const withParsed = filteredTransactions.map((t) => ({ ...t, _date: parseAnyDate(t) }));
    withParsed.sort((a, b) => {
      const ta = a._date ? a._date.getTime() : -Infinity;
      const tb = b._date ? b._date.getTime() : -Infinity;
      return sortOrder === "desc" ? tb - ta : ta - tb;
    });
    const totalBal = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    const filteredBal = withParsed.reduce((acc, t) => acc + Number(t.amount || 0), 0);
    return { rows: withParsed, totalBalance: totalBal, filteredBalance: filteredBal };
  }, [transactions, filteredTransactions, sortOrder]);

  // Resetear el límite cuando cambian los filtros de fecha
  useEffect(() => {
    setLimit(INITIAL_LIMIT);
  }, [startDate, endDate, sortOrder]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
  const formatDate = (value) => {
    const d = parseDate(value);
    if (!d) return "—";
    return new Intl.DateTimeFormat("es-AR").format(d);
  };

  const clearFilters = () => {
    setStartDate && setStartDate("");
    setEndDate && setEndDate("");
  };
  const filtersActive = !!(startDate || endDate);

  return (
    <div className="mb-5">
      <div className="d-flex flex-wrap align-items-end gap-2">
        <h3 className="fw-bold m-0">Balance Total: {formatCurrency(totalBalance)}</h3>
        {filtersActive && (
          <span className="text-muted">Balance filtrado: {formatCurrency(filteredBalance)}</span>
        )}
      </div>

      <div className="row g-2 mt-3">
        <div className="col-12 col-md-3">
          <label className="form-label">Desde</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate && setStartDate(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Hasta</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate && setEndDate(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label">Orden</label>
          <select className="form-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Más reciente</option>
            <option value="asc">Más antiguo</option>
          </select>
        </div>
        <div className="col-12 col-md-3 d-flex align-items-end">
          <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p className="mb-2">{filtersActive ? "No hay transacciones en el rango seleccionado." : "Aún no hay transacciones."}</p>
          {!filtersActive && <p className="mb-0">Agrega tu primera transacción para comenzar.</p>}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped mt-3 table-stacked">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th className="text-end">Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
          {rows.slice(0, limit).map((t) => (
            <tr key={t.id} className={t.type === "income" ? "card-income" : "card-expense"}>
              <td data-label="Fecha">{formatDate(t.dateOnly || t.date)}</td>
              <td data-label="Descripción">{t.desc}</td>
              <td data-label="Tipo" className="only-desktop">
                {t.type === "income" ? (
                  <span className="badge bg-success">Ingreso</span>
                ) : (
                  <span className="badge bg-danger">Gasto</span>
                )}
              </td>
              <td data-label="Categoría" className="only-desktop">{t.category}</td>
              <td data-label="Detalle" className="only-mobile">
                {t.type === "income" ? (
                  <span className="badge bg-success me-2">Ingreso</span>
                ) : (
                  <span className="badge bg-danger me-2">Gasto</span>
                )}
                <span>{t.category}</span>
              </td>
              <td data-label="Monto" className={`text-end ${t.amount >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}`}>
                {formatCurrency(t.amount)}
              </td>
              <td className="text-end actions">
                <button
                  onClick={() => {
                    if (window.confirm("¿Eliminar transacción?")) deleteTransaction(t.id);
                  }}
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 0 && (
            <div className="d-flex gap-2 justify-content-center mt-2">
              {rows.length > limit && (
                <button className="btn btn-outline-primary btn-sm" onClick={() => setLimit((l) => l + INITIAL_LIMIT)}>
                  Mostrar más
                </button>
              )}
              {rows.length > limit && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setLimit(rows.length)}>
                  Mostrar todo
                </button>
              )}
              {limit > INITIAL_LIMIT && (
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setLimit(INITIAL_LIMIT)}>
                  Mostrar menos
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
