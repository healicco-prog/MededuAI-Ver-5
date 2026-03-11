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
  
  if (pathname.startsWith('/dashboard')) {
      console.log(`\n\n[MIDDLEWARE DIAGNOSTIC START] ---------------------`);
      console.log(`- Request Pathname: ${pathname}`);
      console.log(`- Request Method: ${request.method}`);
      console.log(`- __session cookie exists: ${!!roleCookie}`);
      console.log(`- auth_token cookie exists: ${!!authToken}`);
      console.log(`- Decoded Role: ${role || 'undefined'}`);
  }

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Redirect to login if not authenticated by EITHER method
    if (!role && !authToken) {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED. Both tokens missing. Redirecting to /login.`);
      const isRsc = request.headers.get('rsc') === '1' || request.headers.get('next-router-prefetch') === '1';
      if (isRsc) {
          return new NextResponse(null, { status: 401, headers: { 'x-middleware-bounce': 'true' }});
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Safely assume student if role is somehow dropped but auth_token exists
    if (!role && authToken) {
      console.log(`- Recovering lost role to 'student' from authToken presence`);
      role = 'student';
    }

    // Role-based routing validation
    if (pathname.startsWith('/dashboard/student') && role !== 'student' && role !== 'superadmin' && role !== 'masteradmin' && role !== 'admin') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC. Path requires student, role is ${role}. Redirecting to /dashboard/${role}`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/teacher') && role !== 'teacher' && role !== 'superadmin' && role !== 'masteradmin' && role !== 'admin') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC.`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/admin/creator') && role !== 'superadmin') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC.`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/admin') && !['admin', 'superadmin', 'masteradmin', 'instadmin', 'deptadmin'].includes(role as string)) {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC.`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/superadmin') && role !== 'superadmin') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC.`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname.startsWith('/dashboard/masteradmin') && role !== 'masteradmin' && role !== 'superadmin') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> DENIED RBAC.`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    if (pathname === '/dashboard') {
      console.log(`[MIDDLEWARE DIAGNOSTIC END] -> ROOT REDIRECT. Sending to /dashboard/${role}`);
      return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
    }

    console.log(`[MIDDLEWARE DIAGNOSTIC END] -> ALLOWED. User has correct role for path.`);
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
