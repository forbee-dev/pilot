import { NextResponse } from 'next/server';
import { getComponentMetadata } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const metadata = await getComponentMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      name: metadata.name,
      slug: metadata.slug,
      description: metadata.description,
      latestVersion: metadata.latestVersion,
      versions: metadata.versions.map(v => ({
        version: v.version,
        propsSchema: v.propsSchema,
        createdAt: v.createdAt,
        status: v.status,
      })),
      status: metadata.status,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

