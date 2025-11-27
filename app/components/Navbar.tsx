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
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    background: 'linear-gradient(135deg, #DC143C 0%, #B71C1C 100%)',
                    boxShadow: '0 4px 12px rgba(220, 20, 60, 0.3)',
                    borderBottom: 'none',
                    width: '100%'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Button
                        type="text"
                        icon={<MenuIcon className="w-5 h-5 text-white" />}
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden hover:bg-white/10"
                        aria-label="Menu"
                        style={{ color: 'white' }}
                    />
                    <div className="flex items-center gap-3">
                        <div className="bg-white rounded-lg p-1.5 shadow-md">
                            <Logo size={36} alt="Logo CENI" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="font-bold text-lg md:text-xl text-white">
                                CENI <span className="text-yellow-300">Madagascar</span>
                            </div>
                            <div className="text-xs text-white/90 hidden md:block font-medium">
                                Gestion des Matériels Électoraux
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="hidden md:flex items-center gap-3 text-white/90 text-sm">
                        <div className="text-right">
                            <div className="font-semibold">{user?.fullName || 'Utilisateur'}</div>
                            <div className="text-xs text-white/70">{user?.primaryEmailAddress?.emailAddress}</div>
                        </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-1">
                        <UserButton appearance={{
                            elements: {
                                avatarBox: "w-9 h-9"
                            }
                        }} />
                    </div>
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