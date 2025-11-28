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
  
  // États pour les sélecteurs en cascade - Émetteur
  const [regions, setRegions] = useState<Region[]>([])
  const [districtsEmetteur, setDistrictsEmetteur] = useState<District[]>([])
  const [communesEmetteur, setCommunesEmetteur] = useState<Commune[]>([])
  const [centresVoteEmetteur, setCentresVoteEmetteur] = useState<CentreVote[]>([])
  const [selectedRegionEmetteurId, setSelectedRegionEmetteurId] = useState<string | undefined>()
  const [selectedDistrictEmetteurId, setSelectedDistrictEmetteurId] = useState<string | undefined>()
  const [selectedCommuneEmetteurId, setSelectedCommuneEmetteurId] = useState<string | undefined>()
  
  // États pour les sélecteurs en cascade - Récepteur
  const [districtsRecepteur, setDistrictsRecepteur] = useState<District[]>([])
  const [communesRecepteur, setCommunesRecepteur] = useState<Commune[]>([])
  const [centresVoteRecepteur, setCentresVoteRecepteur] = useState<CentreVote[]>([])
  const [selectedRegionRecepteurId, setSelectedRegionRecepteurId] = useState<string | undefined>()
  const [selectedDistrictRecepteurId, setSelectedDistrictRecepteurId] = useState<string | undefined>()
  const [selectedCommuneRecepteurId, setSelectedCommuneRecepteurId] = useState<string | undefined>()

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
      if (values.dateArrive) {
        // Ant Design DatePicker retourne un dayjs object, convertir en ISO string
        initialData.dateArrive = values.dateArrive.format('YYYY-MM-DD')
      }
      if (values.nomEmetteur) initialData.nomEmetteur = values.nomEmetteur
      if (values.adresseEmetteur) initialData.adresseEmetteur = values.adresseEmetteur
      // Localisations de l'émetteur
      if (values.regionEmetteurId) initialData.regionEmetteurId = values.regionEmetteurId
      if (values.districtEmetteurId) initialData.districtEmetteurId = values.districtEmetteurId
      if (values.communeEmetteurId) initialData.communeEmetteurId = values.communeEmetteurId
      if (values.centreVoteEmetteurId) initialData.centreVoteEmetteurId = values.centreVoteEmetteurId
      if (values.nomRecepteur) initialData.nomRecepteur = values.nomRecepteur
      if (values.adresseRecepteur) initialData.adresseRecepteur = values.adresseRecepteur
      // Localisations du récepteur
      if (values.regionRecepteurId) initialData.regionRecepteurId = values.regionRecepteurId
      if (values.districtRecepteurId) initialData.districtRecepteurId = values.districtRecepteurId
      if (values.communeRecepteurId) initialData.communeRecepteurId = values.communeRecepteurId
      if (values.centreVoteRecepteurId) initialData.centreVoteRecepteurId = values.centreVoteRecepteurId
      if (values.notes) initialData.notes = values.notes
      
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

  // Handlers pour l'émetteur
  const handleRegionEmetteurChange = async (regionId: string) => {
    setSelectedRegionEmetteurId(regionId)
    setSelectedDistrictEmetteurId(undefined)
    setSelectedCommuneEmetteurId(undefined)
    setDistrictsEmetteur([])
    setCommunesEmetteur([])
    setCentresVoteEmetteur([])
    form.setFieldsValue({ districtEmetteurId: undefined, communeEmetteurId: undefined, centreVoteEmetteurId: undefined })
    
    if (regionId) {
      const data = await getDistrictsByRegion(regionId)
      setDistrictsEmetteur(data as District[])
    }
  }

  const handleDistrictEmetteurChange = async (districtId: string) => {
    setSelectedDistrictEmetteurId(districtId)
    setSelectedCommuneEmetteurId(undefined)
    setCommunesEmetteur([])
    setCentresVoteEmetteur([])
    form.setFieldsValue({ communeEmetteurId: undefined, centreVoteEmetteurId: undefined })
    
    if (districtId) {
      const data = await getCommunesByDistrict(districtId)
      setCommunesEmetteur(data as Commune[])
    }
  }

  const handleCommuneEmetteurChange = async (communeId: string) => {
    setSelectedCommuneEmetteurId(communeId)
    setCentresVoteEmetteur([])
    form.setFieldsValue({ centreVoteEmetteurId: undefined })
    
    if (communeId) {
      const data = await getCentresVoteByCommune(communeId)
      setCentresVoteEmetteur(data as CentreVote[])
    }
  }

  // Handlers pour le récepteur
  const handleRegionRecepteurChange = async (regionId: string) => {
    setSelectedRegionRecepteurId(regionId)
    setSelectedDistrictRecepteurId(undefined)
    setSelectedCommuneRecepteurId(undefined)
    setDistrictsRecepteur([])
    setCommunesRecepteur([])
    setCentresVoteRecepteur([])
    form.setFieldsValue({ districtRecepteurId: undefined, communeRecepteurId: undefined, centreVoteRecepteurId: undefined })
    
    if (regionId) {
      const data = await getDistrictsByRegion(regionId)
      setDistrictsRecepteur(data as District[])
    }
  }

  const handleDistrictRecepteurChange = async (districtId: string) => {
    setSelectedDistrictRecepteurId(districtId)
    setSelectedCommuneRecepteurId(undefined)
    setCommunesRecepteur([])
    setCentresVoteRecepteur([])
    form.setFieldsValue({ communeRecepteurId: undefined, centreVoteRecepteurId: undefined })
    
    if (districtId) {
      const data = await getCommunesByDistrict(districtId)
      setCommunesRecepteur(data as Commune[])
    }
  }

  const handleCommuneRecepteurChange = async (communeId: string) => {
    setSelectedCommuneRecepteurId(communeId)
    setCentresVoteRecepteur([])
    form.setFieldsValue({ centreVoteRecepteurId: undefined })
    
    if (communeId) {
      const data = await getCentresVoteByCommune(communeId)
      setCentresVoteRecepteur(data as CentreVote[])
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
                    name='dateArrive'
                    label={<span className="font-medium text-gray-700">Date d'arrivée</span>}
                  >
                    <DatePicker 
                      className="w-full"
                      format="DD/MM/YYYY"
                      placeholder="Sélectionner la date"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24}>
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
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation de l'émetteur</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='regionEmetteurId'
                    label={<span className="font-medium text-gray-700">Région</span>}
                  >
                    <Select
                      placeholder="Sélectionner une région"
                      showSearch
                      allowClear
                      onChange={handleRegionEmetteurChange}
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
                    name='districtEmetteurId'
                    label={<span className="font-medium text-gray-700">District</span>}
                  >
                    <Select
                      placeholder="Sélectionner un district"
                      showSearch
                      allowClear
                      disabled={!selectedRegionEmetteurId}
                      onChange={handleDistrictEmetteurChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={districtsEmetteur.map(district => ({
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
                    name='communeEmetteurId'
                    label={<span className="font-medium text-gray-700">Commune</span>}
                  >
                    <Select
                      placeholder="Sélectionner une commune"
                      showSearch
                      allowClear
                      disabled={!selectedDistrictEmetteurId}
                      onChange={handleCommuneEmetteurChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={communesEmetteur.map(commune => ({
                        value: commune.id,
                        label: commune.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='centreVoteEmetteurId'
                    label={<span className="font-medium text-gray-700">Centre de vote</span>}
                  >
                    <Select
                      placeholder="Sélectionner un centre de vote"
                      showSearch
                      allowClear
                      disabled={!selectedCommuneEmetteurId}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={centresVoteEmetteur.map(centre => ({
                        value: centre.id,
                        label: centre.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="border-t border-gray-200 my-6"></div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Localisation du récepteur</h3>
              
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='regionRecepteurId'
                    label={<span className="font-medium text-gray-700">Région</span>}
                  >
                    <Select
                      placeholder="Sélectionner une région"
                      showSearch
                      allowClear
                      onChange={handleRegionRecepteurChange}
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
                    name='districtRecepteurId'
                    label={<span className="font-medium text-gray-700">District</span>}
                  >
                    <Select
                      placeholder="Sélectionner un district"
                      showSearch
                      allowClear
                      disabled={!selectedRegionRecepteurId}
                      onChange={handleDistrictRecepteurChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={districtsRecepteur.map(district => ({
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
                    name='communeRecepteurId'
                    label={<span className="font-medium text-gray-700">Commune</span>}
                  >
                    <Select
                      placeholder="Sélectionner une commune"
                      showSearch
                      allowClear
                      disabled={!selectedDistrictRecepteurId}
                      onChange={handleCommuneRecepteurChange}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={communesRecepteur.map(commune => ({
                        value: commune.id,
                        label: commune.nom
                      }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name='centreVoteRecepteurId'
                    label={<span className="font-medium text-gray-700">Centre de vote</span>}
                  >
                    <Select
                      placeholder="Sélectionner un centre de vote"
                      showSearch
                      allowClear
                      disabled={!selectedCommuneRecepteurId}
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      options={centresVoteRecepteur.map(centre => ({
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
