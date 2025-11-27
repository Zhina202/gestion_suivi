"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createEmptyMaterielPdf } from '@/app/actions'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Button, Form, Input, message } from 'antd'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'

export default function CreateMaterielPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onFinish = async (values: { name: string }) => {
    if (!email) return
    setIsSubmitting(true)
    try {
      await createEmptyMaterielPdf(email, values.name)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
      message.success('Matériel créé')
      router.push('/materiels')
    } catch (err) {
      console.error(err)
      message.error('Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Wrapper>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="hidden md:block md:col-span-1">
          <Sidebar />
        </div>

  <main className="col-span-1 md:col-span-5 px-4 md:px-6">
          {/* Full-width page look: no border, no card shadow */}
          <div className='p-6'>
            <h1 className='text-2xl font-semibold mb-4'>Créer un nouveau matériel</h1>
            <Form layout='vertical' onFinish={onFinish}>
              <Form.Item
                name='name'
                label='Nom du matériel (max 50 caractères)'
                rules={[{ required: true, message: 'Veuillez saisir le nom' }, { max: 50, message: 'Le nom ne peut pas dépasser 50 caractères' }]}
              >
                <Input placeholder='Nom du matériel' />
              </Form.Item>

              <Form.Item>
                <div className='flex gap-3'>
                  <Button type='primary' htmlType='submit' loading={isSubmitting}>
                    Créer
                  </Button>
                  <Button onClick={() => router.push('/materiels')}>Annuler</Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </main>
      </div>
    </Wrapper>
  )
}
