import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { UserRole } from '@/types/database';

const validRoles: UserRole[] = ['admin', 'petugas', 'dokter', 'pasien'];

function isUserRole(role: unknown): role is UserRole {
  return validRoles.some((validRole) => validRole === role);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  if (!pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const refreshedCookies: { name: string; value: string; options: CookieOptions }[] = [];
  const responseHeaders: Record<string, string> = {};
  let response = NextResponse.next({ request });
  const redirect = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    refreshedCookies.forEach(({ name, value, options }) => {
      redirectResponse.cookies.set(name, value, options);
    });
    Object.entries(responseHeaders).forEach(([name, value]) => {
      redirectResponse.headers.set(name, value);
    });
    return redirectResponse;
  };
  const loginRedirect = (error: string) => {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('auth_error', error);
    return redirect(loginUrl);
  };

  const demoMode = request.cookies.get('sim_klinik_demo')?.value === 'true';
  const cookieRole = request.cookies.get('sim_klinik_role')?.value;
  let role: UserRole | null = demoMode && isUserRole(cookieRole) ? cookieRole : null;

  if (!role) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              refreshedCookies.push({ name, value, options });
            });
            Object.assign(responseHeaders, headers);
            response = NextResponse.next({ request });
            refreshedCookies.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
            Object.entries(responseHeaders).forEach(([name, value]) => {
              response.headers.set(name, value);
            });
          },
        },
      });

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!authError && authData.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (!profileError && profile && isUserRole(profile.role)) {
          role = profile.role;
        }
      }
    }
  }

  if (!role) {
    return loginRedirect('unauthenticated');
  }

  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return redirect(new URL(`/dashboard/${role}`, request.url));
  }

  const requiredRole = pathname.startsWith('/dashboard/admin')
    ? 'admin'
    : pathname.startsWith('/dashboard/dokter')
    ? 'dokter'
    : pathname.startsWith('/dashboard/petugas')
    ? 'petugas'
    : pathname.startsWith('/dashboard/pasien')
    ? 'pasien'
    : null;

  if (
    requiredRole &&
    role !== requiredRole &&
    !(requiredRole === 'pasien' && role === 'admin')
  ) {
    return loginRedirect(`forbidden_${requiredRole}`);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
