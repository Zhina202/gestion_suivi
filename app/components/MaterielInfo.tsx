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
    const [districts, setDistricts] = useState<District[]>([])
    const [communes, setCommunes] = useState<Commune[]>([])
    const [centresVote, setCentresVote] = useState<CentreVote[]>([])
    
    const [selectedRegionId, setSelectedRegionId] = useState<string | undefined>(
        (materielPdf as any)?.regionId || (materielPdf as any)?.region?.id
    )
    const [selectedDistrictId, setSelectedDistrictId] = useState<string | undefined>(
        (materielPdf as any)?.districtId || (materielPdf as any)?.district?.id
    )
    const [selectedCommuneId, setSelectedCommuneId] = useState<string | undefined>(
        (materielPdf as any)?.communeId || (materielPdf as any)?.commune?.id
    )

    const loadDistricts = async (regionId: string) => {
        const data = await getDistrictsByRegion(regionId)
        setDistricts(data as District[])
    }

    const loadCommunes = async (districtId: string) => {
        const data = await getCommunesByDistrict(districtId)
        setCommunes(data as Commune[])
    }

    const loadCentresVote = async (communeId: string) => {
        const data = await getCentresVoteByCommune(communeId)
        setCentresVote(data as CentreVote[])
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
        const regionId = (materielPdf as any)?.regionId || (materielPdf as any)?.region?.id
        const districtId = (materielPdf as any)?.districtId || (materielPdf as any)?.district?.id
        const communeId = (materielPdf as any)?.communeId || (materielPdf as any)?.commune?.id
        
        if (regionId) {
            setSelectedRegionId(regionId)
            loadDistricts(regionId)
        }
        if (districtId) {
            setSelectedDistrictId(districtId)
            loadCommunes(districtId)
        }
        if (communeId) {
            setSelectedCommuneId(communeId)
            loadCentresVote(communeId)
        }
    }, [materielPdf])

    const handleRegionChange = async (regionId: string) => {
        setSelectedRegionId(regionId)
        setSelectedDistrictId(undefined)
        setSelectedCommuneId(undefined)
        setDistricts([])
        setCommunes([])
        setCentresVote([])
        setMaterielPdf({
            ...materielPdf,
            regionId: regionId,
            districtId: undefined,
            communeId: undefined,
            centreVoteId: undefined
        } as any)
        if (regionId) {
            await loadDistricts(regionId)
        }
    }

    const handleDistrictChange = async (districtId: string) => {
        setSelectedDistrictId(districtId)
        setSelectedCommuneId(undefined)
        setCommunes([])
        setCentresVote([])
        setMaterielPdf({
            ...materielPdf,
            districtId: districtId,
            communeId: undefined,
            centreVoteId: undefined
        } as any)
        if (districtId) {
            await loadCommunes(districtId)
        }
    }

    const handleCommuneChange = async (communeId: string) => {
        setSelectedCommuneId(communeId)
        setCentresVote([])
        setMaterielPdf({
            ...materielPdf,
            communeId: communeId,
            centreVoteId: undefined
        } as any)
        if (communeId) {
            await loadCentresVote(communeId)
        }
    }

    const handleCentreVoteChange = (centreVoteId: string) => {
        setMaterielPdf({
            ...materielPdf,
            centreVoteId: centreVoteId
        } as any)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | 
        HTMLTextAreaElement> , field : string) => {
            setMaterielPdf({...materielPdf , [field]: e.target.value})
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
                </div>

                <div className="mb-6">
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Localisation</h2>
                    <Form.Item label={<span className="font-semibold">Région</span>}>
                        <Select
                            placeholder="Sélectionner une région"
                            value={selectedRegionId}
                            onChange={handleRegionChange}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={regions.map((r: any) => ({ value: r.id, label: r.nom }))}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">District</span>}>
                        <Select
                            placeholder="Sélectionner un district"
                            value={selectedDistrictId}
                            onChange={handleDistrictChange}
                            disabled={!selectedRegionId}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={districts.map((d: any) => ({ value: d.id, label: d.nom }))}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Commune</span>}>
                        <Select
                            placeholder="Sélectionner une commune"
                            value={selectedCommuneId}
                            onChange={handleCommuneChange}
                            disabled={!selectedDistrictId}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={communes.map((c: any) => ({ value: c.id, label: c.nom }))}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Centre de vote</span>}>
                        <Select
                            placeholder="Sélectionner un centre de vote"
                            value={(materielPdf as any)?.centreVoteId || (materielPdf as any)?.centreVote?.id}
                            onChange={handleCentreVoteChange}
                            disabled={!selectedCommuneId}
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            options={centresVote.map((cv: any) => ({ value: cv.id, label: cv.nom }))}
                        />
                    </Form.Item>
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

