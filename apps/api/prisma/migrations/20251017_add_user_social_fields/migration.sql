-- Add social network fields to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "social_linkedin" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "social_twitter" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "social_github" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "social_instagram" TEXT;

-- Add notification preference fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifications_messages" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifications_orders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifications_projects" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "notifications_newsletter" BOOLEAN NOT NULL DEFAULT false;

-- Add settings fields
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'buenos-aires';
