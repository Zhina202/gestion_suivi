import React from 'react'
import { Menu } from 'antd'
import Link from 'next/link'
import Logo from './Logo'

const Sidebar: React.FC = () => {
  const items = [
    { key: '/', label: <Link href="/">Dashboard</Link> },
    { key: '/materiels', label: <Link href="/materiels">Matériels</Link> },
  ]

  return (
    // Make sidebar full viewport height (accounting for top navbar), sticky and add right padding so main content has space
    <div
      style={{
        width: 260,
        height: 'calc(100vh - 48px)',
        position: 'sticky',
        top: '48px',
        paddingRight: '3rem',
        marginRight: '2rem',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        borderRight: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        zIndex: 30,
      }}
    >
        <Menu mode="inline" items={items} style={{ height: '100%', borderRight: '0' }} />
    </div>
  )
}

export default Sidebar
