"use client";
import { MaterielPdf } from '@/type'
import React from 'react'
import { Form, Input } from 'antd'

interface Props {
    materielPdf : MaterielPdf 
    setMaterielPdf : (materielPdf:MaterielPdf) => void
}
const MaterielPdfInfo : React.FC<Props>  = ({materielPdf , setMaterielPdf}) => {

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
                            value={materielPdf?.nom_emetteur || ''}
                            placeholder="Nom de l'émetteur"
                            onChange={(e) => handleInputChange(e as any, 'nom_emetteur')}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse de l'émetteur</span>}>
                        <Input.TextArea
                            value={materielPdf?.adresse_emetteur || ''}
                            placeholder="Adresse complète de l'émetteur"
                            rows={4}
                            onChange={(e) => handleInputChange(e as any, 'adresse_emetteur')}
                        />
                    </Form.Item>
                </div>

                <div className="mb-6">
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Récepteur</h2>
                    <Form.Item label={<span className="font-semibold">Nom du récepteur</span>}>
                        <Input
                            value={materielPdf?.nom_recepteur || ''}
                            placeholder="Nom du récepteur"
                            onChange={(e) => handleInputChange(e as any, 'nom_recepteur')}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Adresse du récepteur</span>}>
                        <Input.TextArea
                            value={materielPdf?.adresse_recepteur || ''}
                            placeholder="Adresse complète du récepteur"
                            rows={4}
                            onChange={(e) => handleInputChange(e as any, 'adresse_recepteur')}
                        />
                    </Form.Item>
                </div>

                <div>
                    <h2 className='text-lg font-bold mb-4 pb-2 border-b'>Dates</h2>
                    <Form.Item label={<span className="font-semibold">Date de départ</span>}>
                        <Input
                            type="date"
                            value={materielPdf?.date_depart || ''}
                            onChange={(e) => handleInputChange(e as any, 'date_depart')}
                        />
                    </Form.Item>

                    <Form.Item label={<span className="font-semibold">Date d'arrivée</span>}>
                        <Input
                            type="date"
                            value={materielPdf?.date_arrive || ''}
                            onChange={(e) => handleInputChange(e as any, 'date_arrive')}
                        />
                    </Form.Item>
                </div>
            </Form>
        </div>
    )
}

export default MaterielPdfInfo