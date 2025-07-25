/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'tgxinnvvibghtwdzjolv.supabase.co', // BURAYA ÖZ SUPABASE HOSTNAME-inizi YAZIN
        },
        {
          protocol: 'https',
          hostname: 'placehold.co',
        },
      ],
    },
    serverActions: {
      bodySizeLimit: '4mb',
    },
  };
  
  export default nextConfig;