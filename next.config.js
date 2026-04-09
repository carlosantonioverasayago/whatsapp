/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Esto es lo que nos salvará
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
export default nextConfig
