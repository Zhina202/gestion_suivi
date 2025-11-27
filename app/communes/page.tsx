"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, message, Input, Form, Select, Modal } from "antd";
import { Edit, Trash2, Plus, Search, Home } from "lucide-react";
import {
  getAllCommunes,
  createCommune,
  updateCommune,
  deleteCommune,
  getAllDistricts,
  getAllRegions,
  getDistrictsByRegion,
} from "../actions";
import { Commune, District, Region } from "@/type";

export default function CommunesPage() {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommune, setEditingCommune] = useState<Commune | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>();
  const [form] = Form.useForm();

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
    const fetchRegions = async () => {
      const data = await getAllRegions();
      setRegions(data as Region[]);
    };
    fetchRegions();
  }, []);

  const handleRegionChange = async (regionId: string) => {
    setSelectedRegionId(regionId);
    setDistricts([]);
    form.setFieldsValue({ districtId: undefined });
    
    if (regionId) {
      const data = await getDistrictsByRegion(regionId);
      setDistricts(data as District[]);
    }
  };

  const handleCreate = () => {
    setEditingCommune(null);
    setSelectedRegionId(undefined);
    setDistricts([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = async (commune: Commune) => {
    setEditingCommune(commune);
    const regionId = commune.district?.regionId;
    if (regionId) {
      setSelectedRegionId(regionId);
      const data = await getDistrictsByRegion(regionId);
      setDistricts(data as District[]);
    }
    form.setFieldsValue({
      code: commune.code,
      nom: commune.nom,
      districtId: commune.districtId,
      regionId: regionId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Extraire regionId car il n'est pas dans le modèle Commune
      const { regionId: _regionId, ...communeData } = values;
      
      // S'assurer que regionId n'est pas dans les données (double sécurité)
      delete (communeData as any).regionId;
      
      if (editingCommune) {
        await updateCommune(editingCommune.id, communeData);
        message.success("Commune mise à jour avec succès");
      } else {
        await createCommune(communeData);
        message.success("Commune créée avec succès");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchCommunes();
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
      content: "Êtes-vous sûr de vouloir supprimer cette commune ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      width: 520,
      centered: true,
      maskClosable: false,
      zIndex: 10000,
      onOk: async () => {
        try {
          await deleteCommune(id);
          message.success("Commune supprimée avec succès");
          fetchCommunes();
        } catch (error) {
          message.error("Erreur lors de la suppression");
          throw error;
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
                  Communes
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des communes de Madagascar
                </p>
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreate}
                size="large"
              >
                Nouvelle Commune
              </Button>
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

      <Modal
        title={editingCommune ? "Modifier la commune" : "Nouvelle commune"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingCommune ? "Modifier" : "Créer"}
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
            <Input placeholder="Code de la commune" />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Nom de la commune" />
          </Form.Item>
          <Form.Item
            name="regionId"
            label="Région"
            rules={[{ required: true, message: "La région est requise" }]}
          >
            <Select 
              placeholder="Sélectionner une région" 
              showSearch
              onChange={handleRegionChange}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={regions.map((region) => ({
                value: region.id,
                label: region.nom
              }))}
            />
          </Form.Item>
          <Form.Item
            name="districtId"
            label="District"
            rules={[{ required: true, message: "Le district est requis" }]}
          >
            <Select 
              placeholder="Sélectionner un district" 
              showSearch
              disabled={!selectedRegionId}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={districts.map((district) => ({
                value: district.id,
                label: district.nom
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

