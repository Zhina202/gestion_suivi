"use client";
import React, { useEffect, useState } from "react";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Table, Card, Button, Tag, Space, message, Input, Form, App, Modal } from "antd";
import { Edit, Trash2, Plus, Search, User as UserIcon } from "lucide-react";
import { getAllUsers, updateUser, deleteUser } from "../actions";
import { User, UserRole } from "@/type";
import Link from "next/link";

const getRoleBadge = (role: UserRole) => {
  const roleMap: Record<UserRole, { color: string; label: string }> = {
    ADMIN: { color: "red", label: "Administrateur" },
    DIRECTEUR: { color: "purple", label: "Directeur" },
    RESPONSABLE: { color: "blue", label: "Responsable" },
    AGENT: { color: "default", label: "Agent" },
  };
  const roleInfo = roleMap[role] || roleMap.AGENT;
  return <Tag color={roleInfo.color}>{roleInfo.label}</Tag>;
};

export default function UsersPage() {
  const { modal } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data as User[]);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
      message.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      role: user.role,
      phone: user.phone || "",
      fonction: user.fonction || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await updateUser(editingUser.id, values);
        message.success("Utilisateur mis à jour avec succès");
        setIsModalOpen(false);
        form.resetFields();
        fetchUsers();
      }
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const handleDelete = (id: string) => {
    modal.confirm({
      title: "Confirmer la suppression",
      content: "Êtes-vous sûr de vouloir supprimer cet utilisateur ?",
      okText: "Supprimer",
      okType: "danger",
      cancelText: "Annuler",
      width: 520,
      centered: true,
      maskClosable: false,
      onOk: async () => {
        try {
          await deleteUser(id);
          message.success("Utilisateur supprimé avec succès");
          fetchUsers();
        } catch (error) {
          message.error("Erreur lors de la suppression");
          throw error;
        }
      },
    });
  };

  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.fonction?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rôle",
      dataIndex: "role",
      key: "role",
      render: (role: UserRole) => getRoleBadge(role),
    },
    {
      title: "Fonction",
      dataIndex: "fonction",
      key: "fonction",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Téléphone",
      dataIndex: "phone",
      key: "phone",
      render: (text: string | null) => text || "—",
    },
    {
      title: "Expéditions",
      key: "expeditions",
      render: (_: any, record: User) => (
        <span>{record.expeditions?.length || 0}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: User) => (
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
                  Utilisateurs
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Gestion des utilisateurs du système
                </p>
              </div>
            </div>

            <Card>
              <div className="mb-6">
                <Input
                  placeholder="Rechercher par nom, email ou fonction..."
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  size="large"
                />
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchText
                      ? "Aucun utilisateur ne correspond à votre recherche"
                      : "Aucun utilisateur trouvé"}
                  </p>
                </div>
              ) : (
                <Table
                  columns={columns}
                  dataSource={filteredUsers.map((u) => ({ ...u, key: u.id }))}
                  loading={loading}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total: ${total} utilisateurs`,
                  }}
                />
              )}
            </Card>
          </div>
        </main>
      </div>

      <Modal
        title="Modifier l'utilisateur"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Modifier"
        cancelText="Annuler"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nom"
            rules={[
              { required: true, message: "Le nom est requis" },
              { max: 100, message: "Le nom ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Nom complet" disabled />
          </Form.Item>
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: "Le rôle est requis" }]}
          >
            <Input placeholder="Rôle" disabled />
          </Form.Item>
          <Form.Item
            name="fonction"
            label="Fonction"
            rules={[
              { max: 100, message: "La fonction ne doit pas dépasser 100 caractères" },
            ]}
          >
            <Input placeholder="Fonction dans la CENI" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Téléphone"
            rules={[
              { max: 20, message: "Le téléphone ne doit pas dépasser 20 caractères" },
            ]}
          >
            <Input placeholder="Numéro de téléphone" />
          </Form.Item>
        </Form>
      </Modal>
    </Wrapper>
  );
}

