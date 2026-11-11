import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public pages, static assets, and APIs pass freely
  if (
    pathname === '/' ||
    pathname.startsWith('/antrean') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Pass through to client-side auth context verification
    // Client-side AuthContext and Dashboard Layouts perform the final role enforcement
    const response = NextResponse.next();
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

