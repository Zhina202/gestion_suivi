"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Tag, Input, message } from "antd";
import { Search, History } from "lucide-react";
import { getAllMouvements } from "../actions";
import { Mouvement, MouvementType } from "@/type";
import Link from "next/link";

const getMouvementTypeBadge = (type: MouvementType) => {
  const typeMap: Record<MouvementType, { color: string; label: string }> = {
    CREATION: { color: "green", label: "Création" },
    ENVOI: { color: "blue", label: "Envoi" },
    RECEPTION: { color: "cyan", label: "Réception" },
    DISTRIBUTION: { color: "purple", label: "Distribution" },
    RETOUR: { color: "orange", label: "Retour" },
    CHANGEMENT_STATUT: { color: "volcano", label: "Changement de statut" },
    CORRECTION: { color: "default", label: "Correction" },
  };
  const typeInfo = typeMap[type] || typeMap.CREATION;
  return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
};

const formatDate = (date: string | Date) => {
  try {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
};

export default function MouvementsPage() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchMouvements = async () => {
    try {
      setLoading(true);
      const data = await getAllMouvements();
      setMouvements(data as Mouvement[]);
    } catch (error) {
      console.error("Erreur lors du chargement des mouvements:", error);
      message.error("Erreur lors du chargement des mouvements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMouvements();
  }, []);

  const filteredMouvements = mouvements.filter((mouvement) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      mouvement.expedition?.numero.toLowerCase().includes(searchLower) ||
      mouvement.expedition?.designation.toLowerCase().includes(searchLower) ||
      mouvement.user?.name.toLowerCase().includes(searchLower) ||
      mouvement.user?.email.toLowerCase().includes(searchLower) ||
      mouvement.notes?.toLowerCase().includes(searchLower) ||
      mouvement.lieu?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string | Date) => (
        <span className="text-sm">{formatDate(date)}</span>
      ),
      sorter: (a: Mouvement, b: Mouvement) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      },
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: MouvementType) => getMouvementTypeBadge(type),
    },
    {
      title: "Expédition",
      key: "expedition",
      render: (_: any, record: Mouvement) => (
        <Link
          href={`/materiel/${record.expeditionId}`}
          className="text-[#DC143C] hover:text-[#B71C1C] font-medium"
        >
          {record.expedition?.numero || record.expeditionId.substring(0, 8)}
        </Link>
      ),
    },
    {
      title: "Désignation",
      key: "designation",
      render: (_: any, record: Mouvement) => (
        <span className="text-sm">
          {record.expedition?.designation || "—"}
        </span>
      ),
    },
    {
      title: "Statut",
      key: "statut",
      render: (_: any, record: Mouvement) => (
        <div className="flex flex-col gap-1">
          {record.statutAvant && (
            <span className="text-xs text-gray-500">
              Avant: {record.statutAvant}
            </span>
          )}
          <span className="text-sm font-medium">{record.statutApres}</span>
        </div>
      ),
    },
    {
      title: "Lieu",
      dataIndex: "lieu",
      key: "lieu",
      render: (text: string | null) => (
        <span className="text-sm">{text || "—"}</span>
      ),
    },
    {
      title: "Utilisateur",
      key: "user",
      render: (_: any, record: Mouvement) => (
        <div className="text-sm">
          <div className="font-medium">{record.user?.name || "—"}</div>
          <div className="text-gray-500 text-xs">
            {record.user?.email || ""}
          </div>
        </div>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text: string | null) => (
        <span className="text-sm text-gray-600">
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : "—"}
        </span>
      ),
    },
  ];

  return (
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-[240px] px-4 md:px-6 w-full">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  Historique des Mouvements
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Suivi de tous les mouvements et changements de statut
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par expédition, utilisateur, lieu ou notes..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredMouvements.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucun mouvement ne correspond à votre recherche"
                      : "Aucun mouvement enregistré"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredMouvements.map((m) => ({
                    ...m,
                    key: m.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} mouvements`,
                  }}
                />
              )}
            </Card>
          </div>
        </main>
      </div>
    </Wrapper>
  );
}

