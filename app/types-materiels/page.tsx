"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, message, Input, Form, TextArea, Modal } from "antd";
import { Edit, Trash2, Plus, Search, Package } from "lucide-react";
import {
  getAllTypeMateriels,
  createTypeMateriel,
  updateTypeMateriel,
  deleteTypeMateriel,
} from "../actions";
import { TypeMateriel } from "@/type";

export default function TypesMaterielsPage() {
  const [typesMateriels, setTypesMateriels] = useState<TypeMateriel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTypeMateriel, setEditingTypeMateriel] = useState<TypeMateriel | null>(null);
  const [form] = Form.useForm();

  const fetchTypesMateriels = async () => {
    try {
      setLoading(true);
      const data = await getAllTypeMateriels();
      setTypesMateriels(data as TypeMateriel[]);
    } catch (error) {
      console.error("Erreur lors du chargement des types de matériels:", error);
      message.error("Erreur lors du chargement des types de matériels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypesMateriels();
  }, []);

  const handleCreate = () => {
    setEditingTypeMateriel(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (typeMateriel: TypeMateriel) => {
    setEditingTypeMateriel(typeMateriel);
    form.setFieldsValue({
      code: typeMateriel.code,
      nom: typeMateriel.nom,
      categorie: typeMateriel.categorie,
      description: typeMateriel.description || "",
      unite: typeMateriel.unite || "unité",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingTypeMateriel) {
        await updateTypeMateriel(editingTypeMateriel.id, values);
        message.success("Type de matériel mis à jour avec succès");
      } else {
        await createTypeMateriel(values);
        message.success("Type de matériel créé avec succès");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchTypesMateriels();
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer ce type de matériel ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      width: 520,
      centered: true,
      maskClosable: false,
      zIndex: 10000,
      onOk: async () => {
        try {
          await deleteTypeMateriel(id);
          message.success("Type de matériel supprimé avec succès");
          fetchTypesMateriels();
        } catch (error) {
          message.error("Erreur lors de la suppression");
          throw error;
        }
      },
    });
  };

  const filteredTypesMateriels = typesMateriels.filter((type) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      type.nom.toLowerCase().includes(searchLower) ||
      type.code.toLowerCase().includes(searchLower) ||
      type.categorie.toLowerCase().includes(searchLower) ||
      type.description?.toLowerCase().includes(searchLower)
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
      title: "Catégorie",
      dataIndex: "categorie",
      key: "categorie",
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string | null) => (
        <span className="text-sm text-gray-600">
          {text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : "—"}
        </span>
      ),
    },
    {
      title: "Unité",
      dataIndex: "unite",
      key: "unite",
      render: (text: string) => <span className="text-sm">{text}</span>,
    },
    {
      title: "Matériels",
      key: "materiels",
      render: (_: any, record: TypeMateriel) => (
        <span>{record.materiels?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: TypeMateriel) => (
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
                  Types de Matériels
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Catalogue des types de matériels électoraux
                </p>
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreate}
                size="large"
              >
                Nouveau Type
              </Button>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, code, catégorie ou description..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredTypesMateriels.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucun type de matériel ne correspond à votre recherche"
                      : "Aucun type de matériel trouvé"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredTypesMateriels.map((t) => ({
                    ...t,
                    key: t.id,
                  }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} types de matériels`,
                  }}
                />
              )}
            </Card>
          </div>
        </main>
      </div>

      <Modal
        title={editingTypeMateriel ? "Modifier le type de matériel" : "Nouveau type de matériel"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingTypeMateriel ? "Modifier" : "Créer"}
        cancelText="Annuler"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Code"
            rules={[
              { required: true, message: "Le code est requis" },
              { max: 20, message: "Le code ne doit pas dépasser 20 caractères" },
            ]}
          >
            <Input placeholder="Code unique du type" />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Ex: Urne électorale, Isoloir, Bulletin de vote" />
          </Form.Item>
          <Form.Item
            name="categorie"
            label="Catégorie"
            rules={[
              { required: true, message: "La catégorie est requise" },
              { max: 50, message: "La catégorie ne doit pas dépasser 50 caractères" },
            ]}
          >
            <Input placeholder="Ex: Urne, Isoloir, Document, Équipement" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: "La description ne doit pas dépasser 500 caractères" },
            ]}
          >
            <TextArea rows={3} placeholder="Description détaillée du type de matériel" />
          </Form.Item>
          <Form.Item
            name="unite"
            label="Unité de mesure"
            rules={[
              { required: true, message: "L'unité est requise" },
              { max: 20, message: "L'unité ne doit pas dépasser 20 caractères" },
            ]}
          >
            <Input placeholder="Ex: unité, lot, paquet" defaultValue="unité" />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

