"use client";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Counts = {
  received: number;
  damaged: number;
  inTransit: number;
  lost: number;
};

const DashboardChart: React.FC<{ counts: Counts }> = ({ counts }) => {
  const labels = ["Reçus", "Endommagé", "En transit", "Perdu"];

  const data = {
    labels,
    datasets: [
      {
        label: "Nombre",
        data: [counts.received, counts.damaged, counts.inTransit, counts.lost],
        backgroundColor: [
          "rgba(34,197,94,0.9)", // green for received
          "rgba(14,165,233,0.9)", // blue-ish for damaged
          "rgba(250,204,21,0.9)", // yellow for in transit
          "rgba(239,68,68,0.9)", // red for lost
        ],
        borderColor: [
          "rgba(34,197,94,1)",
          "rgba(14,165,233,1)",
          "rgba(250,204,21,1)",
          "rgba(239,68,68,1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Statut des matériels" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="h-72 bg-base-200 p-4 rounded-xl shadow">
      <Bar data={data} options={options} />
    </div>
  );
};

export default DashboardChart;
