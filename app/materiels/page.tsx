"use client";
import Image from "next/image";
import Wrapper from "../components/Wrapper";
import Sidebar from "../components/Sidebar";
import { Layers } from "lucide-react";
import { useEffect, useState } from "react";
import { createEmptyMaterielPdf, getMaterielPdfByEmail } from "@/app/actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { MaterielPdf } from "@/type";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Table, Space, Button, Modal, Badge } from 'antd';

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
    { title: 'Statut', dataIndex: 'status', key: 'status', render: (s: number) => getStatusBadge(s) },
    { title: 'Date départ', dataIndex: 'date_depart', key: 'date_depart' },
    { title: 'Actions', key: 'actions', render: (_: any, record: any) => (
      <Space>
        <Link href={`/materiel/${record.id}`}><Button type="link">Voir</Button></Link>
        <Link href={`/materiel/${record.id}/edit`}><Button type="default">Éditer</Button></Link>
  <Button danger onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleDelete(record.id); }}>Suppr.</Button>
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Matériels</h1>
            <p className="text-sm text-gray-500">Liste et gestion des matériels</p>
          </div>
          <div>
            <Link href="/materiel/create"><Button type='default'>Ajouter un matériel</Button></Link>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          {materielsPdf.length === 0 ? (
            <div className="col-span-full text-center text-sm text-gray-500">Aucun matériel trouvé. Créez-en un pour commencer.</div>
          ) : (
            <MaterielsTable data={materielsPdf} onDeleted={() => fetchMaterielPdf()} />
          )}
        </div>

        {/* Creation moved to dedicated page /materiel/create */}
          </div>
        </main>
      </div>
    </Wrapper>
  );
}
