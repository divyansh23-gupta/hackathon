# CampusDash Database Setup Guide

## 📋 Quick Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project: https://supabase.com/dashboard/project/aawvgjczrjcinnmupnba
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Run the Schema
1. Open `database-schema.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click "Run" or press `Ctrl/Cmd + Enter`

### Step 3: Verify Tables Created
Go to "Table Editor" and verify these tables exist:
- ✅ users
- ✅ requests
- ✅ notifications
- ✅ reviews
- ✅ transactions
- ✅ dasher_stats
- ✅ chat_messages
- ✅ saved_locations

### Step 4: Enable Realtime (Important!)
1. Go to "Database" → "Replication"
2. Enable replication for:
   - `requests`
   - `notifications`
   - `chat_messages`

### Step 5: Create Storage Buckets
1. Go to "Storage" in sidebar
2. Create these buckets:
   - **qr-codes** (Public)
   - **photos** (Public)
   - **avatars** (Public)

3. Set bucket policies (in SQL Editor):
```sql
-- QR Codes bucket policies
CREATE POLICY "Anyone can view QR codes"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Authenticated users can upload QR codes"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- Photos bucket policies
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Avatars bucket policies
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 📊 Database Schema Overview

### Core Tables

**users** - User accounts (students, dashers, admins)
- Stores profile info, role, ratings, balance
- Tracks total orders and deliveries

**requests** - All delivery requests
- Supports all categories (food, stationery, medicines, tech, hostel, custom)
- QR code support for food orders
- Status tracking (pending → accepted → picked_up → on_the_way → delivered)
- Normal/Urgent mode support

**notifications** - Push notifications
- Real-time updates for users
- Supports urgent notifications
- Read/unread tracking

**reviews** - Rating system
- Buyer can rate dasher
- Dasher can rate buyer
- 1-5 star ratings with comments

**transactions** - Payment tracking
- Credits, debits, refunds, tips
- Multiple payment methods
- Transaction history

**dasher_stats** - Dasher performance
- Total deliveries, earnings
- Average rating
- Online/offline status
- Current location

**chat_messages** - In-app messaging
- Buyer ↔ Dasher communication
- Text, image, location support
- Read receipts

**saved_locations** - Quick delivery addresses
- Save frequently used locations
- Set default location

## 🔒 Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ **Policies** ensure users only see their own data
✅ **Triggers** auto-update timestamps
✅ **Functions** handle notifications automatically
✅ **Indexes** for fast queries

## 🚀 Testing the Database

### Test Query 1: Create a User
```sql
INSERT INTO users (email, full_name, student_id, role, hostel_block, room_number)
VALUES ('test@campus.edu', 'Test User', 'STU2024999', 'student', 'Block A', '101')
RETURNING *;
```

### Test Query 2: Create a Request
```sql
INSERT INTO requests (
    buyer_id, 
    category, 
    item_name, 
    delivery_location, 
    room, 
    tip, 
    mode
)
VALUES (
    (SELECT id FROM users WHERE email = 'test@campus.edu'),
    'food',
    'Cold Coffee',
    'Hostel Block A',
    '101',
    20.00,
    'normal'
)
RETURNING *;
```

### Test Query 3: View Active Requests
```sql
SELECT * FROM active_requests;
```

### Test Query 4: View Dasher Leaderboard
```sql
SELECT * FROM dasher_leaderboard;
```

## 📱 Frontend Integration

Your `supabase-client.js` is already configured to work with this schema!

**Example Usage:**
```javascript
// Create a request
const result = await SupabaseClient.createRequest({
    buyerId: userId,
    qrImage: qrDataUrl,
    deliveryLocation: 'Hostel Block A',
    roomNumber: '405',
    tip: 20,
    mode: 'normal'
});

// Accept a request (dasher)
const result = await SupabaseClient.acceptRequest(requestId, dasherId);

// Update status
const result = await SupabaseClient.updateStatus(requestId, 'picked_up');

// Subscribe to new requests (dashers)
SupabaseClient.subscribeToRequests((newRequest) => {
    console.log('New request:', newRequest);
    showNotificationToast(newRequest);
});

// Subscribe to notifications (users)
SupabaseClient.subscribeToNotifications(userId, (notification) => {
    console.log('New notification:', notification);
});
```

## ✅ Checklist

- [ ] Run database-schema.sql in Supabase
- [ ] Verify all 8 tables created
- [ ] Enable realtime for requests, notifications, chat_messages
- [ ] Create 3 storage buckets (qr-codes, photos, avatars)
- [ ] Set storage bucket policies
- [ ] Test with sample queries
- [ ] Test frontend integration

## 🎯 You're Ready!

Your database is now fully configured for:
- ✅ QR-based food ordering
- ✅ Multi-category requests
- ✅ Real-time notifications
- ✅ Dasher tracking
- ✅ In-app chat
- ✅ Ratings & reviews
- ✅ Payment tracking

**Next Step**: Test the integration with your frontend!
