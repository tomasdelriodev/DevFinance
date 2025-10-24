import { useState } from "react";
import { CATEGORIES } from "../utils/categories";

export default function TransactionForm({ addTransaction }) {
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("General");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!desc || !amount) return;
    const now = new Date();
    const dateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const normalizedAmountStr = String(amount).replace(",", ".");
    const parsed = parseFloat(normalizedAmountStr);
    if (!Number.isFinite(parsed)) return;
    const newTransaction = {
      id: Date.now(),
      desc,
      amount: type === "income" ? parsed : -Math.abs(parsed),
      type,
      category,
      date: now.toISOString(),
      dateOnly,
    };
    addTransaction(newTransaction);
    setDesc("");
    setAmount("");
    setType("income");
    setCategory("General");
  };

  return (
    <form onSubmit={handleSubmit} className="row g-2 align-items-end justify-content-center mb-4">
      <div className="col-12 col-sm-6 col-md-3">
        <label className="form-label mb-1">Descripción</label>
        <div className="input-group">
          <span className="input-group-text"><i className="fa-solid fa-pen" /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Sueldo de octubre"
            aria-label="Descripción"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="col-12 col-sm-6 col-md-2">
        <label className="form-label mb-1">Monto</label>
        <div className="input-group">
          <span className="input-group-text"><i className="fa-solid fa-dollar-sign" /></span>
          <input
            type="text"
            className="form-control"
            placeholder="0,00"
            aria-label="Monto"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="col-6 col-md-2">
        <label className="form-label mb-1">Tipo</label>
        <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
          <option value="income">Ingreso</option>
          <option value="expense">Gasto</option>
        </select>
      </div>

      <div className="col-6 col-md-3">
        <label className="form-label mb-1">Categoría</label>
        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Categoría">
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-2 d-grid">
        <button className="btn btn-primary">Agregar</button>
      </div>
    </form>
  );
}

