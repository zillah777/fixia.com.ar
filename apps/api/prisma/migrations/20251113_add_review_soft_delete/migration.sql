-- Add soft delete fields to MatchReview for audit trail
ALTER TABLE "match_reviews" ADD COLUMN "deleted_at" TIMESTAMP(3),
ADD COLUMN "deleted_by_user_id" TEXT,
ADD COLUMN "deleted_reason" TEXT;

-- Create index for soft-deleted reviews queries
CREATE INDEX "match_reviews_deleted_at_idx" ON "match_reviews"("deleted_at");
