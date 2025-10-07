-- Comprehensive Platform Expansion Migration
-- Adds Jobs, Reviews, Trust, Verification, and Notifications systems
-- This migration adds 12 new models and 7 new enums for full marketplace functionality

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('not_started', 'in_progress', 'milestone_review', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'released', 'refunded', 'disputed');

-- CreateEnum
CREATE TYPE "ReviewModerationStatus" AS ENUM ('pending', 'approved', 'rejected', 'flagged', 'spam');

-- CreateEnum
CREATE TYPE "ReviewFlagReason" AS ENUM ('inappropriate_language', 'fake_review', 'spam', 'harassment', 'irrelevant', 'personal_information', 'other');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('identity', 'skills', 'business', 'background_check', 'phone', 'email', 'address');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'approved', 'rejected', 'expired', 'cancelled');

-- Extend NotificationType enum with new values
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'job_started';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'job_milestone';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'job_completed';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'payment_received';

-- CreateTable: Jobs - Core job tracking
CREATE TABLE "jobs" (
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
    "status" "JobStatus" NOT NULL DEFAULT 'not_started',
    "progress_percentage" INTEGER NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Job Milestones - For milestone-based payments
CREATE TABLE "job_milestones" (
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

-- CreateTable: Job Status Updates - Audit trail
CREATE TABLE "job_status_updates" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status_from" "JobStatus" NOT NULL,
    "status_to" "JobStatus" NOT NULL,
    "message" TEXT,
    "updated_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_status_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Payments - Payment tracking and escrow
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" TEXT,
    "transaction_id" TEXT,
    "paid_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "platform_fee" DECIMAL(12,2),
    "professional_amount" DECIMAL(12,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Contact Interactions - Lead tracking
CREATE TABLE "contact_interactions" (
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

-- Enhance Reviews table with trust and moderation features
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "helpful_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "verified_purchase" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderation_status" "ReviewModerationStatus" NOT NULL DEFAULT 'pending';
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_by" TEXT;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "moderated_at" TIMESTAMP(3);
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "flagged_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "trust_score" DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "communication_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "quality_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "timeliness_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "professionalism_rating" INTEGER;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "job_id" TEXT;

-- CreateTable: Review Helpful Votes
CREATE TABLE "review_helpful_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_helpful_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Review Flags
CREATE TABLE "review_flags" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "flagger_id" TEXT NOT NULL,
    "reason" "ReviewFlagReason" NOT NULL,
    "description" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Trust Scores - Advanced trust calculation
CREATE TABLE "trust_scores" (
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

-- CreateTable: Verification Requests - Professional verification system
CREATE TABLE "verification_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verification_type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
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

-- CreateTable: Review Templates - Standardized review categories
CREATE TABLE "review_templates" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_templates_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE UNIQUE INDEX "jobs_project_id_key" ON "jobs"("project_id");
CREATE UNIQUE INDEX "jobs_proposal_id_key" ON "jobs"("proposal_id");
CREATE INDEX "jobs_client_id_idx" ON "jobs"("client_id");
CREATE INDEX "jobs_professional_id_idx" ON "jobs"("professional_id");
CREATE INDEX "jobs_status_idx" ON "jobs"("status");
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");

CREATE INDEX "job_milestones_job_id_idx" ON "job_milestones"("job_id");
CREATE INDEX "job_milestones_completed_idx" ON "job_milestones"("completed");

CREATE INDEX "job_status_updates_job_id_idx" ON "job_status_updates"("job_id");
CREATE INDEX "job_status_updates_created_at_idx" ON "job_status_updates"("created_at");

CREATE UNIQUE INDEX "payments_transaction_id_key" ON "payments"("transaction_id");
CREATE INDEX "payments_job_id_idx" ON "payments"("job_id");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

CREATE INDEX "contact_interactions_client_id_idx" ON "contact_interactions"("client_id");
CREATE INDEX "contact_interactions_professional_id_idx" ON "contact_interactions"("professional_id");
CREATE INDEX "contact_interactions_created_at_idx" ON "contact_interactions"("created_at");
CREATE INDEX "contact_interactions_converted_to_job_idx" ON "contact_interactions"("converted_to_job");

CREATE INDEX "reviews_job_id_idx" ON "reviews"("job_id");
CREATE INDEX "reviews_moderation_status_idx" ON "reviews"("moderation_status");
CREATE INDEX "reviews_verified_purchase_idx" ON "reviews"("verified_purchase");
CREATE INDEX "reviews_trust_score_idx" ON "reviews"("trust_score");

CREATE INDEX "review_helpful_votes_review_id_idx" ON "review_helpful_votes"("review_id");
CREATE INDEX "review_helpful_votes_user_id_idx" ON "review_helpful_votes"("user_id");
CREATE UNIQUE INDEX "review_helpful_votes_review_id_user_id_key" ON "review_helpful_votes"("review_id", "user_id");

CREATE INDEX "review_flags_review_id_idx" ON "review_flags"("review_id");
CREATE INDEX "review_flags_flagger_id_idx" ON "review_flags"("flagger_id");
CREATE INDEX "review_flags_resolved_idx" ON "review_flags"("resolved");
CREATE UNIQUE INDEX "review_flags_review_id_flagger_id_key" ON "review_flags"("review_id", "flagger_id");

CREATE UNIQUE INDEX "trust_scores_user_id_key" ON "trust_scores"("user_id");
CREATE INDEX "trust_scores_overall_score_idx" ON "trust_scores"("overall_score");
CREATE INDEX "trust_scores_user_id_idx" ON "trust_scores"("user_id");

CREATE INDEX "verification_requests_user_id_idx" ON "verification_requests"("user_id");
CREATE INDEX "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX "verification_requests_verification_type_idx" ON "verification_requests"("verification_type");

CREATE INDEX "review_templates_category_idx" ON "review_templates"("category");
CREATE INDEX "review_templates_active_idx" ON "review_templates"("active");

-- Add foreign key constraints
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "job_milestones" ADD CONSTRAINT "job_milestones_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_status_updates" ADD CONSTRAINT "job_status_updates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "job_status_updates" ADD CONSTRAINT "job_status_updates_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "contact_interactions" ADD CONSTRAINT "contact_interactions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_moderated_by_fkey" FOREIGN KEY ("moderated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_helpful_votes" ADD CONSTRAINT "review_helpful_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_flagger_id_fkey" FOREIGN KEY ("flagger_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_flags" ADD CONSTRAINT "review_flags_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "trust_scores" ADD CONSTRAINT "trust_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;