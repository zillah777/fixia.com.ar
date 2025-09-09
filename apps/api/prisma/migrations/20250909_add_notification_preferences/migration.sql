-- Add missing notification preference columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_messages" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_orders" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_projects" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifications_newsletter" BOOLEAN NOT NULL DEFAULT false;

-- Add missing settings column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT DEFAULT 'buenos-aires';

-- Add missing social network columns if they don't exist
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_linkedin" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_twitter" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_github" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "social_instagram" TEXT;