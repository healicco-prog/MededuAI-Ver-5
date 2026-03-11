import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get('__session');
  return NextResponse.json({
    hasSession: !!session,
    value: session?.value,
    all: cookieStore.getAll()
  });
}
