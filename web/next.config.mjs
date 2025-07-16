/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if(dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
            '**/public/*.gltf',
            '**/public/*.bin'
        ]
      }
    }
  }
};

export default nextConfig;
