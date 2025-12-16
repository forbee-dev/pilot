import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCDNPath } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; version: string; file: string }> }
) {
  try {
    const { slug, version, file } = await params;
    const filePath = getCDNPath(slug, version, file);
    
    try {
      const content = await fs.readFile(filePath);
      const ext = path.extname(file);
      
      let contentType = 'application/octet-stream';
      if (ext === '.js') contentType = 'application/javascript';
      else if (ext === '.css') contentType = 'text/css';
      else if (ext === '.json') contentType = 'application/json';

      return new NextResponse(content, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

