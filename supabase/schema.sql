-- ============================================
-- California Care Alliance - Database Schema
-- Provider Portal & Admin Dashboard
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROVIDERS TABLE
-- Agency/Broker accounts (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    agency_name VARCHAR(255) NOT NULL,
    address TEXT DEFAULT '',
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    main_contact_name VARCHAR(255) NOT NULL,
    main_contact_phone VARCHAR(50) NOT NULL,
    main_contact_email VARCHAR(255) NOT NULL,
    secondary_contact_name VARCHAR(255),
    secondary_contact_phone VARCHAR(50),
    secondary_contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);

-- ============================================
-- 2. ADMINS TABLE
-- Admin users (linked to auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_admins_user_id ON admins(user_id);

-- ============================================
-- 3. REFERRALS TABLE
-- Provider referrals for customers
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    accident_date DATE,
    people_involved INTEGER,
    at_fault_status VARCHAR(50) CHECK (at_fault_status IN ('at_fault', 'not_at_fault', 'unknown') OR at_fault_status IS NULL),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_referrals_provider_id ON referrals(provider_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at DESC);

-- ============================================
-- 4. REFERRAL_NOTES TABLE
-- Admin notes on referrals
-- ============================================
CREATE TABLE IF NOT EXISTS referral_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referral_id UUID REFERENCES referrals(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    is_visible_to_provider BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster referral lookups
CREATE INDEX IF NOT EXISTS idx_referral_notes_referral_id ON referral_notes(referral_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROVIDERS POLICIES
-- ============================================

-- Providers can view and update their own record
CREATE POLICY providers_select_own ON providers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY providers_update_own ON providers
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY providers_insert_own ON providers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all providers
CREATE POLICY providers_admin_select ON providers
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can update all providers
CREATE POLICY providers_admin_update ON providers
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- ============================================
-- ADMINS POLICIES
-- ============================================

-- Admins can view their own record
CREATE POLICY admins_select_own ON admins
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view other admins
CREATE POLICY admins_select_all ON admins
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- ============================================
-- REFERRALS POLICIES
-- ============================================

-- Providers can view their own referrals
CREATE POLICY referrals_provider_select ON referrals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM providers WHERE id = referrals.provider_id AND user_id = auth.uid())
    );

-- Providers can insert their own referrals
CREATE POLICY referrals_provider_insert ON referrals
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM providers WHERE id = provider_id AND user_id = auth.uid())
    );

-- Admins can view all referrals
CREATE POLICY referrals_admin_select ON referrals
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can update all referrals
CREATE POLICY referrals_admin_update ON referrals
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can delete referrals
CREATE POLICY referrals_admin_delete ON referrals
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- ============================================
-- REFERRAL_NOTES POLICIES
-- ============================================

-- Providers can view notes visible to them
CREATE POLICY referral_notes_provider_select ON referral_notes
    FOR SELECT USING (
        is_visible_to_provider = TRUE
        AND EXISTS (
            SELECT 1 FROM referrals r
            JOIN providers p ON r.provider_id = p.id
            WHERE r.id = referral_notes.referral_id
            AND p.user_id = auth.uid()
        )
    );

-- Admins can view all notes
CREATE POLICY referral_notes_admin_select ON referral_notes
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can insert notes
CREATE POLICY referral_notes_admin_insert ON referral_notes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can update notes
CREATE POLICY referral_notes_admin_update ON referral_notes
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- Admins can delete notes
CREATE POLICY referral_notes_admin_delete ON referral_notes
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for providers
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for referrals
DROP TRIGGER IF EXISTS update_referrals_updated_at ON referrals;
CREATE TRIGGER update_referrals_updated_at
    BEFORE UPDATE ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- CREATE FIRST ADMIN (Run manually after creating auth user)
-- Replace 'YOUR_USER_ID' with the actual UUID from auth.users
-- ============================================
-- INSERT INTO admins (user_id, name, email, role)
-- VALUES ('YOUR_USER_ID', 'Admin Name', 'admin@californiacarealliance.com', 'super_admin');
