# Quick Installation Guide

## 1. Build the Plugin

```bash
cd wordpress-plugin
npm install
npm run build
```

## 2. Copy to WordPress

```bash
# Replace /path/to/wordpress with your WordPress installation path
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/microfe-components
```

## 3. Activate in WordPress

1. Go to WordPress Admin → Plugins
2. Find "MicroFE Components"
3. Click "Activate"

## 4. Configure API URL

1. Go to Settings → MicroFE
2. Enter your MicroFE API URL (e.g., `http://localhost:3000`)
3. Click "Save Changes"

## 5. Use the Block

1. Edit any post/page
2. Add block → Search "React Component"
3. Select component and configure props
4. Publish!

## Troubleshooting

- **Block not showing?** Make sure `build/` directory exists
- **Components not loading?** Check API URL in Settings → MicroFE
- **CORS errors?** Make sure MicroFE API has CORS enabled (already configured in next.config.js)

For detailed setup, see [WORDPRESS_SETUP.md](./WORDPRESS_SETUP.md)


