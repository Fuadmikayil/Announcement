// FAYL: next.config.mjs (ANA QOVLUQDA BU FAYLI YARADIN VƏ YA YENİLƏYİN)
/** @type {import('next').NextConfig} */
const nextConfig = {
    // YENİ ƏLAVƏ OLUNAN HİSSƏ
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          // Sizin Supabase proyektinizin unikal adını bura yazırıq
          hostname: 'tgxinnvvibghtwdzjolv.supabase.co', 
        },
      ],
    },
    serverActions: {
      bodySizeLimit: '4mb',
    },
  };
  
  export default nextConfig;