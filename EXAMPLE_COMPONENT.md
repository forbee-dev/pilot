# Example Component Structure

This guide shows how to structure a React component for upload to MicroFE.

## Basic Component Structure

Create a ZIP file with the following structure:

```
my-component.zip
├── index.tsx          (or index.jsx, component.tsx, etc.)
├── style.css         (optional)
└── other-files...    (any additional files)
```

## Example Component

### index.tsx

```tsx
import React from 'react';

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function HeroBanner({
  title,
  subtitle,
  imageUrl,
  buttonText = 'Learn More',
  onButtonClick,
}: HeroBannerProps) {
  return (
    <div className="hero-banner">
      <img src={imageUrl} alt={title} />
      <div className="hero-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {buttonText && (
          <button onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
```

### style.css (optional)

```css
.hero-banner {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
}

.hero-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  color: white;
}

.hero-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
}

.hero-content button {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
```

## Component Requirements

1. **Default Export**: Component must be the default export
2. **React Component**: Must be a valid React component (function or class)
3. **Props Interface**: Use TypeScript interfaces for automatic schema generation
4. **SSR Compatible**: Avoid browser-only APIs during initial render
   - ❌ `window`, `document`, `localStorage` in render
   - ✅ Use `useEffect` for browser-only code

## Props Schema Generation

MicroFE automatically extracts props schema from TypeScript interfaces:

- `string` → `{ type: 'string' }`
- `number` → `{ type: 'number' }`
- `boolean` → `{ type: 'boolean' }`
- `?` suffix → optional prop (not in `required` array)

## Upload Process

1. Create your component files
2. Zip them together
3. Upload via the MicroFE dashboard
4. System will:
   - Detect the main component file
   - Extract props schema
   - Build SSR and client bundles
   - Create a new version

## Testing Locally

Before uploading, test your component:

```tsx
// test.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import HeroBanner from './index';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <HeroBanner
    title="Welcome"
    subtitle="This is a test"
    imageUrl="https://example.com/image.jpg"
    buttonText="Click Me"
  />
);
```

## Common Issues

### Component not detected
- Ensure you have a `.tsx`, `.jsx`, `.ts`, or `.js` file
- File should export a default React component

### Props not showing in WordPress
- Check TypeScript interface is properly formatted
- Ensure props are not all optional (at least one should be required)

### SSR errors
- Remove any `window` or `document` usage from render
- Move browser-only code to `useEffect`


