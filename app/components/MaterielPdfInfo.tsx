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
        <div className='flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0'>
                <Form layout='vertical'>
                    <h2 className='font-bold'>Emetteur</h2>
                    <Form.Item label='Nom de l’émetteur' required>
                        <Input
                                value={materielPdf?.nom_emetteur}
                                placeholder="Veuillez saisir le nom de l’émetteur"
                                onChange={(e) => handleInputChange(e as any , 'nom_emetteur')}
                        />
                    </Form.Item>

                    <Form.Item label='Adresse de l’émetteur' required>
                        <Input.TextArea
                            value={materielPdf?.adresse_emetteur}
                            placeholder="Veuillez saisir l’adresse de l’émetteur"
                            rows={4}
                            onChange={(e) => handleInputChange(e as any , 'adresse_emetteur')}
                        />
                    </Form.Item>

                    <h2 className='font-bold'>Récepteur</h2>
                    <Form.Item label='Nom du récepteur' required>
                        <Input
                                value={materielPdf?.nom_recepteur}
                                placeholder="Veuillez saisir le nom du récepteur"
                                onChange={(e) => handleInputChange(e as any , 'nom_recepteur')}
                        />
                    </Form.Item>

                    <Form.Item label='Adresse du récepteur' required>
                        <Input.TextArea
                            value={materielPdf?.adresse_recepteur}
                            placeholder="Veuillez saisir l’adresse du récepteur"
                            rows={4}
                            onChange={(e) => handleInputChange(e as any , 'adresse_recepteur')}
                        />
                    </Form.Item>

                    <Form.Item label='Date de départ' required>
                        <Input
                                type="date"
                                value={materielPdf?.date_depart}
                                onChange={(e) => handleInputChange(e as any , 'date_depart')}
                        />
                    </Form.Item>

                    <Form.Item label='Date d’arrivée' required>
                        <Input
                                type="date"
                                value={materielPdf?.date_arrive}
                                onChange={(e) => handleInputChange(e as any , 'date_arrive')}
                        />
                    </Form.Item>
                </Form>
        </div>
    )
}

export default MaterielPdfInfo