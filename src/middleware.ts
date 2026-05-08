import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-fallback-secret');

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isEmployeeRoute = pathname.startsWith('/employee');
  const isMemberRoute = pathname.startsWith('/member') && pathname !== '/member/verify';

  // If it's the login page and we have a valid token, redirect to dashboard
  if (pathname === '/login' && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;
      if (role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'employee') return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      if (role === 'member') return NextResponse.redirect(new URL('/member/dashboard', request.url));
    } catch (e) {
      // Token invalid, stay on login
    }
  }

  if (isAdminRoute || isEmployeeRoute || isMemberRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // Role-based protection
      if (isAdminRoute && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (isEmployeeRoute && role !== 'employee') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      if (isMemberRoute && role !== 'member') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      // Invalid token
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
    '/member/:path*',
    '/login'
  ],
};
