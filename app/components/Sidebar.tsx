"use client"
import React from 'react'
import { Menu } from 'antd'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package } from 'lucide-react'

const Sidebar: React.FC = () => {
  const pathname = usePathname()

  const items = [
    { 
      key: '/', 
      label: <Link href="/">Dashboard</Link>,
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    { 
      key: '/materiels', 
      label: <Link href="/materiels">Matériels</Link>,
      icon: <Package className="w-4 h-4" />
    },
  ]

  return (
    <div
      className="bg-white border-r border-gray-200 shadow-sm"
      style={{
        width: 260,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: '64px',
        paddingRight: '3rem',
        marginRight: '2rem',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 30,
      }}
    >
      <Menu 
        mode="inline" 
        items={items} 
        selectedKeys={[pathname || '/']}
        style={{ height: '100%', borderRight: '0' }}
        className="border-0"
      />
    </div>
  )
}

export default Sidebar
