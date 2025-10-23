import { useMemo, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import useReveal from "/MisProyectos/devfinance/src/hooks/useReveal";
ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function CategoryChart({ transactions = [] }) {
  const containerRef = useRef(null);
  useReveal(containerRef);
  const { data, hasValues } = useMemo(() => {
    if (!transactions.length) {
      return { data: null, hasValues: false };
    }
    const totals = transactions.reduce((acc, t) => {
      const key = t.category || "Sin categoría";
      acc[key] = (acc[key] || 0) + Math.abs(Number(t.amount));
      return acc;
    }, {});
    const labels = Object.keys(totals);
    const values = Object.values(totals);
    const colors = [
      "#198754",
      "#0d6efd",
      "#dc3545",
      "#ffc107",
      "#20c997",
      "#6f42c1",
      "#fd7e14",
      "#6610f2",
    ];
    const backgroundColor = labels.map((_, index) => colors[index % colors.length]);
    return {
      data: {
        labels,
        datasets: [
          {
            label: "Distribución por categoría ($)",
            data: values,
            backgroundColor,
            borderColor: "white",
            borderWidth: 2,
          },
        ],
      },
      hasValues: values.some((value) => value > 0),
    };
  }, [transactions]);
  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label}: $${context.parsed.toLocaleString("es-AR")}`,
          },
        },
      },
    }),
    []
  );
  if (!hasValues || !data) {
    return (
      <div className="text-center mt-5">
        <h4 className="text-muted">Aún no hay datos para mostrar el gráfico</h4>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mt-5 text-center reveal">
      <h4 className="fw-bold mb-4">Distribución por Categoría</h4>
        <div
        className="col-md-6 mx-auto"
        style={{ height: "400px", background: "#eee" }}
      >
        <Doughnut data={data} options={options} redraw />
      </div>
    </div>
  );
}