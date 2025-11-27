"use client"
import React, { useEffect, useState } from 'react'
import { deleteMaterielPdf, getMaterielPdfById, updatedMaterielPdf } from '@/app/actions'
import { MaterielPdf } from '@/type'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import { Trash2, Save, ArrowLeft, X } from 'lucide-react'
import MaterielInfo from '@/app/components/MaterielInfo'
import Materiel from '@/app/components/Materiel'
import { useRouter } from 'next/navigation'
import Pdf from '@/app/components/Pdf'
import Card from '@/app/components/Card'
import { Select, Button, Space, message, Modal } from 'antd'
import Link from 'next/link'

const Page = ({ params }: { params: Promise<{ materielId: string }> }) => {
  const [materielPdf, setMaterielPdf] = useState<MaterielPdf | null>(null);
  const [initialMaterielPdf, setInitialMaterielPdf] = useState<MaterielPdf | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
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
        setInitialMaterielPdf(mapped)
      } else {
        message.error("Aucun document trouvé pour cet ID.")
      }
    } catch (error) {
      console.error(error)
      message.error("Erreur lors du chargement du matériel")
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    fetchMaterielPdf()
  }, [])

  useEffect(() => {
    setIsSaveDisabled(
      JSON.stringify(materielPdf) === JSON.stringify(initialMaterielPdf)
    )
  }, [materielPdf, initialMaterielPdf])

  if (pageLoading) {
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

  const handleSave = async () => {
    if (!materielPdf) return;
    setIsLoading(true)
    try {
      await updatedMaterielPdf(materielPdf);
      message.success('Matériel sauvegardé avec succès')

      const refreshed = await getMaterielPdfById(materielPdf.id)
      if (refreshed) {
        const mappedRefreshed = { 
          ...refreshed, 
          materiels: (refreshed as any).Materiel || (refreshed as any).materiels || [] 
        }
        setMaterielPdf(mappedRefreshed)
        setInitialMaterielPdf(mappedRefreshed)
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de materiel : ", error);
      message.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (isSaveDisabled) {
      router.push(`/materiel/${materielPdf.id}`)
      return
    }

    Modal.confirm({
      title: 'Annuler les modifications',
      content: 'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir quitter ?',
      okText: 'Quitter sans sauvegarder',
      cancelText: 'Continuer l\'édition',
      onOk: () => {
        router.push(`/materiel/${materielPdf.id}`)
      }
    })
  }

  const handleDelete = async () => {
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
          router.push("/materiels")
        } catch (error) {
          console.error("Erreur lors de la suppression :", error)
          message.error('Erreur lors de la suppression')
        }
      }
    })
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
              <Link href={`/materiel/${materielPdf.id}`}>
                <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Modifier le matériel</h1>
                <p className="text-gray-500 mt-1">MATRI-{materielPdf.id}</p>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-sm">Statut</label>
                <Select
                  value={materielPdf?.status}
                  onChange={(value: number) => {
                    if (materielPdf) setMaterielPdf({ ...materielPdf, status: value })
                  }}
                  options={[
                    { value: 1, label: 'Brouillon' },
                    { value: 2, label: 'En transit' },
                    { value: 3, label: 'Reçu' },
                    { value: 4, label: 'Endommagé' },
                    { value: 5, label: 'Perdu' }
                  ]}
                  style={{ minWidth: 150 }}
                />
              </div>
              <Space>
                <Button
                  onClick={handleCancel}
                  icon={<X className="w-4 h-4" />}
                >
                  Annuler
                </Button>
                <Button
                  type='primary'
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  loading={isLoading}
                  icon={<Save className="w-4 h-4" />}
                >
                  Sauvegarder
                </Button>
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

          {/* Form Content */}
          <div className='flex flex-col md:flex-row w-full gap-4'>
            <div className='flex w-full md:w-1/3 flex-col'>
              <Card>
                <MaterielInfo materielPdf={materielPdf} setMaterielPdf={setMaterielPdf} />
              </Card>
            </div>

            <div className='flex w-full md:w-2/3 flex-col gap-4'>
              <Card>
                <Materiel materielPdf={materielPdf} setMaterielPdf={setMaterielPdf} />
              </Card>
              <Card>
                <Pdf materielPdf={materielPdf} />
              </Card>
            </div>
          </div>
        </main>
      </div>
    </Wrapper>
  )
}

export default Page

