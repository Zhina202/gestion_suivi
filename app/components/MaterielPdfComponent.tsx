"use client";
import React from 'react'
import { MaterielPdf } from '@/type'
import Link from 'next/link'
import { Button } from 'antd'
import { CheckCircle, Clock, FileText, SquareArrowOutUpRight, XCircle } from 'lucide-react';
import Card from './Card'


type MaterielPdfComponentProps = {
    materielPdf: MaterielPdf;
    index : number
}

const getStatusBadge = (status : number) => {
    switch (status){
        case 1 :
            return(
                <div className='badge badge-lg flex items-center gap-2'>
                    <FileText className='w-4'/>
                    Brouillon
                </div>
            )
        case 2 :
            return(
                <div className='badge badge-lg badge-warning flex items-center gap-2'>
                    <Clock className='w-4'/>
                    En transit
                </div>
            )
        case 3 :
            return(
                <div className='badge badge-lg badge-success flex items-center gap-2'>
                    <CheckCircle className='w-4'/>
                    Reçu
                </div>
            )
        case 4 :
            return(
                <div className='badge badge-lg badge-info flex items-center gap-2'>
                    <XCircle className='w-4'/>
                    Endommagé
                </div>
            )
        case 5 :
            return(
                <div className='badge badge-lg  badge-error flex items-center gap-2'>
                    <XCircle className='w-4'/>
                    Perdu
                </div>
            )
        default:
            return(
                <div className='badge badge-lg '>
                    <XCircle className='w-4'/>
                    Indefinis
                </div>
            )
    }
}

const MaterielPdfComponent : React.FC<MaterielPdfComponentProps> = ({materielPdf , index}) => {
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className='flex justify-between items-start w-full gap-4'>
                <div className='flex flex-col gap-2'>
                    <div className='text-sm uppercase font-semibold'>MATRI-{materielPdf.id}</div>
                    <div className='text-xs text-gray-500'>Matériel électoral</div>
                </div>

                <div className='flex flex-col items-end gap-2'>
                    <div>{getStatusBadge(materielPdf.status)}</div>
                    <Link href={`/materiel/${materielPdf.id}`}>
                        <Button type='default' size='small' icon={<SquareArrowOutUpRight className='w-4'/>}>Ouvrir</Button>
                    </Link>
                </div>
            </div>
        </Card>
    )
}

export default MaterielPdfComponent