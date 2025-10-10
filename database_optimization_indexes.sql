-- FIXIA MARKETPLACE - DATABASE OPTIMIZATION INDEXES
-- Optimized indexing strategy for high-performance marketplace operations
-- Performance target: <100ms for 95% of queries

-- ================================================================
-- 1. SERVICE SEARCH OPTIMIZATION
-- ================================================================

-- Composite index for service search with filters
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_search_optimization 
ON services (active, category_id, price, featured, created_at DESC) 
WHERE active = true;

-- GIN index for full-text search on title and description
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_fulltext_search 
ON services USING GIN (to_tsvector('spanish', title || ' ' || description));

-- GIN index for tags array search
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_tags_gin 
ON services USING GIN (tags);

-- ================================================================
-- 2. PROFESSIONAL MATCHING OPTIMIZATION
-- ================================================================

-- Composite index for professional search with rating
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professional_search 
ON professional_profiles (level, rating DESC, availability_status, user_id);

-- Location-based search optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location_trgm 
ON users USING GIN (location gin_trgm_ops) 
WHERE user_type = 'professional' AND deleted_at IS NULL;

-- Professional availability quick lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professional_available 
ON professional_profiles (availability_status, response_time_hours) 
WHERE availability_status = 'available';

-- ================================================================
-- 3. PROJECT AND PROPOSAL OPTIMIZATION
-- ================================================================

-- Project status and timeline optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_active_search 
ON projects (status, category_id, budget_min, budget_max, created_at DESC) 
WHERE status = 'open';

-- Proposal performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_professional_status 
ON proposals (professional_id, status, created_at DESC);

-- Unique constraint optimization for proposals
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_proposals_unique_active 
ON proposals (project_id, professional_id) 
WHERE status IN ('pending', 'accepted');

-- ================================================================
-- 4. REVIEW AND RATING OPTIMIZATION
-- ================================================================

-- Review aggregation optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_professional_rating 
ON reviews (professional_id, rating, created_at DESC);

-- Service review performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_service_recent 
ON reviews (service_id, created_at DESC, rating);

-- ================================================================
-- 5. USER ACTIVITY AND ANALYTICS
-- ================================================================

-- User activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_analytics 
ON user_activity (action, resource_type, created_at DESC);

-- Service view analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_views_analytics 
ON service_views (service_id, viewed_at DESC) 
WHERE viewer_id IS NOT NULL;

-- ================================================================
-- 6. NOTIFICATION AND SESSION OPTIMIZATION
-- ================================================================

-- Notification delivery optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
ON notifications (user_id, read, created_at DESC) 
WHERE read = false;

-- Session management optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_sessions_active 
ON user_sessions (user_id, expires_at DESC) 
WHERE expires_at > NOW();

-- ================================================================
-- 7. SECURITY AND AUTHENTICATION OPTIMIZATION
-- ================================================================

-- Password reset token lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_password_reset_valid 
ON password_reset_tokens (token, expires_at) 
WHERE used = false AND expires_at > NOW();

-- Email verification optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_email_verification_valid 
ON email_verification_tokens (token, expires_at) 
WHERE used = false AND expires_at > NOW();

-- ================================================================
-- 8. MARKETPLACE-SPECIFIC ANALYTICS INDEXES
-- ================================================================

-- Revenue and earnings tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_professional_earnings 
ON professional_profiles (total_earnings DESC, review_count DESC, rating DESC);

-- Category performance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_performance 
ON categories (popular DESC, service_count DESC, name);

-- ================================================================
-- QUERY PERFORMANCE VALIDATION
-- ================================================================

-- Create function to validate index usage
CREATE OR REPLACE FUNCTION validate_index_usage() 
RETURNS TABLE(
  schemaname text,
  tablename text,
  indexname text,
  idx_scan bigint,
  idx_tup_read bigint,
  idx_tup_fetch bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname::text,
    tablename::text,
    indexname::text,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
  ORDER BY idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Performance monitoring view
CREATE OR REPLACE VIEW marketplace_query_performance AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  min_time,
  max_time,
  rows
FROM pg_stat_statements 
WHERE query LIKE '%services%' 
   OR query LIKE '%users%' 
   OR query LIKE '%projects%'
ORDER BY total_time DESC;

-- ================================================================
-- INDEX MAINTENANCE RECOMMENDATIONS
-- ================================================================

-- Schedule for index maintenance (run monthly)
-- REINDEX INDEX CONCURRENTLY idx_services_search_optimization;
-- ANALYZE services, users, professional_profiles, projects, reviews;

-- Monitor index bloat
CREATE OR REPLACE FUNCTION check_index_bloat() 
RETURNS TABLE(
  table_name text,
  index_name text,
  bloat_ratio numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    indexname as index_name,
    ROUND(
      CASE WHEN idx_tuple_count > 0 
      THEN (idx_pages::numeric / idx_tuple_count) * 100 
      ELSE 0 END, 2
    ) as bloat_ratio
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public'
  ORDER BY bloat_ratio DESC;
END;
$$ LANGUAGE plpgsql;