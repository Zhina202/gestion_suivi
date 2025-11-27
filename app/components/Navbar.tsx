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
        // Use antd Header so we can use Menu; keep header sticky and with a solid background + zIndex
        <Header style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            height: 48,
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            background: '#ffffff',
            boxShadow: '0 1px 0 rgba(0,0,0,0.04)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Logo size={32} alt="Logo" />

                <div>
                    <div className="font-semibold">CE<span className="text-accent">NI</span></div>
                </div>
            </div>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                <UserButton />
            </div>
        </Header>
    )
}

export default Navbar