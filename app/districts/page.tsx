"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, Modal, message, Input } from "antd";
import { Edit, Trash2, Search, Building2 } from "lucide-react";
import {
  getAllDistricts,
  deleteDistrict,
} from "../actions";
import { District } from "@/type";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const data = await getAllDistricts();
      setDistricts(data as District[]);
    } catch (error) {
      console.error("Erreur lors du chargement des districts:", error);
      message.error("Erreur lors du chargement des districts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce district ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      onOk: async () => {
        try {
          await deleteDistrict(id);
          message.success("District supprimé avec succès");
          fetchDistricts();
        } catch (error) {
          message.error("Erreur lors de la suppression");
        }
      },
    });
  };

  const filteredDistricts = districts.filter((district) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      district.nom.toLowerCase().includes(searchLower) ||
      district.code.toLowerCase().includes(searchLower) ||
      district.region?.nom.toLowerCase().includes(searchLower) ||
      district.chefLieu?.toLowerCase().includes(searchLower)
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
      title: "Région",
      key: "region",
      render: (_: any, record: District) => (
        <Tag color="blue">{record.region?.nom || "—"}</Tag>
      ),
    },
    {
      title: "Chef-lieu",
      dataIndex: "chefLieu",
      key: "chefLieu",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Communes",
      key: "communes",
      render: (_: any, record: District) => (
        <span>{record.communes?.length || 0}</span>
      ),
    },
    {
      title: "Expéditions",
      key: "expeditions",
      render: (_: any, record: District) => (
        <span>{record.expeditions?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: District) => (
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
                  Districts
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des districts de Madagascar
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, code ou région..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredDistricts.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucun district ne correspond à votre recherche"
                      : "Aucun district trouvé"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredDistricts.map((d) => ({
                    ...d,
                    key: d.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} districts`,
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

