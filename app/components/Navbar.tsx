"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from 'react'
import { UserButton, useUser } from "@clerk/nextjs";
import { checkAndAddUser } from "../actions";
import Logo from './Logo';
import Link from 'next/link'
import { Layout, Menu, Drawer, Button } from 'antd'
import { Menu as MenuIcon, LayoutDashboard, Package } from 'lucide-react'

const { Header } = Layout

const Navbar = () => {
    const pathname = usePathname()
    const { user } = useUser()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
            checkAndAddUser(user?.primaryEmailAddress?.emailAddress, user.fullName)
        }
    }, [user])

    const menuItems = [
        { 
            key: '/', 
            label: <Link href="/" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>,
            icon: <LayoutDashboard className="w-4 h-4" />
        },
        { 
            key: '/materiels', 
            label: <Link href="/materiels" onClick={() => setMobileMenuOpen(false)}>Matériels</Link>,
            icon: <Package className="w-4 h-4" />
        },
    ]

    return (
        <>
            <Header 
                className="md:pl-60 sticky top-0 z-[100]"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    background: '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                    width: '100%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Button
                        type="text"
                        icon={<MenuIcon className="w-5 h-5" />}
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden"
                        aria-label="Menu"
                    />
                    <Logo size={40} alt="Logo" />
                    <div className="hidden sm:block">
                        <div className="font-bold text-base md:text-lg">CE<span className="text-blue-600">NI</span></div>
                        <div className="text-xs text-gray-500 hidden md:block">Gestion de suivi</div>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <UserButton />
                </div>
            </Header>

            <Drawer
                title="Menu"
                placement="left"
                onClose={() => setMobileMenuOpen(false)}
                open={mobileMenuOpen}
                width={240}
                styles={{ body: { padding: 0 } }}
            >
                <Menu 
                    mode="inline" 
                    items={menuItems} 
                    selectedKeys={[pathname || '/']}
                    style={{ height: '100%', borderRight: '0' }}
                    className="border-0"
                />
            </Drawer>
        </>
    )
}

export default Navbar