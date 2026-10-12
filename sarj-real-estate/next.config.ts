import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Use the same Tailwind compiler when choosing Next.js’s Webpack fallback.
  webpack(config) {
    // Nest the preprocessing rule to retain Next.js’s built-in CSS bundling.
    config.module.rules.push({
      rules: [{ test: /\.css$/, enforce: "pre", use: ["@tailwindcss/turbopack"] }],
    });
    return config;
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
