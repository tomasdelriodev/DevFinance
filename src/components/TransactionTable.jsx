export default function TransactionTable({ transactions = [], deleteTransaction }) {
  const balance = transactions.reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);

  return (
    <div className="mb-5">
      <h3 className="fw-bold">Balance Total: {formatCurrency(balance)}</h3>

      {/* ✅ la tabla completa está dentro del div */}
      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Categoría</th>
            <th>Monto</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td>{t.desc}</td>
              <td>
                {t.type === "income" ? (
                  <span className="badge bg-success">Ingreso</span>
                ) : (
                  <span className="badge bg-danger">Gasto</span>
                )}
              </td>
              <td>{t.category}</td>
              <td
                className={t.amount >= 0 ? "text-success fw-bold" : "text-danger fw-bold"}
              >
                {formatCurrency(t.amount)}
              </td>
              <td>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
