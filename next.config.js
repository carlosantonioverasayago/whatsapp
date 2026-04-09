/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Permite que los despliegues finalicen con éxito incluso si
    // tu proyecto tiene errores de TypeScript.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora los errores de ESLint durante el despliegue
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
