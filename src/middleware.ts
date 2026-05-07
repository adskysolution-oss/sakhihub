import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret'
);

export async function middleware(request: NextRequest) {
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
        const dashboardUrl = role === 'admin' 
          ? new URL('/admin/dashboard', request.url) 
          : new URL('/dashboard/member', request.url);
        return NextResponse.redirect(dashboardUrl);
      }

      // Role-based protection
      if (isAdminRoute && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard/member', request.url));
      }

      if (isDashboardRoute && role === 'admin' && !pathname.includes('member')) {
         // Admins can view member dashboard if they want, but usually stay in /admin
         // For now, let's allow them, or redirect if needed.
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
