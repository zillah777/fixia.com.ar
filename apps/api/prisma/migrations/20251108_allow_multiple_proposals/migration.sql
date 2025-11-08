-- Drop the unique constraint that limits to 1 proposal per professional per opportunity
-- This allows professionals to submit up to 2 proposals per opportunity
ALTER TABLE "proposals" DROP CONSTRAINT "proposals_project_id_professional_id_version_key";

-- Create a regular index for query performance (not unique)
CREATE INDEX IF NOT EXISTS "proposals_project_id_professional_id_idx" ON "proposals"("project_id", "professional_id");
