import { useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../utils/categories";

export default function EditTransactionModal({ open = false, transaction = null, onClose = () => {}, onSave = () => {} }) {
  const CAT_OPTIONS = useMemo(() => CATEGORIES, []);

  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [category, setCategory] = useState("General");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !transaction) return;
    setError("");
    setDesc(transaction.desc ?? "");
    const abs = Math.abs(Number(transaction.amount) || 0);
    setAmount(String(abs));
    setType(transaction.type === "expense" ? "expense" : "income");
    setCategory(transaction.category || "General");
  }, [open, transaction]);

  if (!open || !transaction) return null;

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!desc.trim()) {
      setError("La descripción es obligatoria");
      return;
    }
    const parsed = parseFloat(String(amount).replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Monto inválido");
      return;
    }
    const signed = type === "income" ? Math.abs(parsed) : -Math.abs(parsed);
    onSave({
      ...transaction,
      desc: desc.trim(),
      amount: signed,
      type,
      category,
    });
  };

  return (
    <div className="auth-modal-backdrop" role="dialog" aria-modal="true">
      <div className="auth-modal-card" style={{ width: "min(520px, 94vw)" }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="m-0">Editar transacción</h5>
          <button className="btn btn-sm btn-outline-secondary" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <form onSubmit={submit} className="row g-2">
          <div className="col-12">
            <label className="form-label mb-1">Descripción</label>
            <input
              type="text"
              className="form-control"
              placeholder="Descripción"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>

          <div className="col-12 col-sm-6">
            <label className="form-label mb-1">Monto</label>
            <input
              type="text"
              inputMode="decimal"
              className="form-control"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="col-6 col-sm-3">
            <label className="form-label mb-1">Tipo</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>

          <div className="col-6 col-sm-3">
            <label className="form-label mb-1">Categoría</label>
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CAT_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {error && <div className="col-12 text-danger small">{error}</div>}

          <div className="col-12 d-flex gap-2 justify-content-end mt-2">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" type="submit">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
