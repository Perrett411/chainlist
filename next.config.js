module.exports = {
  // Removed 'output: export' to enable API routes for server-side authentication
  // i18n: {
  //   locales: ["en", "zh"],
  //   defaultLocale: "en",
  // },
  reactStrictMode: true,
  // Allow all dev origins for Replit proxy support
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Fix dev server cross-origin warnings
  allowedDevOrigins: [
    '3a537a4f-77af-4f31-ae3c-9d1df8557a3f-00-2nr5nficho2z6.janeway.replit.dev',
    'localhost:5000',
    'localhost',
    '127.0.0.1:5000',
    '127.0.0.1'
  ],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
