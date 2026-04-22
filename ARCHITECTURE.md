# Vision2535 Mentorship Platform - Architecture Documentation

## Overview

This document outlines the role-based architecture of the Vision2535 Mentorship Platform, implementing Next.js 15 App Router with strict role-based route protection and isolated user experiences.

---

## 1. Authentication Flow

### Login Process

1. User navigates to `/login`
2. User enters email, password, and **selects their role** (MENTEE, MENTOR, ADMIN)
3. Form submission:
   - Creates mock user object with selected role
   - Generates authentication token
   - Stores session in `sessionStorage` (client-side)
   - Sets authentication cookies (`user_role`, `auth_token`)
   - Redirects to role-specific dashboard

### Role-Based Redirect

```typescript
// After successful login:
const dashboardRoute = getRoleDashboardRoute(role);
// MENTEE  → /mentee/dashboard
// MENTOR  → /mentor/dashboard
// ADMIN   → /admin/dashboard
```

---

## 2. Middleware Protection (`src/middleware.ts`)

### Route Filtering Rules

- **Public Routes:** `/`, `/login`, `/forgot-password`, `/reset-password`, `/otp`
- **Protected Routes:** All dashboard routes require valid `auth_token` and `user_role` cookies

### Access Control

```
Middleware Verification Flow:
1. Check if route is public → Allow
2. Check for auth_token cookie → If missing, redirect to /login
3. Check for user_role cookie → If missing, redirect to /login
4. Verify user can access requested route:
   - MENTEE can access: /mentee/*
   - MENTOR can access: /mentor/*
   - ADMIN can access: /admin/*
5. If unauthorized → Redirect to role's dashboard
```

### Enforcement

- Middleware runs on every request
- Users cannot directly access routes outside their role
- Invalid or missing credentials automatically redirect to login

---

## 3. Folder Structure (Role-Based Organization)

```
src/app/(dashboard)/
├── (mentee)/                          # Mentee-only routes
│   ├── layout.tsx                     # Mentee layout (sidebar, header)
│   ├── dashboard/page.tsx
│   ├── goals/page.tsx
│   ├── sessions/page.tsx
│   ├── reflections/page.tsx
│   └── profile/page.tsx
│
├── (mentor)/                          # Mentor-only routes
│   ├── layout.tsx                     # Mentor layout (sidebar, header)
│   ├── dashboard/page.tsx
│   ├── mentees/page.tsx
│   ├── sessions/page.tsx
│   ├── feedback/page.tsx
│   └── profile/page.tsx
│
└── (admin)/                           # Admin-only routes
    ├── layout.tsx                     # Admin layout (sidebar, header)
    ├── dashboard/page.tsx
    ├── cohorts/page.tsx
    ├── users/page.tsx
    ├── reports/page.tsx
    └── settings/page.tsx
```

### Key Design Principles

1. **Role Isolation:** Each role has its own folder (`(mentee)`, `(mentor)`, `(admin)`)
2. **Separate Layouts:** Each role has a dedicated `layout.tsx` with role-specific navigation
3. **No Shared Routes:** Users cannot access routes outside their assigned role folder
4. **Clear Structure:** Navigation is self-documenting based on folder organization

---

## 4. Components

### RoleAwareSidebar (`src/components/dashboard/RoleAwareSidebar.tsx`)

- Receives `userRole` prop
- Renders role-specific navigation menu
- Uses `getRoleNavigation(role)` utility to fetch navigation items

**Navigation Items by Role:**

- **MENTEE:** Dashboard, Goals, Sessions, Reflections, Profile
- **MENTOR:** Dashboard, Mentees, Sessions, Feedback, Profile
- **ADMIN:** Dashboard, Cohorts, Users, Reports, Settings

### RoleAwareHeader (`src/components/dashboard/RoleAwareHeader.tsx`)

- Receives `userRole` and optional `userInfo` props
- Displays page title based on current route and role
- Shows user information in header

---

## 5. Auth Utilities (`src/lib/auth.ts`)

### Key Functions

```typescript
// Get current authenticated user
getCurrentUser(): User | null

// Set user session after login
setUserSession(user: User, token: string): void

// Clear user session on logout
clearUserSession(): void

// Get role-specific dashboard route
getRoleDashboardRoute(role: UserRole): string
// Returns: /mentee/dashboard, /mentor/dashboard, or /admin/dashboard

// Get navigation items for a role
getRoleNavigation(role: UserRole): Array<{ name: string; href: string }>

// Check if user has required role
hasRole(user: User | null, requiredRole: UserRole): boolean

// Check if user has ANY of the required roles
hasAnyRole(user: User | null, requiredRoles: UserRole[]): boolean
```

### User Types

```typescript
type UserRole = "MENTEE" | "MENTOR" | "ADMIN";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}
```

---

## 6. User Journey by Role

### Mentee Journey

```
Login → /login
  ↓ (select "Mentee")
Enter credentials → /mentee/dashboard (home)
  ├── /mentee/goals
  ├── /mentee/sessions
  ├── /mentee/reflections
  └── /mentee/profile
```

### Mentor Journey

```
Login → /login
  ↓ (select "Mentor")
Enter credentials → /mentor/dashboard (home)
  ├── /mentor/mentees
  ├── /mentor/sessions
  ├── /mentor/feedback
  └── /mentor/profile
```

### Admin Journey

```
Login → /login
  ↓ (select "Admin")
Enter credentials → /admin/dashboard (home)
  ├── /admin/cohorts
  ├── /admin/users
  ├── /admin/reports
  └── /admin/settings
```

---

## 7. Route Access Control Matrix

| Route       | MENTEE | MENTOR | ADMIN | Unauth |
| ----------- | ------ | ------ | ----- | ------ |
| `/`         | ✓      | ✓      | ✓     | ✓      |
| `/login`    | ✓      | ✓      | ✓     | ✓      |
| `/mentee/*` | ✓      | ✗      | ✗     | ✗      |
| `/mentor/*` | ✗      | ✓      | ✗     | ✗      |
| `/admin/*`  | ✗      | ✗      | ✓     | ✗      |

**Legend:**

- ✓ = Access allowed
- ✗ = Access blocked (redirects to role-specific dashboard)

---

## 8. Session Management

### Current Implementation (Development)

- **Client-side storage:** `sessionStorage` for user data
- **Cookies:** `user_role` and `auth_token` for middleware verification
- **Duration:** 7 days (configurable in `setUserSession()`)

### Production Recommendations

- Replace `sessionStorage` with secure **HTTP-only cookies**
- Implement **JWT token validation** on backend
- Add **refresh token rotation** mechanism
- Store session data in **secure database** instead of client-side

---

## 9. Adding New Routes

### To Add a Route for Mentees

```
1. Create file: src/app/(dashboard)/(mentee)/new-feature/page.tsx
2. Add route to navigation array in src/lib/auth.ts (getRoleNavigation)
3. Component automatically uses mentee layout and sidebar
```

### To Add a Route for Mentors

```
1. Create file: src/app/(dashboard)/(mentor)/new-feature/page.tsx
2. Add route to navigation array in src/lib/auth.ts (getRoleNavigation)
3. Component automatically uses mentor layout and sidebar
```

### To Add a Route for Admins

```
1. Create file: src/app/(dashboard)/(admin)/new-feature/page.tsx
2. Add route to navigation array in src/lib/auth.ts (getRoleNavigation)
3. Component automatically uses admin layout and sidebar
```

**No additional auth code needed** – Middleware automatically protects routes based on folder structure.

---

## 10. Security Considerations

### Current Gaps (Development)

- ⚠️ No backend validation of credentials
- ⚠️ Mock user creation without verification
- ⚠️ Client-side session storage (not secure for production)
- ⚠️ Tokens don't expire automatically per backend

### Production Checklist

- [ ] Implement backend authentication API
- [ ] Validate credentials against secure database
- [ ] Use HTTP-only, secure cookies for tokens
- [ ] Implement token expiration and refresh
- [ ] Add CSRF protection
- [ ] Implement rate limiting on `/login`
- [ ] Add audit logging for access attempts
- [ ] Implement session revocation on logout
- [ ] Use HTTPS everywhere
- [ ] Implement password hashing (bcrypt)

---

## 11. Testing the Architecture

### Test Mentee Access

1. Go to `/login`
2. Select "Mentee" role
3. Enter any email/password
4. Should redirect to `/mentee/dashboard`
5. Try accessing `/mentor/dashboard` → Should redirect back to `/mentee/dashboard`

### Test Mentor Access

1. Go to `/login`
2. Select "Mentor" role
3. Enter any email/password
4. Should redirect to `/mentor/dashboard`
5. Try accessing `/admin/dashboard` → Should redirect back to `/mentor/dashboard`

### Test Admin Access

1. Go to `/login`
2. Select "Admin" role
3. Enter any email/password
4. Should redirect to `/admin/dashboard`
5. Should have access to all admin routes

### Test Unauthenticated Access

1. Clear cookies: `user_role` and `auth_token`
2. Try accessing `/mentee/dashboard` → Should redirect to `/login`

---

## 12. Future Enhancements

✓ **Completed:**

- Role-based route protection
- Middleware authentication
- Separate dashboards per role
- Role-specific navigation

⏳ **Planned:**

- Backend authentication API integration
- Database session management
- OAuth/SSO integration
- Multi-device session tracking
- Real-time role updates
- Advanced audit logging
- MFA (Multi-Factor Authentication)
- SAML integration for enterprise

---

## 13. File Reference Guide

### Auth & Security

- `src/middleware.ts` - Route protection middleware
- `src/lib/auth.ts` - Auth utilities and helpers
- `src/components/auth/LoginForm.tsx` - Login UI with role selection

### Role-Based Layouts

- `src/app/(dashboard)/(mentee)/layout.tsx` - Mentee wrapper
- `src/app/(dashboard)/(mentor)/layout.tsx` - Mentor wrapper
- `src/app/(dashboard)/(admin)/layout.tsx` - Admin wrapper

### Role-Aware Components

- `src/components/dashboard/RoleAwareSidebar.tsx` - Dynamic navigation
- `src/components/dashboard/RoleAwareHeader.tsx` - Dynamic header

### Old Files (Deprecated - Can Be Removed)

- `src/app/(dashboard)/layout.tsx` - Replaced by role-specific layouts
- `src/app/(dashboard)/dashboard/page.tsx` - Moved to `(mentee)/dashboard`
- `src/app/(dashboard)/goals/page.tsx` - Moved to `(mentee)/goals`
- `src/app/(dashboard)/sessions/page.tsx` - Moved to `(mentee)/sessions`
- `src/app/(dashboard)/reflections/page.tsx` - Moved to `(mentee)/reflections`
- `src/app/(dashboard)/profile/page.tsx` - Moved to `(mentee)/profile`
- `src/components/dashboard/Sidebar.tsx` - Replaced by RoleAwareSidebar
- `src/components/dashboard/Header.tsx` - Replaced by RoleAwareHeader

---

## 14. Summary

The Vision2535 Mentorship Platform now implements a **secure, role-based architecture** using Next.js 15:

✅ **Middleware Protection:** All protected routes verified by server-side middleware  
✅ **Role Isolation:** Each user role has completely separate routes and navigation  
✅ **Type Safety:** Full TypeScript support with UserRole enums  
✅ **Scalability:** Easy to add new roles or routes  
✅ **Minimal:** No unnecessary abstraction, code is clean and maintainable  
✅ **Best Practices:** Follows Next.js 15 App Router conventions

Users cannot access routes outside their assigned role, and the system automatically redirects unauthorized access to their role's dashboard.
