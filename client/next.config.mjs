/** @type {import('next').NextConfig} */
const nextConfig = {
    serverExternalPackages: ['sharp'],
    experimental: {
        optimizePackageImports: ['framer-motion', 'gsap'],
    },
    async headers() {
        return [
            {
                source: '/media/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*.png',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*.jpg',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/:path*.webp',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Exclude API, Admin dashboard, and internal Next.js paths from this aggressive cache
                source: '/((?!api|admin|_next|.*\\..*).*)*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, s-maxage=60, stale-while-revalidate=300',
                    },
                ],
            },
        ]
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                // Allow all HTTPS domains (covers WordPress media + any CDN)
                protocol: 'https',
                hostname: '**',
            },
            {
                // Allow HTTP for local WordPress dev
                protocol: 'http',
                hostname: '**',
            },
        ],
    },
};

export default nextConfig;
