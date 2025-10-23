import { useState, useEffect } from "react";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceChart from "./components/BalanceChart";
import CategoryChart from "./components/CategoryChart";

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="container py-4">
      <Header />
      <TransactionForm addTransaction={addTransaction} />
      <TransactionTable
        transactions={transactions}
        deleteTransaction={deleteTransaction}
      />
      <BalanceChart transactions={transactions} />
      <CategoryChart transactions={transactions}/>
    </div>
  );
}
