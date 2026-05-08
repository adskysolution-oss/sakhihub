import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Define protected and public routes
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  // 1. If trying to access protected routes without a token, redirect to login
  if ((isAdminRoute || isDashboardRoute) && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If token exists, verify it and check roles
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // Prevent logged-in users from accessing login/register pages
      if (isAuthRoute) {
        if (role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (role === 'employee') return NextResponse.redirect(new URL('/dashboard/employee', request.url));
        return NextResponse.redirect(new URL('/dashboard/member', request.url));
      }

      // Role-based protection
      if (isAdminRoute && role !== 'super_admin') {
        const redirectUrl = role === 'employee' ? '/dashboard/employee' : '/dashboard/member';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      // If employee trying to access member routes or vice versa
      if (pathname.startsWith('/dashboard/employee') && role !== 'employee' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard/member', request.url));
      }
      
      if (pathname.startsWith('/dashboard/member') && role !== 'member' && role !== 'super_admin') {
        return NextResponse.redirect(new URL('/dashboard/employee', request.url));
      }

    } catch (error) {
      // Token invalid or expired
      if (isAdminRoute || isDashboardRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
