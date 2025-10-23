import { useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useReveal from "/MisProyectos/devfinance/src/hooks/useReveal";
ChartJS.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

export default function BalanceChart({ transactions = [] }) {
  const containerRef = useRef(null);
  useReveal(containerRef);

  // Calcular ingresos y gastos
  const incomes = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + Number(t.amount), 0);

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + Math.abs(Number(t.amount)), 0);

  const data = useMemo(
    () => ({
      labels: ["Ingresos", "Gastos"],
      datasets: [
        {
          label: "Monto total ($)",
          data: [incomes, expenses],
          backgroundColor: ["#198754", "#dc3545"],
        },
      ],
    }),
    [incomes, expenses]
  );
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Resumen Financiero" },
      },
    }),
    []
  );

  return (
    <div ref={containerRef} className="mt-5 text-center reveal">
      <h4 className="fw-bold mb-4">Resumen Financiero</h4>
      <div
        className="col-md-6 mx-auto"
        style={{
          height: "400px",
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#f8f9fa",
          position: "relative",
        }}
      >
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}