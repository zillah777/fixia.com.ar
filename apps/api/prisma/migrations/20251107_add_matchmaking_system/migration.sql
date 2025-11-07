-- Add new fields to Proposal table for counter-proposal support
ALTER TABLE "proposals" ADD COLUMN "parent_proposal_id" TEXT;
ALTER TABLE "proposals" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Update unique constraint on proposals (drop if exists, then add new one with version)
DO $$
BEGIN
    IF EXISTS (
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'proposals' AND constraint_name = 'proposals_project_id_professional_id_key'
    ) THEN
        ALTER TABLE "proposals" DROP CONSTRAINT "proposals_project_id_professional_id_key";
    END IF;
END $$;

ALTER TABLE "proposals" ADD CONSTRAINT "proposals_project_id_professional_id_version_key" UNIQUE ("project_id", "professional_id", "version");

-- Add foreign key for parent_proposal_id
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_parent_proposal_id_fkey" FOREIGN KEY ("parent_proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE;

-- Add index for status and accepted_at on proposals
CREATE INDEX "proposals_status_idx" ON "proposals"("status");
CREATE INDEX "proposals_accepted_at_idx" ON "proposals"("accepted_at");

-- Add completion tracking fields to Job table
ALTER TABLE "jobs" ADD COLUMN "completion_requested_by" TEXT;
ALTER TABLE "jobs" ADD COLUMN "completion_requested_at" TIMESTAMP(3);
ALTER TABLE "jobs" ADD COLUMN "completion_confirmed_by" TEXT;
ALTER TABLE "jobs" ADD COLUMN "completion_confirmed_at" TIMESTAMP(3);

-- Create Match table
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "job_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "phone_revealed_at" TIMESTAMP(3),
    "phone_reveal_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for proposal_id in Match
ALTER TABLE "matches" ADD CONSTRAINT "matches_proposal_id_unique" UNIQUE ("proposal_id");

-- Create indexes for Match table
CREATE INDEX "matches_client_id_idx" ON "matches"("client_id");
CREATE INDEX "matches_professional_id_idx" ON "matches"("professional_id");
CREATE INDEX "matches_status_idx" ON "matches"("status");
CREATE INDEX "matches_created_at_idx" ON "matches"("created_at");

-- Add foreign keys for Match table
ALTER TABLE "matches" ADD CONSTRAINT "matches_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE CASCADE;
ALTER TABLE "matches" ADD CONSTRAINT "matches_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id");
ALTER TABLE "matches" ADD CONSTRAINT "matches_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id");

-- Create PhoneReveal table
CREATE TABLE "phone_reveals" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revealed_at" TIMESTAMP(3),
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_reveals_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for token in PhoneReveal
ALTER TABLE "phone_reveals" ADD CONSTRAINT "phone_reveals_token_key" UNIQUE ("token");

-- Create indexes for PhoneReveal table
CREATE INDEX "phone_reveals_match_id_idx" ON "phone_reveals"("match_id");
CREATE INDEX "phone_reveals_user_id_idx" ON "phone_reveals"("user_id");
CREATE INDEX "phone_reveals_expires_at_idx" ON "phone_reveals"("expires_at");

-- Add foreign keys for PhoneReveal table
ALTER TABLE "phone_reveals" ADD CONSTRAINT "phone_reveals_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE;
ALTER TABLE "phone_reveals" ADD CONSTRAINT "phone_reveals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Add completion_confirmed_at index to Job table
CREATE INDEX "jobs_completion_confirmed_at_idx" ON "jobs"("completion_confirmed_at");

-- Add new notification types (update enum)
-- Note: PostgreSQL enums must be extended with ALTER TYPE
ALTER TYPE "NotificationType" ADD VALUE 'match_created' AFTER 'payment_received';
ALTER TYPE "NotificationType" ADD VALUE 'match_completed' AFTER 'match_created';
ALTER TYPE "NotificationType" ADD VALUE 'phone_revealed' AFTER 'match_completed';
ALTER TYPE "NotificationType" ADD VALUE 'review_requested' AFTER 'phone_revealed';
