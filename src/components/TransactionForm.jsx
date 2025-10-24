import { useState } from "react";

export default function TransactionForm({addTransaction}){
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("income");
    const [category, setCategory] = useState("General");

    const handleSubmit = (e) => {
        e.preventDefault();
         if (!desc || !amount) return;
         const now = new Date();
         const dateOnly = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
         const newTransaction = {
            id: Date.now(),
            desc,
            amount: type === "income" ? parseFloat(amount) : -parseFloat(amount),
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
        <form onSubmit={handleSubmit} className="d-flex gap-2 justify-content-center mb-4">
             <input type="text" className="form-control w-25" placeholder="Descripción" aria-label="Descripción" value={desc} onChange={(e) => setDesc(e.target.value)} />
             <input type="number" className="form-control w-25" placeholder="Monto" aria-label="Monto" inputMode="decimal" step="0.01" value={amount} onChange={(e)=> setAmount(e.target.value)}/>
             <select className="form-select w-25" value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo">
                 <option value="income">Ingreso</option>
                 <option value="expense">Gasto</option>
             </select>
             <select className="form-select w-25" value={category} onChange={(e)=>setCategory(e.target.value)} aria-label="Categoría">
                <option value="General">General</option>
                <option value="Sueldo">Sueldo</option>
                <option value="Comida">Comida</option>
                <option value="Transporte">Transporte</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Salud">Salud</option>
                <option value="Educacion">Educacion</option>
             </select>
             <button className="btn btn-primary">Agregar</button>
        </form>
    );
  }
