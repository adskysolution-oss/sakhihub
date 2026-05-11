import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sakhi-hub-secret-key-2026'
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Define route protections
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminPage = pathname.startsWith('/admin');
  const isVendorPage = pathname.startsWith('/vendor');
  const isSubVendorPage = pathname.startsWith('/sub-vendor');
  const isEmployeePage = pathname.startsWith('/employee');
  const isMemberPage = pathname.startsWith('/member');
  const isPublicPage = !isAdminPage && !isVendorPage && !isSubVendorPage && !isEmployeePage && !isMemberPage && !isAuthPage;

  // 1. Allow public pages
  if (isPublicPage || pathname === '/' || pathname.startsWith('/api/public') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 2. Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);
      if (payload.role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (payload.role === 'vendor') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      if (payload.role === 'sub_vendor') return NextResponse.redirect(new URL('/sub-vendor/dashboard', request.url));
      if (payload.role === 'employee') return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      if (payload.role === 'member') return NextResponse.redirect(new URL('/member/dashboard', request.url));
    } catch (e) {
      // Invalid token, allow access to login
      return NextResponse.next();
    }
  }

  // 3. Protect dashboard routes
  if (isAdminPage || isVendorPage || isSubVendorPage || isEmployeePage || isMemberPage) {
    if (!token) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);
      
      // Role-based access control
      if (isAdminPage && payload.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (isVendorPage && payload.role !== 'vendor' && payload.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (isSubVendorPage && payload.role !== 'sub_vendor' && payload.role !== 'vendor' && payload.role !== 'super_admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (isEmployeePage && !['employee', 'sub_vendor', 'vendor', 'super_admin'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      if (isMemberPage && !['member', 'employee', 'sub_vendor', 'vendor', 'super_admin'].includes(payload.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/sub-vendor/:path*',
    '/employee/:path*',
    '/member/:path*',
    '/login',
    '/register',
  ],
};
