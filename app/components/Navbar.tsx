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
                className="md:pl-60"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1000,
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderBottom: '1px solid #e5e7eb',
                    width: '100%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button
                        type="text"
                        icon={<MenuIcon className="w-5 h-5" />}
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden"
                        aria-label="Menu"
                    />
                    <div className="flex items-center gap-3">
                        <Logo size={36} alt="Logo CENI" />
                        <div className="hidden sm:block">
                            <div className="font-semibold text-lg md:text-xl text-gray-900">
                                CENI <span className="text-[#DC143C]">Madagascar</span>
                            </div>
                            <div className="text-xs text-gray-600 hidden md:block">
                                Gestion des Matériels Électoraux
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="hidden md:flex items-center gap-3 text-gray-700 text-sm">
                        <div className="text-right">
                            <div className="font-medium">{user?.fullName || 'Utilisateur'}</div>
                            <div className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</div>
                        </div>
                    </div>
                    <UserButton appearance={{
                        elements: {
                            avatarBox: "w-9 h-9"
                        }
                    }} />
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