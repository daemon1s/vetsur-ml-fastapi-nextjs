import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { TransicionPagina } from "@/components/transicion-pagina"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "VetSur · Sistema inteligente de retención veterinaria",
  description: "Plataforma de predicción de abandono y Business Intelligence para 8 clínicas veterinarias",
  icons: {
    icon: "/logo_vetsur.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${plexSans.variable} ${plexMono.variable} dark`}>
      <body className="min-h-screen bg-[#0b1320] text-slate-100 antialiased">
        <Navbar />
        <TransicionPagina>{children}</TransicionPagina>
      </body>
    </html>
  )
}
