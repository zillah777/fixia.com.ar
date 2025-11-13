-- AlterEnum: Add 'admin' value to UserType enum
-- This is a safe migration that only adds a new enum value

-- PostgreSQL doesn't allow direct ALTER TYPE ADD VALUE in transactions,
-- so we need to handle this carefully. The value is already in schema.prisma
-- and this migration documents the change for production database sync.

-- Note: In PostgreSQL, enum values are added with:
-- ALTER TYPE "UserType" ADD VALUE 'admin';
-- This must be done outside of transaction blocks.

-- For safety, we'll create a new enum type and migrate existing records
BEGIN;

-- Create new enum type with all values including 'admin'
CREATE TYPE "UserType_new" AS ENUM ('client', 'professional', 'dual', 'admin');

-- Alter the user_type column to use the new enum type
ALTER TABLE "users" ALTER COLUMN "user_type" TYPE "UserType_new" USING "user_type"::text::"UserType_new";

-- Drop the old enum type
DROP TYPE "UserType";

-- Rename the new enum type to the original name
ALTER TYPE "UserType_new" RENAME TO "UserType";

COMMIT;
