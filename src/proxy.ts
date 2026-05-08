import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-fallback-secret'
);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define Route Categories
  const isAdminPath = pathname.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';
  const isAdminProtectedRoute = isAdminPath && !isAdminLogin;
  
  const isEmployeeProtectedRoute = pathname.startsWith('/employee');
  const isMemberProtectedRoute = pathname.startsWith('/member');
  
  const isPublicAuthRoute = pathname === '/login' || pathname === '/register';

  // 2. Handle Unauthenticated Access
  if (!token) {
    if (isAdminProtectedRoute) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (isEmployeeProtectedRoute || isMemberProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. Handle Authenticated Access
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // A. Prevent logged-in users from visiting login pages
    if (isPublicAuthRoute || isAdminLogin) {
      if (role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'employee') return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      if (role === 'member') return NextResponse.redirect(new URL('/member/dashboard', request.url));
    }

    // B. Super Admin Access Control
    if (role === 'super_admin') {
      if (isEmployeeProtectedRoute || isMemberProtectedRoute) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // C. Employee Access Control
    if (role === 'employee') {
      if (isAdminPath) return NextResponse.redirect(new URL('/login', request.url));
      if (isMemberProtectedRoute) return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      return NextResponse.next();
    }

    // D. Member Access Control
    if (role === 'member') {
      if (isAdminPath) return NextResponse.redirect(new URL('/login', request.url));
      if (isEmployeeProtectedRoute) return NextResponse.redirect(new URL('/member/dashboard', request.url));
      return NextResponse.next();
    }

  } catch (error) {
    const response = NextResponse.redirect(
      isAdminPath ? new URL('/admin/login', request.url) : new URL('/login', request.url)
    );
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/employee/:path*',
    '/member/:path*',
    '/login',
    '/register',
  ],
};
