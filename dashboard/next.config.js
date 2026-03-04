/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    // Prevent intermittent missing chunk files in Windows dev mode.
    if (dev) {
      config.cache = false
    }
    return config
  },
}

module.exports = nextConfig
