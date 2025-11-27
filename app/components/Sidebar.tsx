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
      className="bg-white border-r border-gray-200 shadow-lg fixed left-0 bottom-0 overflow-y-auto hidden md:block"
      style={{
        width: 260,
        top: 70,
        zIndex: 999,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #F8F9FA 100%)',
      }}
    >
      <div className="px-4 py-6 border-b border-gray-200">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Navigation
        </div>
      </div>
      <Menu 
        mode="inline" 
        items={items} 
        selectedKeys={[pathname || '/']}
        style={{ 
          height: '100%', 
          borderRight: '0', 
          paddingTop: '12px',
          background: 'transparent'
        }}
        className="border-0 ceni-sidebar-menu"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          <div className="font-semibold text-gray-700 mb-1">CENI Madagascar</div>
          <div>Système de Gestion</div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
