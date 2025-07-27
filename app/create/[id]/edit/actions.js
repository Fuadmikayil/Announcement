'use server'
import { createClient } from '../../../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateListing(formData) {
  const listingId = formData.get('listingId');

  try {
    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      redirect('/login');
    }
    const user = authData.user;

    if (!listingId) {
      throw new Error("listing_id_not_found");
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const { data: listing } = await supabase.from('listings').select('user_id, image_urls, status').eq('id', listingId).single();

    if (!listing) {
      throw new Error("listing_not_found");
    }
    
    const isAdmin = profile?.role === 'admin';
    const isOwner = listing?.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error('unauthorized_operation');
    }

    const updatedData = {
      brand: formData.get('brand'),
      model: formData.get('model'),
      year: parseInt(formData.get('year'), 10),
      price: parseInt(formData.get('price'), 10),
      mileage: parseInt(formData.get('mileage'), 10),
      engine_volume: parseFloat(formData.get('engine_volume')),
      color: formData.get('color'),
      description: formData.get('description'),
      city: formData.get('city'),
      status: isAdmin ? formData.get('status') : listing.status,
    };

    const newImages = formData.getAll('new_images').filter(f => f.size > 0);
    if (newImages.length > 0) {
      const newImageUrls = [];
      for (const image of newImages) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`;
        
        const { error: uploadError } = await supabase.storage.from('listings-images').upload(fileName, image);
        if (uploadError) {
          console.error("Supabase Storage Upload Error:", uploadError);
          throw new Error("image_upload_failed");
        }

        const { data: urlData } = supabase.storage.from('listings-images').getPublicUrl(fileName);
        if (!urlData?.publicUrl) {
          throw new Error("image_url_fetch_failed");
        }
        newImageUrls.push(urlData.publicUrl);
      }
      updatedData.image_urls = [...(listing.image_urls || []), ...newImageUrls];
    }

    const { error: updateError } = await supabase.from('listings').update(updatedData).eq('id', listingId);
    if (updateError) {
      console.error("Supabase Database Update Error:", updateError);
      throw new Error("db_update_failed");
    }

  } catch (error) {
    console.error('Server Action Xətası:', error.message);
    const errorMessage = error.message; // No need for encodeURIComponent now
    redirect(`/create/${listingId}/edit?message=${errorMessage}`);
  }

  revalidatePath(`/create/${listingId}/edit`);
  revalidatePath(`/profil`);
  redirect(`/profil?message=update_success`);
}

export async function deleteImage(formData) {
    const listingId = formData.get('listingId');
    const imageUrlToDelete = formData.get('imageUrl');

    try {
        if (!listingId || !imageUrlToDelete) {
            throw new Error("delete_params_missing");
        }
        
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) { redirect('/login'); }
        const user = authData.user;

        const { data: listing } = await supabase.from('listings').select('user_id, image_urls').eq('id', listingId).single();
        if (!listing) throw new Error("listing_not_found");

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        const isAdmin = profile?.role === 'admin';
        const isOwner = listing.user_id === user.id;

        if (!isAdmin && !isOwner) throw new Error('unauthorized_operation');

        try {
            const imagePath = new URL(imageUrlToDelete).pathname.split('/listings-images/')[1];
            if(imagePath) await supabase.storage.from('listings-images').remove([imagePath]);
        } catch(e) {
            console.error("Storage-dən silərkən xəta (URL parse):", e.message);
        }

        const newImageUrls = listing.image_urls.filter(url => url !== imageUrlToDelete);
        const { error: dbError } = await supabase.from('listings').update({ image_urls: newImageUrls }).eq('id', listingId);

        if (dbError) {
          console.error("Database-dən şəkil URL-i silinərkən xəta:", dbError);
          throw new Error("db_image_delete_failed");
        }

    } catch (error) {
        console.error('Şəkil silmə xətası:', error.message);
        const errorMessage = error.message;
        redirect(`/create/${listingId}/edit?message=${errorMessage}`);
    }

    revalidatePath(`/create/${listingId}/edit`);
    redirect(`/create/${listingId}/edit?message=delete_success`);
}