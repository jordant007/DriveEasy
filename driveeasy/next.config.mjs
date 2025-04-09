/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dns: false,
        fs: false,
        net: false,
        tls: false,
        module: false,
      };
    }
    return config;
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return [
      {
        source: "/api/cars/:path*",
        destination: `${backendUrl}/api/cars/:path*`,
      },
      {
        source: "/api/bookings/:path*",
        destination: `${backendUrl}/api/bookings/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    domains: ["localhost", "https://drive-easy-5hz8.vercel.app/"], // Add your backend domain
  },
};

export default nextConfig;