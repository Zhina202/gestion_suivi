"use client";
import { MaterielPdf } from '@/type'
import React from 'react'
import { Form, Input } from 'antd'

interface Props {
    materielPdf : MaterielPdf 
    setMaterielPdf : (materielPdf:MaterielPdf) => void
}
const MaterielInfo : React.FC<Props>  = ({materielPdf , setMaterielPdf}) => {

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
                            value={materielPdf?.nomEmetteur || materielPdf?.nom_emetteur || ''}
                            placeholder="Nom de l'émetteur"
                            onChange={(e) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, nomEmetteur: value, nom_emetteur: value})
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse de l'émetteur</span>}>
                        <Input.TextArea
                            value={materielPdf?.adresseEmetteur || materielPdf?.adresse_emetteur || ''}
                            placeholder="Adresse complète de l'émetteur"
                            rows={4}
                            onChange={(e) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, adresseEmetteur: value, adresse_emetteur: value})
                            }}
                        />
                    </Form.Item>
                </div>

                <div className="mb-6">
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Récepteur</h2>
                    <Form.Item label={<span className="font-semibold">Nom du récepteur</span>}>
                        <Input
                            value={materielPdf?.nomRecepteur || materielPdf?.nom_recepteur || ''}
                            placeholder="Nom du récepteur"
                            onChange={(e) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, nomRecepteur: value, nom_recepteur: value})
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse du récepteur</span>}>
                        <Input.TextArea
                            value={materielPdf?.adresseRecepteur || materielPdf?.adresse_recepteur || ''}
                            placeholder="Adresse complète du récepteur"
                            rows={4}
                            onChange={(e) => {
                                const value = e.target.value;
                                setMaterielPdf({...materielPdf, adresseRecepteur: value, adresse_recepteur: value})
                            }}
                        />
                    </Form.Item>
                </div>

                <div>
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Dates</h2>
                    <Form.Item label={<span className="font-semibold">Date de départ</span>}>
                        <Input
                            type="date"
                            value={
                                materielPdf?.dateDepart 
                                    ? new Date(materielPdf.dateDepart).toISOString().split('T')[0]
                                    : materielPdf?.date_depart || ''
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                const dateValue = value ? new Date(value) : null;
                                setMaterielPdf({
                                    ...materielPdf, 
                                    dateDepart: dateValue as any,
                                    date_depart: value
                                })
                            }}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Date d'arrivée</span>}>
                        <Input
                            type="date"
                            value={
                                materielPdf?.dateArrive 
                                    ? new Date(materielPdf.dateArrive).toISOString().split('T')[0]
                                    : materielPdf?.date_arrive || ''
                            }
                            onChange={(e) => {
                                const value = e.target.value;
                                const dateValue = value ? new Date(value) : null;
                                setMaterielPdf({
                                    ...materielPdf, 
                                    dateArrive: dateValue as any,
                                    date_arrive: value
                                })
                            }}
                        />
                    </Form.Item>
                </div>
            </Form>
        </div>
    )
}

export default MaterielInfo

