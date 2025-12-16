import { NextResponse } from 'next/server';
import { getAllComponents } from '@/lib/storage';

export async function GET() {
  try {
    const components = await getAllComponents();
    return NextResponse.json(components.map(c => ({
      name: c.name,
      slug: c.slug,
      latestVersion: c.latestVersion,
      description: c.description,
      status: c.status,
    })));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}


