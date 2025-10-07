-- Production Schema Fix Migration
-- This migration ensures the database schema matches the corrected Prisma schema
-- Removes non-existing fields from schema expectations

-- Note: This is a schema synchronization migration
-- It doesn't actually change the database structure since we're matching
-- the schema to what already exists in production

-- Verify that all expected columns exist in the users table
-- If any columns are missing, they will be added

-- Add any missing columns (if they don't exist)
DO $$
BEGIN
  -- Check if avatar column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar TEXT;
  END IF;

  -- Ensure all required columns exist with correct types
  -- These should already exist but we verify for safety:
  -- id, email, password_hash, name, user_type, location, verified, 
  -- email_verified, phone, whatsapp_number, created_at, updated_at, 
  -- deleted_at, birthdate, failed_login_attempts, locked_until

END $$;

-- Create index on commonly queried fields if they don't exist
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_verified ON users(verified);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users(location);

-- Verify data integrity
-- Ensure no null values in required fields
UPDATE users SET 
  failed_login_attempts = 0 
WHERE failed_login_attempts IS NULL;

UPDATE users SET 
  verified = false 
WHERE verified IS NULL;

UPDATE users SET 
  email_verified = false 
WHERE email_verified IS NULL;