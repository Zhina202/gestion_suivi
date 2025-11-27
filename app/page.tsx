import React from "react";
import prisma from "./lib/prisma";
import DashboardChart from "./components/DashboardChart";
import Sidebar from "./components/Sidebar";
import Card from "./components/Card";
import Wrapper from "./components/Wrapper";
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
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-60 px-4 md:px-6">
          <div className="mb-4 md:mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Vue d'ensemble des matériels électoraux</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Total documents</div>
                  <div className="text-3xl font-bold">{total}</div>
                </div>
                <div className="text-4xl opacity-20">📄</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Reçus</div>
                  <div className="text-3xl font-bold text-green-600">{received}</div>
                </div>
                <div className="text-4xl opacity-20">✅</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">En transit</div>
                  <div className="text-3xl font-bold text-orange-600">{inTransit}</div>
                </div>
                <div className="text-4xl opacity-20">🚚</div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Perdu / Endommagé</div>
                  <div className="text-3xl font-bold text-red-600">{damaged + lost}</div>
                </div>
                <div className="text-4xl opacity-20">⚠️</div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Card>
                <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                {/* DashboardChart is a client component */}
                {/* @ts-ignore */}
                <DashboardChart counts={counts} />
              </Card>
            </div>

            <div>
              <Card>
                <h3 className="text-lg font-semibold mb-4">Matériels récents</h3>
                {recent.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">Aucun matériel récent</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {recent.map((r) => (
                      <li key={r.id} className="flex justify-between items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold text-sm">MATRI-{r.id}</div>
                          <div className="text-xs text-gray-500 mt-1">{r.design || "—"}</div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xs font-medium mb-1">{statusLabel(r.status)}</div>
                          <Link 
                            href={`/materiel/${r.id}`} 
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Voir →
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Wrapper>
  );
}



