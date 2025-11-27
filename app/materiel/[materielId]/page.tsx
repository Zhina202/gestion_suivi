"use client"
import React, { useEffect, useState } from 'react'
import { getMaterielPdfById } from '@/app/actions'
import { MaterielPdf } from '@/type'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import { Edit, ArrowLeft, Download, Trash2 } from 'lucide-react'
import Pdf from '@/app/components/Pdf'
import Card from '@/app/components/Card'
import { Badge, Button, Descriptions, Space, Modal, message } from 'antd'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteMaterielPdf } from '@/app/actions'

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

const Page = ({ params }: { params: Promise<{ materielId: string }> }) => {
  const [materielPdf, setMaterielPdf] = useState<MaterielPdf | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMaterielPdf = async () => {
    try {
      const { materielId } = await params
      const fetchedMaterielPdf = await getMaterielPdfById(materielId)
      if (fetchedMaterielPdf) {
        const mapped = { 
          ...fetchedMaterielPdf, 
          materiels: (fetchedMaterielPdf as any).Materiel || (fetchedMaterielPdf as any).materiels || [] 
        }
        setMaterielPdf(mapped)
      } else {
        message.error("Aucun document trouvé pour cet ID.")
      }
    } catch (error) {
      console.error(error)
      message.error("Erreur lors du chargement du matériel")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterielPdf()
  }, [])

  const handleDelete = async () => {
    if (!materielPdf) return;
    
    Modal.confirm({
      title: 'Confirmer la suppression',
      content: 'Êtes-vous sûr de vouloir supprimer ce matériel ? Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await deleteMaterielPdf(materielPdf.id)
          message.success('Matériel supprimé avec succès')
          router.push('/materiels')
        } catch (error) {
          console.error("Erreur lors de la suppression :", error)
          message.error('Erreur lors de la suppression')
        }
      }
    })
  }

  if (loading) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center h-screen w-full">
          <div className="text-center">
            <div className="text-lg font-semibold">Chargement...</div>
          </div>
        </div>
      </Wrapper>
    )
  }

  if (!materielPdf) {
    return (
      <Wrapper>
        <div className="flex justify-center items-center h-screen w-full">
          <div className="text-center">
            <div className="text-lg font-semibold mb-4">Aucun document trouvé</div>
            <Link href="/materiels">
              <Button type="primary">Retour à la liste</Button>
            </Link>
          </div>
        </div>
      </Wrapper>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  return (
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-60 px-4 md:px-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/materiels">
                <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Détails du matériel</h1>
                <p className="text-gray-500 mt-1">MATRI-{materielPdf.id}</p>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>{getStatusBadge(materielPdf.status)}</div>
              <Space>
                <Link href={`/materiel/${materielPdf.id}/edit`}>
                  <Button type="primary" icon={<Edit className="w-4 h-4" />}>
                    Modifier
                  </Button>
                </Link>
                <Button 
                  danger 
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleDelete}
                >
                  Supprimer
                </Button>
              </Space>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <Descriptions title="Informations générales" column={1} bordered>
                <Descriptions.Item label="Nom">
                  {materielPdf.design || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Statut">
                  {getStatusBadge(materielPdf.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Date de départ">
                  {formatDate(materielPdf.date_depart)}
                </Descriptions.Item>
                <Descriptions.Item label="Date d'arrivée">
                  {formatDate(materielPdf.date_arrive)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card>
              <Descriptions title="Émetteur" column={1} bordered>
                <Descriptions.Item label="Nom">
                  {materielPdf.nom_emetteur || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Adresse">
                  <div className="max-w-xs whitespace-pre-wrap">
                    {materielPdf.adresse_emetteur || "—"}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card>
              <Descriptions title="Récepteur" column={1} bordered>
                <Descriptions.Item label="Nom">
                  {materielPdf.nom_recepteur || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Adresse">
                  <div className="max-w-xs whitespace-pre-wrap">
                    {materielPdf.adresse_recepteur || "—"}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>

          {/* Liste des matériels */}
          {materielPdf.materiels && materielPdf.materiels.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Matériels électoraux</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold">#</th>
                      <th className="text-left p-3 font-semibold">Design</th>
                      <th className="text-left p-3 font-semibold">Catégorie</th>
                      <th className="text-left p-3 font-semibold">Description</th>
                      <th className="text-left p-3 font-semibold">Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materielPdf.materiels.map((materiel: import("@prisma/client").Materiel, index: number) => (
                      <tr key={materiel.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">{materiel.design || "—"}</td>
                        <td className="p-3">
                          {materiel.categorie ? (
                            <Badge color="blue">{materiel.categorie}</Badge>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="p-3">{materiel.description || "—"}</td>
                        <td className="p-3 font-semibold">{materiel.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* PDF Export */}
          <Card>
            <Pdf materielPdf={materielPdf} />
          </Card>
        </main>
      </div>
    </Wrapper>
  )
}

export default Page
