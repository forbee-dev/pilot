# Example Hero Banner Component

This is an example React component that demonstrates the MicroFE component structure.

## Files

- `index.tsx` - Main React component with TypeScript props
- `style.css` - Component styles

## Props

- `title` (string, required) - Main heading text
- `subtitle` (string, optional) - Subtitle text
- `imageUrl` (string, required) - Background image URL
- `buttonText` (string, optional) - Button text (defaults to "Learn More")
- `backgroundColor` (string, optional) - Background color (defaults to "#0070f3")
- `textColor` (string, optional) - Text color (defaults to "#ffffff")

## Usage

1. Upload `example-hero-banner.zip` to the MicroFE dashboard
2. The component will be detected and bundled automatically
3. Use it in WordPress by selecting it from the component dropdown
4. Configure props in the Gutenberg block sidebar

## Example Props

```json
{
  "title": "Welcome to Our Site",
  "subtitle": "Discover amazing features and services",
  "imageUrl": "https://images.unsplash.com/photo-1557683316-973673baf926",
  "buttonText": "Get Started",
  "backgroundColor": "#0070f3",
  "textColor": "#ffffff"
}
```


