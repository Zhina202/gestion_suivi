import { MaterielPdf } from '@/type'
import { ArrowDownFromLine } from 'lucide-react'
import React, { useRef } from 'react'
import { Button, Badge } from 'antd'
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
        <div className='mt-4'>
            <div className='border border-gray-300 rounded-lg p-4 md:p-6 bg-white shadow-sm'>
                <div className='mb-4 flex justify-between items-center flex-wrap gap-4'>
                    <Button
                        onClick={handleDownloadPdf}
                        type='primary'
                        size='large'
                        icon={<ArrowDownFromLine className="w-4 h-4" />}
                        aria-label='Exporter en PDF'
                        title='Exporter en PDF'
                    >
                        Exporter en PDF
                    </Button>
                </div>

                <div className='w-full overflow-x-auto'>
                    <div className='bg-white p-6 md:p-10 rounded-lg border border-gray-200 shadow-sm w-full' ref={materielRef} style={{ maxWidth: '100%' }}>
                    {/* Header */}
                    <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b-2 border-gray-300'>
                        <div className='flex items-center mb-4 md:mb-0'>
                            <div className="mr-4">
                                <Logo size={64} alt="Logo du système de Suivi Matériel Électoral" />
                            </div>
                            <div>
                                <span className="font-bold text-3xl md:text-4xl italic text-gray-800">
                                    CE<span className="text-blue-600">NI</span>
                                </span>
                                <h1 className='text-lg md:text-xl font-bold uppercase text-gray-700 mt-1'>Matériel électoral</h1>
                            </div>
                        </div>

                        <div className='text-left md:text-right'>
                            <div className='inline-block px-3 py-1 bg-gray-100 rounded-md mb-2'>
                                <span className='text-sm font-semibold text-gray-700'>MATRI-{materielPdf.id}</span>
                            </div>
                            <div className='text-sm text-gray-600 space-y-1'>
                                <p>
                                    <strong className='text-gray-800'>Date départ : </strong>
                                    {formatDate(materielPdf.date_depart) || "—"}
                                </p>
                                <p>
                                    <strong className='text-gray-800'>Date d'arrivée : </strong>
                                    {formatDate(materielPdf.date_arrive) || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Emetteur et Récepteur */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8'>
                        <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                            <div className='text-xs uppercase font-semibold text-gray-500 mb-3 tracking-wider'>Émetteur</div>
                            <p className='text-base font-bold text-gray-800 mb-2'>{materielPdf.nom_emetteur || "—"}</p>
                            <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>{materielPdf.adresse_emetteur || "—"}</p>
                        </div>
                        <div className='bg-gray-50 p-4 rounded-lg border border-gray-200'>
                            <div className='text-xs uppercase font-semibold text-gray-500 mb-3 tracking-wider'>Récepteur</div>
                            <p className='text-base font-bold text-gray-800 mb-2'>{materielPdf.nom_recepteur || "—"}</p>
                            <p className='text-sm text-gray-600 leading-relaxed whitespace-pre-wrap'>{materielPdf.adresse_recepteur || "—"}</p>
                        </div>
                    </div>

                    {/* Tableau des matériels */}
                    {materielPdf.materiels && materielPdf.materiels.length > 0 && (
                        <div className='overflow-x-auto w-full'>
                            <table className='w-full border-collapse border border-gray-300' style={{ minWidth: '100%' }}>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-12'>#</th>
                                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Design</th>
                                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Catégorie</th>
                                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>Description</th>
                                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24'>Quantité</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {materielPdf.materiels.map((materiel: import("@prisma/client").Materiel, index: number) => (
                                        <tr key={index + 1} className='hover:bg-gray-50'>
                                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-700 font-medium'>{index + 1}</td>
                                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-800'>{materiel.design || "—"}</td>
                                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-700'>
                                                {materiel.categorie && materiel.categorie.trim() !== '' ? (
                                                    <Badge color="blue">{materiel.categorie}</Badge>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-700'>{materiel.description || "—"}</td>
                                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-800 font-semibold text-center'>{materiel.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Pdf