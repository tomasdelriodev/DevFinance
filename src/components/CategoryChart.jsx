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

export default function CategoryChart({ transactions = [], startDate = "", endDate = "" }) {
  const containerRef = useRef(null);
  useReveal(containerRef);

  // Colores fijos por categoría (Sueldo siempre verde)
  const CATEGORY_COLORS = {
    Sueldo: "#198754",
    General: "#6c757d",
    Comida: "#fd7e14",
    Transporte: "#0d6efd",
    Entretenimiento: "#6610f2",
    Salud: "#20c997",
    Educacion: "#ffc107",
  };
  const FALLBACKS = ["#0dcaf0", "#6f42c1", "#dc3545", "#198754", "#fd7e14", "#0d6efd"];

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
    const backgroundColor = labels.map(
      (label, index) => CATEGORY_COLORS[label] || FALLBACKS[index % FALLBACKS.length]
    );

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
      maintainAspectRatio: false,
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

  const filterLabel = useMemo(() => {
    if (!startDate && !endDate) return "";
    const fmt = (s) => (s ? new Intl.DateTimeFormat("es-AR").format(new Date(s + "T00:00:00")) : "");
    const from = fmt(startDate);
    const to = fmt(endDate);
    return `Filtrado: ${from || 'inicio'} — ${to || 'hoy'}`;
  }, [startDate, endDate]);

  return (
    <div id="category-chart" ref={containerRef} className="mt-5 text-center reveal">
      <h4 className="fw-bold mb-2">Distribución por Categoría</h4>
      {filterLabel && (
        <div className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>{filterLabel}</div>
      )}
      <div
        className="col-md-6 mx-auto chart-card"
        style={{ height: "400px", width: "100%", maxWidth: "600px", background: "var(--card-bg)", position: "relative" }}
      >
        <Doughnut data={data} options={options} redraw />
      </div>
    </div>
  );
}
