import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ConfigProvider, App } from "antd";
import "./globals.css";
import Navbar from './components/Navbar'
import SuppressAntdWarning from './components/SuppressAntdWarning'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CENI Madagascar - Gestion des Matériels Électoraux",
  description: "Système professionnel de gestion et de suivi des matériels électoraux pour la Commission Électorale Nationale Indépendante de Madagascar",
};

// Forcer le rendu dynamique pour éviter les erreurs Clerk lors du build
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" style={{ overflowX: 'hidden' }}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ overflowX: 'hidden', width: '100%' }}>
          <ConfigProvider
            theme={{
              token: {
                zIndexBase: 1000,
                zIndexPopupBase: 10000,
              },
            }}
          >
            <App>
              <SuppressAntdWarning />
              <Navbar />
              {children}
            </App>
          </ConfigProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
