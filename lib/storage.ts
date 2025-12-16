import 'server-only';

import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const COMPONENTS_DIR = path.join(process.cwd(), 'components');
const CDN_DIR = path.join(process.cwd(), 'cdn');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export interface ComponentMetadata {
  name: string;
  slug: string;
  description?: string;
  latestVersion: string;
  versions: ComponentVersion[];
  status: 'active' | 'deprecated';
  createdAt: string;
  updatedAt: string;
}

export interface ComponentVersion {
  version: string;
  propsSchema: any;
  ssrPath: string;
  clientPath: string;
  cssPath?: string;
  createdAt: string;
  status: 'active' | 'deprecated';
}

export async function ensureDirectories() {
  await fs.mkdir(COMPONENTS_DIR, { recursive: true });
  await fs.mkdir(CDN_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function getComponentMetadata(slug: string): Promise<ComponentMetadata | null> {
  const metadataPath = path.join(COMPONENTS_DIR, slug, 'metadata.json');
  try {
    const data = await fs.readFile(metadataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function saveComponentMetadata(slug: string, metadata: ComponentMetadata) {
  const componentDir = path.join(COMPONENTS_DIR, slug);
  await fs.mkdir(componentDir, { recursive: true });
  const metadataPath = path.join(componentDir, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
}

export async function getAllComponents(): Promise<ComponentMetadata[]> {
  await ensureDirectories();
  const entries = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components: ComponentMetadata[] = [];
  
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const metadata = await getComponentMetadata(entry.name);
      if (metadata) {
        components.push(metadata);
      }
    }
  }
  
  return components;
}

export function getComponentVersionPath(slug: string, version: string): string {
  return path.join(COMPONENTS_DIR, slug, version);
}

export function getCDNPath(slug: string, version: string, file: string): string {
  return path.join(CDN_DIR, slug, version, file);
}

export async function saveCDNFile(slug: string, version: string, filename: string, content: string | Buffer) {
  const cdnVersionDir = path.join(CDN_DIR, slug, version);
  await fs.mkdir(cdnVersionDir, { recursive: true });
  const filePath = path.join(cdnVersionDir, filename);
  await fs.writeFile(filePath, content);
  return filePath;
}

export function getUploadPath(filename: string): string {
  return path.join(UPLOADS_DIR, filename);
}

