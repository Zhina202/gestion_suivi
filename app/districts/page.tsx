"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, message, Input, Form, Select } from "antd";
import { Edit, Trash2, Plus, Search, Building2 } from "lucide-react";
import {
  getAllDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getAllRegions,
} from "../actions";
import { District, Region } from "@/type";
import { confirmDelete } from "../utils/confirmDelete";

export default function DistrictsPage() {
  const [districts, setDistricts] = useState<District[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [form] = Form.useForm();

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
    const fetchRegions = async () => {
      const data = await getAllRegions();
      setRegions(data as Region[]);
    };
    fetchRegions();
  }, []);

  const handleCreate = () => {
    setEditingDistrict(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (district: District) => {
    setEditingDistrict(district);
    form.setFieldsValue({
      code: district.code,
      nom: district.nom,
      regionId: district.regionId,
      chefLieu: district.chefLieu || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingDistrict) {
        await updateDistrict(editingDistrict.id, values);
        message.success("District mis à jour avec succès");
      } else {
        await createDistrict(values);
        message.success("District créé avec succès");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchDistricts();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = (id: string) => {
    confirmDelete({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce district ?",
      onConfirm: async () => {
        await deleteDistrict(id);
      },
      onSuccess: () => {
        message.success("District supprimé avec succès");
        fetchDistricts();
      },
      onError: () => {
        message.error("Erreur lors de la suppression");
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
                  Districts
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des districts de Madagascar
                </p>
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreate}
                size="large"
              >
                Nouveau District
              </Button>
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

      <Modal
        title={editingDistrict ? "Modifier le district" : "Nouveau district"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingDistrict ? "Modifier" : "Créer"}
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
            <Input placeholder="Code du district" />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Nom du district" />
          </Form.Item>
          <Form.Item
            name="regionId"
            label="Région"
            rules={[{ required: true, message: "La région est requise" }]}
          >
            <Select placeholder="Sélectionner une région" showSearch>
              {regions.map((region) => (
                <Select.Option key={region.id} value={region.id}>
                  {region.nom}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="chefLieu"
            label="Chef-lieu"
            rules={[
              { max: 100, message: "Le chef-lieu ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Chef-lieu du district" />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

