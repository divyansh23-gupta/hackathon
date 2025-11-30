-- ==========================================
-- DASHDROP SUPABASE DATABASE SCHEMA
-- Complete SQL for all tables, RLS policies, and functions
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. USERS TABLE
-- ==========================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    full_name TEXT NOT NULL,
    student_id TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'dasher', 'admin')),
    avatar_url TEXT,
    hostel_block TEXT,
    room_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    total_orders INT DEFAULT 0,
    total_deliveries INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- 2. REQUESTS TABLE (Main Orders)
-- ==========================================

CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    runner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Request Details
    category TEXT NOT NULL CHECK (category IN ('food', 'stationery', 'medicines', 'tech', 'hostel', 'custom')),
    item_name TEXT,
    description TEXT,
    qr_image_url TEXT,
    photo_url TEXT,
    
    -- Delivery Info
    pickup_point TEXT DEFAULT 'Food Court / Canteen',
    delivery_location TEXT NOT NULL,
    room TEXT,
    
    -- Pricing
    tip DECIMAL(10,2) NOT NULL DEFAULT 15.00,
    service_fee DECIMAL(10,2) DEFAULT 5.00,
    total_amount DECIMAL(10,2) GENERATED ALWAYS AS (tip + service_fee) STORED,
    
    -- Mode & Status
    mode TEXT NOT NULL DEFAULT 'normal' CHECK (mode IN ('normal', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picked_up', 'on_the_way', 'delivered', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    on_the_way_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_requests_buyer ON requests(buyer_id);
CREATE INDEX idx_requests_runner ON requests(runner_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_mode ON requests(mode);
CREATE INDEX idx_requests_created ON requests(created_at DESC);

-- ==========================================
-- 3. NOTIFICATIONS TABLE
-- ==========================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    
    -- Notification Details
    type TEXT NOT NULL CHECK (type IN ('new_request', 'request_accepted', 'status_update', 'delivery_complete', 'payment', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    urgent BOOLEAN DEFAULT false,
    read BOOLEAN DEFAULT false,
    action_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ==========================================
-- 4. REVIEWS TABLE
-- ==========================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Review Details
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_type TEXT NOT NULL CHECK (review_type IN ('buyer_to_dasher', 'dasher_to_buyer')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_reviews_request ON reviews(request_id);

-- ==========================================
-- 5. TRANSACTIONS TABLE
-- ==========================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES requests(id) ON DELETE SET NULL,
    
    -- Transaction Details
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'tip', 'withdrawal')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    
    -- Payment Info
    payment_method TEXT CHECK (payment_method IN ('wallet', 'upi', 'card', 'cash')),
    payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_request ON transactions(request_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ==========================================
-- 6. DASHER_STATS TABLE
-- ==========================================

CREATE TABLE dasher_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dasher_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Statistics
    total_deliveries INT DEFAULT 0,
    completed_deliveries INT DEFAULT 0,
    cancelled_deliveries INT DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Availability
    is_online BOOLEAN DEFAULT false,
    current_location TEXT,
    last_active_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_dasher_stats_online ON dasher_stats(is_online);

-- ==========================================
-- 7. CHAT_MESSAGES TABLE
-- ==========================================

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message Details
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
    attachment_url TEXT,
    
    -- Status
    read BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_chat_request ON chat_messages(request_id);
CREATE INDEX idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_created ON chat_messages(created_at);

-- ==========================================
-- 8. SAVED_LOCATIONS TABLE
-- ==========================================

CREATE TABLE saved_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Location Details
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    room TEXT,
    is_default BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_saved_locations_user ON saved_locations(user_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dasher_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;

-- Users Policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Requests Policies
CREATE POLICY "Anyone can view pending requests"
    ON requests FOR SELECT
    USING (status = 'pending' OR buyer_id = auth.uid() OR runner_id = auth.uid());

CREATE POLICY "Buyers can create requests"
    ON requests FOR INSERT
    WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Buyers and runners can update their requests"
    ON requests FOR UPDATE
    USING (buyer_id = auth.uid() OR runner_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid());

-- Reviews Policies
CREATE POLICY "Anyone can view reviews"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews for their requests"
    ON reviews FOR INSERT
    WITH CHECK (reviewer_id = auth.uid());

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
    ON transactions FOR SELECT
    USING (user_id = auth.uid());

-- Dasher Stats Policies
CREATE POLICY "Anyone can view dasher stats"
    ON dasher_stats FOR SELECT
    USING (true);

CREATE POLICY "Dashers can update their own stats"
    ON dasher_stats FOR UPDATE
    USING (dasher_id = auth.uid());

CREATE POLICY "Dashers can create their own stats"
    ON dasher_stats FOR INSERT
    WITH CHECK (dasher_id = auth.uid());


-- Chat Messages Policies
CREATE POLICY "Users can view messages for their requests"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM requests
            WHERE requests.id = chat_messages.request_id
            AND (requests.buyer_id = auth.uid() OR requests.runner_id = auth.uid())
        )
    );

CREATE POLICY "Users can send messages for their requests"
    ON chat_messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Saved Locations Policies
CREATE POLICY "Users can manage their own saved locations"
    ON saved_locations FOR ALL
    USING (user_id = auth.uid());

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dasher_stats_updated_at BEFORE UPDATE ON dasher_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create notification on request status change
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO notifications (user_id, request_id, type, title, message, urgent)
        VALUES (
            NEW.buyer_id,
            NEW.id,
            'status_update',
            'Order Status Updated',
            'Your order status changed to: ' || NEW.status,
            NEW.mode = 'urgent'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER request_status_notification AFTER UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION notify_on_status_change();

-- Function to update dasher stats on delivery completion
CREATE OR REPLACE FUNCTION update_dasher_stats_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        UPDATE dasher_stats
        SET 
            completed_deliveries = completed_deliveries + 1,
            total_earnings = total_earnings + NEW.tip
        WHERE dasher_id = NEW.runner_id;
        
        UPDATE users
        SET total_deliveries = total_deliveries + 1
        WHERE id = NEW.runner_id;
        
        UPDATE users
        SET total_orders = total_orders + 1
        WHERE id = NEW.buyer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_delivery AFTER UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_dasher_stats_on_delivery();

-- ==========================================
-- SAMPLE DATA (Optional - for testing)
-- ==========================================

-- Insert sample users
INSERT INTO users (email, full_name, student_id, role, hostel_block, room_number) VALUES
('student1@campus.edu', 'Rahul Kumar', 'STU2024001', 'student', 'Block A', '405'),
('student2@campus.edu', 'Priya Sharma', 'STU2024002', 'student', 'Block B', '302'),
('dasher1@campus.edu', 'Amit Singh', 'STU2024003', 'dasher', 'Block C', '201');

-- Insert sample dasher stats
INSERT INTO dasher_stats (dasher_id, is_online)
SELECT id, true FROM users WHERE role = 'dasher';

-- ==========================================
-- REALTIME SUBSCRIPTIONS
-- ==========================================

-- Enable realtime for tables
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- ==========================================
-- STORAGE BUCKETS (for images)
-- ==========================================

-- Create storage buckets (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies
-- CREATE POLICY "Anyone can view QR codes" ON storage.objects FOR SELECT USING (bucket_id = 'qr-codes');
-- CREATE POLICY "Authenticated users can upload QR codes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'qr-codes' AND auth.role() = 'authenticated');

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Composite indexes for common queries
CREATE INDEX idx_requests_status_created ON requests(status, created_at DESC);
CREATE INDEX idx_requests_buyer_status ON requests(buyer_id, status);
CREATE INDEX idx_requests_runner_status ON requests(runner_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);

-- ==========================================
-- VIEWS (for analytics)
-- ==========================================

-- View for active requests
CREATE VIEW active_requests AS
SELECT 
    r.*,
    u1.full_name as buyer_name,
    u2.full_name as runner_name
FROM requests r
LEFT JOIN users u1 ON r.buyer_id = u1.id
LEFT JOIN users u2 ON r.runner_id = u2.id
WHERE r.status IN ('pending', 'accepted', 'picked_up', 'on_the_way');

-- View for dasher leaderboard
CREATE VIEW dasher_leaderboard AS
SELECT 
    u.id,
    u.full_name,
    u.avatar_url,
    ds.completed_deliveries,
    ds.total_earnings,
    ds.average_rating,
    ds.is_online
FROM users u
JOIN dasher_stats ds ON u.id = ds.dasher_id
WHERE u.role = 'dasher' AND u.is_active = true
ORDER BY ds.completed_deliveries DESC, ds.average_rating DESC;

-- ==========================================
-- COMPLETE! 
-- Run this entire script in your Supabase SQL editor
-- ==========================================
