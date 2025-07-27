import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'

const inter = Inter({ subsets: ['latin'] })
export const metadata = { title: 'AvtoAz', description: 'Avtomobil elanları saytı' }

export default function RootLayout({ children }) {
  return (
    // The suppressHydrationWarning prop is added here to prevent errors
    // from browser extensions that modify the HTML.
    <html lang="az" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
