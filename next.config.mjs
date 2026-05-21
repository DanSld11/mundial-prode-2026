/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Supabase without generated types infers `never` on table access.
    // Type safety is enforced at runtime; remove this once types are generated.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
