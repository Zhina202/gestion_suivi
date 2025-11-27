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
    <aside
      className="bg-white border-r border-gray-200 shadow-sm fixed left-0 bottom-0 overflow-y-auto hidden md:block"
      style={{
        width: 240,
        top: 64,
        zIndex: 999,
      }}
    >
      <Menu 
        mode="inline" 
        items={items} 
        selectedKeys={[pathname || '/']}
        style={{ height: '100%', borderRight: '0', paddingTop: '8px' }}
        className="border-0"
      />
    </aside>
  )
}

export default Sidebar
