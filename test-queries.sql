-- ==========================================
-- CAMPUSDASH DATABASE TEST QUERIES
-- Copy and paste these into Supabase SQL Editor
-- ==========================================

-- Step 1: Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Step 2: Create test users
INSERT INTO users (email, full_name, student_id, role, hostel_block, room_number) VALUES
('student1@campus.edu', 'Rahul Kumar', 'STU2024001', 'student', 'Block A', '405'),
('student2@campus.edu', 'Priya Sharma', 'STU2024002', 'student', 'Block B', '302'),
('dasher1@campus.edu', 'Amit Singh', 'STU2024003', 'dasher', 'Block C', '201')
ON CONFLICT (email) DO NOTHING
RETURNING *;

-- Step 3: Create dasher stats for dashers
INSERT INTO dasher_stats (dasher_id, is_online)
SELECT id, true FROM users WHERE role = 'dasher'
ON CONFLICT (dasher_id) DO NOTHING;

-- Step 4: Create test food order request (QR-based)
INSERT INTO requests (
    buyer_id,
    category,
    item_name,
    qr_image_url,
    delivery_location,
    room,
    tip,
    mode,
    pickup_point,
    status
) VALUES (
    (SELECT id FROM users WHERE email = 'student1@campus.edu' LIMIT 1),
    'food',
    'Cold Coffee & Samosa',
    'https://example.com/qr-codes/test-qr.png',
    'Hostel Block A',
    '405',
    20.00,
    'normal',
    'Food Court / Canteen',
    'pending'
)
RETURNING *;

-- Step 5: Create urgent medicine request
INSERT INTO requests (
    buyer_id,
    category,
    item_name,
    description,
    delivery_location,
    room,
    tip,
    mode,
    pickup_point,
    status
) VALUES (
    (SELECT id FROM users WHERE email = 'student2@campus.edu' LIMIT 1),
    'medicines',
    'Paracetamol',
    'Need paracetamol urgently for fever',
    'Hostel Block B',
    '302',
    35.00,
    'urgent',
    'Medical Store',
    'pending'
)
RETURNING *;

-- Step 6: Create stationery request
INSERT INTO requests (
    buyer_id,
    category,
    item_name,
    description,
    delivery_location,
    tip,
    mode,
    pickup_point,
    status
) VALUES (
    (SELECT id FROM users WHERE email = 'student1@campus.edu' LIMIT 1),
    'stationery',
    'Notebook & Pen',
    'Need 1 notebook and 2 pens',
    'Library',
    15.00,
    'normal',
    'Stationery Shop',
    'pending'
)
RETURNING *;

-- Step 7: View all pending requests
SELECT 
    r.id,
    r.category,
    r.item_name,
    r.delivery_location,
    r.room,
    r.tip,
    r.mode,
    r.status,
    u.full_name as buyer_name,
    r.created_at
FROM requests r
JOIN users u ON r.buyer_id = u.id
WHERE r.status = 'pending'
ORDER BY r.created_at DESC;

-- Step 8: Simulate dasher accepting a request
UPDATE requests
SET 
    runner_id = (SELECT id FROM users WHERE role = 'dasher' LIMIT 1),
    status = 'accepted',
    accepted_at = NOW()
WHERE id = (SELECT id FROM requests WHERE status = 'pending' LIMIT 1)
RETURNING *;

-- Step 9: View active requests (with buyer and dasher names)
SELECT 
    r.id,
    r.category,
    r.item_name,
    r.delivery_location,
    r.tip,
    r.mode,
    r.status,
    buyer.full_name as buyer_name,
    dasher.full_name as dasher_name,
    r.created_at
FROM requests r
LEFT JOIN users buyer ON r.buyer_id = buyer.id
LEFT JOIN users dasher ON r.runner_id = dasher.id
WHERE r.status IN ('pending', 'accepted', 'picked_up', 'on_the_way')
ORDER BY r.created_at DESC;

-- Step 10: Simulate status updates
-- Mark as picked up
UPDATE requests
SET status = 'picked_up', picked_up_at = NOW()
WHERE status = 'accepted'
RETURNING *;

-- Mark as on the way
UPDATE requests
SET status = 'on_the_way', on_the_way_at = NOW()
WHERE status = 'picked_up'
RETURNING *;

-- Mark as delivered
UPDATE requests
SET status = 'delivered', delivered_at = NOW()
WHERE status = 'on_the_way'
RETURNING *;

-- Step 11: View notifications
SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.urgent,
    n.read,
    u.full_name as user_name,
    n.created_at
FROM notifications n
JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Step 12: View dasher leaderboard
SELECT 
    u.id,
    u.full_name,
    ds.completed_deliveries,
    ds.total_earnings,
    ds.average_rating,
    ds.is_online
FROM users u
JOIN dasher_stats ds ON u.id = ds.dasher_id
WHERE u.role = 'dasher' AND u.is_active = true
ORDER BY ds.completed_deliveries DESC, ds.average_rating DESC;

-- Step 13: View user's order history
SELECT 
    r.id,
    r.category,
    r.item_name,
    r.delivery_location,
    r.tip,
    r.status,
    r.created_at,
    r.delivered_at,
    dasher.full_name as dasher_name
FROM requests r
LEFT JOIN users dasher ON r.runner_id = dasher.id
WHERE r.buyer_id = (SELECT id FROM users WHERE email = 'student1@campus.edu')
ORDER BY r.created_at DESC;

-- Step 14: Clean up test data (optional - run this to reset)
-- DELETE FROM notifications;
-- DELETE FROM requests;
-- DELETE FROM dasher_stats;
-- DELETE FROM users WHERE email LIKE '%@campus.edu';

-- ==========================================
-- QUICK VERIFICATION QUERIES
-- ==========================================

-- Count records in each table
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'requests', COUNT(*) FROM requests
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'dasher_stats', COUNT(*) FROM dasher_stats
UNION ALL
SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- View all requests with full details
SELECT * FROM active_requests;

-- View dasher performance
SELECT * FROM dasher_leaderboard;
