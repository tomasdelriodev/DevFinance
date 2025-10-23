import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

export default function CategoryChart({ transactions = [] }) {
  console.log("Transacciones recibidas por CategoryChart:", transactions);

  if (!transactions.length) {
    return (
      <div className="text-center mt-5">
        <h4 className="text-muted">Aún no hay datos para mostrar el gráfico</h4>
      </div>
    );
  }

  const categoryTotals = transactions.reduce((acc, t) => {
    const key = t.category || "Sin categoría";
    acc[key] = (acc[key] || 0) + Math.abs(Number(t.amount));
    return acc;
  }, {});

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

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
  const bgColors = labels.map((_, i) => colors[i % colors.length]);

  const data = {
    labels,
    datasets: [
      {
        label: "Distribución por categoría ($)",
        data: values,
        backgroundColor: bgColors,
        borderColor: "white",
        borderWidth: 2,
      },
    ],
  };

  const options = {
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
  };

  console.log("Datos procesados para el gráfico:", data);

  return (
    <div className="mt-5 text-center reveal">
      <h4 className="fw-bold mb-4">Distribución por Categoría</h4>
      <div className="col-md-6 mx-auto" style={{ height: "400px", background: "#eee" }}>
        console.log("Datos finales enviados a Chart.js:", data);

        <Doughnut data={data} options={options} redraw />
      </div>
    </div>
  );
}
