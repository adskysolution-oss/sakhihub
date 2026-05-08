# SakhiHub Project Audit

## 1. Current Project Status
**Status: Alpha / Development Phase**
The core authentication engine and role-based routing are solid. The primary workflows for Employee registration, Admin approval, Group creation, and Member enrollment are functional at the API level and partially integrated into the UI. However, many sub-dashboard pages are missing, and the CMS system remains hardcoded.

---

## 2. Fully Working Features
- **Role-Based Authentication**: Secure JWT-based login for Super Admin, Employee, and Member.
- **Secure Routing (Proxy)**: Middleware correctly enforces role-specific access and prevents cross-portal leaks.
- **Employee Lifecycle (API)**: Registration, status-gating (pending approval), and Admin approval API are fully functional.
- **Member Dashboard**: Aggregated view of profile, group, and membership status is live.
- **Database Architecture**: Mongoose models for Users, Groups, Members, Memberships, and Reports are well-defined.
- **Multilingual Foundation**: Context-based language switching (Hinglish/English) is implemented.

---

## 3. Partially Working Features
- **Admin Dashboard**: Stat cards and recent activity are partially connected but still rely on some hardcoded UI elements.
- **Employee Dashboard**: The main dashboard UI exists, but "Quick Action" buttons need to be linked to their respective modal/page handlers.
- **Membership Collection**: The ₹100 payment collection form exists and generates receipts, but the "Download PDF" feature is a UI placeholder.
- **Daily Reports**: Submission API and form exist, but viewing historical reports is not yet built.

---

## 4. Broken Features
- **Admin Approval List**: The dashboard shows hardcoded "Sunita", "Priyanka", etc. It needs to fetch from `/api/admin/employees?status=pending`.
- **Navigation Links**: Several links in the sidebar lead to routes that currently return 404 because the `page.tsx` files are either missing or misplaced.

---

## 5. Missing Features
- **Dynamic CMS**: No database-driven content management. All website text is currently in a static translation file.
- **Member Profile Edit**: Members cannot yet update their own profile details.
- **Admin Management Pages**: Detailed CRUD pages for Groups, Memberships, and Campaigns are missing.
- **PDF Receipt Generation**: The logic to generate and serve a downloadable PDF receipt is missing.

---

## 6. Route Issues
| Route | Status | File Path |
|-------|--------|-----------|
| `/` | ✅ Working | `src/app/page.tsx` |
| `/login` | ✅ Working | `src/app/(auth)/login/page.tsx` |
| `/admin/login` | ✅ Working | `src/app/(auth)/admin/page.tsx` |
| `/admin/dashboard`| ✅ Working | `src/app/admin/dashboard/page.tsx` |
| `/employee/dashboard`| ✅ Working | `src/app/employee/dashboard/page.tsx` |
| `/member/dashboard`| ✅ Working | `src/app/member/dashboard/page.tsx` |
| `/admin/cms` | ❌ Missing | No `page.tsx` found |
| `/employee/profile`| ❌ Missing | No `page.tsx` found |
| `/member/verify` | ❌ Missing | No `page.tsx` found |

---

## 7. Authentication Issues
- **Redirect Loops**: Resolved by the recent `proxy.ts` refactor.
- **Session Data**: Recently updated to include `mobile` in JWT for better API performance.

---

## 8. Dashboard Status
### Admin
- **Stats API**: Connected (`/api/admin/stats`).
- **UI**: Premium design, but needs connection to real pending employee data.

### Employee
- **Core Forms**: `AddMemberForm`, `CreateGroupForm`, and `DailyReportForm` are built and ready for integration.
- **Stats**: Currently hardcoded in `EmployeeDashboard.tsx`.

### Member
- **Data Flow**: Connected to aggregate API. Displays status and receipts correctly.

---

## 9. CMS Status
- **Current State**: **Hardcoded**.
- **Issue**: Located in `src/context/LanguageContext.tsx`.
- **Requirement**: Needs a `CMSContent` model and an `/api/cms` endpoint + Admin UI to become "Dynamic".

---

## 10. Database Status
- **Models**: Solid. Using `ref` for relationships (User -> Group -> Member -> Membership).
- **Scalability**: High. Indexed fields like `mobile` and `employeeId` ensure fast lookups.

---

## 11. API Status
- **Auth**: Complete (`login`, `register`, `me`).
- **Admin**: Partially complete (`stats`, `employees/status`).
- **Employee**: Missing aggregate dashboard API (currently using individual calls).
- **Member**: Complete (`dashboard`, `receipt`).

---

## 12. UI/UX Problems
- **Loading States**: Some dashboard pages lack skeleton loaders during data fetch.
- **Mobile Sidebar**: Navigation on mobile needs a dedicated drawer/hamburger menu for the dashboard.
- **Empty States**: If a group has no members, the UI looks blank instead of showing an "Add Member" prompt.

---

## 13. Security Problems
- **Role Gating**: Implemented in middleware, but should also be enforced at the API route level for double protection.
- **Input Validation**: Needs more robust Zod validation on POST requests.

---

## 14. Scalability Review
- **Architecture**: **Excellent**. Separation of concerns (models, utils, components, APIs) is clean.
- **Next.js Conventions**: Following App Router standards (using route groups where appropriate, though currently moved to root for Turbopack stability).

---

## 15. Production Readiness
- **Score: 65%**
- **Verdict**: Not ready for deployment. Critical missing pieces: Dynamic CMS, Admin CRUD pages, and PDF generation.

---

## 16. Exact Next Steps (Priority Order)

### Priority 1: Critical Fixes & Integration
1.  **Admin UI Data Sync**: Connect `SuperAdminDashboard.tsx` to the `stats` prop and fetch real pending employees.
2.  **Employee Dashboard API**: Create `/api/employee/dashboard` to aggregate group and collection stats.

### Priority 2: Dashboard Completion
1.  **Admin Management Pages**: Build `/admin/groups`, `/admin/members`, and `/admin/memberships`.
2.  **Employee Profile**: Build `/employee/profile` for self-management.

### Priority 3: CMS Completion
1.  **CMS Model**: Create `CMSContent.ts`.
2.  **CMS API**: Create `/api/cms` (GET/POST).
3.  **CMS Admin UI**: Build the management interface in `/admin/cms`.

### Priority 4: PDF & Receipts
1.  **PDF Generation**: Implement `jspdf` or similar for receipt downloads.

---

## 17. Files That Need Changes
- `src/components/features/dashboard/SuperAdminDashboard.tsx` (Remove hardcoded stats)
- `src/components/features/dashboard/EmployeeDashboard.tsx` (Remove hardcoded stats)
- `src/context/LanguageContext.tsx` (Change to fetch from API)
- `src/proxy.ts` (Add API route role-gating)

## 18. Recommended Final Folder Structure
Keep the current root-level `admin`, `employee`, and `member` folders for maximum Turbopack stability, but ensure all sub-pages follow the `page.tsx` pattern.

## 19. Recommended Refactor Plan
1.  Extract large inline styles into a dedicated `dashboard.css` or use Tailwind classes to reduce `page.tsx` size.
2.  Implement a Global Loading Overlay for API transitions.

## 20. Final Summary
The project has a strong backbone. The most important achievement is the **Security Proxy** and **Role-Based Auth**. The next phase should focus on **"Filling the Shell"**—meaning building the sub-pages for the links that already exist in the sidebar and making the CMS content truly dynamic.
