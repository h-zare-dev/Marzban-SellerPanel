/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    PAGE_TITLE: process.env.PAGE_TITLE,
    CHANNEL_NAME: process.env.CHANNEL_NAME,
  },
};

module.exports = nextConfig;
