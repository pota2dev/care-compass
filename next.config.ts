import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.clerk.dev" },
<<<<<<< HEAD
=======
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
>>>>>>> d067441b9309af54710333f4c1e7ec7f0cc849dc
    ],
  },
};

export default nextConfig;
