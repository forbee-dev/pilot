import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { JSDOM } from 'jsdom';

export interface ComponentInfo {
  entryFile: string;
  componentName: string;
  propsSchema?: any;
}

export async function detectComponent(extractedDir: string): Promise<ComponentInfo> {
  const files = await getAllFiles(extractedDir);
  const tsxFiles = files.filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
  const tsFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'));

  // Look for common entry points
  const entryCandidates = [
    'index.tsx', 'index.jsx', 'index.ts', 'index.js',
    'component.tsx', 'component.jsx',
    'app.tsx', 'app.jsx',
  ];

  let entryFile: string | null = null;
  for (const candidate of entryCandidates) {
    const candidatePath = path.join(extractedDir, candidate);
    try {
      await fs.access(candidatePath);
      entryFile = candidate;
      break;
    } catch {
      continue;
    }
  }

  // If no standard entry found, use first tsx/jsx file
  if (!entryFile && tsxFiles.length > 0) {
    entryFile = path.relative(extractedDir, tsxFiles[0]);
  } else if (!entryFile && tsFiles.length > 0) {
    entryFile = path.relative(extractedDir, tsFiles[0]);
  }

  if (!entryFile) {
    throw new Error('No component file found in uploaded ZIP');
  }

  const entryPath = path.join(extractedDir, entryFile);
  const content = await fs.readFile(entryPath, 'utf-8');
  
  // Extract component name from file
  const componentName = extractComponentName(content, entryFile);
  
  // Try to extract props schema from TypeScript interface
  const propsSchema = extractPropsSchema(content);

  return {
    entryFile,
    componentName,
    propsSchema,
  };
}

async function getAllFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subFiles = await getAllFiles(fullPath);
      files.push(...subFiles);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

function extractComponentName(content: string, filename: string): string {
  // Try to find export default or named export
  const defaultExportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (defaultExportMatch) {
    return defaultExportMatch[1];
  }

  const namedExportMatch = content.match(/export\s+(?:default\s+)?(?:const|function)\s+(\w+)/);
  if (namedExportMatch) {
    return namedExportMatch[1];
  }

  // Fallback to filename
  return path.basename(filename, path.extname(filename));
}

function extractPropsSchema(content: string): any {
  // Simple extraction of TypeScript interface
  // In production, use a proper TypeScript parser
  const interfaceMatch = content.match(/interface\s+(\w+)\s*Props\s*\{([^}]+)\}/s);
  if (!interfaceMatch) {
    return {};
  }

  const propsContent = interfaceMatch[2];
  const schema: any = {
    type: 'object',
    properties: {},
    required: [],
  };

  // Extract properties (simplified)
  const propMatches = propsContent.matchAll(/(\w+)\s*:\s*([^;,\n]+)/g);
  for (const match of propMatches) {
    const propName = match[1].trim();
    const propType = match[2].trim();
    
    let jsonType = 'string';
    if (propType.includes('number')) jsonType = 'number';
    else if (propType.includes('boolean')) jsonType = 'boolean';
    else if (propType.includes('[]')) jsonType = 'array';

    schema.properties[propName] = { type: jsonType };
    
    // Check if optional
    if (!propType.includes('?')) {
      schema.required.push(propName);
    }
  }

  return schema;
}

