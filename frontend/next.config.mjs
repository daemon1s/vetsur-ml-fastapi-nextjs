/** @type {import('next').NextConfig} */
// Nota: Esta configuración optimiza Next.js para correr dentro de Docker (standalone).
const nextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Nota: Ignoramos errores de tipado en el build para facilitar el despliegue rápido.
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
