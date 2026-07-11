/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Hosts paste arbitrary photo URLs in the listing wizard, so allow any
    // remote host rather than whitelisting fixed domains. ("**" matches any
    // hostname; without this, next/image throws "hostname not configured".)
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;
