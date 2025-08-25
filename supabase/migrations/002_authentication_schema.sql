-- Migration: 002_authentication_schema.sql
-- Description: Implement complete authentication system with user isolation
-- Date: 2024-12-19

-- =====================================================
-- STEP 1.1: Update Users Table (if needed)
-- =====================================================

-- Add audit columns to auth.users if they don't exist
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON auth.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON auth.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 1.2: Update Items Table Structure
-- =====================================================

-- Add user_id column to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add audit fields
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id);
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_user_id ON public.items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON public.items(status);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON public.items(created_at);

-- Create trigger for items audit trail
DROP TRIGGER IF EXISTS update_items_updated_at ON public.items;
CREATE TRIGGER update_items_updated_at 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 1.3: Enable Row Level Security (RLS)
-- =====================================================

-- Enable RLS on items table
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create policies for user data isolation
DROP POLICY IF EXISTS "Users can only see their own items" ON public.items;
CREATE POLICY "Users can only see their own items" ON public.items
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only insert their own items" ON public.items;
CREATE POLICY "Users can only insert their own items" ON public.items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only update their own items" ON public.items;
CREATE POLICY "Users can only update their own items" ON public.items
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can only delete their own items" ON public.items;
CREATE POLICY "Users can only delete their own items" ON public.items
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- STEP 1.4: Create User Settings Table
-- =====================================================

-- Create user_settings table for storing user preferences
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    custom_system_prompt TEXT,
    theme_preference VARCHAR(20) DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for user_settings
CREATE POLICY "Users can only access their own settings" ON public.user_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create trigger for user_settings audit trail
CREATE TRIGGER update_user_settings_updated_at 
    BEFORE UPDATE ON public.user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 1.5: Create User Sessions Table
-- =====================================================

-- Create user_sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_sessions
CREATE POLICY "Users can only access their own sessions" ON public.user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =====================================================
-- STEP 1.6: Update Existing Data (Migration Helper)
-- =====================================================

-- Function to migrate existing items to have user_id
-- This will be called after authentication is implemented
CREATE OR REPLACE FUNCTION migrate_existing_items_to_user(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    items_updated INTEGER;
BEGIN
    -- Update items that don't have a user_id
    UPDATE public.items 
    SET user_id = user_uuid, 
        created_by = user_uuid, 
        updated_by = user_uuid
    WHERE user_id IS NULL;
    
    GET DIAGNOSTICS items_updated = ROW_COUNT;
    
    RETURN items_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 1.7: Create Authentication Helper Functions
-- =====================================================

-- Function to get current user's items count
CREATE OR REPLACE FUNCTION get_user_items_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM public.items 
        WHERE user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is authenticated
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 1.8: Create Views for Common Queries
-- =====================================================

-- View for user's active items
CREATE OR REPLACE VIEW user_active_items AS
SELECT * FROM public.items 
WHERE user_id = auth.uid() 
  AND status = 'active'
ORDER BY created_at DESC;

-- View for user's completed items
CREATE OR REPLACE VIEW user_completed_items AS
SELECT * FROM public.items 
WHERE user_id = auth.uid() 
  AND status = 'completed'
ORDER BY updated_at DESC;

-- =====================================================
-- STEP 1.9: Grant Permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_sessions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION migrate_existing_items_to_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_items_count() TO authenticated;
GRANT EXECUTE ON FUNCTION is_authenticated() TO authenticated;

-- =====================================================
-- STEP 1.10: Create Cleanup Functions
-- =====================================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    sessions_cleaned INTEGER;
BEGIN
    DELETE FROM public.user_sessions 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS sessions_cleaned = ROW_COUNT;
    
    RETURN sessions_cleaned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired sessions (optional)
-- This would require pg_cron extension which may not be available in free tier
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

-- =====================================================
-- Migration Complete
-- =====================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Migration 002_authentication_schema completed successfully';
    RAISE NOTICE 'Database schema updated for authentication system';
    RAISE NOTICE 'Row Level Security enabled on all tables';
    RAISE NOTICE 'User isolation policies created';
    RAISE NOTICE 'Audit trails and triggers configured';
END $$;
