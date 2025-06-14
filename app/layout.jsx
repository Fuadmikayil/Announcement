
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer' // Footer-i import edirik

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TurboClone - Avtomobil Elanları',
  description: 'Next.js və Supabase ilə yaradılmış avtomobil elanları saytı',
}

export default function RootLayout({ children }) {
  return (
    <html lang="az" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-100 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer /> {/* Footer-i bura əlavə edirik */}
      </body>
    </html>
  )
}