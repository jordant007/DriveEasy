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
    return [
      {
        source: "/api/cars/:path*",
        destination: "http://localhost:5000/api/cars/:path*", // Proxy to backend
      },
      {
        source: "/api/bookings/:path*",
        destination: "http://localhost:5000/api/bookings/:path*", // Proxy to backend
      },
    ];
  },
  images: {
    domains: ["localhost"], // Allow localhost for development
  },
};

export default nextConfig;