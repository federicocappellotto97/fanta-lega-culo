/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push(
      { test: /\.csv$/, type: "asset/source" },
      { test: /\.txt$/, type: "asset/source" }
    );
    return config;
  },
};

export default nextConfig;
