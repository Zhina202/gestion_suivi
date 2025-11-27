"use client"
import React, { useEffect, useState } from 'react'
import { deleteMaterielPdf, getMaterielPdfById, updatedMaterielPdf } from '@/app/actions'
import { MaterielPdf } from '@/type'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import { Trash } from 'lucide-react'
import MaterielPdfInfo from '@/app/components/MaterielPdfInfo'
import Materiel from '@/app/components/Materiel'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Pdf from '@/app/components/Pdf'
import Card from '@/app/components/Card'
import { Select, Button, Space } from 'antd'

const Page = ({ params }: { params: Promise<{ materielId: string }> }) => {
  const [materielPdf, setMaterielPdf] = useState<MaterielPdf | null>(null);
  const [initialMaterielPdf, setInitialMaterielPdf] = useState<MaterielPdf | null>(null);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchMaterielPdf = async () => {
    try {
      const { materielId } = await params
      const fetchedMaterielPdf = await getMaterielPdfById(materielId)
      if (fetchedMaterielPdf) {
        const mapped = { ...fetchedMaterielPdf, materiels: (fetchedMaterielPdf as any).Materiel || (fetchedMaterielPdf as any).materiels || [] }
        setMaterielPdf(mapped)
        setInitialMaterielPdf(mapped)
      } else {
        console.warn("Aucun document trouvé pour cet ID.")
      }
    } catch (error) {
      console.error(error)
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

  if (!materielPdf) return (
    <div className='flex justify-center items-center h-screen w-full'>
      <span className='font-bold'>Aucun document trouvé</span>
    </div>
  )

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value)
    if (materielPdf) {
      setMaterielPdf({ ...materielPdf, status: newStatus })
    }
  }


  const handleSave = async () => {
    if (!materielPdf) return;
    setIsLoading(true)
    try {
      await updatedMaterielPdf(materielPdf);

      const refreshed = await getMaterielPdfById(materielPdf.id)

      if (refreshed) {
        const mappedRefreshed = { ...refreshed, materiels: (refreshed as any).Materiel || (refreshed as any).materiels || [] }
        setMaterielPdf(mappedRefreshed)
        setInitialMaterielPdf(mappedRefreshed)
      }
      setIsLoading(false)

    } catch (error) {
      console.error("Erreur lors de la sauvegarde de materiel : ", error);
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer ?")

    if (confirmed) {
      try {
        await deleteMaterielPdf(materielPdf?.id as string)
        router.push("/materiel")
      } catch (error) {
        console.error("Erreur lors de la suppression :", error)
      }
    }
  }

  return (
    <Wrapper>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="hidden md:block md:col-span-1">
          <Sidebar />
        </div>

  <main className="col-span-1 md:col-span-5 px-4 md:px-6">
          <div>
        <div className='flex flex-col md:flex-row md:justify-between md:items-center mb-4'>
          <p className='text-lg font-light'>
           Materiel <span className='font-bold'> {materielPdf?.id} </span>
          </p>
            <div className='flex items-end gap-3 md:mt-0 mt-4 flex-nowrap'>
              <div className='flex flex-col'>
                <label className='mb-1 font-medium'>Statut</label>
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
              <div className='flex items-center gap-2'>
                <Button
                  type='primary'
                  size='small'
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  loading={isLoading}
                  icon={<Save />}
                  aria-label='Sauvegarder les modifications'
                  title='Sauvegarder'
                >
                  Sauvegarder
                </Button>

                <Button
                  danger
                  size='small'
                  onClick={handleDelete}
                  icon={<Trash />}
                  aria-label='Supprimer le document'
                  title='Supprimer'
                > Supprimer</Button>
              </div>
            </div>
        </div>

        <div className='flex flex-col md:flex-row w-full gap-4'>
          <div className='flex w-full md:w-1/3 flex-col'>
            <Card>
              <MaterielPdfInfo materielPdf={materielPdf} setMaterielPdf={setMaterielPdf} />
            </Card>
          </div>

          <div className='flex w-full md:w-2/3 flex-col md:ml-4 gap-4'>
            <Card>
              <Materiel materielPdf={materielPdf} setMaterielPdf={setMaterielPdf} />
            </Card>
            <Card>
              <Pdf materielPdf={materielPdf} />
            </Card>
          </div>

        </div>
          </div>
        </main>
      </div>
    </Wrapper>
  )
}

export default Page
