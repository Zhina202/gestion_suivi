import React from "react";
import prisma from "./lib/prisma";
import DashboardChart from "./components/DashboardChart";
import Sidebar from "./components/Sidebar";
import Card from "./components/Card";
import Link from "next/link";

const statusLabel = (s: number) => {
  switch (s) {
    case 1:
      return "Brouillon";
    case 2:
      return "En transit";
    case 3:
      return "Reçu";
    case 4:
      return "Endommagé";
    case 5:
      return "Perdu";
    default:
      return "Indéfini";
  }
};

export default async function Home() {
  // counts by status
  const [received, damaged, inTransit, lost, total] = await Promise.all([
    prisma.materielPdf.count({ where: { status: 3 } }),
    prisma.materielPdf.count({ where: { status: 4 } }),
    prisma.materielPdf.count({ where: { status: 2 } }),
    prisma.materielPdf.count({ where: { status: 5 } }),
    prisma.materielPdf.count(),
  ]);

  const recent = await prisma.materielPdf.findMany({
    orderBy: { date_depart: "desc" },
    take: 6,
    select: { id: true, design: true, status: true, date_depart: true },
  });

  const counts = { received, damaged, inTransit, lost };

  return (
    <div className="w-full py-6 bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="hidden md:block md:col-span-1">
          <Sidebar />
        </div>

  <main className="col-span-1 md:col-span-5 px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-500 mt-1">Vue d'ensemble professionnelle des matériels</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-gray-500">Total docs</div>
              <div className="text-2xl font-bold">{total}</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Reçus</div>
              <div className="text-2xl font-bold text-green-600">{received}</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">En transit</div>
              <div className="text-2xl font-bold text-yellow-500">{inTransit}</div>
            </Card>
            <Card>
              <div className="text-sm text-gray-500">Perdu / Endommagé</div>
              <div className="text-2xl font-bold text-red-600">{damaged + lost}</div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                {/* DashboardChart is a client component */}
                {/* @ts-ignore */}
                <DashboardChart counts={counts} />
              </Card>
            </div>

            <div>
              <Card>
                <h3 className="font-semibold mb-2">Récents</h3>
                <ul className="space-y-2">
                  {recent.map((r) => (
                    <li key={r.id} className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">MATRI-{r.id}</div>
                        <div className="text-xs text-gray-500">{r.design || "—"}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">{statusLabel(r.status)}</div>
                        <Link href={`/materiel/${r.id}`} className="text-xs text-accent">Ouvrir</Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



