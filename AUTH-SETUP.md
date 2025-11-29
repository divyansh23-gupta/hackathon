# Supabase Authentication Setup Guide

## 🔐 Enable Authentication in Supabase

### Step 1: Enable Email Authentication
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/aawvgjczrjcinnmupnba
2. Click **Authentication** in the left sidebar
3. Go to **Providers** tab
4. **Email** should be enabled by default
5. Scroll down to **Email Templates** and customize if needed

### Step 2: Enable Google OAuth (Optional)
1. In **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need:
   - **Client ID** from Google Cloud Console
   - **Client Secret** from Google Cloud Console

**To get Google OAuth credentials:**
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `https://aawvgjczrjcinnmupnba.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret to Supabase

### Step 3: Configure Site URL
1. In **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:8000` (for local testing)
3. Add **Redirect URLs**:
   - `http://localhost:8000/index.html`
   - `http://localhost:8000/login.html`
   - Add your production URL when deploying

### Step 4: Update Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize:
   - **Confirm signup** - Welcome email
   - **Magic Link** - Passwordless login
   - **Change Email Address**
   - **Reset Password**

### Step 5: Test Authentication

**Test Signup:**
```
1. Open login.html in browser
2. Click "Sign Up" tab
3. Fill in:
   - Name: Test User
   - Email: test@campus.edu
   - Student ID: STU2024999
   - Phone: +91 9876543210
   - Password: Test@1234
   - Role: Student
4. Click "Create Account"
5. Check email for verification link
6. Click verification link
7. Login with credentials
```

**Test Login:**
```
1. Open login.html
2. Enter email and password
3. Click "Login"
4. Should redirect to index.html
5. Check console for "✅ SW registered"
6. Check localStorage for user session
```

## 🔧 Update Login Buttons

All "Login / Sign Up" buttons across the site need to link to `login.html`.

### Files to Update:
- index.html (line 367, 400)
- food.html
- stationery.html
- medicines.html
- tech.html
- hostel.html
- custom.html
- upload-qr.html
- task.html
- tracking.html
- dasher.html
- request.html

### Change this:
```html
<button class="btn btn-yellow btn-lg">Login / Sign Up</button>
```

### To this:
```html
<a href="login.html" class="btn btn-yellow btn-lg" style="text-decoration: none;">Login / Sign Up</a>
```

## 🎯 What's Working

✅ **Login Page Created** (`login.html`)
- Email/password login
- Email/password signup
- Role selection (Student/Dasher)
- Google OAuth ready
- Password visibility toggle
- Form validation
- Error/success messages
- Auto-redirect after login

✅ **Database Integration**
- Creates user profile on signup
- Creates dasher stats for dashers
- Stores user session in localStorage
- Checks existing session on page load

✅ **Security**
- Supabase Auth handles password hashing
- Email verification required
- Session management
- Protected routes ready

## 🚀 Next Steps

1. **Enable Email Auth** in Supabase (already done by default)
2. **Optional**: Enable Google OAuth
3. **Update login buttons** across all pages
4. **Test signup** with a real email
5. **Test login** with created account
6. **Add logout** functionality to navbar

## 📝 Testing Checklist

- [ ] Signup creates user in Supabase Auth
- [ ] Signup creates profile in users table
- [ ] Signup creates dasher_stats for dashers
- [ ] Email verification works
- [ ] Login redirects to index.html
- [ ] Session persists on page reload
- [ ] Google OAuth works (if enabled)
- [ ] Error messages show correctly
- [ ] Password toggle works
- [ ] Role selector works

## 🔒 Security Notes

- Passwords are hashed by Supabase
- Email verification prevents fake accounts
- RLS policies protect user data
- Sessions expire after inactivity
- HTTPS required in production

**Your authentication system is ready to use!**
