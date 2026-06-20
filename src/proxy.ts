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
  const isEmployeePage = pathname.startsWith('/employee/') || pathname === '/employee';
  const isOfferLetterPage = pathname.startsWith('/employee-offer-letter');
  const isMemberPage = pathname.startsWith('/member');
  const isPortalPage = pathname.startsWith('/portal');
  const isPaymentPendingPage = pathname === '/payment-pending' || pathname === '/payment-pending/';
  const isPaymentApi = pathname.startsWith('/api/payment');
  const isPublicPage = !isAdminPage && !isVendorPage && !isSubVendorPage && !isEmployeePage && !isOfferLetterPage && !isMemberPage && !isPortalPage && !isAuthPage && !isPaymentPendingPage;

  // 1. Allow public pages and payment APIs (payment APIs have their own auth)
  if (isPublicPage || pathname === '/' || pathname.startsWith('/api/public') || pathname.startsWith('/_next') || isPaymentApi) {
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
      if (payload.role === 'super_admin' || payload.role === 'operations_admin') return NextResponse.redirect(new URL('/admin/dashboard', request.url));

      if (payload.role === 'vendor') {
        if (!payload.dashboardAccess) {
          // Check if docs verified but payment pending
          if (payload.documentsVerified && !payload.paymentCompleted) {
            return NextResponse.redirect(new URL('/payment-pending', request.url));
          }
          return NextResponse.redirect(new URL('/vendor/onboarding', request.url));
        }
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
      }

      if (payload.role === 'sub_vendor') {
        if (payload.dashboardAccess && payload.assignmentStatus === 'completed') {
          return NextResponse.redirect(new URL('/sub-vendor/dashboard', request.url));
        }
        if (payload.documentsVerified && !payload.paymentCompleted) {
          return NextResponse.redirect(new URL('/payment-pending', request.url));
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
        if (payload.documentsVerified && !payload.paymentCompleted) {
          return NextResponse.redirect(new URL('/payment-pending', request.url));
        }
        if (payload.documentsVerified && payload.assignmentStatus !== 'completed') {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
        return NextResponse.redirect(new URL('/employee/onboarding', request.url));
      }
      if (payload.role === 'staff') {
        if (['active', 'approved'].includes(payload.status) && payload.dashboardAccess) {
          return NextResponse.redirect(new URL('/portal/dashboard', request.url));
        }
        if (payload.status === 'under_review' || (['active', 'approved'].includes(payload.status) && !payload.dashboardAccess)) {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
        return NextResponse.redirect(new URL('/portal/onboarding', request.url));
      }
      if (payload.role === 'member') return NextResponse.redirect(new URL('/member/dashboard', request.url));
    } catch (e) {
      return NextResponse.next();
    }
  }

  // 3. Protect dashboard routes
  if (isAdminPage || isVendorPage || isVendorApi || isSubVendorPage || isEmployeePage || isMemberPage || isPortalPage || isOfferLetterPage) {
    if (!token) {
      if (isVendorApi) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      // Super Admin Bypass
      if (payload.role === 'super_admin') {
        return NextResponse.next();
      }

      // Offer Letter Page Security Gating
      if (isOfferLetterPage) {
        const pathSegments = pathname.split('/');
        const targetEmployeeId = pathSegments[2];
        const isSelf = payload.role === 'employee' && payload.id === targetEmployeeId;

        const userPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];
        const isAuthorized = ['operations_admin', 'staff'].includes(payload.role) && userPermissions.includes('offer_letters.view');

        if (!isSelf && !isAuthorized) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        return NextResponse.next();
      }

      // VENDOR STRICT ACCESS CONTROL
      if (payload.role === 'vendor') {
        // API Protection
        if (isVendorApi && !payload.dashboardAccess && pathname !== '/api/vendor/documents') {
          return NextResponse.json({ success: false, message: 'Verification Required. Dashboard access blocked.' }, { status: 403 });
        }

        // Page Protection
        if (isVendorPage) {
          // Payment gate: docs verified but payment not done
          if (payload.documentsVerified && !payload.paymentCompleted && pathname !== '/vendor/onboarding') {
            return NextResponse.redirect(new URL('/payment-pending', request.url));
          }

          // Allow documents page if they are not totally pending
          const isTotallyPending = !payload.documentsVerified && payload.status === 'pending';
          if (isTotallyPending && pathname !== '/vendor/onboarding') {
            return NextResponse.redirect(new URL('/vendor/onboarding', request.url));
          }

          if (!payload.dashboardAccess && pathname !== '/vendor/onboarding' && pathname !== '/vendor/dashboard/documents') {
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
          const isTotallyPending = !payload.documentsVerified && payload.status === 'pending';

          // STEP 1: Document Verification is HIGHEST priority
          if (!payload.documentsVerified && pathname !== '/sub-vendor/onboarding' && pathname !== '/sub-vendor/dashboard/documents') {
            if (isTotallyPending) {
              return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
            } else if (!payload.dashboardAccess) {
              return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
            }
          }

          // STEP 1.5: Payment Gate (after docs verified, before hierarchy)
          if (payload.documentsVerified && !payload.paymentCompleted && pathname !== '/sub-vendor/dashboard/documents') {
            return NextResponse.redirect(new URL('/payment-pending', request.url));
          }

          // STEP 2: Hierarchy Mapping is SECOND priority (only checked if docs are verified)
          if (payload.documentsVerified && payload.paymentCompleted && payload.assignmentStatus !== 'completed') {
            if (pathname !== '/pending-assignment' && pathname !== '/sub-vendor/onboarding' && pathname !== '/sub-vendor/dashboard/documents') {
              return NextResponse.redirect(new URL('/pending-assignment', request.url));
            }
          }

          // STEP 3: Dashboard Access (Final Gate)
          if (pathname.startsWith('/sub-vendor/dashboard') && pathname !== '/sub-vendor/dashboard/documents') {
            if (!payload.documentsVerified) return NextResponse.redirect(new URL('/sub-vendor/onboarding', request.url));
            if (!payload.paymentCompleted) return NextResponse.redirect(new URL('/payment-pending', request.url));
            if (payload.assignmentStatus !== 'completed') return NextResponse.redirect(new URL('/pending-assignment', request.url));
          }
        }
      }

      // EMPLOYEE STRICT ACCESS CONTROL
      if (payload.role === 'employee') {
        if (isEmployeePage) {
          const isTotallyPending = !payload.documentsVerified && payload.status === 'pending';

          // STEP 1: Document Verification is HIGHEST priority
          if (!payload.documentsVerified && pathname !== '/employee/onboarding' && pathname !== '/employee/dashboard/documents') {
            if (isTotallyPending) {
              return NextResponse.redirect(new URL('/employee/onboarding', request.url));
            } else if (!payload.dashboardAccess) {
              return NextResponse.redirect(new URL('/employee/onboarding', request.url));
            }
          }

          // STEP 1.5: Payment Gate (after docs verified, before hierarchy)
          if (payload.documentsVerified && !payload.paymentCompleted && pathname !== '/employee/dashboard/documents') {
            return NextResponse.redirect(new URL('/payment-pending', request.url));
          }

          // STEP 2: Hierarchy Mapping (only checked if docs verified + payment done)
          if (payload.documentsVerified && payload.paymentCompleted && payload.assignmentStatus !== 'completed') {
            if (pathname !== '/pending-assignment' && pathname !== '/employee/onboarding' && pathname !== '/employee/dashboard/documents') {
              return NextResponse.redirect(new URL('/pending-assignment', request.url));
            }
          }

          // STEP 3: Dashboard Access (Final Gate)
          if (pathname.startsWith('/employee/dashboard') && pathname !== '/employee/dashboard/documents') {
            if (!payload.documentsVerified) return NextResponse.redirect(new URL('/employee/onboarding', request.url));
            if (!payload.paymentCompleted) return NextResponse.redirect(new URL('/payment-pending', request.url));
            if (payload.assignmentStatus !== 'completed') return NextResponse.redirect(new URL('/pending-assignment', request.url));
          }
        }
      }



      // STAFF STRICT ACCESS CONTROL
      if (payload.role === 'staff') {
        if (isPortalPage) {
          const isApprovedOrActive = ['approved', 'active'].includes(payload.status);
          
          if (payload.status === 'under_review') {
            if (pathname !== '/pending-approval') {
              return NextResponse.redirect(new URL('/pending-approval', request.url));
            }
          } else if (['documents_pending', 'reupload_required'].includes(payload.status) || !payload.documentsVerified) {
            if (pathname !== '/portal/onboarding') {
              return NextResponse.redirect(new URL('/portal/onboarding', request.url));
            }
          } else if (isApprovedOrActive && !payload.dashboardAccess) {
            if (pathname !== '/pending-approval') {
              return NextResponse.redirect(new URL('/pending-approval', request.url));
            }
          } else if (isApprovedOrActive && payload.dashboardAccess) {
            if (pathname === '/portal/onboarding' || pathname === '/pending-approval') {
              return NextResponse.redirect(new URL('/portal/dashboard', request.url));
            }

            // Enforce page-level permission checks
            const portalPagePermissionMap: Record<string, string> = {
              '/portal/vendors': 'vendors.view',
              '/portal/sub-vendors': 'sub_vendors.view',
              '/portal/employees': 'employees.view',
              '/portal/members': 'members.view',
              '/portal/network': 'network.view',
              '/portal/reports': 'reports.view',
              '/portal/recruitment': 'recruitment.view',
              '/portal/applications': 'recruitment.view',
              '/portal/campaigns': 'campaigns.view',
              '/portal/projects': 'projects.view',
              '/portal/products': 'products.view',
              '/portal/memberships': 'payments.view',
              '/portal/offline-payments': 'payments.view',
              '/portal/support-requests': 'support.view',
              '/portal/abha': 'abha.view',
            };

            const userPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];

            if (pathname.startsWith('/portal/forms/builder')) {
              if (!userPermissions.includes('forms.manage')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
              }
            } else if (pathname.startsWith('/portal/forms') && pathname.endsWith('/analytics')) {
              if (!userPermissions.includes('forms.analytics')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
              }
            } else if (pathname.startsWith('/portal/forms')) {
              if (!userPermissions.includes('forms.view') && !userPermissions.includes('forms.manage')) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
              }
            }

            for (const [routePrefix, requiredPermission] of Object.entries(portalPagePermissionMap)) {
              if (pathname.startsWith(routePrefix)) {
                if (!userPermissions.includes(requiredPermission)) {
                  return NextResponse.redirect(new URL('/unauthorized', request.url));
                }
              }
            }
          }
        }
      }

      if (isPortalPage && payload.role !== 'staff') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // RESTRICTED STATUS PROTECTION (All roles)
      if (['rejected', 'suspended', 'inactive'].includes(payload.status)) {
        if (pathname !== '/pending-approval') {
          return NextResponse.redirect(new URL('/pending-approval', request.url));
        }
      }

      // Hierarchy check (General)
      // Now including sub_vendor and staff in the mandatory assignment check exclusion
      if (!['super_admin', 'operations_admin', 'staff', 'vendor', 'member'].includes(payload.role) && payload.assignmentStatus === 'pending') {
        if (pathname !== '/pending-assignment' && pathname !== '/pending-approval' && pathname !== '/vendor/onboarding' && !pathname.includes('onboarding')) {
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
      }

      // Role-based access control (RBAC)
      if (isAdminPage) {
        if (!['super_admin', 'operations_admin'].includes(payload.role)) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
        if (payload.role === 'operations_admin') {
          const restrictedAdminSubPages = [
            '/admin/operations-admins',
            '/admin/permissions',
            '/admin/assignments',
            '/admin/activity-logs',
            '/admin/cms',
            '/admin/finance',
            '/admin/forms',
            '/admin/payment-config',
            '/admin/communication'
          ];
          if (restrictedAdminSubPages.some(subPath => pathname.startsWith(subPath))) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
          }

          // Enforce page-level permission checks for Operations Admins
          const adminPagePermissionMap: Record<string, string> = {
            '/admin/network': 'network.view',
            '/admin/reports': 'reports.view',
            '/admin/vendors': 'vendors.view',
            '/admin/sub-vendors': 'sub_vendors.view',
            '/admin/employees': 'employees.view',
            '/admin/members': 'members.view',
            '/admin/memberships': 'payments.view',
          };

          const userPermissions = Array.isArray(payload.permissions) ? payload.permissions : [];
          
          if (pathname.startsWith('/admin/users')) {
            const hasAnyUserView = userPermissions.includes('vendors.view') ||
              userPermissions.includes('sub_vendors.view') ||
              userPermissions.includes('employees.view') ||
              userPermissions.includes('members.view');
            if (!hasAnyUserView) {
              return NextResponse.redirect(new URL('/unauthorized', request.url));
            }
          }

          for (const [routePrefix, requiredPermission] of Object.entries(adminPagePermissionMap)) {
            if (pathname.startsWith(routePrefix)) {
              if (!userPermissions.includes(requiredPermission)) {
                return NextResponse.redirect(new URL('/unauthorized', request.url));
              }
            }
          }
        }
      }
      if (isVendorPage && payload.role !== 'vendor') return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isSubVendorPage && payload.role !== 'sub_vendor') return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isEmployeePage && payload.role !== 'employee') return NextResponse.redirect(new URL('/unauthorized', request.url));
      if (isMemberPage && payload.role !== 'member') return NextResponse.redirect(new URL('/unauthorized', request.url));

    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle Payment Pending Page
  if (isPaymentPendingPage) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);
      // If payment is already completed, redirect to appropriate next step
      if (payload.paymentCompleted) {
        if (payload.role === 'vendor') {
          return NextResponse.redirect(new URL(payload.dashboardAccess ? '/vendor/dashboard' : '/vendor/onboarding', request.url));
        }
        if (['sub_vendor', 'employee'].includes(payload.role)) {
          const rolePath = payload.role === 'sub_vendor' ? 'sub-vendor' : 'employee';
          if (payload.assignmentStatus === 'completed' && payload.dashboardAccess) {
            return NextResponse.redirect(new URL(`/${rolePath}/dashboard`, request.url));
          }
          return NextResponse.redirect(new URL('/pending-assignment', request.url));
        }
      }
      // Allow access to payment-pending page
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle Landing Pages for Restricted Statuses
  if (pathname === '/pending-approval' || pathname === '/pending-assignment') {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      if (payload.role === 'staff' && ['documents_pending', 'reupload_required'].includes(payload.status)) {
        return NextResponse.redirect(new URL('/portal/onboarding', request.url));
      }

      // If user is now active and assigned, redirect them out of the waiting room
      if (payload.status === 'active' || payload.status === 'approved') {
        if (payload.role === 'staff' && !payload.dashboardAccess) {
          if (pathname === '/pending-approval') {
            return NextResponse.next();
          }
        }
        if (payload.role === 'vendor' && !payload.dashboardAccess) {
          if (payload.documentsVerified && !payload.paymentCompleted) {
            return NextResponse.redirect(new URL('/payment-pending', request.url));
          }
          return NextResponse.redirect(new URL('/vendor/onboarding', request.url));
        }
        if (['sub_vendor', 'employee'].includes(payload.role)) {
          const rolePath = payload.role === 'sub_vendor' ? 'sub-vendor' : 'employee';
          if (!payload.documentsVerified) return NextResponse.redirect(new URL(`/${rolePath}/onboarding`, request.url));
          if (!payload.paymentCompleted) return NextResponse.redirect(new URL('/payment-pending', request.url));
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
          operations_admin: '/admin/dashboard',
          vendor: '/vendor/dashboard',
          sub_vendor: '/sub-vendor/dashboard',
          employee: '/employee/dashboard',
          staff: '/portal/dashboard',
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
    '/portal/:path*',
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
    '/payment-pending',
    '/employee-offer-letter/:path*',
  ],
};
