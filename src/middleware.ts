import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check the 'role' cookie
  const roleCookie = request.cookies.get('__session');
  const rawRole = roleCookie?.value;
  let role = rawRole ? rawRole.replace(/['"]/g, '').trim().toLowerCase() : undefined;

  // Check the actual auth token (JWT)
  const authToken = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;
  console.log(`[Middleware] ${request.method} ${pathname}`);
  console.log(`[Middleware] Role evaluated: ${role || 'NONE'}, AuthToken Present: ${!!authToken}`);

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Redirect to login if not authenticated by EITHER method
    if (!role && !authToken) {
      console.log(`[Middleware] Missing tokens on ${pathname} (${request.method}). Initiating redirect or RSC fallback.`);
      
      // If this is an RSC request (client-side Next.js fetch missing cookies), don't hard bounce.
      // Force the client to perform a full window.location.href reload to the same URL to pick up cookies again.
      // 303 See Other is better for breaking out of RSC fetches than 307.
      const isRsc = request.headers.get('rsc') === '1' || request.headers.get('next-router-prefetch') === '1';
      if (isRsc) {
          console.log(`[Middleware] Bouncing RSC fetch cleanly with X-Middleware-Rewrite to force hard reset.`);
          // Setting a custom header that the client layout could theoretically catch, or just redirecting to the target itself directly as a non-RSC payload.
          // Returning 401 prevents the cache poisoning from 307.
          return new NextResponse(null, { status: 401, headers: { 'x-middleware-bounce': 'true' }});
      }

      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Safely assume student if role is somehow dropped but auth_token exists
    if (!role && authToken) {
      role = 'student';
    }

    // Role-based routing validation
    if (pathname.startsWith('/dashboard/student') && role !== 'student' && role !== 'superadmin' && role !== 'masteradmin' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/teacher') && role !== 'teacher' && role !== 'superadmin' && role !== 'masteradmin' && role !== 'admin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/admin/creator') && role !== 'superadmin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/admin') && !['admin', 'superadmin', 'masteradmin', 'instadmin', 'deptadmin'].includes(role as string)) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/superadmin') && role !== 'superadmin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/masteradmin') && role !== 'masteradmin' && role !== 'superadmin') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname === '/dashboard') {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }
  }

  // Redirect authenticated users away from login pages
  if ((pathname === '/login' || pathname === '/controlpanel') && (role || authToken)) {
    return NextResponse.redirect(new URL(`/dashboard/${role || 'student'}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/controlpanel'],
};
