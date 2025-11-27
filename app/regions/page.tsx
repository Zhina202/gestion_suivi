"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Space, Modal, message, Input } from "antd";
import { Edit, Trash2, Plus, Search, MapPin } from "lucide-react";
import {
  getAllRegions,
  createRegion,
  updateRegion,
  deleteRegion,
} from "../actions";
import { Region } from "@/type";

export default function RegionsPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchRegions = async () => {
    try {
      setLoading(true);
      const data = await getAllRegions();
      setRegions(data as Region[]);
    } catch (error) {
      console.error("Erreur lors du chargement des régions:", error);
      message.error("Erreur lors du chargement des régions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer cette région ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await deleteRegion(id);
          message.success("Région supprimée avec succès");
          fetchRegions();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const filteredRegions = regions.filter((region) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      region.nom.toLowerCase().includes(searchLower) ||
      region.code.toLowerCase().includes(searchLower) ||
      region.chefLieu?.toLowerCase().includes(searchLower)
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
      title: "Chef-lieu",
      dataIndex: "chefLieu",
      key: "chefLieu",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Districts",
      key: "districts",
      render: (_: any, record: Region) => (
        <span>{record.districts?.length || 0}</span>
      ),
    },
    {
      title: "Expéditions",
      key: "expeditions",
      render: (_: any, record: Region) => (
        <span>{record.expeditions?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Region) => (
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
                  Régions
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des régions de Madagascar
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, code ou chef-lieu..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredRegions.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucune région ne correspond à votre recherche"
                      : "Aucune région trouvée"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredRegions.map((r) => ({
                    ...r,
                    key: r.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} régions`,
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

