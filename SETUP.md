# MicroFE MVP Setup Guide

This guide will help you set up and run the MicroFE Component Manager MVP.

## Prerequisites

- Node.js 18+ and npm
- WordPress installation (for the plugin)

## MicroFE Application Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   The application will be available at http://localhost:3000

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## WordPress Plugin Setup

1. **Copy the plugin:**
   ```bash
   cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/microfe-components
   ```

2. **Install plugin dependencies:**
   ```bash
   cd /path/to/wordpress/wp-content/plugins/microfe-components
   npm install
   npm run build
   ```

3. **Activate the plugin:**
   - Go to WordPress Admin > Plugins
   - Find "MicroFE Components" and click "Activate"

4. **Configure the API URL:**
   - Go to Settings > MicroFE
   - Enter your MicroFE API URL (e.g., http://localhost:3000)
   - Click "Save Changes"

## Usage

### Uploading a Component

1. Navigate to http://localhost:3000/upload
2. Optionally enter a component name
3. Select a ZIP file containing your React component
4. Click "Upload Component"

The system will:
- Extract the ZIP file
- Detect the main component file
- Extract props schema from TypeScript interfaces
- Build SSR and client bundles
- Create a new version

### Using Components in WordPress

1. Edit a post or page in WordPress
2. Click the "+" button to add a block
3. Search for "React Component"
4. Select the component from the dropdown
5. Configure props in the sidebar
6. Preview will update automatically
7. Publish the post

## Component Structure

Your uploaded ZIP should contain:
- A main component file (e.g., `index.tsx`, `component.tsx`)
- Optional CSS file (`style.css`)
- Any dependencies (will be bundled)

Example component:
```tsx
// index.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
  count?: number;
}

export default function MyComponent({ title, count = 0 }: MyComponentProps) {
  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
    </div>
  );
}
```

## API Endpoints

- `GET /api/components` - List all components
- `GET /api/components/{slug}` - Get component details
- `GET /api/render/{slug}/{version}?props={json}` - SSR render
- `GET /cdn/components/{slug}/{version}/client.js` - Client bundle
- `GET /cdn/components/{slug}/{version}/style.css` - CSS file
- `POST /api/upload` - Upload new component

## Troubleshooting

### Components not loading in WordPress
- Check that the MicroFE API URL is correct in Settings > MicroFE
- Ensure the MicroFE server is running
- Check browser console for errors

### Upload fails
- Ensure the ZIP contains valid React component files
- Check that the component exports a default React component
- Verify file size is within limits

### SSR not working
- Ensure React and ReactDOM are available in the Node.js environment
- Check component doesn't use browser-only APIs during SSR

## Next Steps

After MVP, consider:
- Component preview sandbox
- Version comparison and rollback
- Component categories/tags
- A/B testing support
- Authentication and RBAC


