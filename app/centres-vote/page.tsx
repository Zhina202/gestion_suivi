"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, Modal, message, Input } from "antd";
import { Edit, Trash2, Search, Vote } from "lucide-react";
import {
  getAllCentresVote,
  deleteCentreVote,
} from "../actions";
import { CentreVote } from "@/type";

export default function CentresVotePage() {
  const [centresVote, setCentresVote] = useState<CentreVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchCentresVote = async () => {
    try {
      setLoading(true);
      const data = await getAllCentresVote();
      setCentresVote(data as CentreVote[]);
    } catch (error) {
      console.error("Erreur lors du chargement des centres de vote:", error);
      message.error("Erreur lors du chargement des centres de vote");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentresVote();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce centre de vote ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await deleteCentreVote(id);
          message.success("Centre de vote supprimé avec succès");
          fetchCentresVote();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const filteredCentresVote = centresVote.filter((centre) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      centre.nom.toLowerCase().includes(searchLower) ||
      centre.code.toLowerCase().includes(searchLower) ||
      centre.commune?.nom.toLowerCase().includes(searchLower) ||
      centre.adresse?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (text: string) => (
        <span className="font-mono text-sm">{text}</span>
      ),
    },
    {
      title: "Nom",
      dataIndex: "nom",
      key: "nom",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Commune",
      key: "commune",
      render: (_: any, record: CentreVote) => (
        <Tag color="blue">{record.commune?.nom || "—"}</Tag>
      ),
    },
    {
      title: "District",
      key: "district",
      render: (_: any, record: CentreVote) => (
        <Tag color="purple">
          {record.commune?.district?.nom || "—"}
        </Tag>
      ),
    },
    {
      title: "Région",
      key: "region",
      render: (_: any, record: CentreVote) => (
        <Tag color="cyan">
          {record.commune?.district?.region?.nom || "—"}
        </Tag>
      ),
    },
    {
      title: "Adresse",
      dataIndex: "adresse",
      key: "adresse",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Capacité",
      dataIndex: "capacite",
      key: "capacite",
      render: (text: number | null) => (text ? `${text} électeurs` : "—"),
    },
    {
      title: "Expéditions",
      key: "expeditions",
      render: (_: any, record: CentreVote) => (
        <span>{record.expeditions?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: CentreVote) => (
        <Space>
          <Button
            type="text"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => {
              message.info("Fonctionnalité d'édition à venir");
            }}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
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
                  Centres de Vote
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des centres de vote de Madagascar
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, code, commune ou adresse..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredCentresVote.length === 0 ? (
                <div className="text-center py-12">
                  <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucun centre de vote ne correspond à votre recherche"
                      : "Aucun centre de vote trouvé"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredCentresVote.map((c) => ({
                    ...c,
                    key: c.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} centres de vote`,
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

