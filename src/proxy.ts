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
  const isAdminLoginPage = pathname === '/admin/login';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || isAdminLoginPage;
  const isAdminPage = pathname.startsWith('/admin') && !isAdminLoginPage;
  const isVendorPage = pathname.startsWith('/vendor');
  const isVendorApi = pathname.startsWith('/api/vendor');
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

      // Check restricted statuses first
      if (['rejected', 'suspended', 'inactive'].includes(payload.status)) {
        return NextResponse.redirect(new URL('/pending-approval', request.url));
      }

      // Strict Role & Status Redirects
      if (payload.role === 'super_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));

      if (payload.role === 'vendor') {
        const dest = payload.dashboardAccess ? '/vendor/dashboard' : '/vendor/onboarding';
        return NextResponse.redirect(new URL(dest, request.url));
      }

      if (payload.role === 'sub_vendor') {
        if (payload.dashboardAccess && payload.assignmentStatus === 'completed') {
          return NextResponse.redirect(new URL('/sub-vendor/dashboard', request.url));
        }
        if (payload.documentsVerified && payload.assignmentStatus !== 'completed') {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
        return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
      }

      if (payload.role === 'employee') {
        if (payload.dashboardAccess && payload.assignmentStatus === 'completed') {
          return NextResponse.redirect(new URL('/employee/dashboard', request.url));
        }
        if (payload.documentsVerified && payload.assignmentStatus !== 'completed') {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
        return NextResponse.redirect(new URL('/employee/onboarding', request.url));
      }
      if (payload.role === 'member') return NextResponse.redirect(new URL(payload.status === 'active' ? '/member/dashboard' : '/pending-assignment', request.url));
    } catch (e) {
      return NextResponse.next();
    }
  }

  // 3. Protect dashboard routes
  if (isAdminPage || isVendorPage || isVendorApi || isSubVendorPage || isEmployeePage || isMemberPage) {
    if (!token) {
      if (isVendorApi) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      // VENDOR STRICT ACCESS CONTROL
      if (payload.role === 'vendor') {
        // API Protection
        if (isVendorApi && !payload.dashboardAccess && pathname !== '/api/vendor/documents') {
          return NextResponse.json({ success: false, message: 'Verification Required. Dashboard access blocked.' }, { status: 403 });
        }

        // Page Protection
        if (isVendorPage) {
          if (!payload.dashboardAccess && pathname !== '/vendor/onboarding') {
            return NextResponse.redirect(new URL('/vendor/onboarding', request.url));
          }
          if (payload.dashboardAccess && pathname === '/vendor/onboarding') {
            return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
          }
        }
      }

      // SUB-VENDOR STRICT ACCESS CONTROL
      if (payload.role === 'sub_vendor') {
        // API Protection
        if (isVendorApi && !payload.dashboardAccess && pathname !== '/api/vendor/documents') {
          return NextResponse.json({ success: false, message: 'Verification Required. Dashboard access blocked.' }, { status: 403 });
        }

        // Page Protection
        if (isSubVendorPage) {
          // STEP 1: Document Verification is HIGHEST priority
          if (!payload.documentsVerified && pathname !== '/sub-vendor/onboarding') {
            return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
          }

          // STEP 2: Hierarchy Mapping is SECOND priority (only checked if docs are verified)
          if (payload.documentsVerified && payload.assignmentStatus !== 'completed') {
            // If they are not already on pending-assignment, send them there
            if (pathname !== '/pending-assignment' && pathname !== '/sub-vendor/onboarding') {
              return NextResponse.redirect(new URL('/pending-assignment', request.url));
            }
          }

          // STEP 3: Dashboard Access (Final Gate)
          if (pathname.startsWith('/sub-vendor/dashboard')) {
            if (!payload.documentsVerified) return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
            if (payload.assignmentStatus !== 'completed') return NextResponse.redirect(new URL('/pending-assignment', request.url));
          }
        }
      }

      // EMPLOYEE STRICT ACCESS CONTROL
      if (payload.role === 'employee') {
        if (isEmployeePage) {
          // STEP 1: Document Verification is HIGHEST priority
          if (!payload.documentsVerified && pathname !== '/employee/onboarding') {
            return NextResponse.redirect(new URL('/employee/onboarding', request.url));
          }

          // STEP 2: Hierarchy Mapping is SECOND priority (only checked if docs are verified)
          if (payload.documentsVerified && payload.assignmentStatus !== 'completed') {
            if (pathname !== '/pending-assignment' && pathname !== '/employee/onboarding') {
              return NextResponse.redirect(new URL('/pending-assignment', request.url));
            }
          }

          // STEP 3: Dashboard Access (Final Gate)
          if (pathname.startsWith('/employee/dashboard')) {
            if (!payload.documentsVerified) return NextResponse.redirect(new URL('/employee/onboarding', request.url));
            if (payload.assignmentStatus !== 'completed') return NextResponse.redirect(new URL('/pending-assignment', request.url));
          }
        }
      }

      // MEMBER PROTECTION
      if (payload.role === 'member' && !['active', 'approved'].includes(payload.status)) {
        if (pathname !== '/pending-approval' && pathname !== '/pending-assignment') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }

      // RESTRICTED STATUS PROTECTION (All roles)
      if (['rejected', 'suspended', 'inactive'].includes(payload.status)) {
        if (pathname !== '/pending-approval') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }

      // Hierarchy check (General)
      // Now including sub_vendor in the mandatory assignment check
      if (!['super_admin', 'vendor'].includes(payload.role) && payload.assignmentStatus === 'pending') {
        if (pathname !== '/pending-assignment' && pathname !== '/pending-approval' && pathname !== '/vendor/onboarding' && !pathname.includes('onboarding')) {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
      }

      // Role-based access control (RBAC)
      if (isAdminPage && payload.role !== 'super_admin') return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isVendorPage && payload.role !== 'vendor' && payload.role !== 'super_admin') return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isSubVendorPage && !['sub_vendor', 'vendor', 'super_admin'].includes(payload.role)) return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isEmployeePage && !['employee', 'sub_vendor', 'vendor', 'super_admin'].includes(payload.role)) return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isMemberPage && !['member', 'employee', 'sub_vendor', 'vendor', 'super_admin'].includes(payload.role)) return NextResponse.redirect(new URL('/unauthorized', request.url));

    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle Landing Pages for Restricted Statuses
  if (pathname === '/pending-approval' || pathname === '/pending-assignment') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      // If user is now active and assigned, redirect them out of the waiting room
      if (payload.status === 'active' || payload.status === 'approved') {
        if (payload.role === 'vendor' && !payload.dashboardAccess) {
          return NextResponse.redirect(new URL('/vendor/onboarding', request.url));
        }
        if (['sub_vendor', 'employee'].includes(payload.role)) {
          const rolePath = payload.role === 'sub_vendor' ? 'sub-vendor' : 'employee';
          if (!payload.documentsVerified) return NextResponse.redirect(new URL(`/${rolePath}/onboarding`, request.url));
          if (payload.assignmentStatus !== 'completed') return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }

        // Special case for sub-vendor/employee in pending-assignment: if assignment completed, let them into dashboard
        if (['sub_vendor', 'employee'].includes(payload.role) && payload.assignmentStatus === 'completed' && payload.dashboardAccess) {
          const rolePath = payload.role === 'sub_vendor' ? 'sub-vendor' : 'employee';
          return NextResponse.redirect(new URL(`/${rolePath}/dashboard`, request.url));
        }

        // Redirect to their respective dashboards
        const dashMap: any = {
          super_admin: '/admin/dashboard',
          vendor: '/vendor/dashboard',
          sub_vendor: '/sub-vendor/dashboard',
          employee: '/employee/dashboard',
          member: '/member/dashboard'
        };

        // Don't redirect out of pending-assignment if assignment is still pending (for non-vendors)
        if (pathname === '/pending-assignment' && payload.assignmentStatus !== 'completed' && payload.role !== 'super_admin' && payload.role !== 'vendor') {
          return NextResponse.next();
        }

        return NextResponse.redirect(new URL(dashMap[payload.role] || '/', request.url));
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
    '/vendor/onboarding',
    '/sub-vendor/onboarding',
    '/employee/onboarding',
    '/api/vendor/:path*',
    '/sub-vendor/:path*',
    '/employee/:path*',
    '/member/:path*',
    '/login',
    '/register',
    '/pending-approval',
    '/pending-assignment',
  ],
};
