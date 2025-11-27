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

        <main className="flex-1 md:ml-[260px] px-4 md:px-6 w-full">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-[#DC143C] to-[#B71C1C] rounded-full"></div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Tableau de Bord</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Vue d'ensemble des matériels électoraux de la CENI</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <Card className="border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Expéditions</div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{total}</div>
                  <div className="text-xs text-gray-500">Documents actifs</div>
                </div>
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">📦</span>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reçus</div>
                  <div className="text-4xl font-bold text-green-600 mb-1">{received}</div>
                  <div className="text-xs text-gray-500">Matériels livrés</div>
                </div>
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">✅</span>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">En Transit</div>
                  <div className="text-4xl font-bold text-orange-600 mb-1">{inTransit}</div>
                  <div className="text-xs text-gray-500">En cours d'acheminement</div>
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">🚚</span>
                </div>
              </div>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Problèmes</div>
                  <div className="text-4xl font-bold text-red-600 mb-1">{damaged + lost}</div>
                  <div className="text-xs text-gray-500">Perdu / Endommagé</div>
                </div>
                <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card title="Statistiques des Expéditions">
                {/* DashboardChart is a client component */}
                {/* @ts-ignore */}
                <DashboardChart counts={counts} />
              </Card>
            </div>

            <div>
              <Card title="Expéditions Récentes">
                {recent.length === 0 ? (
                  <div className="text-center text-gray-400 py-12">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="text-sm font-medium">Aucune expédition récente</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recent.map((r) => (
                      <li key={r.id} className="flex justify-between items-start p-4 hover:bg-gray-50 rounded-lg transition-all border border-transparent hover:border-gray-200">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-gray-900 mb-1">EXP-{r.id}</div>
                          <div className="text-xs text-gray-600 truncate mb-2">{r.design || "Sans désignation"}</div>
                          <div className="inline-block px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                            {statusLabel(r.status)}
                          </div>
                        </div>
                        <Link 
                          href={`/materiel/${r.id}`} 
                          className="ml-4 text-[#DC143C] hover:text-[#B71C1C] font-semibold text-sm transition-colors flex items-center gap-1"
                        >
                          Voir <span>→</span>
                        </Link>
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



