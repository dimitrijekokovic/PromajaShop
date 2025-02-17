/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Aktivirajte striktni mod za otkrivanje problema u razvoju
    images: {
      domains: ['lh3.googleusercontent.com'], // Dozvolite slike sa Google-a za profilne slike
      ['dimitrije-next-ecommerce.s3.amazonaws.com'],
    },
    async redirects() {
      return [
        {
          source: '/login',
          destination: '/',
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  