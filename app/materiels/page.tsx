"use client";
import Image from "next/image";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Layers, Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { createEmptyMaterielPdf, getMaterielPdfByEmail } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { MaterielPdf } from "@/type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Table, Space, Button, Modal, Badge, Tooltip, Card, Input, Select, Row, Col } from 'antd';

const getStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return <Badge color="default">Brouillon</Badge>;
    case 2:
      return <Badge color="orange">En transit</Badge>;
    case 3:
      return <Badge color="green">Reçu</Badge>;
    case 4:
      return <Badge color="blue">Endommagé</Badge>;
    case 5:
      return <Badge color="red">Perdu</Badge>;
    default:
      return <Badge>Indéfini</Badge>;
  }
};

// Fonction pour obtenir une couleur basée sur le nom de la catégorie
const getCategoryColor = (categorie: string): string => {
  const colors = [
    'blue', 'green', 'orange', 'red', 'purple', 'cyan', 'magenta', 'gold', 
    'lime', 'geekblue', 'volcano', 'processing'
  ];
  
  // Utiliser le hash du nom pour obtenir une couleur cohérente
  let hash = 0;
  for (let i = 0; i < categorie.length; i++) {
    hash = categorie.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getCategoryBadges = (materielPdf: MaterielPdf) => {
  const materiels = materielPdf.Materiel || materielPdf.materiels || [];
  const categories = [...new Set(materiels.map(m => m.categorie).filter(c => c && c.trim() !== ''))];
  
  if (categories.length === 0) {
    return <span className="text-gray-400 text-sm">Aucune catégorie</span>;
  }
  
  return (
    <Space size="small" wrap>
      {categories.map((categorie, index) => (
        <Badge key={index} color={getCategoryColor(categorie)}>{categorie}</Badge>
      ))}
    </Space>
  );
};

const MaterielsTable: React.FC<{ data: MaterielPdf[]; onDeleted: () => void; filteredData: MaterielPdf[] }> = ({ data, onDeleted, filteredData }: { data: MaterielPdf[]; onDeleted: () => void; filteredData: MaterielPdf[] }) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Supprimer ce matériel ? Cette action est irréversible.',
      onOk: async () => {
        try {
          const res = await fetch(`/api/materiel/${id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.ok) onDeleted();
          else Modal.error({ title: 'Erreur', content: 'Impossible de supprimer' });
        } catch (err) {
          console.error(err);
          Modal.error({ title: 'Erreur', content: 'Erreur lors de la suppression' });
        }
      }
    })
  }

  const columns: any = [
    { title: 'ID', dataIndex: 'id', key: 'id', render: (id: string) => `MATRI-${id}` },
    { title: 'Nom', dataIndex: 'design', key: 'design' },
    { title: 'Types', key: 'types', render: (_: any, record: MaterielPdf) => getCategoryBadges(record) },
    { title: 'Statut', dataIndex: 'status', key: 'status', render: (s: number) => getStatusBadge(s) },
    { title: 'Date départ', dataIndex: 'date_depart', key: 'date_depart' },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <Space>
        <Tooltip title="Éditer">
          <Link href={`/materiel/${record.id}/edit`} onClick={(e) => e.stopPropagation()}>
            <Button type="text" icon={<Edit className="w-4 h-4" />} />
          </Link>
        </Tooltip>
        <Tooltip title="Supprimer">
          <Button 
            type="text" 
            danger 
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { 
              e.stopPropagation(); 
              handleDelete(record.id); 
            }} 
          />
        </Tooltip>
      </Space>
    ), align: 'right' }
  ];

  return (
    <div className="overflow-x-auto w-full">
      <Table
        columns={columns}
        dataSource={filteredData.map(d => ({ ...d, key: d.id }))}
        onRow={(record: any) => ({ onClick: () => router.push(`/materiel/${record.id}`) })}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total: number) => `Total: ${total} matériels`,
          responsive: true
        }}
      />
    </div>
  )
}

export default function MaterielsPage() {
  const { user } = useUser();
  const [materielPdfName, setmaterielPdfName] = useState<string>("");
  const [isNameValide, setisNameValide] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [materielsPdf, setMaterielPdf] = useState<MaterielPdf[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);

  const fetchMaterielPdf = async () => {
    try {
      const data = await getMaterielPdfByEmail(email);
      if (data) setMaterielPdf(data);
    } catch (error) {
      console.error("Erreur lors du changement du matériel", error);
    }
  };

  useEffect(() => {
    fetchMaterielPdf();
  }, [email]);

  useEffect(() => {
    setisNameValide(materielPdfName.length <= 50);
  }, [materielPdfName]);

  // Obtenir toutes les catégories uniques pour le filtre
  const getAllCategories = () => {
    const allCategories = new Set<string>();
    materielsPdf.forEach((materielPdf: MaterielPdf) => {
      const materiels = materielPdf.Materiel || materielPdf.materiels || [];
      materiels.forEach((m: import("@prisma/client").Materiel) => {
        if (m.categorie && m.categorie.trim() !== '') {
          allCategories.add(m.categorie);
        }
      });
    });
    return Array.from(allCategories).sort();
  };

  // Filtrer les matériels
  const filteredMateriels = materielsPdf.filter((materielPdf: MaterielPdf) => {
    // Filtre par texte de recherche (nom, ID)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesSearch = 
        materielPdf.design?.toLowerCase().includes(searchLower) ||
        materielPdf.id.toLowerCase().includes(searchLower) ||
        `MATRI-${materielPdf.id}`.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Filtre par statut
    if (statusFilter !== undefined && materielPdf.status !== statusFilter) {
      return false;
    }

    // Filtre par catégorie
    if (categoryFilter) {
      const materiels = materielPdf.Materiel || materielPdf.materiels || [];
      const hasCategory = materiels.some((m: import("@prisma/client").Materiel) => m.categorie === categoryFilter);
      if (!hasCategory) return false;
    }

    return true;
  });

  const handleCreateMaterielPdf = async () => {
    try {
      if (email) await createEmptyMaterielPdf(email, materielPdfName);
      fetchMaterielPdf();
      setmaterielPdfName("");
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) modal.close();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    } catch (error) {
      console.error("Erreur lors de la création du matériel :", error);
    }
  };

  return (
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-60 px-4 md:px-6 w-full">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Matériels</h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Liste et gestion des matériels électoraux</p>
              </div>
              <div className="w-full sm:w-auto">
                <Link href="/materiel/create" className="block">
                  <Button type='primary' size="large" icon={<Plus className="w-4 h-4" />} block className="sm:inline-block">
                    <span className="hidden sm:inline">Ajouter un matériel</span>
                    <span className="sm:hidden">Ajouter</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="w-full">
              {materielsPdf.length === 0 ? (
                <Card>
                  <div className="text-center py-12">
                    <Layers className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun matériel trouvé</h3>
                    <p className="text-gray-500 mb-6">Créez votre premier matériel pour commencer</p>
                    <Link href="/materiel/create">
                      <Button type="primary" icon={<Plus className="w-4 h-4" />}>
                        Créer un matériel
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <Card>
                  {/* Filtres */}
                  <div className="mb-6 space-y-4">
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={8}>
                        <Input
                          placeholder="Rechercher par nom ou ID..."
                          prefix={<Search className="w-4 h-4 text-gray-400" />}
                          value={searchText}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                          allowClear
                          size="large"
                        />
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Select
                          placeholder="Filtrer par statut"
                          value={statusFilter}
                          onChange={(value: number | undefined) => setStatusFilter(value)}
                          allowClear
                          size="large"
                          style={{ width: '100%' }}
                          options={[
                            { value: 1, label: 'Brouillon' },
                            { value: 2, label: 'En transit' },
                            { value: 3, label: 'Reçu' },
                            { value: 4, label: 'Endommagé' },
                            { value: 5, label: 'Perdu' }
                          ]}
                        />
                      </Col>
                      <Col xs={24} sm={24} md={8}>
                        <Select
                          placeholder="Filtrer par catégorie"
                          value={categoryFilter}
                          onChange={(value: string | undefined) => setCategoryFilter(value)}
                          allowClear
                          size="large"
                          style={{ width: '100%' }}
                          options={getAllCategories().map(cat => ({
                            value: cat,
                            label: <Badge color={getCategoryColor(cat)}>{cat}</Badge>
                          }))}
                        />
                      </Col>
                    </Row>
                    {(searchText || statusFilter !== undefined || categoryFilter) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Filter className="w-4 h-4" />
                        <span>
                          {filteredMateriels.length} matériel{filteredMateriels.length > 1 ? 's' : ''} trouvé{filteredMateriels.length > 1 ? 's' : ''}
                          {materielsPdf.length !== filteredMateriels.length && ` sur ${materielsPdf.length}`}
                        </span>
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={() => {
                            setSearchText("");
                            setStatusFilter(undefined);
                            setCategoryFilter(undefined);
                          }}
                        >
                          Réinitialiser
                        </Button>
                      </div>
                    )}
                  </div>

                  {filteredMateriels.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Aucun matériel ne correspond aux filtres sélectionnés</p>
                    </div>
                  ) : (
                    <MaterielsTable 
                      data={materielsPdf} 
                      filteredData={filteredMateriels}
                      onDeleted={() => fetchMaterielPdf()} 
                    />
                  )}
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </Wrapper>
  );
}
