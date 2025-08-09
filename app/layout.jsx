import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

const inter = Inter({ subsets: ['latin'] })
export const metadata = { title: 'AvtoAz', description: 'Avtomobil elanları saytı' }

export default function RootLayout({ children }) {
  return (
    <html lang="az" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} bg-animated bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white flex flex-col min-h-screen`}>
        {/* 3D background layers */}
        <div className="fx-layer fx-stars" aria-hidden="true" />
        <div className="fx-layer fx-aurora" aria-hidden="true" />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
