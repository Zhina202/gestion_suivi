"use client"
import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

// Forcer le rendu dynamique pour éviter le pré-rendu avec Clerk
export const dynamic = 'force-dynamic'
import { createEmptyMaterielPdf, getAllRegions, getDistrictsByRegion, getCommunesByDistrict, getCentresVoteByCommune } from '@/app/actions'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Button, Form, Input, DatePicker, message, Card, Space, Row, Col, Select } from 'antd'
import { ArrowLeft, Plus } from 'lucide-react'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import Link from 'next/link'
import { Region, District, Commune, CentreVote } from '@/type'

const { TextArea } = Input

export default function CreateMaterielPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm()
  
  // États pour les sélecteurs en cascade
  const [regions, setRegions] = useState<Region[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [communes, setCommunes] = useState<Commune[]>([])
  const [centresVote, setCentresVote] = useState<CentreVote[]>([])
  
  const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>()
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>()
  const [selectedCommuneId, setSelectedCommuneId] = useState<string | undefined>()

  const onFinish = async (values: any) => {
    if (!email) {
      message.error('Vous devez être connecté pour créer une expédition')
      return
    }
    setIsSubmitting(true)
    try {
      // Préparer les données initiales
      const initialData: any = {}
      if (values.lieuDepart) initialData.lieuDepart = values.lieuDepart
      if (values.lieuArrive) initialData.lieuArrive = values.lieuArrive
      if (values.dateDepart) {
        // Ant Design DatePicker retourne un dayjs object, convertir en ISO string
        initialData.dateDepart = values.dateDepart.format('YYYY-MM-DD')
      }
      if (values.nomEmetteur) initialData.nomEmetteur = values.nomEmetteur
      if (values.adresseEmetteur) initialData.adresseEmetteur = values.adresseEmetteur
      if (values.nomRecepteur) initialData.nomRecepteur = values.nomRecepteur
      if (values.adresseRecepteur) initialData.adresseRecepteur = values.adresseRecepteur
      if (values.notes) initialData.notes = values.notes
      if (values.regionId) initialData.regionId = values.regionId
      if (values.districtId) initialData.districtId = values.districtId
      if (values.communeId) initialData.communeId = values.communeId
      if (values.centreVoteId) initialData.centreVoteId = values.centreVoteId
      
      // Créer l'expédition avec toutes les données en une seule fois
      const expedition = await createEmptyMaterielPdf(
        email, 
        values.designation,
        Object.keys(initialData).length > 0 ? initialData : undefined
      )
      
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
      message.success('Expédition créée avec succès')
      router.push(`/materiel/${expedition.id}`)
    } catch (err) {
      console.error(err)
      message.error('Erreur lors de la création de l\'expédition')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Charger les régions au montage
  useEffect(() => {
    const loadRegions = async () => {
      const data = await getAllRegions()
      setRegions(data as Region[])
    }
    loadRegions()
  }, [])

  // Charger les districts quand une région est sélectionnée
  const handleRegionChange = async (regionId: string) => {
    setSelectedRegionId(regionId)
    setSelectedDistrictId(undefined)
    setSelectedCommuneId(undefined)
    setDistricts([])
    setCommunes([])
    setCentresVote([])
    form.setFieldsValue({ districtId: undefined, communeId: undefined, centreVoteId: undefined })
    
    if (regionId) {
      const data = await getDistrictsByRegion(regionId)
      setDistricts(data as District[])
    }
  }

  // Charger les communes quand un district est sélectionné
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId)
    setSelectedCommuneId(undefined)
    setCommunes([])
    setCentresVote([])
    form.setFieldsValue({ communeId: undefined, centreVoteId: undefined })
    
    if (districtId) {
      const data = await getCommunesByDistrict(districtId)
      setCommunes(data as Commune[])
    }
  }

  // Charger les centres de vote quand une commune est sélectionnée
  const handleCommuneChange = async (communeId: string) => {
    setSelectedCommuneId(communeId)
    setCentresVote([])
    form.setFieldsValue({ centreVoteId: undefined })
    
    if (communeId) {
      const data = await getCentresVoteByCommune(communeId)
      setCentresVote(data as CentreVote[])
    }
  }

  return (
    <Wrapper>
      <div className="flex min-h-screen bg-gray-50">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 md:ml-[240px] w-full px-4 md:px-8 py-6 md:py-8">
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

          <Card className="w-full max-w-6xl mx-auto">
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
                  placeholder="Adresse complète de l'émetteur"
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
                  placeholder="Notes additionnelles sur l'expédition"
                />
              </Form.Item>

              <div className="border-t border-gray-200 my-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation géographique</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='regionId'
                    label={<span className="font-medium text-gray-700">Région</span>}
                  >
                    <Select
                      placeholder="Sélectionner une région"
                      showSearch
                      allowClear
                      onChange={handleRegionChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={regions.map(region => ({
                        value: region.id,
                        label: region.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='districtId'
                    label={<span className="font-medium text-gray-700">District</span>}
                  >
                    <Select
                      placeholder="Sélectionner un district"
                      showSearch
                      allowClear
                      disabled={!selectedRegionId}
                      onChange={handleDistrictChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={districts.map(district => ({
                        value: district.id,
                        label: district.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='communeId'
                    label={<span className="font-medium text-gray-700">Commune</span>}
                  >
                    <Select
                      placeholder="Sélectionner une commune"
                      showSearch
                      allowClear
                      disabled={!selectedDistrictId}
                      onChange={handleCommuneChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={communes.map(commune => ({
                        value: commune.id,
                        label: commune.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='centreVoteId'
                    label={<span className="font-medium text-gray-700">Centre de vote</span>}
                  >
                    <Select
                      placeholder="Sélectionner un centre de vote"
                      showSearch
                      allowClear
                      disabled={!selectedCommuneId}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={centresVote.map(centre => ({
                        value: centre.id,
                        label: centre.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

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
