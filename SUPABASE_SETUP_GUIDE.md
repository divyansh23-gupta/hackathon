# Supabase Setup Guide for DashDrop

## Problem: Login Not Working

If your login isn't working even after creating users in Supabase Authentication, follow these steps:

## Step 1: Disable Email Confirmation (For Development)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Settings** → **Auth Settings**
4. Find "**Enable email confirmations**"
5. **Turn it OFF** (toggle to disabled)
6. Click **Save**

This allows users to login immediately without email verification.

## Step 2: Create Required Database Tables

Run these SQL commands in your Supabase SQL Editor:

### Create Users Table

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  student_id TEXT UNIQUE,
  phone TEXT,
  role TEXT CHECK (role IN ('student', 'dasher')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert during signup"
  ON public.users FOR INSERT
  WITH CHECK (true);
```

### Create Dasher Stats Table

```sql
-- Create dasher_stats table
CREATE TABLE IF NOT EXISTS public.dasher_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dasher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  total_deliveries INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 5.0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.dasher_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Dashers can view their own stats"
  ON public.dasher_stats FOR SELECT
  USING (auth.uid() = dasher_id);

CREATE POLICY "Dashers can update their own stats"
  ON public.dasher_stats FOR UPDATE
  USING (auth.uid() = dasher_id);

CREATE POLICY "Anyone can insert during signup"
  ON public.dasher_stats FOR INSERT
  WITH CHECK (true);
```

### Create Requests Table

```sql
-- Create requests table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.users(id),
  runner_id UUID REFERENCES public.users(id),
  qr_image_url TEXT,
  delivery_location TEXT NOT NULL,
  room TEXT,
  tip DECIMAL(10,2),
  mode TEXT CHECK (mode IN ('normal', 'urgent')),
  status TEXT CHECK (status IN ('pending', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
  pickup_point TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view requests"
  ON public.requests FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Dashers can update requests"
  ON public.requests FOR UPDATE
  USING (true);
```

### Create Notifications Table

```sql
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  request_id UUID REFERENCES public.requests(id),
  urgent BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);
```

## Step 3: Test Login

### Option A: Create a Test User via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - Email: `test@example.com`
   - Password: `Test123456`
   - Auto Confirm User: **YES** (check this box)
4. Click **Create user**

### Option B: Use the Signup Form

1. Go to your login page: `file:///Users/divyansh/Downloads/hackathon-main/login.html`
2. Click **Sign Up** tab
3. Fill in the form:
   - Name: Test User
   - Email: test@campus.edu
   - Student ID: STU2024001
   - Phone: +91 9876543210
   - Password: Test123456
   - Role: Student
4. Click **Create Account**
5. If email confirmation is disabled, you can login immediately

## Step 4: Verify Login Works

1. Go to login page
2. Enter the credentials you created
3. Click **Login**
4. You should be redirected to index.html

## Common Issues & Solutions

### Issue 1: "Invalid login credentials"
**Solution**: Make sure:
- Email confirmation is disabled in Auth settings
- The user exists in Authentication → Users
- You're using the correct password

### Issue 2: "User already registered"
**Solution**: 
- Delete the user from Authentication → Users
- Try signing up again

### Issue 3: Database errors during signup
**Solution**:
- Make sure all tables are created (run the SQL above)
- Check that RLS policies are set correctly
- Verify the `users` table has the correct columns

### Issue 4: "Failed to create user profile"
**Solution**:
- Check the browser console for errors
- Verify the `users` table exists
- Make sure the INSERT policy allows new users

## Step 5: Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials
4. Add authorized redirect URLs:
   - `https://aawvgjczrjcinnmupnba.supabase.co/auth/v1/callback`
   - `http://localhost:3000` (for local development)

## Testing Checklist

- [ ] Email confirmation is disabled
- [ ] All tables are created
- [ ] RLS policies are set
- [ ] Test user can be created
- [ ] Test user can login
- [ ] User is redirected to index.html after login
- [ ] User session is stored in localStorage

## Need More Help?

Check the browser console (F12) for error messages. Common errors:
- `relation "public.users" does not exist` → Run the CREATE TABLE SQL
- `new row violates row-level security policy` → Check RLS policies
- `Invalid login credentials` → Disable email confirmation

Your Supabase credentials are:
- URL: `https://aawvgjczrjcinnmupnba.supabase.co`
- Anon Key: (already in your code)
