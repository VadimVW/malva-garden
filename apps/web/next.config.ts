import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.prom.ua", pathname: "/**" },
      { protocol: "https", hostname: "yaskrava.com.ua", pathname: "/**" },
      { protocol: "https", hostname: "yaskravaklumba.com.ua", pathname: "/**" },
      { protocol: "https", hostname: "svitroslyn.ua", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn1.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn2.gstatic.com", pathname: "/**" },
      { protocol: "https", hostname: "encrypted-tbn3.gstatic.com", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/uploads/**" },
      { protocol: "https", hostname: "malva-api-staging.onrender.com", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
