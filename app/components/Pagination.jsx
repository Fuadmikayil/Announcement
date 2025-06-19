
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Pagination({ totalPages }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-12">
      {/* Əvvəlki düyməsi */}
      <Link
        href={createPageURL(currentPage - 1)}
        className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}`}
      >
        Əvvəlki
      </Link>

      {/* Səhifə nömrələri (sadələşdirilmiş versiya) */}
      <span className="text-sm text-gray-700">
        Səhifə {currentPage} / {totalPages}
      </span>

      {/* Növbəti düyməsi */}
      <Link
        href={createPageURL(currentPage + 1)}
        className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
      >
        Növbəti
      </Link>
    </nav>
  )
}