import { NextResponse } from 'next/server';
import { getComponentMetadata } from '@/lib/storage';
import { renderComponent } from '@/lib/bundler';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string; version: string }> }
) {
  try {
    const { slug, version: versionParam } = await params;
    const { searchParams } = new URL(request.url);
    const propsParam = searchParams.get('props');
    const props = propsParam ? JSON.parse(decodeURIComponent(propsParam)) : {};

    const metadata = await getComponentMetadata(slug);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Component not found' },
        { status: 404 }
      );
    }

    const version = metadata.versions.find(v => v.version === versionParam);
    if (!version) {
      return NextResponse.json(
        { error: 'Version not found' },
        { status: 404 }
      );
    }

    const html = await renderComponent(version.ssrPath, props);

    return NextResponse.json({
      html,
      props,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

