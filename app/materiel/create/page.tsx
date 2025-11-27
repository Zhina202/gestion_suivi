"use client"
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { createEmptyMaterielPdf } from '@/app/actions'
import { useRouter } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Button, Form, Input, message, Card, Space } from 'antd'
import { ArrowLeft, Plus } from 'lucide-react'
import Wrapper from '@/app/components/Wrapper'
import Sidebar from '@/app/components/Sidebar'
import Link from 'next/link'

export default function CreateMaterielPage() {
  const { user } = useUser()
  const email = user?.primaryEmailAddress?.emailAddress as string
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onFinish = async (values: { name: string }) => {
    if (!email) {
      message.error('Vous devez être connecté pour créer un matériel')
      return
    }
    setIsSubmitting(true)
    try {
      await createEmptyMaterielPdf(email, values.name)
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 })
      message.success('Matériel créé avec succès')
      router.push('/materiels')
    } catch (err) {
      console.error(err)
      message.error('Erreur lors de la création du matériel')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Wrapper>
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 md:ml-60 px-4 md:px-6 w-full">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-4 mb-4">
              <Link href="/materiels">
                <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} />
              </Link>
              <div>
                <h1 className="text-xl md:text-3xl font-bold">Créer un nouveau matériel</h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Ajoutez un nouveau matériel électoral au système</p>
              </div>
            </div>
          </div>

          <Card className="max-w-2xl">
            <Form 
              layout='vertical' 
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                name='name'
                label={<span className="font-semibold">Nom du matériel</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir le nom du matériel' }, 
                  { max: 50, message: 'Le nom ne peut pas dépasser 50 caractères' }
                ]}
                help="Le nom doit être unique et descriptif (maximum 50 caractères)"
              >
                <Input 
                  placeholder='Ex: Matériel électoral - Bureau de vote 001' 
                  prefix={<Plus className="w-4 h-4 text-gray-400" />}
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space>
                  <Button 
                    type='primary' 
                    htmlType='submit' 
                    loading={isSubmitting}
                    icon={<Plus className="w-4 h-4" />}
                    size="large"
                  >
                    Créer le matériel
                  </Button>
                  <Button 
                    onClick={() => router.push('/materiels')}
                    size="large"
                  >
                    Annuler
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </main>
      </div>
    </Wrapper>
  )
}
