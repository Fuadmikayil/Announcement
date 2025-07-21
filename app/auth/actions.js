'use server'
import { createClient } from '../../lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function login(formData) {
  const supabase = createClient();
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login xətası:', error.message);
    if (error.message.includes('Email not confirmed')) {
      return redirect('/login?message=Zehmet_olmasa_emailinizi_tesdiq_edin');
    }
    return redirect('/login?message=Email_ve_ya_sifre_yanlisdir');
  }

  revalidatePath('/', 'layout');
  return redirect('/');
}

export async function signup(formData) {
  const supabase = createClient();
  const data = {
    email: formData.get('email'),
    password: formData.get('password'),
    options: {
      data: { full_name: formData.get('fullName') }
    }
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error('Signup xətası:', error.message);
    if (error.message.includes('User already registered')) {
      return redirect('/signup?message=Bu_email_artiq_qeydiyyatdan_kecib');
    }
    return redirect('/signup?message=Qeydiyyat_ugursuz_oldu');
  }

  return redirect('/login?message=Qeydiyyat_ugurludur_emailinizi_tesdiqleyin');
}

export async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect('/login');
}

export async function signInWithGoogle() {
    const supabase = createClient();
    const origin = headers().get('origin');
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/auth/callback` }
    });

    if (error) {
        console.error('Google ilə daxil olma xətası:', error.message);
        return redirect('/login?message=Google_ile_daxil_olmaq_mumkun_olmadi');
    }
    
    return redirect(data.url);
}