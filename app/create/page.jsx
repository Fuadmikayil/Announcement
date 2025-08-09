//app/create/page.jsx
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from './ListingForm.jsx'

async function getFormOptions(supabase) {
    const [brandsRes, citiesRes, bodyTypesRes, colorsRes] = await Promise.all([
        supabase.from('brands').select('id, name').order('name', { ascending: true }),
        supabase.from('cities').select('name').order('name', { ascending: true }),
        supabase.from('body_types').select('name').order('name', { ascending: true }),
        supabase.from('colors').select('name, hex_code').order('id'),
    ]);

    return {
        brands: brandsRes.data || [],
        cities: citiesRes.data?.map(c => c.name) || [],
        bodyTypes: bodyTypesRes.data?.map(bt => bt.name) || [],
        colors: colorsRes.data || [],
    };
}

export default async function CreateListingPage({ searchParams }) {
  const supabase = await createClient()
  // Next.js 15: searchParams can be a Promise
  const params = typeof searchParams?.then === 'function' ? await searchParams : searchParams
  const message = params?.message

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number')
    .eq('id', user.id)
    .single()

  const formOptions = await getFormOptions(supabase)

  return (
    <div className="py-12">
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto glass gradient-border p-8 md:p-12 rounded-2xl shadow-lg">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold gradient-text">Yeni Elan Yerləşdir</h1>
                    <p className="text-gray-600 mt-2">Avtomobiliniz üçün alıcı tapmağın ən asan yolu.</p>
                </div>
                {message && (
                    <div className="mb-6 p-4 text-center text-sm text-red-700 bg-red-100 rounded-lg">
                        {message.replace(/_/g, ' ')}
                    </div>
                )}
                <ListingForm userProfile={profile} formOptions={formOptions} />
            </div>
        </div>
    </div>
  )
}