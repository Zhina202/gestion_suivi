"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, Modal, message, Input } from "antd";
import { Edit, Trash2, Search, Home } from "lucide-react";
import {
  getAllCommunes,
  deleteCommune,
} from "../actions";
import { Commune } from "@/type";

export default function CommunesPage() {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchCommunes = async () => {
    try {
      setLoading(true);
      const data = await getAllCommunes();
      setCommunes(data as Commune[]);
    } catch (error) {
      console.error("Erreur lors du chargement des communes:", error);
      message.error("Erreur lors du chargement des communes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunes();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer cette commune ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await deleteCommune(id);
          message.success("Commune supprimée avec succès");
          fetchCommunes();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const filteredCommunes = communes.filter((commune) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      commune.nom.toLowerCase().includes(searchLower) ||
      commune.code.toLowerCase().includes(searchLower) ||
      commune.district?.nom.toLowerCase().includes(searchLower) ||
      commune.district?.region?.nom.toLowerCase().includes(searchLower)
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
      title: "District",
      key: "district",
      render: (_: any, record: Commune) => (
        <Tag color="blue">{record.district?.nom || "—"}</Tag>
      ),
    },
    {
      title: "Région",
      key: "region",
      render: (_: any, record: Commune) => (
        <Tag color="purple">{record.district?.region?.nom || "—"}</Tag>
      ),
    },
    {
      title: "Centres de vote",
      key: "centresVote",
      render: (_: any, record: Commune) => (
        <span>{record.centresVote?.length || 0}</span>
      ),
    },
    {
      title: "Expéditions",
      key: "expeditions",
      render: (_: any, record: Commune) => (
        <span>{record.expeditions?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Commune) => (
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
                  Communes
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des communes de Madagascar
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, code, district ou région..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredCommunes.length === 0 ? (
                <div className="text-center py-12">
                  <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucune commune ne correspond à votre recherche"
                      : "Aucune commune trouvée"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredCommunes.map((c) => ({
                    ...c,
                    key: c.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} communes`,
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

