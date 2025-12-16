/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Note: Turbopack is disabled via --no-turbo flag in build script
  // This is needed because Turbopack doesn't support webpack config for esbuild externalization

  // CORS headers for WordPress integration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
      {
        source: '/cdn/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
        ],
      },
    ];
  },

  // Webpack configuration for handling esbuild
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize esbuild and its platform-specific packages
      config.externals = config.externals || [];
      
      // Add function to check if module should be externalized
      const originalExternals = config.externals;
      config.externals = [
        ...(Array.isArray(originalExternals) ? originalExternals : [originalExternals]),
        ({ request }, callback) => {
          // Externalize esbuild and all @esbuild packages
          if (request === 'esbuild' || request?.startsWith('@esbuild/')) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }

    // Ignore binary files and READMEs
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    
    config.module.rules.push({
      test: /node_modules\/@esbuild\/.*\/bin\/esbuild$/,
      use: 'ignore-loader',
    });

    config.module.rules.push({
      test: /\.md$/,
      include: /node_modules\/@esbuild/,
      use: 'ignore-loader',
    });

    return config;
  },
}

module.exports = nextConfig

