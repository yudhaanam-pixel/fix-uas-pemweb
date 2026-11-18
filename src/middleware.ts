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

  // Strict role gating for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const roleCookie = request.cookies.get('sim_klinik_role')?.value;

    // 1. If not authenticated at all, kick to login page immediately
    if (!roleCookie) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('auth_error', 'unauthenticated');
      return NextResponse.redirect(loginUrl);
    }

    // 2. Strict gating for Admin dashboard (/dashboard/admin)
    if (pathname.startsWith('/dashboard/admin') && roleCookie !== 'admin') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('auth_error', 'forbidden_admin');
      return NextResponse.redirect(loginUrl);
    }

    // 3. Strict gating for Dokter dashboard (/dashboard/dokter)
    if (pathname.startsWith('/dashboard/dokter') && roleCookie !== 'dokter') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('auth_error', 'forbidden_dokter');
      return NextResponse.redirect(loginUrl);
    }

    // 4. Strict gating for Petugas dashboard (/dashboard/petugas)
    if (pathname.startsWith('/dashboard/petugas') && roleCookie !== 'petugas') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('auth_error', 'forbidden_petugas');
      return NextResponse.redirect(loginUrl);
    }

    // 5. Strict gating for Pasien dashboard (/dashboard/pasien)
    if (pathname.startsWith('/dashboard/pasien') && roleCookie !== 'pasien' && roleCookie !== 'admin') {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('auth_error', 'forbidden_pasien');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

