# 🚀 DashDrop Supabase Database Setup Guide

## 📋 Quick Setup Instructions

Follow these steps to set up your complete DashDrop database in Supabase:

---

## Step 1: Access Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project (the one with URL: `aawvgjczrjcinnmupnba.supabase.co`)
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

---

## Step 2: Run the Complete Schema

Copy and paste the **entire contents** of `database-schema.sql` into the SQL editor and click **"Run"**.

This will create:

### ✅ **8 Core Tables:**
1. **`users`** - User profiles (students, dashers, admins)
2. **`requests`** - Delivery requests/orders
3. **`notifications`** - Real-time notifications
4. **`reviews`** - Rating system
5. **`transactions`** - Payment history
6. **`dasher_stats`** - Dasher performance metrics
7. **`chat_messages`** - In-app messaging
8. **`saved_locations`** - User's saved delivery locations

### ✅ **Security Features:**
- Row Level Security (RLS) policies on all tables
- User authentication integration
- Secure data access controls

### ✅ **Automation:**
- Auto-update timestamps
- Automatic notification triggers
- Dasher stats auto-calculation
- Real-time subscriptions

### ✅ **Performance:**
- Optimized indexes for fast queries
- Composite indexes for common operations
- Views for analytics and leaderboards

---

## Step 3: Verify Tables Created

After running the schema, verify all tables were created:

1. Click on **"Table Editor"** in the left sidebar
2. You should see all 8 tables listed
3. Click on each table to verify the structure

---

## Step 4: Set Up Storage Buckets (for Images)

### Create Buckets:

1. Go to **"Storage"** in the left sidebar
2. Click **"New Bucket"**
3. Create these 3 buckets:

#### Bucket 1: `qr-codes`
- **Name:** `qr-codes`
- **Public:** ✅ Yes
- **Purpose:** Store canteen QR code images

#### Bucket 2: `photos`
- **Name:** `photos`
- **Public:** ✅ Yes
- **Purpose:** Store request photos and item images

#### Bucket 3: `avatars`
- **Name:** `avatars`
- **Public:** ✅ Yes
- **Purpose:** Store user profile pictures

### Set Storage Policies:

For each bucket, go to **Policies** and add:

```sql
-- Allow anyone to view files
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- Allow users to delete their own files
CREATE POLICY "User Delete Own Files"
ON storage.objects FOR DELETE
USING (bucket_id = 'qr-codes' AND auth.uid() = owner);
```

Repeat for `photos` and `avatars` buckets (change `bucket_id` accordingly).

---

## Step 5: Enable Realtime (Already Done)

The schema already enables realtime for:
- ✅ `requests` - Live order updates
- ✅ `notifications` - Instant notifications
- ✅ `chat_messages` - Real-time chat

---

## Step 6: Test with Sample Data (Optional)

The schema includes sample data. To verify:

1. Go to **Table Editor** → **users**
2. You should see 3 sample users
3. Go to **dasher_stats** → You should see 1 dasher

---

## 📊 Database Structure Overview

### Users Table
Stores all user information including students, dashers, and admins.

**Key Fields:**
- `id` - Unique user ID (UUID)
- `email` - User email (unique)
- `student_id` - Campus student ID
- `role` - 'student', 'dasher', or 'admin'
- `rating` - User rating (0-5)
- `balance` - Wallet balance

---

### Requests Table
Main table for delivery orders.

**Key Fields:**
- `id` - Request ID
- `buyer_id` - Who placed the order
- `runner_id` - Who accepted the order
- `category` - food, stationery, medicines, tech, hostel, custom
- `mode` - 'normal' or 'urgent'
- `status` - pending, accepted, picked_up, on_the_way, delivered, cancelled
- `tip` - Tip amount for dasher
- `delivery_location` - Where to deliver

**Status Flow:**
```
pending → accepted → picked_up → on_the_way → delivered
         ↓
      cancelled
```

---

### Notifications Table
Real-time notifications for users.

**Types:**
- `new_request` - New order available (for dashers)
- `request_accepted` - Your order was accepted
- `status_update` - Order status changed
- `delivery_complete` - Order delivered
- `payment` - Payment notifications
- `system` - System announcements

---

### Reviews Table
Rating and feedback system.

**Review Types:**
- `buyer_to_dasher` - Student rates dasher
- `dasher_to_buyer` - Dasher rates student

---

### Dasher Stats Table
Performance metrics for dashers.

**Tracked Metrics:**
- Total deliveries
- Completed vs cancelled
- Total earnings
- Average rating
- Online status
- Current location

---

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

**Users:**
- ✅ Users can view/update their own profile
- ❌ Cannot view other users' private data

**Requests:**
- ✅ Anyone can view pending requests
- ✅ Buyers can create requests
- ✅ Buyers and dashers can update their requests

**Notifications:**
- ✅ Users can only see their own notifications

**Reviews:**
- ✅ Anyone can view reviews
- ✅ Only participants can create reviews

---

## 🎯 Common Queries

### Get All Pending Requests
```sql
SELECT * FROM requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Get User's Active Orders
```sql
SELECT * FROM requests 
WHERE buyer_id = 'user-uuid-here' 
AND status IN ('pending', 'accepted', 'picked_up', 'on_the_way')
ORDER BY created_at DESC;
```

### Get Dasher Leaderboard
```sql
SELECT * FROM dasher_leaderboard 
LIMIT 10;
```

### Get Unread Notifications
```sql
SELECT * FROM notifications 
WHERE user_id = 'user-uuid-here' 
AND read = false 
ORDER BY created_at DESC;
```

---

## 🔄 Automatic Features

### Auto-Timestamps
- `created_at` - Set automatically on insert
- `updated_at` - Updated automatically on every change

### Auto-Notifications
When a request status changes, a notification is automatically created for the buyer.

### Auto-Stats Update
When a delivery is completed:
- Dasher's `completed_deliveries` count increases
- Dasher's `total_earnings` increases by tip amount
- User's `total_orders` count increases

---

## 🧪 Testing Your Setup

### 1. Create a Test User
```sql
INSERT INTO users (email, full_name, student_id, role)
VALUES ('test@campus.edu', 'Test User', 'STU999', 'student');
```

### 2. Create a Test Request
```sql
INSERT INTO requests (buyer_id, category, delivery_location, tip, mode)
VALUES (
  (SELECT id FROM users WHERE email = 'test@campus.edu'),
  'food',
  'Hostel Block A',
  15.00,
  'normal'
);
```

### 3. Check if Notification Was Created
```sql
SELECT * FROM notifications 
WHERE user_id = (SELECT id FROM users WHERE email = 'test@campus.edu');
```

---

## 🚨 Troubleshooting

### Issue: Tables not created
**Solution:** Make sure you're running the SQL in the correct project. Check the project URL matches your Supabase URL.

### Issue: RLS policies blocking queries
**Solution:** Make sure you're authenticated. RLS policies require `auth.uid()` to work.

### Issue: Realtime not working
**Solution:** Check that realtime is enabled for your tables in **Database** → **Replication**.

### Issue: Storage upload failing
**Solution:** Verify storage policies are set correctly and bucket is public.

---

## 📚 Next Steps

After setup:

1. ✅ Update your frontend code to use the correct table names
2. ✅ Test authentication flow
3. ✅ Test creating a request
4. ✅ Test dasher accepting a request
5. ✅ Test real-time notifications
6. ✅ Test file uploads to storage

---

## 🎉 You're All Set!

Your DashDrop database is now fully configured with:
- ✅ All tables and relationships
- ✅ Security policies
- ✅ Real-time subscriptions
- ✅ Automatic triggers
- ✅ Storage buckets
- ✅ Sample data for testing

**Happy coding! 🚀**

---

## 📞 Support

If you encounter any issues:
1. Check Supabase logs in **Database** → **Logs**
2. Verify your API keys in **Settings** → **API**
3. Review RLS policies in **Authentication** → **Policies**

**Database Schema File:** `database-schema.sql`
**Supabase URL:** `https://aawvgjczrjcinnmupnba.supabase.co`
