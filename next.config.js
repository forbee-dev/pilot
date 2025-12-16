/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Having a webpack() function should force Next.js to use webpack instead of Turbopack
  // This is required because Turbopack doesn't support our esbuild externalization needs

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
  // This webpack function forces Next.js to use webpack instead of Turbopack
  webpack: (config, { isServer, webpack }) => {
    // Always use webpack (not Turbopack) when this config exists
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

