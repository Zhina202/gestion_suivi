"use client"
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createEmptyMaterielPdf } from '@/app/actions'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Button, Form, Input, DatePicker, message, Card, Space, Row, Col } from 'antd'
import { ArrowLeft, Plus } from 'lucide-react'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import Link from 'next/link'

const { TextArea } = Input

export default function CreateMaterielPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    if (!email) {
      message.error('Vous devez être connecté pour créer une expédition')
      return
    }
    setIsSubmitting(true)
    try {
      // Créer l'expédition avec les données de base
      const expedition = await createEmptyMaterielPdf(email, values.designation)
      
      // Si d'autres champs sont remplis, les mettre à jour via l'API
      if (values.lieuDepart || values.lieuArrive || values.dateDepart || values.nomEmetteur || values.adresseEmetteur || values.nomRecepteur || values.adresseRecepteur || values.notes) {
        // Mettre à jour l'expédition avec les autres champs
        const updateData: any = {}
        if (values.lieuDepart) updateData.lieuDepart = values.lieuDepart
        if (values.lieuArrive) updateData.lieuArrive = values.lieuArrive
        if (values.dateDepart) {
          // Ant Design DatePicker retourne un dayjs object
          updateData.dateDepart = values.dateDepart.format('YYYY-MM-DD')
        }
        if (values.nomEmetteur) updateData.nomEmetteur = values.nomEmetteur
        if (values.adresseEmetteur) updateData.adresseEmetteur = values.adresseEmetteur
        if (values.nomRecepteur) updateData.nomRecepteur = values.nomRecepteur
        if (values.adresseRecepteur) updateData.adresseRecepteur = values.adresseRecepteur
        if (values.notes) updateData.notes = values.notes
        
        // Mettre à jour via l'API
        await fetch(`/api/materiel/${expedition.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      }
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
      message.success('Expédition créée avec succès')
      router.push(`/materiel/${expedition.id}/edit`)
    } catch (err) {
      console.error(err)
      message.error('Erreur lors de la création de l\'expédition')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-[240px] px-4 md:px-6 w-full">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/materiels">
                <Button type="text" icon={<ArrowLeft className="w-5 h-5" />} />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Nouvelle Expédition</h1>
                <p className="text-gray-600 mt-1 text-sm">Créer une nouvelle expédition de matériels électoraux</p>
              </div>
            </div>
          </div>

          <Card className="max-w-4xl">
            <Form 
              form={form}
              layout='vertical' 
              onFinish={onFinish}
              size="large"
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='designation'
                    label={<span className="font-medium text-gray-700">Désignation *</span>}
                    rules={[
                      { required: true, message: 'Veuillez saisir la désignation' }, 
                      { max: 200, message: 'La désignation ne peut pas dépasser 200 caractères' }
                    ]}
                  >
                    <Input 
                      placeholder='Ex: Matériel électoral - Bureau de vote 001' 
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='dateDepart'
                    label={<span className="font-medium text-gray-700">Date de départ</span>}
                  >
                    <DatePicker 
                      className="w-full"
                      format="DD/MM/YYYY"
                      placeholder="Sélectionner la date"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="border-t border-gray-200 my-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations de départ</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='lieuDepart'
                    label={<span className="font-medium text-gray-700">Lieu de départ</span>}
                  >
                    <Input placeholder='Ex: Antananarivo' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='nomEmetteur'
                    label={<span className="font-medium text-gray-700">Nom de l'émetteur</span>}
                  >
                    <Input placeholder='Nom de la personne ou organisation' />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name='adresseEmetteur'
                label={<span className="font-medium text-gray-700">Adresse de l'émetteur</span>}
              >
                <TextArea 
                  rows={2}
                  placeholder='Adresse complète de l\'émetteur'
                />
              </Form.Item>

              <div className="border-t border-gray-200 my-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations d'arrivée</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='lieuArrive'
                    label={<span className="font-medium text-gray-700">Lieu d'arrivée</span>}
                  >
                    <Input placeholder='Ex: Toamasina' />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='nomRecepteur'
                    label={<span className="font-medium text-gray-700">Nom du récepteur</span>}
                  >
                    <Input placeholder='Nom de la personne ou organisation' />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name='adresseRecepteur'
                label={<span className="font-medium text-gray-700">Adresse du récepteur</span>}
              >
                <TextArea 
                  rows={2}
                  placeholder='Adresse complète du récepteur'
                />
              </Form.Item>

              <Form.Item
                name='notes'
                label={<span className="font-medium text-gray-700">Notes</span>}
              >
                <TextArea 
                  rows={3}
                  placeholder='Notes additionnelles sur l\'expédition'
                />
              </Form.Item>

              <Form.Item className="mb-0 mt-6">
                <Space>
                  <Button 
                    type='primary' 
                    htmlType='submit' 
                    loading={isSubmitting}
                    icon={<Plus className="w-4 h-4" />}
                    size="large"
                  >
                    Créer l'expédition
                  </Button>
                  <Button 
                    onClick={() => router.push('/materiels')}
                    size="large"
                  >
                    Annuler
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </main>
      </div>
    </Wrapper>
  )
}
