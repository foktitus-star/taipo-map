/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/taipei-trees',
        destination: 'https://data.taipei/api/v1/dataset/7a49d00c-a5ff-4a6b-be9e-aaa6dc1ff7e8?scope=resourceAquire&limit=1000',
      },
      {
        source: '/api/taipei-sidewalks',
        destination: 'https://data.taipei/api/dataset/715d3a83-8445-4496-b6bf-b0900538b7e7/resource/b11d6142-1d71-41d5-a843-7b7cfcea61ef/download',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' }
        ]
      }
    ];
  },
};

export default nextConfig;
