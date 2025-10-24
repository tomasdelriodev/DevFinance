import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceChart from "./components/BalanceChart";
import CategoryChart from "./components/CategoryChart";

export default function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // Filtros de fecha elevados para sincronizar tabla y gráficos
  const [startDate, setStartDate] = useState(""); // formato YYYY-MM-DD
  const [endDate, setEndDate] = useState("");   // formato YYYY-MM-DD

  // Normalizar si el usuario elige el rango al revés (intercambiar)
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setStartDate(endDate);
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const filteredTransactions = useMemo(() => {
    if (!startDate && !endDate) return transactions;
    const inRange = (t) => {
      // preferir t.dateOnly; derivar de t.date si no existe
      const base = t.dateOnly || (t.date ? new Date(t.date) : null);
      let key;
      if (typeof base === "string") {
        key = base; // ya es YYYY-MM-DD
      } else if (base instanceof Date && !isNaN(base)) {
        const d = base;
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      } else {
        return false; // si hay filtros y no tiene fecha interpretable, excluir
      }
      if (startDate && key < startDate) return false;
      if (endDate && key > endDate) return false;
      return true;
    };
    return transactions.filter(inRange);
  }, [transactions, startDate, endDate]);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    // Exponer data-theme para estilos basados en atributo
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="container py-4">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <TransactionForm addTransaction={addTransaction} />
      <TransactionTable
        transactions={transactions}
        filteredTransactions={filteredTransactions}
        startDate={startDate}
        endDate={endDate}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        deleteTransaction={deleteTransaction}
      />
      <BalanceChart transactions={filteredTransactions} startDate={startDate} endDate={endDate} />
      <CategoryChart transactions={filteredTransactions} startDate={startDate} endDate={endDate} />
    </div>
  );
}
