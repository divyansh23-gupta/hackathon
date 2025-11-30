-- ==========================================
-- FIX: Add missing RLS policies for user signup
-- Run this in Supabase SQL Editor
-- ==========================================

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can create their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Allow authenticated users to insert into dasher_stats
CREATE POLICY "Dashers can create their own stats"
    ON dasher_stats FOR INSERT
    WITH CHECK (auth.uid() = dasher_id);

-- Allow users to insert notifications (for system/app use)
CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- COMPLETE! Run this to fix signup issues
-- ==========================================
