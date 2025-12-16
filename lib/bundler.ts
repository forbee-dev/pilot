// Server-only code - esbuild is Node.js only
import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { build } from 'esbuild';
import { getComponentVersionPath, saveCDNFile, ComponentVersion } from './storage';

export interface BundleResult {
  ssrPath: string;
  clientPath: string;
  cssPath?: string;
}

export async function bundleComponent(
  componentDir: string,
  slug: string,
  version: string,
  entryFile: string
): Promise<BundleResult> {
  const entryPath = path.join(componentDir, entryFile);
  const outputDir = getComponentVersionPath(slug, version);
  await fs.mkdir(outputDir, { recursive: true });

  // Create SSR wrapper
  const ssrWrapperPath = path.join(outputDir, 'ssr-wrapper.js');
  // Use absolute path for require to avoid resolution issues
  const ssrWrapper = `
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const path = require('path');
const bundlePath = path.join(__dirname, 'ssr-bundle.js');
const Component = require(bundlePath);

module.exports = function render(props) {
  const element = React.createElement(Component.default || Component, props || {});
  return ReactDOMServer.renderToString(element);
};
`;
  await fs.writeFile(ssrWrapperPath, ssrWrapper);

  // Build SSR bundle (component only)
  const ssrBundlePath = path.join(outputDir, 'ssr-bundle.js');
  await build({
    entryPoints: [entryPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile: ssrBundlePath,
    external: ['react', 'react-dom'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // Build client bundle as IIFE with React as external
  const clientOutput = path.join(outputDir, 'client.js');
  await build({
    entryPoints: [entryPath],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    outfile: clientOutput,
    globalName: 'MicroFEComponent',
    external: ['react', 'react-dom', 'react-dom/client'],
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // Read the built bundle and wrap it with hydration code
  let clientBundleContent = await fs.readFile(clientOutput, 'utf-8');
  
  // Create full hydration wrapper
  // Note: React should be loaded by WordPress before this script
  const fullClientCode = `
(function() {
  // Wait for React to be available
  function initHydration() {
    if (typeof window.React === 'undefined' || typeof window.ReactDOM === 'undefined') {
      console.warn('MicroFE: React not yet loaded, retrying...');
      setTimeout(initHydration, 100);
      return;
    }
    
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    
    // React 18 uses hydrateRoot, React 17 uses hydrate
    const hydrateMethod = ReactDOM.hydrateRoot || ReactDOM.hydrate;
    
    if (!hydrateMethod) {
      console.error('MicroFE: ReactDOM hydration method not available.');
      return;
    }
    
    // Component is in MicroFEComponent (from esbuild bundle)
    ${clientBundleContent}
    
    const Component = window.MicroFEComponent?.default || window.MicroFEComponent;
    
    if (!Component) {
      console.error('MicroFE: Component not found in bundle');
      return;
    }
    
    // Find all containers for this component
    const containers = document.querySelectorAll('[id^="microfe-${slug}-${version}"]');
    
    containers.forEach(function(container) {
      try {
        const propsData = container.dataset.props ? JSON.parse(container.dataset.props) : {};
        const element = React.createElement(Component, propsData);
        
        if (ReactDOM.hydrateRoot) {
          // React 18
          ReactDOM.hydrateRoot(container, element);
        } else {
          // React 17
          ReactDOM.hydrate(element, container);
        }
      } catch (error) {
        console.error('MicroFE: Error hydrating component:', error);
      }
    });
  }
  
  // Start hydration when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHydration);
  } else {
    initHydration();
  }
})();
`;
  await fs.writeFile(clientOutput, fullClientCode);

  // Copy client bundle to CDN
  const clientContent = await fs.readFile(clientOutput);
  await saveCDNFile(slug, version, 'client.js', clientContent);

  // Extract CSS if present
  const cssPath = path.join(componentDir, 'style.css');
  let cssContent: string | undefined;
  try {
    cssContent = await fs.readFile(cssPath, 'utf-8');
    await saveCDNFile(slug, version, 'style.css', cssContent);
  } catch {
    // No CSS file found
  }

  return {
    ssrPath: ssrWrapperPath,
    clientPath: clientOutput,
    cssPath: cssContent ? path.join(outputDir, 'style.css') : undefined,
  };
}

export async function renderComponent(
  ssrPath: string,
  props: any
): Promise<string> {
  try {
    // Normalize the path (handle both absolute and relative)
    const normalizedPath = path.isAbsolute(ssrPath) 
      ? path.normalize(ssrPath)
      : path.resolve(process.cwd(), ssrPath);
    
    // Check if file exists
    try {
      await fs.access(normalizedPath);
    } catch (accessError) {
      throw new Error(`SSR bundle file does not exist at ${normalizedPath}. Original path: ${ssrPath}`);
    }
    
    // Resolve the module path - require.resolve works with absolute paths
    let resolvedPath: string;
    try {
      resolvedPath = require.resolve(normalizedPath);
    } catch (resolveError: any) {
      // If resolve fails, the file might not be in require's search path
      // Try using the normalized path directly
      resolvedPath = normalizedPath;
    }
    
    // Clear from cache if it exists (try both paths)
    [normalizedPath, resolvedPath].forEach(p => {
      if (require.cache[p]) {
        delete require.cache[p];
      }
    });
    
    // Dynamically import and execute SSR bundle
    // Use eval to avoid webpack static analysis of require()
    // This ensures the require happens at runtime, not build time
    let render: any;
    try {
      // eslint-disable-next-line no-eval
      render = eval(`require(${JSON.stringify(resolvedPath)})`);
    } catch (requireError: any) {
      // If that fails, try with the normalized path
      if (resolvedPath !== normalizedPath) {
        try {
          // eslint-disable-next-line no-eval
          render = eval(`require(${JSON.stringify(normalizedPath)})`);
        } catch {
          throw requireError;
        }
      } else {
        throw requireError;
      }
    }
    
    if (typeof render !== 'function') {
      throw new Error(`SSR bundle does not export a render function. Got: ${typeof render}. Path: ${resolvedPath}`);
    }

    const html = render(props || {});
    
    if (typeof html !== 'string') {
      throw new Error(`Render function did not return a string. Got: ${typeof html}`);
    }
    
    return html;
  } catch (error: any) {
    // Provide more context in error message
    if (error.code === 'MODULE_NOT_FOUND' || error.message?.includes('Cannot find module')) {
      throw new Error(`SSR bundle not found at ${ssrPath}. Make sure the component was built correctly. Error: ${error.message}`);
    }
    if (error.message?.includes('does not exist')) {
      throw error; // Re-throw file existence errors as-is
    }
    throw new Error(`Failed to render component: ${error.message}. Path: ${ssrPath}`);
  }
}

