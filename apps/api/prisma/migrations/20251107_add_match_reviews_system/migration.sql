-- Create MatchReview table for bidirectional reviews after match completion
CREATE TABLE IF NOT EXISTS "match_reviews" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewed_user_id" TEXT NOT NULL,
    "overall_rating" INTEGER NOT NULL,
    "communication_rating" INTEGER,
    "quality_rating" INTEGER,
    "professionalism_rating" INTEGER,
    "timeliness_rating" INTEGER,
    "comment" TEXT,
    "verified_match" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "match_reviews_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches" ("id") ON DELETE CASCADE,
    CONSTRAINT "match_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "match_reviews_reviewed_user_id_fkey" FOREIGN KEY ("reviewed_user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
    CONSTRAINT "match_reviews_match_id_reviewer_id_key" UNIQUE ("match_id", "reviewer_id")
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "match_reviews_match_id_idx" ON "match_reviews"("match_id");
CREATE INDEX IF NOT EXISTS "match_reviews_reviewer_id_idx" ON "match_reviews"("reviewer_id");
CREATE INDEX IF NOT EXISTS "match_reviews_reviewed_user_id_idx" ON "match_reviews"("reviewed_user_id");
CREATE INDEX IF NOT EXISTS "match_reviews_overall_rating_idx" ON "match_reviews"("overall_rating");
CREATE INDEX IF NOT EXISTS "match_reviews_created_at_idx" ON "match_reviews"("created_at");
