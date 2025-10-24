import { useState, useEffect, useMemo } from "react";
import Header from "./components/Header";
import TransactionForm from "./components/TransactionForm";
import TransactionTable from "./components/TransactionTable";
import BalanceChart from "./components/BalanceChart";
import CategoryChart from "./components/CategoryChart";
import { useAuth } from "./context/AuthContext";
import { db } from "./lib/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function App() {
  const { user } = useAuth();
  // Normaliza una transacción proveniente de localStorage o versiones viejas
  const normalizeTransaction = (raw) => {
    const now = new Date();
    const safe = raw && typeof raw === "object" ? raw : {};
    const id = Number(safe.id) || Date.now();
    const desc = typeof safe.desc === "string" ? safe.desc : "";
    let amount = Number(safe.amount);
    if (!isFinite(amount)) amount = 0;
    let type = safe.type === "expense" ? "expense" : "income";
    if (type === "income" && amount < 0) amount = Math.abs(amount);
    if (type === "expense" && amount > 0) amount = -Math.abs(amount);
    const category = typeof safe.category === "string" && safe.category ? safe.category : "General";

    let date = typeof safe.date === "string" ? safe.date : null;
    let dateOnly = typeof safe.dateOnly === "string" ? safe.dateOnly : null;
    if (!date && dateOnly) {
      const d = new Date(`${dateOnly}T00:00:00`);
      if (!isNaN(d)) date = d.toISOString();
    }
    if (!dateOnly && date) {
      const d = new Date(date);
      if (!isNaN(d)) {
        dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
    }
    if (!date && !dateOnly) {
      const d = now;
      date = d.toISOString();
      dateOnly = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    return { id, desc, amount, type, category, date, dateOnly };
  };

  const loadTransactions = () => {
    try {
      const saved = localStorage.getItem("transactions");
      const arr = saved ? JSON.parse(saved) : [];
      if (!Array.isArray(arr)) return [];
      return arr.map(normalizeTransaction);
    } catch (_e) {
      return [];
    }
  };
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const [transactions, setTransactions] = useState(loadTransactions);
  const [unsub, setUnsub] = useState(null);

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

  // Migración defensiva: al montar, normaliza y guarda si detecta diferencias
  useEffect(() => {
    const current = loadTransactions();
    // Si difiere en longitud o algún campo clave, reescribe el storage
    const differs = current.length !== transactions.length || current.some((c, i) => {
      const t = transactions[i];
      return !t || c.id !== t.id || c.dateOnly !== t.dateOnly || c.amount !== t.amount;
    });
    if (differs) {
      setTransactions(current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    // Exponer data-theme para estilos basados en atributo
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // Cloud sync when logged in
  useEffect(() => {
    // Cleanup previous subscription
    if (unsub) {
      try { unsub(); } catch {}
      setUnsub(null);
    }
    if (!user) {
      // Back to local-only
      setTransactions(loadTransactions());
      return;
    }
    const colRef = collection(db, "users", user.uid, "transactions");
    (async () => {
      try {
        // Migrate local -> cloud if remote empty
        const snap = await getDocs(colRef);
        const local = loadTransactions();
        if (snap.empty && local.length) {
          await Promise.all(
            local.map((raw) => {
              const t = normalizeTransaction(raw);
              const ref = doc(colRef, String(t.id));
              return setDoc(ref, {
                ...t,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            })
          );
        }
      } catch {}
      // Subscribe to remote changes ordered by date (ISO string)
      const q = query(colRef, orderBy("date", "desc"));
      const off = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => normalizeTransaction({ id: d.id, ...d.data() }));
        setTransactions(list);
      });
      setUnsub(() => off);
    })();
    // Cleanup on unmount or user change
    return () => {
      if (unsub) {
        try { unsub(); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addTransaction = async (transaction) => {
    const t = normalizeTransaction(transaction);
    if (user) {
      const colRef = collection(db, "users", user.uid, "transactions");
      const ref = doc(colRef, String(t.id));
      await setDoc(ref, { ...t, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } else {
      setTransactions([t, ...transactions]);
    }
  };

  const deleteTransaction = async (id) => {
    if (user) {
      const ref = doc(db, "users", user.uid, "transactions", String(id));
      await deleteDoc(ref).catch(() => {});
    } else {
      setTransactions(transactions.filter((t) => t.id !== id));
    }
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
