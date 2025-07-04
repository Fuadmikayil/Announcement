
// FAYL: /app/login/page.js
// AÇIQLAMA: İstifadəçinin daxil olması üçün forma olan səhifə.
// app qovluğunda "login" adlı yeni bir qovluq yaradıb bu faylı ora yerləşdirin.

import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage({ searchParams }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Hesaba Daxil Ol</h1>
        
        <form action={login} className="space-y-6">
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700"
            >
              E-poçt
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700"
            >
              Şifrə
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Daxil Ol
          </button>

          {searchParams?.message && (
            <p className="p-4 text-center text-red-500 bg-red-100 rounded-md">
              {searchParams.message}
            </p>
          )}
        </form>

        <p className="text-sm text-center text-gray-600">
          Hesabınız yoxdur?{' '}
          <Link href="/qeydiyyat" className="font-medium text-indigo-600 hover:text-indigo-500">
            Qeydiyyatdan keçin
          </Link>
        </p>
      </div>
    </div>
  )
}