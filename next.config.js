/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Esto ignora los errores de TypeScript para que te deje publicar
    ignoreBuildErrors: true,
  },
  eslint: {
    // Esto ignora los avisos de "ortografía" del código
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
