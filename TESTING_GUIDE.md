# Vision2535 Platform - Developer Setup & Testing Guide

**Last Updated:** February 15, 2026  
**For Developers:** Complete guide to testing all role-based features

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to project directory
cd /Users/CEO/Desktop/Vision2535\ Mentorship\ Platform

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

---

## 🧪 Testing Role-Based Features

### Test Scenario 1: Mentee Login & Navigation

#### Step-by-Step

1. **Start the app** → `npm run dev`
2. **Open browser** → `http://localhost:3000`
3. **Automatically redirected** → Should see `/login` page
4. **Role Selection:**
   - You should see 3 role buttons: "Mentee", "Mentor", "Admin"
   - Click on **"Mentee"** button (should highlight)
5. **Enter Credentials:**
   - Email: `mentee@example.com` (or any email)
   - Password: `password123` (or any password)
6. **Click "Sign In"**
7. **Verify Redirect:**
   - Should be redirected to `/mentee/dashboard`
   - URL should show: `http://localhost:3000/mentee/dashboard`
8. **Verify Navigation:**
   - Left sidebar should show:
     - Dashboard (highlighted)
     - My Goals
     - Sessions
     - My Reflections
     - Profile
   - Should NOT see: Mentees, Cohorts, Users, Reports, etc.
9. **Test Route Isolation:**
   - Click on "Goals" → `/mentee/goals` ✓
   - Click on "Sessions" → `/mentee/sessions` ✓
   - Click on "Reflections" → `/mentee/reflections` ✓
   - Click on "Profile" → `/mentee/profile` ✓
10. **Test Access Control:**
    - Manually enter: `http://localhost:3000/mentor/dashboard`
    - Should be **redirected back** to `/mentee/dashboard`
    - Manually enter: `http://localhost:3000/admin/dashboard`
    - Should be **redirected back** to `/mentee/dashboard`

#### Expected Results

```
✅ Mentee can access /mentee/* routes
✅ Mentee cannot access /mentor/* routes
✅ Mentee cannot access /admin/* routes
✅ Mentee sees mentee-only navigation
✅ Middleware redirects unauthorized access
```

---

### Test Scenario 2: Mentor Login & Navigation

#### Step-by-Step

1. **Logout First:**
   - Click "Logout" button in sidebar footer
   - Should return to `/login` page
   - Cookies should be cleared
2. **Role Selection:**
   - On login page, click **"Mentor"** button
3. **Enter Credentials:**
   - Email: `mentor@example.com`
   - Password: `password123`
4. **Click "Sign In"**
5. **Verify Redirect:**
   - Should be at `/mentor/dashboard`
6. **Verify Navigation:**
   - Left sidebar should show:
     - Dashboard (highlighted)
     - My Mentees
     - Sessions
     - Feedback
     - Profile
   - Should NOT see: My Goals, Cohorts, Users, Reports, etc.
7. **Test Route Isolation:**
   - Click on "My Mentees" → `/mentor/mentees` ✓
   - Click on "Sessions" → `/mentor/sessions` ✓
   - Click on "Feedback" → `/mentor/feedback` ✓
   - Click on "Profile" → `/mentor/profile` ✓
8. **Test Access Control:**
   - Manually enter: `http://localhost:3000/mentee/dashboard`
   - Should be **redirected back** to `/mentor/dashboard`
   - Manually enter: `http://localhost:3000/admin/dashboard`
   - Should be **redirected back** to `/mentor/dashboard`

#### Expected Results

```
✅ Mentor can access /mentor/* routes
✅ Mentor cannot access /mentee/* routes
✅ Mentor cannot access /admin/* routes
✅ Mentor sees mentor-only navigation
✅ Middleware redirects unauthorized access
```

---

### Test Scenario 3: Admin Login & Navigation

#### Step-by-Step

1. **Logout:** Click "Logout" in sidebar
2. **Role Selection:** Click **"Admin"** button on login page
3. **Enter Credentials:**
   - Email: `admin@example.com`
   - Password: `password123`
4. **Click "Sign In"**
5. **Verify Redirect:**
   - Should be at `/admin/dashboard`
6. **Verify Navigation:**
   - Left sidebar should show:
     - Dashboard (highlighted)
     - Cohorts
     - Users
     - Reports
     - Settings
   - Should NOT see: My Goals, My Mentees, Feedback, etc.
7. **Test Route Isolation:**
   - Click on "Cohorts" → `/admin/cohorts` ✓
   - Click on "Users" → `/admin/users` ✓
   - Click on "Reports" → `/admin/reports` ✓
   - Click on "Settings" → `/admin/settings` ✓
8. **Test Access Control:**
   - Manually enter: `http://localhost:3000/mentee/dashboard`
   - Should be **redirected back** to `/admin/dashboard`
   - Manually enter: `http://localhost:3000/mentor/dashboard`
   - Should be **redirected back** to `/admin/dashboard`

#### Expected Results

```
✅ Admin can access /admin/* routes
✅ Admin cannot access /mentee/* routes
✅ Admin cannot access /mentor/* routes
✅ Admin sees admin-only navigation
✅ Middleware redirects unauthorized access
```

---

### Test Scenario 4: Unauthenticated Access

#### Step-by-Step

1. **Open Browser Console:**
   - Right-click → "Inspect" → "Application" tab
2. **Clear All Cookies:**
   - Find "Cookies" in left sidebar
   - Right-click on `http://localhost:3000`
   - Delete both `user_role` and `auth_token` cookies
3. **Manually Enter Protected Route:**
   - Type: `http://localhost:3000/mentee/dashboard` in address bar
   - Press Enter
4. **Verify Redirect:**
   - Should be **automatically redirected** to `/login`
   - Should see login form again
5. **Try Other Routes:**
   - Try: `/mentor/dashboard` → Redirect to `/login` ✓
   - Try: `/admin/dashboard` → Redirect to `/login` ✓
   - Try: `/goals` → Redirect to `/login` ✓

#### Expected Results

```
✅ Unauthenticated users cannot access protected routes
✅ Middleware redirects to /login automatically
✅ Cookies are necessary for access
✅ Removing cookies forces re-login
```

---

### Test Scenario 5: Session Persistence

#### Step-by-Step

1. **Login as Mentee:**
   - Complete normal login process
   - Verify at `/mentee/dashboard`
2. **Refresh Page:**
   - Press F5 or Cmd+R to refresh
3. **Verify Still Logged In:**
   - Should remain at `/mentee/dashboard`
   - Should NOT be redirected to `/login`
   - Navigation should still show
4. **Close and Reopen Tab:**
   - Type in address bar: `http://localhost:3000/mentee/dashboard`
   - Press Enter
5. **Verify Access:**
   - Should load `/mentee/dashboard`
   - Should show mentee navigation
6. **Check Session Storage:**
   - Open DevTools → Application → Session Storage
   - Should see `vision2535_auth_session` key
   - Click it to see user data

#### Expected Results

```
✅ Session persists across page refreshes
✅ Session persists across tab navigation
✅ User data visible in sessionStorage
✅ Cookies present for middleware verification
```

---

### Test Scenario 6: Navigation Persistence

#### Step-by-Step

1. **Login as Mentor**
2. **Click "My Mentees"**
3. **Verify URL:** Should be `/mentor/mentees`
4. **Verify Header:** Should show active state on "My Mentees"
5. **Click "Sessions"** from sidebar
6. **Verify URL:** Should be `/mentor/sessions`
7. **Verify Header:** Should show active state on "Sessions"
8. **Refresh Page:**
   - Press F5
   - Should stay at `/mentor/sessions`
   - Header should show "Sessions"

#### Expected Results

```
✅ Navigation updates URL correctly
✅ Header reflects current page
✅ Navigation state persists on refresh
✅ Breadcrumb/title updates dynamically
```

---

## 🔍 Debugging Tips

### Check Cookies in Browser

```javascript
// Open DevTools Console and run:
console.log(document.cookie);
```

### Check Session Storage

```javascript
// Open DevTools Console and run:
console.log(JSON.parse(sessionStorage.getItem("vision2535_auth_session")));
```

### Check Middleware Logs

Watch the terminal where you ran `npm run dev`:

```
[middleware] Checking route: /mentee/dashboard
[middleware] User role: MENTEE - ✓ Access allowed
```

### Test Specific Routes

```bash
# Test mentee dashboard
curl http://localhost:3000/mentee/dashboard

# Test mentor dashboard
curl http://localhost:3000/mentor/dashboard

# Test admin dashboard
curl http://localhost:3000/admin/dashboard
```

---

## 🐛 Common Issues & Fixes

### Issue: Stuck on Login Screen

**Solution:**

1. Clear browser cache and cookies
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
3. Restart development server: `npm run dev`

### Issue: Role Selector Not Appearing

**Solution:**

1. Check browser console for errors
2. Verify all CSS is loading (inspect elements)
3. Make sure no ad blockers are interfering

### Issue: Redirect Not Working

**Solution:**

1. Check middleware.ts exists in `src/` root
2. Verify cookies are set (check with: `document.cookie`)
3. Check browser console for middleware errors
4. Restart dev server

### Issue: Navigation Not Showing Correct Role

**Solution:**

1. Clear sessionStorage: `sessionStorage.clear()`
2. Hard refresh page
3. Re-login
4. Check user role: `console.log(sessionStorage.getItem('vision2535_auth_session'))`

### Issue: Routes Missing

**Solution:**

1. Verify folder structure exists
2. Check file has `export default` function
3. Verify naming: should be `page.tsx` (lowercase)
4. Restart dev server after adding new files

---

## 📊 Expected Test Results Summary

| Test                     | Expected    | Status   |
| ------------------------ | ----------- | -------- |
| Mentee login → dashboard | ✓ Works     | [ ] Pass |
| Mentee navigation        | ✓ Correct   | [ ] Pass |
| Mentee route protection  | ✓ Protected | [ ] Pass |
| Mentor login → dashboard | ✓ Works     | [ ] Pass |
| Mentor navigation        | ✓ Correct   | [ ] Pass |
| Mentor route protection  | ✓ Protected | [ ] Pass |
| Admin login → dashboard  | ✓ Works     | [ ] Pass |
| Admin navigation         | ✓ Correct   | [ ] Pass |
| Admin route protection   | ✓ Protected | [ ] Pass |
| Unauthorized access      | ✓ Redirects | [ ] Pass |
| Session persistence      | ✓ Works     | [ ] Pass |
| Navigation persistence   | ✓ Works     | [ ] Pass |
| Logout clears session    | ✓ Works     | [ ] Pass |
| Cross-role access denied | ✓ Denied    | [ ] Pass |

---

## 🎯 Performance Testing

### Test Page Load Speed

```javascript
// In browser console:
console.time("pageLoad");
location.reload();
console.timeEnd("pageLoad");

// Should be < 1 second for subsequent loads
```

### Test Navigation Speed

```javascript
// Click between pages and note response time:
// Goal: < 100ms for same-role navigation
// Goal: < 500ms including redirects
```

---

## 📱 Cross-Browser Testing

Test the following browsers:

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### Expected Results (All Browsers)

```
✅ Login works
✅ Navigation works
✅ Routes protected
✅ Cookies set correctly
✅ Responsive design works
```

---

## 🚀 Performance Benchmarks

### Target Metrics

- **Time to login:** < 500ms
- **Time to navigate:** < 100ms
- **Time to redirect:** < 100ms
- **Initial load:** < 2s
- **Page interactions:** < 50ms response time

---

## ✅ Final Checklist

Before considering testing complete, verify:

```
[ ] All three roles can login
[ ] Each role sees correct dashboard
[ ] Each role sees correct navigation
[ ] Navigation items highlight correctly
[ ] Cross-role access is blocked
[ ] Unauthorized users redirected to login
[ ] Session persists on refresh
[ ] URL updates when navigating
[ ] Browser back button works
[ ] Logout clears session completely
[ ] All role-specific pages load
[ ] Mobile responsive works
[ ] Console has no errors
[ ] Documentation is clear
```

---

## 📞 Troubleshooting Support

### For questions about:

- **Architecture:** See `ARCHITECTURE.md`
- **Quick answers:** See `QUICK_REFERENCE.md`
- **Implementation details:** See `IMPLEMENTATION_SUMMARY.md`
- **Specific routes:** Check folder structure in `src/app/(dashboard)/`

---

## 🎓 Learning Resources

### Understanding Session Management

- Study `src/lib/auth.ts` - All auth helpers in one place
- Review `LoginForm.tsx` - How sessions are created
- Check `middleware.ts` - How sessions are validated

### Understanding Role-Based Routing

- Look at `src/app/(dashboard)/(mentee)/layout.tsx`
- Compare with `(mentor)/layout.tsx` and `(admin)/layout.tsx`
- See how `RoleAwareSidebar` props determine content

### Understanding Middleware

- Read `src/middleware.ts` - Core route protection logic
- Comments explain each step
- Shows how roles determine access

---

**Happy Testing! 🚀**

All role-based features are ready for comprehensive testing. Follow the scenarios above to verify everything works as expected.
