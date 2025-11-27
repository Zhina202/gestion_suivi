import { MaterielPdf } from '@/type'
import { ArrowDownFromLine } from 'lucide-react'
import React, { useRef } from 'react'
import { Button } from 'antd'
import { Layers } from 'lucide-react'
import html2canvas from 'html2canvas-pro'
import jsPDF from 'jspdf'
import confetti from 'canvas-confetti'
import Image from 'next/image';
import Logo from './Logo';

interface PdfProps {
    materielPdf : MaterielPdf
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };
  return date.toLocaleDateString('fr-FR', options);
}


const Pdf: React.FC<PdfProps> = (
    {
        materielPdf
    }
) => {
    const materielRef = useRef<HTMLDivElement>(null)

    const handleDownloadPdf = async () => {
        const element = materielRef.current
        if(element){
            try {
                const canvas = await html2canvas(element ,{scale :3 , useCORS : true} )
                const imgData = canvas.toDataURL('image/png')

                const pdf = new jsPDF({
                    orientation :  "portrait",
                    unit : 'mm',
                    format : 'A4'
                })

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth ) / canvas.width;

                pdf.addImage(imgData , 'PNG' ,0,0 , pdfWidth, pdfHeight )

                pdf.save(`materiel-${materielPdf.design}.pdf`) 
                confetti({
                        particleCount : 100,
                        spread : 70,
                        origin : {y: 0.6},
                        zIndex:9999
                
                      })

            } catch (error) {
                console.error('Erreur lors de la generation du PDF :', error);
            }
        }
    }

    return (
        // show export block on all sizes; previous class used `lg-block` (invalid) which hid it
        <div className='mt-4'>
        <div className='border-base-300 border-2 border-dashed rounded-xl p-5'>
            
                <Button
                    onClick={handleDownloadPdf}
                    className='mb-4'
                    type='default'
                    icon={<ArrowDownFromLine />}
                    aria-label='Exporter en PDF'
                    title='Exporter en PDF'
                >
                    Exporter en PDF
                </Button>

                <div className='p-8' ref={materielRef}>
                    <div className='flex justify-between items-center text-sm'>
                        <div className='flex flex-col'>
                            <div>
                                <div className='flex items-center'>
                                                                     <div className="mr-3">
                                                                         <Logo size={56} alt="Logo du système de Suivi Matériel Électoral" />
                                                                     </div>
                                    
                                    <span className="ml-3 font-bold text-2xl italic">
                                        CE<span className="text-accent">NI</span>
                                    </span>
                                </div>
                            </div>
                            <h1 className='text-xl font-bold uppercase'>Matériel électoral</h1>
                        </div>

                        <div className='text-right uppercase'>
                            <p className='badge badge-ghost'>
                                Materiel° {materielPdf.id}
                            </p>
                            <p className='my-2'>
                                <strong>Date : </strong>
                                {formatDate(materielPdf.date_depart)}
                            </p>
                            <p>
                                <strong>Date d’arrivée : </strong>
                                {formatDate(materielPdf.date_arrive)}
                            </p>
                        </div>
                        
                    </div>

                    <div className='my-6 flex justify-between'>
                        <div>
                            <p className='badge badge-ghost mb-2'>Emetteur</p>
                            <p  className='text-sm font-bold italic'>{materielPdf.nom_emetteur}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{materielPdf.adresse_emetteur}</p>
                        </div>
                        <div className='text-right'>
                            <p className='badge badge-ghost mb-2'>Recepteur</p>
                            <p  className='text-sm font-bold italic'>{materielPdf.nom_recepteur}</p>
                            <p className='text-sm text-gray-500 w-52 break-words'>{materielPdf.adresse_recepteur}</p>
                        </div>
                        
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='table table-zebra'>
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Design</th>
                                    <th>Categorie</th>
                                    <th>Description</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {materielPdf.materiels?.map((materiel: import("@prisma/client").Materiel, index: number) => (
                                    <tr key={index + 1 }>
                                        <td>{index + 1}</td>
                                        <td>{materiel.design}</td>
                                        <td>{materiel.categorie}</td>
                                        <td>{materiel.description}</td>
                                        <td>{materiel.quantity}</td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>



                    
                </div>

        </div>
    </div>
  )
}

export default Pdf