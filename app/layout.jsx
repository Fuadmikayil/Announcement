
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header' // Header-i import edirik

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TurboClone - Avtomobil Elanları',
  description: 'Next.js və Supabase ilə yaradılmış avtomobil elanları saytı',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az">
      <body className={inter.className}>
        <Header /> {/* Header-i bura əlavə edirik */}
        <main className="bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  )
}