/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    npm_package_version: process.env.npm_package_version,
  },
};

module.exports = nextConfig;
