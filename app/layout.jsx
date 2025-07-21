
// FAYL: /app/layout.jsx
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

const inter = Inter({ subsets: ['latin'] })
export const metadata = { title: 'TurboClone', description: 'Avtomobil elanları saytı' }

export default function RootLayout({ children }) {
  return (
    <html lang="az" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-100 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}