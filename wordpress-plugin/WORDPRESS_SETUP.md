# WordPress Plugin Setup Guide

## Prerequisites

- WordPress 5.8+ (with Gutenberg editor)
- Node.js 18+ and npm
- MicroFE API running (default: http://localhost:3000)

## Installation Steps

### 1. Build the Plugin

```bash
cd wordpress-plugin
npm install
npm run build
```

This will create a `build/` directory with the compiled block files.

### 2. Install in WordPress

**Option A: Manual Installation**

1. Copy the entire `wordpress-plugin` directory to your WordPress `wp-content/plugins/` directory:
   ```bash
   cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/microfe-components
   ```

2. The directory structure should be:
   ```
   wp-content/plugins/microfe-components/
   ├── microfe-components.php
   ├── build/
   │   ├── index.js
   │   ├── index.css
   │   └── block.json
   └── src/
       └── ...
   ```

**Option B: Symlink (for development)**

```bash
ln -s /path/to/Pilot/wordpress-plugin /path/to/wordpress/wp-content/plugins/microfe-components
```

### 3. Activate the Plugin

1. Log in to WordPress admin
2. Go to **Plugins** → **Installed Plugins**
3. Find **MicroFE Components** and click **Activate**

### 4. Configure the API URL

1. Go to **Settings** → **MicroFE**
2. Enter your MicroFE API URL (e.g., `http://localhost:3000`)
3. Click **Save Changes**

**Note:** If your WordPress site is on a different domain/port than the MicroFE API, make sure:
- The API is accessible from the WordPress server
- CORS is configured if needed (for development)
- The URL is correct (no trailing slash)

### 5. Use the Block

1. Edit any post or page
2. Click the **+** button to add a block
3. Search for **"React Component"** or look in the **Widgets** category
4. Select a component from the dropdown
5. Configure props in the sidebar
6. Preview updates automatically
7. Publish the post

## Development

For development with hot reloading:

```bash
cd wordpress-plugin
npm start
```

This watches for changes and rebuilds automatically.

## Troubleshooting

### Block not appearing

- Make sure the plugin is activated
- Check that `build/` directory exists and contains files
- Clear browser cache and WordPress cache
- Check browser console for JavaScript errors

### Components not loading

- Verify MicroFE API URL in Settings → MicroFE
- Check that MicroFE server is running
- Test API endpoint: `http://your-api-url/api/components`
- Check browser console for network errors

### Preview not working in editor

- Check browser console for errors
- Verify API URL is correct
- Ensure CORS is enabled on MicroFE API (for cross-origin requests)

### Frontend not hydrating

- Check that React and ReactDOM are loading
- Verify client.js bundle is accessible
- Check browser console for hydration errors
- Ensure container ID matches between SSR and client

## API Requirements

The MicroFE API must be accessible from:
1. WordPress admin (for block editor)
2. WordPress frontend (for rendering)

If running locally:
- Use `http://localhost:3000` if WordPress is also local
- Use your machine's IP if WordPress is in Docker/VM
- Configure CORS headers if needed

## CORS Configuration (if needed)

If you get CORS errors, add to your MicroFE API (Next.js):

```javascript
// next.config.js
const nextConfig = {
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
    ];
  },
};
```


