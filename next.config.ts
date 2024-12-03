import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',
  // Images must be handled differently in static exports
  images: {
    unoptimized: true,
  }
}

export default config 