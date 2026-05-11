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
      
      // Hierarchy check (Option C) - Skip for Super Admin and Vendors
      if (!['super_admin', 'vendor'].includes(payload.role) && payload.assignmentStatus === 'pending') {
        if (pathname !== '/pending-assignment') {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
      }

      // Status check (Admin Review Flow)
      if (payload.role !== 'super_admin' && payload.status !== 'active') {
        if (pathname !== '/pending-approval' && pathname !== '/pending-assignment') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }

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

  // Handle Landing Pages for Restricted Statuses
  if (pathname === '/pending-approval' || pathname === '/pending-assignment') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);
      
      // If user is now active and assigned, redirect them to their dashboard
      if (payload.status === 'active' && payload.assignmentStatus === 'completed') {
        if (payload.role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        if (payload.role === 'vendor') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
        if (payload.role === 'sub_vendor') return NextResponse.redirect(new URL('/sub-vendor/dashboard', request.url));
        if (payload.role === 'employee') return NextResponse.redirect(new URL('/employee/dashboard', request.url));
        return NextResponse.redirect(new URL('/member/dashboard', request.url));
      }
      
      // If they are on the wrong landing page (e.g., assigned but not approved)
      if (pathname === '/pending-assignment' && payload.assignmentStatus === 'completed' && payload.status !== 'active') {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
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
    '/pending-approval',
    '/pending-assignment',
  ],
};
