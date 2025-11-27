import React from 'react'
import { MaterielPdf } from '@/type'
import { Plus, Trash } from 'lucide-react'
import type { Materiel as MaterielType } from "@/type"
import { Button, Input, InputNumber, Space } from 'antd'

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
    <div className='h-fit bg-base-200 p-5 rounded-xl w-full'>
        <div className='flex justify-between items-center mb-4'>
            <h2  className='font-bold'>Matériel électoral</h2>
            <Button type="default" size="small" onClick={handleAddLine} icon={<Plus />} title='Ajouter une ligne' aria-label='Ajouter une ligne' />
        </div>

        <div className='scrollable'>
            <table className='table table-full'>
                <thead className='capitalize font-normal'>
                    <tr>
                        <th>design</th>
                        <th>categorie</th>
                        <th>description</th>
                        <th>quantity</th>
                        <th></th>
                    </tr>
                </thead>

                <tbody>
                                        {materielPdf.materiels?.map((materiel , index) => (
                                                <tr key={materiel.id}>
                                                    <td>
                                                        <div className='flex items-center gap-2'>
                                                            <Input
                                                                value={materiel.design}
                                                                onChange={(e) => handleDesignChange(index, e.target.value)}
                                                                placeholder='Design du matériel'
                                                                aria-label={`Design du matériel ${index + 1}`}
                                                            />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <Input
                                                            value={materiel.categorie}
                                                            onChange={(e) => handleCategorieChange(index, e.target.value)}
                                                            placeholder='Catégorie'
                                                            aria-label={`Catégorie du matériel ${index + 1}`}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input
                                                            value={materiel.description}
                                                            onChange={(e) => handleDescriptionChange(index, e.target.value)}
                                                            placeholder='Description'
                                                            aria-label={`Description du matériel ${index + 1}`}
                                                        />
                                                    </td>
                                                    <td>
                                                        <InputNumber
                                                            value={materiel.quantity}
                                                            min={0}
                                                            onChange={(val) => handleQuantityChange(index, String(val || 0))}
                                                            style={{ width: '100%' }}
                                                            aria-label={`Quantité du matériel ${index + 1}`}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Button danger shape="circle" size="small" onClick={() => handleRemoveLine(index)} icon={<Trash />} title='Supprimer la ligne' aria-label={`Supprimer la ligne ${index + 1}`} />
                                                    </td>
                                                </tr>
                                            ))}
                </tbody>
            </table>
        </div>
    </div>
  )
}

export default Materiel