
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'
import ListingForm from './ListingForm.jsx'

export default async function CreateListingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Yeni Elan Yerləşdir</h1>
        <ListingForm />
      </div>
    </div>
  )
}