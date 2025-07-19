
// FAYL: /app/login/page.jsx (YENİLƏNMİŞ)
// AÇIQLAMA: Düymələrin className-lərinə flexbox əlavə edildi.
import { login, signInWithGoogle } from '../auth/actions'
import Link from 'next/link'
import { SubmitButton } from '../components/SubmitButton.jsx'

export default function LoginPage({ searchParams }) {
  const message = searchParams.message;
  
  const isError = message && (message.includes('yanlisdir') || message.includes('mumkun_olmadi'));
  const isSuccess = message && message.includes('ugurludur');
  const isInfo = message && message.includes('tesdiq_edin');

  const messageClass = isError ? 'bg-red-100 text-red-700' : isSuccess ? 'bg-green-100 text-green-700' : isInfo ? 'bg-yellow-100 text-yellow-800' : 'hidden';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Hesaba Daxil Ol</h1>
        
        {message && (
            <p className={`p-4 text-center text-sm rounded-md ${messageClass}`}>
              {message.replace(/_/g, ' ')}
            </p>
        )}

        <form action={signInWithGoogle}>
            <SubmitButton 
                pendingText="Gözləyin..."
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-200"
            >
                <svg className="w-5 h-5 mr-2" role="img" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><title>Google icon</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.63-4.5 1.63-5.42 0-9.82-4.4-9.82-9.82s4.4-9.82 9.82-9.82c3.04 0 5.2.93 6.82 2.45l-2.72 2.72c-.85-.85-2.04-1.47-4.1-1.47-3.27 0-5.95 2.68-5.95 5.95s2.68 5.95 5.95 5.95c2.45 0 3.53-.93 4.2-1.63.58-.58.93-1.37.93-2.55v-3.28h-7.84z"/></svg>
                Google ilə Daxil Ol
            </SubmitButton>
        </form>
        
        <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">və ya e-poçt ilə</span></div></div>
        
        <form action={login} className="space-y-6">
          <div><label htmlFor="email" className="block text-sm font-medium text-gray-700">E-poçt</label><input id="email" name="email" type="email" required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm" placeholder="email@example.com" /></div>
          <div><label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifrə</label><input id="password" name="password" type="password" required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm" placeholder="••••••••" /></div>
          <SubmitButton 
            pendingText="Daxil olunur..."
            className="w-full flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            Daxil Ol
          </SubmitButton>
        </form>
        
        <p className="text-sm text-center text-gray-600">
          Hesabınız yoxdur?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Qeydiyyatdan keçin
          </Link>
        </p>
      </div>
    </div>
  )
}