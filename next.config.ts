import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  // Images must be handled differently in static exports
  images: {
    unoptimized: true,
  },
  // Enable additional optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  compiler: {
    removeConsole: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@emotion/react'],
  }
}

export default config 