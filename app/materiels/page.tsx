"use client";
import Image from "next/image";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Layers, Edit, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { createEmptyMaterielPdf, getMaterielPdfByEmail } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { MaterielPdf } from "@/type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Table, Space, Button, Modal, Badge, Tooltip, Card } from 'antd';

const getStatusBadge = (status: number) => {
  switch (status) {
    case 1:
      return <Badge.Ribbon text="Brouillon"><span /></Badge.Ribbon>;
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

const getCategoryBadges = (materielPdf: MaterielPdf) => {
  const materiels = materielPdf.Materiel || materielPdf.materiels || [];
  const categories = [...new Set(materiels.map(m => m.categorie).filter(c => c && c.trim() !== ''))];
  
  if (categories.length === 0) {
    return <span className="text-gray-400 text-sm">Aucune catégorie</span>;
  }
  
  return (
    <Space size="small" wrap>
      {categories.map((categorie, index) => (
        <Badge key={index} color="blue">{categorie}</Badge>
      ))}
    </Space>
  );
};

const MaterielsTable: React.FC<{ data: MaterielPdf[]; onDeleted: () => void }> = ({ data, onDeleted }) => {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Supprimer ce matériel ? Cette action est irréversible.',
      onOk: async () => {
        try {
          const res = await fetch(`/api/materielPdf/${id}`, { method: 'DELETE' });
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
    <Table
      columns={columns}
      dataSource={data.map(d => ({ ...d, key: d.id }))}
  onRow={(record: any) => ({ onClick: () => router.push(`/materiel/${record.id}`) })}
    />
  )
}

export default function MaterielsPage() {
  const { user } = useUser();
  const [materielPdfName, setmaterielPdfName] = useState<string>("");
  const [isNameValide, setisNameValide] = useState(true);
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [materielsPdf, setMaterielPdf] = useState<MaterielPdf[]>([]);

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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="hidden md:block md:col-span-1">
          <Sidebar />
        </div>

        <main className="col-span-1 md:col-span-5 px-4 md:px-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold">Matériels</h1>
                <p className="text-gray-500 mt-1">Liste et gestion des matériels électoraux</p>
              </div>
              <div>
                <Link href="/materiel/create">
                  <Button type='primary' size="large" icon={<Plus className="w-4 h-4" />}>
                    Ajouter un matériel
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
                  <MaterielsTable data={materielsPdf} onDeleted={() => fetchMaterielPdf()} />
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </Wrapper>
  );
}
