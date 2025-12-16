# Micro-Frontend Component Manager (MicroFE)

A web application that enables content and product teams to upload, manage, and deploy React-based UI components with SSR support and WordPress Gutenberg integration.

## 🚀 Quick Start

```bash
# Run setup script
./scripts/setup.sh

# Or manually:
npm install
npm run dev
```

The app will run on http://localhost:3000

## 📋 Architecture

- **MicroFE App**: Next.js application handling component upload, bundling, and API endpoints
- **WordPress Plugin**: Gutenberg block for integrating components into WordPress content

## ✨ Features

- ✅ Upload React components as ZIP files
- ✅ Automated bundling (SSR + client hydration + CSS)
- ✅ API endpoints for component management and rendering
- ✅ WordPress Gutenberg block with dynamic props
- ✅ SSR preview in editor
- ✅ SEO-friendly frontend rendering
- ✅ Automatic props schema extraction from TypeScript
- ✅ Version management

## 📚 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Example Component](./EXAMPLE_COMPONENT.md) - How to structure components
- [Docker Setup](./DOCKER.md) - Container deployment

## 🔌 WordPress Plugin Setup

1. Copy the `wordpress-plugin` directory to your WordPress `wp-content/plugins/` directory
2. Install plugin dependencies:
   ```bash
   cd wordpress-plugin
   npm install
   npm run build
   ```
3. Activate the plugin in WordPress admin
4. Configure the MicroFE API URL in Settings > MicroFE

## 🌐 API Endpoints

- `GET /api/components` - List all components
- `GET /api/components/{component}` - Get component details
- `GET /api/render/{component}/{version}?props={json}` - SSR render endpoint
- `GET /cdn/components/{component}/{version}/client.js` - Hydration bundle
- `GET /cdn/components/{component}/{version}/style.css` - Styles
- `POST /api/upload` - Upload new component (multipart/form-data)

## 🏗️ Project Structure

```
Pilot/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # Component detail pages
│   └── upload/            # Upload page
├── lib/                   # Core libraries
│   ├── bundler.ts         # Component bundling
│   ├── storage.ts         # Component storage
│   └── upload-handler.ts  # Upload processing
├── wordpress-plugin/      # WordPress plugin
│   ├── src/              # Plugin source
│   └── microfe-components.php
└── components/            # Stored components (generated)
```

## 🎯 MVP Features (Phase 1)

All Phase 1 requirements from the PRD are implemented:

- ✅ Component upload via ZIP
- ✅ Automated bundling pipeline
- ✅ SSR + hydration endpoints
- ✅ Basic dashboard
- ✅ Gutenberg block with component selection
- ✅ Dynamic props configuration
- ✅ SSR preview in editor
- ✅ WordPress frontend integration

