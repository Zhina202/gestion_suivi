"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, Modal, message, Input, Form, Select, InputNumber } from "antd";
import { Edit, Trash2, Plus, Search, Vote } from "lucide-react";
import {
  getAllCentresVote,
  createCentreVote,
  updateCentreVote,
  deleteCentreVote,
  getAllCommunes,
  getAllDistricts,
  getCommunesByDistrict,
} from "../actions";
import { CentreVote, Commune, District } from "@/type";

export default function CentresVotePage() {
  const [centresVote, setCentresVote] = useState<CentreVote[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCentreVote, setEditingCentreVote] = useState<CentreVote | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>();
  const [form] = Form.useForm();

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
    const fetchDistricts = async () => {
      const data = await getAllDistricts();
      setDistricts(data as District[]);
    };
    fetchDistricts();
  }, []);

  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setCommunes([]);
    form.setFieldsValue({ communeId: undefined });
    
    if (districtId) {
      const data = await getCommunesByDistrict(districtId);
      setCommunes(data as Commune[]);
    }
  };

  const handleCreate = () => {
    setEditingCentreVote(null);
    setSelectedDistrictId(undefined);
    setCommunes([]);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = async (centreVote: CentreVote) => {
    setEditingCentreVote(centreVote);
    const districtId = centreVote.commune?.districtId;
    if (districtId) {
      setSelectedDistrictId(districtId);
      const data = await getCommunesByDistrict(districtId);
      setCommunes(data as Commune[]);
    }
    form.setFieldsValue({
      code: centreVote.code,
      nom: centreVote.nom,
      communeId: centreVote.communeId,
      districtId: districtId,
      adresse: centreVote.adresse || "",
      capacite: centreVote.capacite || undefined,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Extraire districtId car il n'est pas dans le modèle CentreVote
      const { districtId: _districtId, ...centreVoteData } = values;
      
      // S'assurer que districtId n'est pas dans les données (double sécurité)
      delete (centreVoteData as any).districtId;
      
      if (editingCentreVote) {
        await updateCentreVote(editingCentreVote.id, centreVoteData);
        message.success("Centre de vote mis à jour avec succès");
      } else {
        await createCentreVote(centreVoteData);
        message.success("Centre de vote créé avec succès");
      }
      setIsModalOpen(false);
      form.resetFields();
      fetchCentresVote();
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
      content: "Êtes-vous sûr de vouloir supprimer ce centre de vote ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      width: 500,
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
                  Centres de Vote
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des centres de vote de Madagascar
                </p>
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleCreate}
                size="large"
              >
                Nouveau Centre de Vote
              </Button>
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

      <Modal
        title={editingCentreVote ? "Modifier le centre de vote" : "Nouveau centre de vote"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText={editingCentreVote ? "Modifier" : "Créer"}
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
            <Input placeholder="Code du centre de vote" />
          </Form.Item>
          <Form.Item
            name="nom"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Nom du centre de vote" />
          </Form.Item>
          <Form.Item
            name="districtId"
            label="District"
            rules={[{ required: true, message: "Le district est requis" }]}
          >
            <Select 
              placeholder="Sélectionner un district" 
              showSearch
              onChange={handleDistrictChange}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={districts.map((district) => ({
                value: district.id,
                label: `${district.nom} (${district.region?.nom})`
              }))}
            />
          </Form.Item>
          <Form.Item
            name="communeId"
            label="Commune"
            rules={[{ required: true, message: "La commune est requise" }]}
          >
            <Select 
              placeholder="Sélectionner une commune" 
              showSearch
              disabled={!selectedDistrictId}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={communes.map((commune) => ({
                value: commune.id,
                label: commune.nom
              }))}
            />
          </Form.Item>
          <Form.Item
            name="adresse"
            label="Adresse"
            rules={[
              { max: 200, message: "L'adresse ne doit pas dépasser 200 caractères" },
            ]}
          >
            <Input placeholder="Adresse du centre de vote" />
          </Form.Item>
          <Form.Item
            name="capacite"
            label="Capacité (nombre d'électeurs)"
            rules={[
              { type: "number", min: 0, message: "La capacité doit être positive" },
            ]}
          >
            <InputNumber placeholder="Capacité" style={{ width: "100%" }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

