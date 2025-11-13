-- Performance indexes for critical queries
-- These indexes optimize common filtering, sorting, and join operations

-- MATCHES TABLE INDEXES
-- Index for client-side match queries
CREATE INDEX IF NOT EXISTS "matches_client_id_status_created_at_idx"
  ON "matches"("client_id", "status", "created_at" DESC);

-- Index for professional-side match queries
CREATE INDEX IF NOT EXISTS "matches_professional_id_status_created_at_idx"
  ON "matches"("professional_id", "status", "created_at" DESC);

-- Index for match status and created_at filtering
CREATE INDEX IF NOT EXISTS "matches_status_created_at_idx"
  ON "matches"("status", "created_at" DESC);

-- Index for proposal_id lookups (unique constraint but explicit index helps)
CREATE INDEX IF NOT EXISTS "matches_proposal_id_idx"
  ON "matches"("proposal_id");

-- JOBS TABLE INDEXES
-- Index for client jobs with status filtering
CREATE INDEX IF NOT EXISTS "jobs_client_id_status_idx"
  ON "jobs"("client_id", "status");

-- Index for professional jobs with status filtering
CREATE INDEX IF NOT EXISTS "jobs_professional_id_status_idx"
  ON "jobs"("professional_id", "status");

-- Index for project-job relationship lookups
CREATE INDEX IF NOT EXISTS "jobs_project_id_idx"
  ON "jobs"("project_id");

-- Index for completion status queries
CREATE INDEX IF NOT EXISTS "jobs_status_completion_confirmed_at_idx"
  ON "jobs"("status", "completion_confirmed_at");

-- FEEDBACK/REVIEWS TABLE INDEXES (if exists)
-- Index for reviews by reviewed user
CREATE INDEX IF NOT EXISTS "match_reviews_reviewed_user_id_created_at_idx"
  ON "match_reviews"("reviewed_user_id", "created_at" DESC);

-- Index for non-deleted reviews
CREATE INDEX IF NOT EXISTS "match_reviews_deleted_at_created_at_idx"
  ON "match_reviews"("deleted_at", "created_at" DESC);

-- PROPOSALS TABLE INDEXES
-- Index for project proposals
CREATE INDEX IF NOT EXISTS "proposals_project_id_status_idx"
  ON "proposals"("project_id", "status");

-- Index for professional proposals
CREATE INDEX IF NOT EXISTS "proposals_professional_id_status_created_at_idx"
  ON "proposals"("professional_id", "status", "created_at" DESC);

-- ADDITIONAL INDEXES FOR PERFORMANCE
-- User active status for role-based queries
CREATE INDEX IF NOT EXISTS "users_user_type_subscription_status_idx"
  ON "users"("user_type", "subscription_status");

-- Project status and client for filtering
CREATE INDEX IF NOT EXISTS "projects_client_id_status_created_at_idx"
  ON "projects"("client_id", "status", "created_at" DESC);
