import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos du livre d'or servies depuis le bucket public Supabase
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nlmijawscumsetnpuvut.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
