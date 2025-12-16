import 'server-only';

import AdmZip from 'adm-zip';
import fs from 'fs/promises';
import path from 'path';
import { detectComponent, ComponentInfo } from './component-detector';
import { bundleComponent } from './bundler';
import { 
  saveComponentMetadata, 
  getComponentMetadata, 
  getUploadPath,
  ComponentMetadata,
  ComponentVersion 
} from './storage';

export interface UploadResult {
  slug: string;
  version: string;
  componentInfo: ComponentInfo;
}

export async function handleComponentUpload(
  zipBuffer: Buffer,
  componentName?: string
): Promise<UploadResult> {
  // Extract ZIP
  const zip = new AdmZip(zipBuffer);
  const uploadId = Date.now().toString();
  const extractedDir = path.join(process.cwd(), 'uploads', uploadId);
  zip.extractAllTo(extractedDir, true);

  // Detect component
  const componentInfo = await detectComponent(extractedDir);

  // Generate slug
  const slug = componentName 
    ? componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : componentInfo.componentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Get or create metadata
  let metadata = await getComponentMetadata(slug);
  const now = new Date().toISOString();

  if (!metadata) {
    metadata = {
      name: componentInfo.componentName,
      slug,
      description: '',
      latestVersion: '1.0.0',
      versions: [],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };
  }

  // Determine next version (simple increment for MVP)
  const latestVersion = metadata.latestVersion;
  const versionParts = latestVersion.split('.').map(Number);
  versionParts[2] = (versionParts[2] || 0) + 1; // Increment patch
  const newVersion = versionParts.join('.');

  // Bundle component
  const bundleResult = await bundleComponent(
    extractedDir,
    slug,
    newVersion,
    componentInfo.entryFile
  );

  // Create version metadata
  const version: ComponentVersion = {
    version: newVersion,
    propsSchema: componentInfo.propsSchema || {},
    ssrPath: bundleResult.ssrPath,
    clientPath: bundleResult.clientPath,
    cssPath: bundleResult.cssPath,
    createdAt: now,
    status: 'active',
  };

  // Update metadata
  metadata.versions.push(version);
  metadata.latestVersion = newVersion;
  metadata.updatedAt = now;

  await saveComponentMetadata(slug, metadata);

  // Cleanup extracted files
  await fs.rm(extractedDir, { recursive: true, force: true });

  return {
    slug,
    version: newVersion,
    componentInfo,
  };
}

