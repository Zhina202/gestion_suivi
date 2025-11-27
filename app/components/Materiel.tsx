import React from 'react'
import { MaterielPdf } from '@/type'
import { Plus, Trash } from 'lucide-react'
import type { Materiel as MaterielType } from "@/type"
import { Button, Input, InputNumber, Space, Badge } from 'antd'

interface Props {
    materielPdf : MaterielPdf 
    setMaterielPdf : (materielPdf:MaterielPdf) => void
}

const Materiel : React.FC<Props> = ({ materielPdf , setMaterielPdf}) => {

    const handleAddLine =() => {
        const newLine: MaterielType = {
            id : `${Date.now()}`,
            design:"",
            categorie:"",
            description:"",
            quantity:1,
            userId: null,
            materielPdfId:materielPdf.id
        }

        const updated = [...(materielPdf.materiels || []), newLine]

        setMaterielPdf({
            ...materielPdf,
           materiels: updated,
           // keep parity with server shape (Prisma returns `Materiel` capitalized)
           Materiel: updated
        })
    }

    const handleDesignChange = (index : number , value:string) => {
        const updatedMateriels = [...(materielPdf.materiels || [])]
        updatedMateriels[index].design = value 
        setMaterielPdf({...materielPdf , materiels : updatedMateriels, Materiel: updatedMateriels})
    }

    const handleCategorieChange = (index : number , value:string) => {
        const updatedMateriels = [...(materielPdf.materiels || [])]
        updatedMateriels[index].categorie = value
        setMaterielPdf({...materielPdf , materiels : updatedMateriels, Materiel: updatedMateriels})
    }

    const handleDescriptionChange = (index : number , value:string) => {
        const updatedMateriels = [...(materielPdf.materiels || [])]
        updatedMateriels[index].description = value 
        setMaterielPdf({...materielPdf , materiels : updatedMateriels, Materiel: updatedMateriels})
    }

    const handleQuantityChange = (index : number , value:string) => {
        const updatedMateriels = [...(materielPdf.materiels || [])]
        updatedMateriels[index].quantity = value === ""? 0 : parseInt(value)
        setMaterielPdf({...materielPdf , materiels : updatedMateriels, Materiel: updatedMateriels})
    }

    const handleRemoveLine = (index : number) => {
        const updatedMateriels = (materielPdf.materiels || []).filter((_ , i) => i !== index );
        setMaterielPdf({ ...materielPdf, materiels: updatedMateriels, Materiel: updatedMateriels });
    }

  return (
    <div className='h-fit w-full'>
        <div className='flex justify-between items-center mb-6'>
            <h2 className='text-lg font-bold'>Matériel électoral</h2>
            <Button 
                type="primary" 
                size="large" 
                onClick={handleAddLine} 
                icon={<Plus className="w-4 h-4" />} 
                title='Ajouter une ligne' 
                aria-label='Ajouter une ligne' 
            >
                Ajouter
            </Button>
        </div>

        <div className='overflow-x-auto w-full'>
            <table className='w-full border-collapse' style={{ minWidth: '100%' }}>
                <thead>
                    <tr className='border-b border-gray-200 bg-gray-50'>
                        <th className='text-left p-3 font-semibold text-sm'>Design</th>
                        <th className='text-left p-3 font-semibold text-sm'>Catégorie</th>
                        <th className='text-left p-3 font-semibold text-sm'>Description</th>
                        <th className='text-left p-3 font-semibold text-sm'>Quantité</th>
                        <th className='text-right p-3 font-semibold text-sm'>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {materielPdf.materiels?.map((materiel, index) => (
                        <tr key={materiel.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                            <td className='p-3'>
                                <Input
                                    value={materiel.design}
                                    onChange={(e) => handleDesignChange(index, e.target.value)}
                                    placeholder='Design du matériel'
                                    aria-label={`Design du matériel ${index + 1}`}
                                    size="large"
                                />
                            </td>
                            <td className='p-3'>
                                <div className='flex flex-col gap-2'>
                                    <Input
                                        value={materiel.categorie}
                                        onChange={(e) => handleCategorieChange(index, e.target.value)}
                                        placeholder='Catégorie'
                                        aria-label={`Catégorie du matériel ${index + 1}`}
                                        size="large"
                                    />
                                    {materiel.categorie && materiel.categorie.trim() !== '' && (
                                        <Badge color="blue" text={materiel.categorie} />
                                    )}
                                </div>
                            </td>
                            <td className='p-3'>
                                <Input
                                    value={materiel.description}
                                    onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                    placeholder='Description'
                                    aria-label={`Description du matériel ${index + 1}`}
                                    size="large"
                                />
                            </td>
                            <td className='p-3'>
                                <InputNumber
                                    value={materiel.quantity}
                                    min={0}
                                    onChange={(val) => handleQuantityChange(index, String(val || 0))}
                                    style={{ width: '100%' }}
                                    aria-label={`Quantité du matériel ${index + 1}`}
                                    size="large"
                                />
                            </td>
                            <td className='p-3'>
                                <div className='flex justify-end'>
                                    <Button 
                                        danger 
                                        type="text"
                                        size="large"
                                        onClick={() => handleRemoveLine(index)} 
                                        icon={<Trash className="w-4 h-4" />} 
                                        title='Supprimer la ligne' 
                                        aria-label={`Supprimer la ligne ${index + 1}`} 
                                    />
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!materielPdf.materiels || materielPdf.materiels.length === 0) && (
                        <tr>
                            <td colSpan={5} className='p-8 text-center text-gray-400'>
                                Aucun matériel ajouté. Cliquez sur "Ajouter" pour commencer.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Materiel