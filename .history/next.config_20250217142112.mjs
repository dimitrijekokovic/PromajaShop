/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'lh3.googleusercontent.com', // Google slike za profile
      'dimitrije-next-ecommerce.s3.amazonaws.com' // AWS S3 bucket za slike proizvoda
    ],
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
