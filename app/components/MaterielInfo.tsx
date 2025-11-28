"use client";
import { MaterielPdf, Region, District, Commune, CentreVote } from '@/type'
import React, { useEffect, useState } from 'react'
import { Form, Input, Select } from 'antd'
import { getAllRegions, getDistrictsByRegion, getCommunesByDistrict, getCentresVoteByCommune } from '@/app/actions'

interface Props {
    materielPdf : MaterielPdf 
    setMaterielPdf : (materielPdf:MaterielPdf) => void
}
const MaterielInfo : React.FC<Props>  = ({materielPdf , setMaterielPdf}) => {
    const [regions, setRegions] = useState<Region[]>([])
    
    // États pour les localisations de l'émetteur
    const [districtsEmetteur, setDistrictsEmetteur] = useState<District[]>([])
    const [communesEmetteur, setCommunesEmetteur] = useState<Commune[]>([])
    const [centresVoteEmetteur, setCentresVoteEmetteur] = useState<CentreVote[]>([])
    const [selectedRegionEmetteurId, setSelectedRegionEmetteurId] = useState<string | undefined>()
    const [selectedDistrictEmetteurId, setSelectedDistrictEmetteurId] = useState<string | undefined>()
    const [selectedCommuneEmetteurId, setSelectedCommuneEmetteurId] = useState<string | undefined>()
    
    // États pour les localisations du récepteur
    const [districtsRecepteur, setDistrictsRecepteur] = useState<District[]>([])
    const [communesRecepteur, setCommunesRecepteur] = useState<Commune[]>([])
    const [centresVoteRecepteur, setCentresVoteRecepteur] = useState<CentreVote[]>([])
    const [selectedRegionRecepteurId, setSelectedRegionRecepteurId] = useState<string | undefined>()
    const [selectedDistrictRecepteurId, setSelectedDistrictRecepteurId] = useState<string | undefined>()
    const [selectedCommuneRecepteurId, setSelectedCommuneRecepteurId] = useState<string | undefined>()

    const loadDistricts = async (regionId: string) => {
        const data = await getDistrictsByRegion(regionId)
        return data as District[]
    }

    const loadCommunes = async (districtId: string) => {
        const data = await getCommunesByDistrict(districtId)
        return data as Commune[]
    }

    const loadCentresVote = async (communeId: string) => {
        const data = await getCentresVoteByCommune(communeId)
        return data as CentreVote[]
    }

    // Charger les régions au montage
    useEffect(() => {
        const loadRegions = async () => {
            const data = await getAllRegions()
            setRegions(data as Region[])
        }
        loadRegions()
    }, [])

    // Initialiser les sélections depuis materielPdf
    useEffect(() => {
        // Localisations de l'émetteur
        const regionEmetteurId = (materielPdf as any)?.regionEmetteurId || (materielPdf as any)?.regionEmetteur?.id
        const districtEmetteurId = (materielPdf as any)?.districtEmetteurId || (materielPdf as any)?.districtEmetteur?.id
        const communeEmetteurId = (materielPdf as any)?.communeEmetteurId || (materielPdf as any)?.communeEmetteur?.id
        
        if (regionEmetteurId) {
            setSelectedRegionEmetteurId(regionEmetteurId)
            loadDistricts(regionEmetteurId).then(setDistrictsEmetteur)
        }
        if (districtEmetteurId) {
            setSelectedDistrictEmetteurId(districtEmetteurId)
            loadCommunes(districtEmetteurId).then(setCommunesEmetteur)
        }
        if (communeEmetteurId) {
            setSelectedCommuneEmetteurId(communeEmetteurId)
            loadCentresVote(communeEmetteurId).then(setCentresVoteEmetteur)
        }
        
        // Localisations du récepteur
        const regionRecepteurId = (materielPdf as any)?.regionRecepteurId || (materielPdf as any)?.regionRecepteur?.id
        const districtRecepteurId = (materielPdf as any)?.districtRecepteurId || (materielPdf as any)?.districtRecepteur?.id
        const communeRecepteurId = (materielPdf as any)?.communeRecepteurId || (materielPdf as any)?.communeRecepteur?.id
        
        if (regionRecepteurId) {
            setSelectedRegionRecepteurId(regionRecepteurId)
            loadDistricts(regionRecepteurId).then(setDistrictsRecepteur)
        }
        if (districtRecepteurId) {
            setSelectedDistrictRecepteurId(districtRecepteurId)
            loadCommunes(districtRecepteurId).then(setCommunesRecepteur)
        }
        if (communeRecepteurId) {
            setSelectedCommuneRecepteurId(communeRecepteurId)
            loadCentresVote(communeRecepteurId).then(setCentresVoteRecepteur)
        }
    }, [materielPdf])

    // Handlers pour l'émetteur
    const handleRegionEmetteurChange = async (regionId: string) => {
        setSelectedRegionEmetteurId(regionId)
        setSelectedDistrictEmetteurId(undefined)
        setSelectedCommuneEmetteurId(undefined)
        setDistrictsEmetteur([])
        setCommunesEmetteur([])
        setCentresVoteEmetteur([])
        setMaterielPdf({
            ...materielPdf,
            regionEmetteurId: regionId,
            districtEmetteurId: undefined,
            communeEmetteurId: undefined,
            centreVoteEmetteurId: undefined
        } as any)
        if (regionId) {
            const districts = await loadDistricts(regionId)
            setDistrictsEmetteur(districts)
        }
    }

    const handleDistrictEmetteurChange = async (districtId: string) => {
        setSelectedDistrictEmetteurId(districtId)
        setSelectedCommuneEmetteurId(undefined)
        setCommunesEmetteur([])
        setCentresVoteEmetteur([])
        setMaterielPdf({
            ...materielPdf,
            districtEmetteurId: districtId,
            communeEmetteurId: undefined,
            centreVoteEmetteurId: undefined
        } as any)
        if (districtId) {
            const communes = await loadCommunes(districtId)
            setCommunesEmetteur(communes)
        }
    }

    const handleCommuneEmetteurChange = async (communeId: string) => {
        setSelectedCommuneEmetteurId(communeId)
        setCentresVoteEmetteur([])
        setMaterielPdf({
            ...materielPdf,
            communeEmetteurId: communeId,
            centreVoteEmetteurId: undefined
        } as any)
        if (communeId) {
            const centresVote = await loadCentresVote(communeId)
            setCentresVoteEmetteur(centresVote)
        }
    }

    const handleCentreVoteEmetteurChange = (centreVoteId: string) => {
        setMaterielPdf({
            ...materielPdf,
            centreVoteEmetteurId: centreVoteId
        } as any)
    }

    // Handlers pour le récepteur
    const handleRegionRecepteurChange = async (regionId: string) => {
        setSelectedRegionRecepteurId(regionId)
        setSelectedDistrictRecepteurId(undefined)
        setSelectedCommuneRecepteurId(undefined)
        setDistrictsRecepteur([])
        setCommunesRecepteur([])
        setCentresVoteRecepteur([])
        setMaterielPdf({
            ...materielPdf,
            regionRecepteurId: regionId,
            districtRecepteurId: undefined,
            communeRecepteurId: undefined,
            centreVoteRecepteurId: undefined
        } as any)
        if (regionId) {
            const districts = await loadDistricts(regionId)
            setDistrictsRecepteur(districts)
        }
    }

    const handleDistrictRecepteurChange = async (districtId: string) => {
        setSelectedDistrictRecepteurId(districtId)
        setSelectedCommuneRecepteurId(undefined)
        setCommunesRecepteur([])
        setCentresVoteRecepteur([])
        setMaterielPdf({
            ...materielPdf,
            districtRecepteurId: districtId,
            communeRecepteurId: undefined,
            centreVoteRecepteurId: undefined
        } as any)
        if (districtId) {
            const communes = await loadCommunes(districtId)
            setCommunesRecepteur(communes)
        }
    }

    const handleCommuneRecepteurChange = async (communeId: string) => {
        setSelectedCommuneRecepteurId(communeId)
        setCentresVoteRecepteur([])
        setMaterielPdf({
            ...materielPdf,
            communeRecepteurId: communeId,
            centreVoteRecepteurId: undefined
        } as any)
        if (communeId) {
            const centresVote = await loadCentresVote(communeId)
            setCentresVoteRecepteur(centresVote)
        }
    }

    const handleCentreVoteRecepteurChange = (centreVoteId: string) => {
        setMaterielPdf({
            ...materielPdf,
            centreVoteRecepteurId: centreVoteId
        } as any)
    }

    return (
        <div className='flex flex-col h-fit'>
            <Form layout='vertical' size="large">
                <div className="mb-6">
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Émetteur</h2>
                    <Form.Item label={<span className="font-semibold">Nom de l'émetteur</span>}>
                        <Input
                            value={(materielPdf as any)?.nomEmetteur || (materielPdf as any)?.nom_emetteur || ''}
                            placeholder="Nom de l'émetteur"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, nomEmetteur: value, nom_emetteur: value} as any)
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse de l'émetteur</span>}>
                        <Input.TextArea
                            value={(materielPdf as any)?.adresseEmetteur || (materielPdf as any)?.adresse_emetteur || ''}
                            placeholder="Adresse complète de l'émetteur"
                            rows={4}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, adresseEmetteur: value, adresse_emetteur: value} as any)
                            }}
                        />
                    </Form.Item>

                    {/* Localisation de l'émetteur */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className='text-md font-semibold mb-3 text-gray-700'>Localisation de l'émetteur</h3>
                        <Form.Item label={<span className="font-semibold">Région</span>}>
                            <Select
                                placeholder="Sélectionner une région"
                                value={selectedRegionEmetteurId}
                                onChange={handleRegionEmetteurChange}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={regions.map((r: any) => ({ value: r.id, label: r.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">District</span>}>
                            <Select
                                placeholder="Sélectionner un district"
                                value={selectedDistrictEmetteurId}
                                onChange={handleDistrictEmetteurChange}
                                disabled={!selectedRegionEmetteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={districtsEmetteur.map((d: any) => ({ value: d.id, label: d.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">Commune</span>}>
                            <Select
                                placeholder="Sélectionner une commune"
                                value={selectedCommuneEmetteurId}
                                onChange={handleCommuneEmetteurChange}
                                disabled={!selectedDistrictEmetteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={communesEmetteur.map((c: any) => ({ value: c.id, label: c.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">Centre de vote</span>}>
                            <Select
                                placeholder="Sélectionner un centre de vote"
                                value={(materielPdf as any)?.centreVoteEmetteurId || (materielPdf as any)?.centreVoteEmetteur?.id}
                                onChange={handleCentreVoteEmetteurChange}
                                disabled={!selectedCommuneEmetteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={centresVoteEmetteur.map((cv: any) => ({ value: cv.id, label: cv.nom }))}
                            />
                        </Form.Item>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Récepteur</h2>
                    <Form.Item label={<span className="font-semibold">Nom du récepteur</span>}>
                        <Input
                            value={(materielPdf as any)?.nomRecepteur || (materielPdf as any)?.nom_recepteur || ''}
                            placeholder="Nom du récepteur"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, nomRecepteur: value, nom_recepteur: value} as any)
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse du récepteur</span>}>
                        <Input.TextArea
                            value={(materielPdf as any)?.adresseRecepteur || (materielPdf as any)?.adresse_recepteur || ''}
                            placeholder="Adresse complète du récepteur"
                            rows={4}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, adresseRecepteur: value, adresse_recepteur: value} as any)
                            }}
                        />
                    </Form.Item>

                    {/* Localisation du récepteur */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h3 className='text-md font-semibold mb-3 text-gray-700'>Localisation du récepteur</h3>
                        <Form.Item label={<span className="font-semibold">Région</span>}>
                            <Select
                                placeholder="Sélectionner une région"
                                value={selectedRegionRecepteurId}
                                onChange={handleRegionRecepteurChange}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={regions.map((r: any) => ({ value: r.id, label: r.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">District</span>}>
                            <Select
                                placeholder="Sélectionner un district"
                                value={selectedDistrictRecepteurId}
                                onChange={handleDistrictRecepteurChange}
                                disabled={!selectedRegionRecepteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={districtsRecepteur.map((d: any) => ({ value: d.id, label: d.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">Commune</span>}>
                            <Select
                                placeholder="Sélectionner une commune"
                                value={selectedCommuneRecepteurId}
                                onChange={handleCommuneRecepteurChange}
                                disabled={!selectedDistrictRecepteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={communesRecepteur.map((c: any) => ({ value: c.id, label: c.nom }))}
                            />
                        </Form.Item>

                        <Form.Item label={<span className="font-semibold">Centre de vote</span>}>
                            <Select
                                placeholder="Sélectionner un centre de vote"
                                value={(materielPdf as any)?.centreVoteRecepteurId || (materielPdf as any)?.centreVoteRecepteur?.id}
                                onChange={handleCentreVoteRecepteurChange}
                                disabled={!selectedCommuneRecepteurId}
                                allowClear
                                showSearch
                                optionFilterProp="label"
                                options={centresVoteRecepteur.map((cv: any) => ({ value: cv.id, label: cv.nom }))}
                            />
                        </Form.Item>
                    </div>
                </div>

                <div>
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Dates</h2>
                    <Form.Item label={<span className="font-semibold">Date de départ</span>}>
                        <Input
                            type="date"
                            value={
                                (materielPdf as any)?.dateDepart 
                                    ? new Date((materielPdf as any).dateDepart).toISOString().split('T')[0]
                                    : (materielPdf as any)?.date_depart || ''
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                const dateValue = value ? new Date(value) : null;
                                setMaterielPdf({
                                    ...materielPdf, 
                                    dateDepart: dateValue as any,
                                    date_depart: value
                                } as any)
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Date d'arrivée</span>}>
                        <Input
                            type="date"
                            value={
                                (materielPdf as any)?.dateArrive 
                                    ? new Date((materielPdf as any).dateArrive).toISOString().split('T')[0]
                                    : (materielPdf as any)?.date_arrive || ''
                            }
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const value = e.target.value;
                                const dateValue = value ? new Date(value) : null;
                                setMaterielPdf({
                                    ...materielPdf, 
                                    dateArrive: dateValue as any,
                                    date_arrive: value
                                } as any)
                            }}
                        />
                    </Form.Item>
                </div>
            </Form>
        </div>
    )
}

export default MaterielInfo
