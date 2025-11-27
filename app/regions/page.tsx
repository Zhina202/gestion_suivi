"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Space, Modal, message, Input, Form } from "antd";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [form] = Form.useForm();

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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer cette région ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      width: 500,
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

  const handleCreate = () => {
    setEditingRegion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (region: Region) => {
    setEditingRegion(region);
    form.setFieldsValue({
      code: region.code,
      nom: region.nom,
      chefLieu: region.chefLieu || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRegion) {
        await updateRegion(editingRegion.id, values);
        message.success("Région mise à jour avec succès");
      } else {
        await createRegion(values);
        message.success("Région créée avec succès");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchRegions();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Erreur lors de l'enregistrement");
    }
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
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              handleDelete(record.id);
            }}
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
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreate}
                size="large"
              >
                Nouvelle Région
              </Button>
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

      <Modal
        title={editingRegion ? "Modifier la région" : "Nouvelle région"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingRegion ? "Modifier" : "Créer"}
        cancelText="Annuler"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: "Le code est requis" },
              { max: 10, message: "Le code ne doit pas dépasser 10 caractères" },
            ]}
          >
            <Input placeholder="Code de la région" />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Nom de la région" />
          </Form.Item>
          <Form.Item
            name="chefLieu"
            label="Chef-lieu"
            rules={[
              { max: 100, message: "Le chef-lieu ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Chef-lieu de la région" />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

