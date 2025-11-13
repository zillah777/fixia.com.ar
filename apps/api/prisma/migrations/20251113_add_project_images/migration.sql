-- Add image fields to projects table for media gallery support
ALTER TABLE "projects" ADD COLUMN "main_image_url" TEXT,
ADD COLUMN "gallery_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Index for projects with images (for filtering/search)
CREATE INDEX "projects_main_image_url_idx" ON "projects"("main_image_url") WHERE "main_image_url" IS NOT NULL;
