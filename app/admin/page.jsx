import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import { approveListing, rejectListing } from './actions'
import Link from 'next/link'
import Image from 'next/image'

// --- SVG Icons (replaces lucide-react import) ---
const Check = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const Edit3 = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);
// --- End SVG Icons ---

// Helper function to define colors for status badges
const getStatusBadge = (status) => {
  switch (status) {
    case 'approved':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Təsdiqlənib</span>
    case 'pending':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Gözləmədə</span>
    case 'rejected':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Rədd edilib</span>
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>
  }
}

// Helper to format date
const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('az-AZ', options);
}

export default async function AdminPage({ searchParams }) {
  const params = typeof searchParams?.then === 'function' ? await searchParams : searchParams
  const message = params?.message

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect('/login') }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return (
      <div className="text-center py-20 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800">Giriş Qadağandır</h1>
        <p className="text-gray-600 mt-2">Bu səhifəyə yalnız adminlər daxil ola bilər.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold mt-6 inline-block">Ana Səhifəyə Qayıt</Link>
      </div>
    )
  }

  const { data: listings, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false })
  if (error) { console.error("Elanları çəkərkən xəta:", error); return <p>Elanları yükləmək mümkün olmadı.</p> }

  // NEW: pre-sign cover image URLs
  const placeholder = 'https://placehold.co/600x400/e2e8f0/e2e8f0?text=...'
  const coverMap = new Map()
  await Promise.all((listings || []).map(async (l) => {
    const raw = l.image_urls?.[0]
    let out = placeholder
    if (raw) {
      try {
        const path = new URL(raw).pathname.split('/listings-images/')[1]
        if (path) {
          const { data: signed } = await supabase.storage.from('listings-images').createSignedUrl(path, 3600)
          if (signed?.signedUrl) out = signed.signedUrl
        }
      } catch {}
    }
    coverMap.set(l.id, out)
  }))

  return (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="sm:flex sm:items-center sm:justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
                {/* You can add stats here later, e.g., total listings */}
            </div>

            {message && (
                <div className="mb-6 p-4 text-center text-sm font-medium text-indigo-800 bg-indigo-100 rounded-lg shadow-sm">
                {message.replace(/_/g, ' ')}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Elan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Qiymət</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Yaradılma Tarixi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Əməliyyatlar</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {listings.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">Sistemdə heç bir elan yoxdur.</td>
                            </tr>
                        ) : (
                            listings.map((listing) => (
                            <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-12 w-16">
                                        <Image
                                            src={coverMap.get(listing.id) || placeholder}
                                            alt={`${listing.brand} ${listing.model}`}
                                            width={64}
                                            height={48}
                                            className="rounded-md object-cover"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-semibold text-gray-900">{listing.brand} {listing.model}</div>
                                        <div className="text-xs text-gray-500">{listing.year}, {listing.city}</div>
                                    </div>
                                </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 font-medium">{new Intl.NumberFormat('az-AZ').format(listing.price)} AZN</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">{formatDate(listing.created_at)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(listing.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {listing.status === 'pending' && (
                                            <form action={approveListing}>
                                                <input type="hidden" name="listingId" value={listing.id} />
                                                <button type="submit" title="Təsdiqlə" className="p-2 text-green-600 hover:text-green-900 hover:bg-green-100 rounded-full transition-colors">
                                                    <Check size={18} />
                                                </button>
                                            </form>
                                        )}
                                        {listing.status !== 'rejected' && (
                                            <form action={rejectListing}>
                                                <input type="hidden" name="listingId" value={listing.id} />
                                                <button type="submit" title="Rədd et" className="p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-full transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </form>
                                        )}
                                        <Link href={`/create/${listing.id}/edit`} title="Redaktə Et" className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-full transition-colors">
                                            <Edit3 size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  )
}
