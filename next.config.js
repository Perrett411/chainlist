module.exports = {
  // Removed 'output: export' to enable API routes for server-side authentication
  // i18n: {
  //   locales: ["en", "zh"],
  //   defaultLocale: "en",
  // },
  reactStrictMode: true,
  // Allow all dev origins for Replit proxy support
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
        ],
      },
    ];
  },
};
