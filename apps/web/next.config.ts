import type { NextConfig } from "next";

function apiUploadsRemotePattern(): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  try {
    const u = new URL(base);
    const protocol = u.protocol.replace(":", "") as "http" | "https";
    return {
      protocol,
      hostname: u.hostname,
      ...(u.port ? { port: u.port } : {}),
      pathname: "/uploads/**",
    };
  } catch {
    return null;
  }
}

const apiUploads = apiUploadsRemotePattern();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
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
      ...(apiUploads ? [apiUploads] : []),
    ],
  },
};

export default nextConfig;
