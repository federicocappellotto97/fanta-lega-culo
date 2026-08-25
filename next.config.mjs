/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    rules: {
      "*.csv": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
      "*.txt": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
