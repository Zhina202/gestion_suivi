"use client";
import { usePathname } from "next/navigation";
import React, { useEffect } from 'react'
import { UserButton, useUser } from "@clerk/nextjs";
import { checkAndAddUser } from "../actions";
import Logo from './Logo';
import Link from 'next/link'
import { Layout, Menu } from 'antd'

const { Header } = Layout

const Navbar = () => {
    const pathname = usePathname()
    const { user } = useUser()

    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
            checkAndAddUser(user?.primaryEmailAddress?.emailAddress, user.fullName)
        }
    }, [user])

    const items = [
        { key: '/', label: <Link href="/">Dashboard</Link> },
        { key: '/materiels', label: <Link href="/materiels">Matériels</Link> },
    ]

    return (
        <Header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            background: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Logo size={40} alt="Logo" />
                <div>
                    <div className="font-bold text-lg">CE<span className="text-blue-600">NI</span></div>
                    <div className="text-xs text-gray-500">Gestion de suivi</div>
                </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
                <UserButton />
            </div>
        </Header>
    )
}

export default Navbar