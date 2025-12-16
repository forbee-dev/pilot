import { NextRequest, NextResponse } from 'next/server';
import { ensureDirectories } from '@/lib/storage';

// Configure body size limit for Next.js 16
export const maxDuration = 60; // 60 seconds
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const componentName = formData.get('name') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Dynamic import to avoid Turbopack analysis issues
    const { handleComponentUpload } = await import('@/lib/upload-handler');
    const result = await handleComponentUpload(buffer, componentName || undefined);

    return NextResponse.json({
      success: true,
      component: {
        slug: result.slug,
        version: result.version,
        name: result.componentInfo.componentName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

