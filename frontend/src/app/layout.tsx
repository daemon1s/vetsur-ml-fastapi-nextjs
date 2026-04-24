import { Outfit } from "next/font/google"
import "./globals.css"

const outfit = Outfit({ 
  subsets: ["latin"], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-sans" 
})

export const metadata: Metadata = {
  title: "VetSur - Dashboard",
  description: "Sistema de predicción de retorno de pacientes.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className={outfit.className}>{children}</body>
    </html>
  )
}
