-- Migration to sync production schema with complete application requirements
-- This migration adds all missing tables and columns needed for the full Fixia marketplace

-- Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "birthdate" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "failed_login_attempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMP(3);

-- Create password_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS "password_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- Create jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "agreed_price" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "delivery_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'not_started',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- Create job_milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS "job_milestones" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "due_date" TIMESTAMP(3),
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "approved_by_client" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_milestones_pkey" PRIMARY KEY ("id")
);

-- Create job_status_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS "job_status_updates" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status_from" TEXT NOT NULL,
    "status_to" TEXT NOT NULL,
    "message" TEXT,
    "updated_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_status_updates_pkey" PRIMARY KEY ("id")
);

-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "job_id" TEXT,
    "service_id" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "mp_payment_id" TEXT,
    "mp_preference_id" TEXT,
    "external_reference" TEXT,
    "status_detail" TEXT,
    "user_id" TEXT NOT NULL,
    "professional_id" TEXT,
    "payer_email" TEXT,
    "payer_name" TEXT,
    "description" TEXT,
    "paid_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "approval_url" TEXT,
    "transaction_data" JSONB,
    "platform_fee" DECIMAL(12,2),
    "professional_amount" DECIMAL(12,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Create payment_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS "payment_preferences" (
    "id" TEXT NOT NULL,
    "mp_preference_id" TEXT NOT NULL,
    "external_reference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payer_email" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT,
    "job_id" TEXT,
    "professional_id" TEXT,
    "success_url" TEXT,
    "failure_url" TEXT,
    "pending_url" TEXT,
    "init_point" TEXT,
    "sandbox_init_point" TEXT,
    "client_id" TEXT,
    "collector_id" INTEGER,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_preferences_pkey" PRIMARY KEY ("id")
);

-- Create contact_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS "contact_interactions" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "professional_id" TEXT NOT NULL,
    "service_id" TEXT,
    "project_id" TEXT,
    "contact_method" TEXT NOT NULL,
    "message" TEXT,
    "contact_data" JSONB,
    "converted_to_job" BOOLEAN NOT NULL DEFAULT false,
    "job_id" TEXT,
    "conversion_value" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_interactions_pkey" PRIMARY KEY ("id")
);

-- Create review_helpful_votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS "review_helpful_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- Create review_flags table if it doesn't exist
CREATE TABLE IF NOT EXISTS "review_flags" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "flagger_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_flags_pkey" PRIMARY KEY ("id")
);

-- Create trust_scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS "trust_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "review_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "completion_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "communication_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reliability_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "verification_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_jobs_completed" INTEGER NOT NULL DEFAULT 0,
    "total_reviews_received" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "response_time_hours" DOUBLE PRECISION NOT NULL DEFAULT 24.0,
    "completion_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "verified_identity" BOOLEAN NOT NULL DEFAULT false,
    "verified_skills" BOOLEAN NOT NULL DEFAULT false,
    "verified_business" BOOLEAN NOT NULL DEFAULT false,
    "background_checked" BOOLEAN NOT NULL DEFAULT false,
    "last_calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_scores_pkey" PRIMARY KEY ("id")
);

-- Create verification_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS "verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verification_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "documents" TEXT[],
    "additional_info" JSONB,
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- Create review_templates table if it doesn't exist
CREATE TABLE IF NOT EXISTS "review_templates" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_templates_pkey" PRIMARY KEY ("id")
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT,
    "professional_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- Add missing columns to reviews table
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "job_id" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "verified_purchase" BOOLEAN DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderation_status" TEXT DEFAULT 'pending';
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_by" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_at" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "flagged_count" INTEGER DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "trust_score" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "communication_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "quality_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "timeliness_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "professionalism_rating" INTEGER;

-- Create unique constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_project_id_key') THEN
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_project_id_key" UNIQUE ("project_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'jobs_proposal_id_key') THEN
        ALTER TABLE "jobs" ADD CONSTRAINT "jobs_proposal_id_key" UNIQUE ("proposal_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_transaction_id_key') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_transaction_id_key" UNIQUE ("transaction_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_mp_payment_id_key') THEN
        ALTER TABLE "payments" ADD CONSTRAINT "payments_mp_payment_id_key" UNIQUE ("mp_payment_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payment_preferences_mp_preference_id_key') THEN
        ALTER TABLE "payment_preferences" ADD CONSTRAINT "payment_preferences_mp_preference_id_key" UNIQUE ("mp_preference_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_helpful_votes_review_id_user_id_key') THEN
        ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_user_id_key" UNIQUE ("review_id", "user_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'review_flags_review_id_flagger_id_key') THEN
        ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_review_id_flagger_id_key" UNIQUE ("review_id", "flagger_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'trust_scores_user_id_key') THEN
        ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_user_id_key" UNIQUE ("user_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_service_id_key') THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_service_id_key" UNIQUE ("user_id", "service_id");
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_professional_id_key') THEN
        ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_professional_id_key" UNIQUE ("user_id", "professional_id");
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "password_history_user_id_idx" ON "password_history"("user_id");
CREATE INDEX IF NOT EXISTS "password_history_created_at_idx" ON "password_history"("created_at");
CREATE INDEX IF NOT EXISTS "jobs_client_id_idx" ON "jobs"("client_id");
CREATE INDEX IF NOT EXISTS "jobs_professional_id_idx" ON "jobs"("professional_id");
CREATE INDEX IF NOT EXISTS "jobs_status_idx" ON "jobs"("status");
CREATE INDEX IF NOT EXISTS "jobs_created_at_idx" ON "jobs"("created_at");
CREATE INDEX IF NOT EXISTS "job_milestones_job_id_idx" ON "job_milestones"("job_id");
CREATE INDEX IF NOT EXISTS "job_milestones_completed_idx" ON "job_milestones"("completed");
CREATE INDEX IF NOT EXISTS "job_status_updates_job_id_idx" ON "job_status_updates"("job_id");
CREATE INDEX IF NOT EXISTS "job_status_updates_created_at_idx" ON "job_status_updates"("created_at");
CREATE INDEX IF NOT EXISTS "payments_job_id_idx" ON "payments"("job_id");
CREATE INDEX IF NOT EXISTS "payments_service_id_idx" ON "payments"("service_id");
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX IF NOT EXISTS "payments_professional_id_idx" ON "payments"("professional_id");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_mp_payment_id_idx" ON "payments"("mp_payment_id");
CREATE INDEX IF NOT EXISTS "payments_external_reference_idx" ON "payments"("external_reference");
CREATE INDEX IF NOT EXISTS "payments_created_at_idx" ON "payments"("created_at");
CREATE INDEX IF NOT EXISTS "payment_preferences_user_id_idx" ON "payment_preferences"("user_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_professional_id_idx" ON "payment_preferences"("professional_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_service_id_idx" ON "payment_preferences"("service_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_job_id_idx" ON "payment_preferences"("job_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_mp_preference_id_idx" ON "payment_preferences"("mp_preference_id");
CREATE INDEX IF NOT EXISTS "contact_interactions_client_id_idx" ON "contact_interactions"("client_id");
CREATE INDEX IF NOT EXISTS "contact_interactions_professional_id_idx" ON "contact_interactions"("professional_id");
CREATE INDEX IF NOT EXISTS "contact_interactions_created_at_idx" ON "contact_interactions"("created_at");
CREATE INDEX IF NOT EXISTS "contact_interactions_converted_to_job_idx" ON "contact_interactions"("converted_to_job");
CREATE INDEX IF NOT EXISTS "review_helpful_votes_review_id_idx" ON "review_helpful_votes"("review_id");
CREATE INDEX IF NOT EXISTS "review_helpful_votes_user_id_idx" ON "review_helpful_votes"("user_id");
CREATE INDEX IF NOT EXISTS "review_flags_review_id_idx" ON "review_flags"("review_id");
CREATE INDEX IF NOT EXISTS "review_flags_flagger_id_idx" ON "review_flags"("flagger_id");
CREATE INDEX IF NOT EXISTS "review_flags_resolved_idx" ON "review_flags"("resolved");
CREATE INDEX IF NOT EXISTS "trust_scores_overall_score_idx" ON "trust_scores"("overall_score");
CREATE INDEX IF NOT EXISTS "trust_scores_user_id_idx" ON "trust_scores"("user_id");
CREATE INDEX IF NOT EXISTS "verification_requests_user_id_idx" ON "verification_requests"("user_id");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "verification_requests_verification_type_idx" ON "verification_requests"("verification_type");
CREATE INDEX IF NOT EXISTS "review_templates_category_idx" ON "review_templates"("category");
CREATE INDEX IF NOT EXISTS "review_templates_active_idx" ON "review_templates"("active");
CREATE INDEX IF NOT EXISTS "favorites_user_id_idx" ON "favorites"("user_id");
CREATE INDEX IF NOT EXISTS "favorites_service_id_idx" ON "favorites"("service_id");
CREATE INDEX IF NOT EXISTS "favorites_professional_id_idx" ON "favorites"("professional_id");
CREATE INDEX IF NOT EXISTS "reviews_job_id_idx" ON "reviews"("job_id");
CREATE INDEX IF NOT EXISTS "reviews_moderation_status_idx" ON "reviews"("moderation_status");
CREATE INDEX IF NOT EXISTS "reviews_verified_purchase_idx" ON "reviews"("verified_purchase");
CREATE INDEX IF NOT EXISTS "reviews_trust_score_idx" ON "reviews"("trust_score");
