-- FIXIA MARKETPLACE - OPTIMIZED QUERIES
-- High-performance query implementations for critical marketplace operations
-- Target: <100ms execution time for 95% of operations

-- ================================================================
-- 1. OPTIMIZED SERVICE SEARCH QUERY
-- ================================================================

-- Replace the current service search with optimized version
CREATE OR REPLACE FUNCTION search_services_optimized(
  p_category_id UUID DEFAULT NULL,
  p_location TEXT DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_search_text TEXT DEFAULT NULL,
  p_rating_min DECIMAL DEFAULT NULL,
  p_professional_level TEXT DEFAULT NULL,
  p_verified_only BOOLEAN DEFAULT FALSE,
  p_featured_only BOOLEAN DEFAULT FALSE,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc',
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  service_id UUID,
  title TEXT,
  description TEXT,
  price DECIMAL,
  main_image TEXT,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  professional_id UUID,
  professional_name TEXT,
  professional_avatar TEXT,
  professional_location TEXT,
  professional_verified BOOLEAN,
  professional_rating DECIMAL,
  professional_review_count INTEGER,
  professional_level TEXT,
  category_name TEXT,
  category_slug TEXT,
  category_icon TEXT,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.title,
    s.description,
    s.price,
    s.main_image,
    s.view_count,
    s.created_at,
    u.id,
    u.name,
    u.avatar,
    u.location,
    u.verified,
    COALESCE(pp.rating, 0.0),
    COALESCE(pp.review_count, 0),
    pp.level::TEXT,
    c.name,
    c.slug,
    c.icon,
    COUNT(r.id) as review_count
  FROM services s
  INNER JOIN users u ON s.professional_id = u.id
  LEFT JOIN professional_profiles pp ON u.id = pp.user_id
  LEFT JOIN categories c ON s.category_id = c.id
  LEFT JOIN reviews r ON s.id = r.service_id
  WHERE s.active = true
    AND u.deleted_at IS NULL
    AND (p_category_id IS NULL OR s.category_id = p_category_id)
    AND (p_location IS NULL OR u.location ILIKE '%' || p_location || '%')
    AND (p_min_price IS NULL OR s.price >= p_min_price)
    AND (p_max_price IS NULL OR s.price <= p_max_price)
    AND (p_rating_min IS NULL OR pp.rating >= p_rating_min)
    AND (p_professional_level IS NULL OR pp.level::TEXT = p_professional_level)
    AND (NOT p_verified_only OR u.verified = true)
    AND (NOT p_featured_only OR s.featured = true)
    AND (p_search_text IS NULL OR 
         to_tsvector('spanish', s.title || ' ' || s.description) @@ plainto_tsquery('spanish', p_search_text)
         OR s.tags && ARRAY[p_search_text])
  GROUP BY s.id, u.id, pp.id, c.id
  ORDER BY 
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'asc' THEN s.price END ASC,
    CASE WHEN p_sort_by = 'price' AND p_sort_order = 'desc' THEN s.price END DESC,
    CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'desc' THEN pp.rating END DESC,
    CASE WHEN p_sort_by = 'rating' AND p_sort_order = 'asc' THEN pp.rating END ASC,
    CASE WHEN p_sort_by = 'popular' AND p_sort_order = 'desc' THEN s.view_count END DESC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN s.created_at END DESC,
    s.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. OPTIMIZED PROFESSIONAL MATCHING QUERY
-- ================================================================

CREATE OR REPLACE FUNCTION find_matching_professionals(
  p_skills TEXT[],
  p_location TEXT DEFAULT NULL,
  p_min_rating DECIMAL DEFAULT NULL,
  p_availability_status TEXT DEFAULT 'available',
  p_response_time_max INTEGER DEFAULT 48,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  professional_id UUID,
  name TEXT,
  avatar TEXT,
  location TEXT,
  verified BOOLEAN,
  bio TEXT,
  specialties TEXT[],
  rating DECIMAL,
  review_count INTEGER,
  level TEXT,
  response_time_hours INTEGER,
  availability_status TEXT,
  match_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar,
    u.location,
    u.verified,
    pp.bio,
    pp.specialties,
    COALESCE(pp.rating, 0.0),
    COALESCE(pp.review_count, 0),
    pp.level::TEXT,
    pp.response_time_hours,
    pp.availability_status::TEXT,
    -- Calculate match score based on skills overlap
    CASE 
      WHEN p_skills IS NULL THEN 0
      ELSE array_length(pp.specialties & p_skills, 1)
    END as match_score
  FROM users u
  INNER JOIN professional_profiles pp ON u.id = pp.user_id
  WHERE u.user_type = 'professional'
    AND u.deleted_at IS NULL
    AND u.verified = true
    AND pp.availability_status::TEXT = p_availability_status
    AND (p_location IS NULL OR u.location ILIKE '%' || p_location || '%')
    AND (p_min_rating IS NULL OR pp.rating >= p_min_rating)
    AND (p_response_time_max IS NULL OR pp.response_time_hours <= p_response_time_max)
    AND (p_skills IS NULL OR pp.specialties && p_skills)
  ORDER BY 
    match_score DESC,
    pp.rating DESC,
    pp.review_count DESC,
    u.verified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. OPTIMIZED DASHBOARD ANALYTICS QUERY
-- ================================================================

CREATE OR REPLACE FUNCTION get_professional_dashboard_stats(p_user_id UUID)
RETURNS TABLE(
  total_services INTEGER,
  active_services INTEGER,
  total_proposals INTEGER,
  pending_proposals INTEGER,
  average_rating DECIMAL,
  review_count INTEGER,
  profile_views INTEGER,
  total_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH service_stats AS (
    SELECT 
      COUNT(*) as total_services,
      COUNT(*) FILTER (WHERE active = true) as active_services
    FROM services 
    WHERE professional_id = p_user_id
  ),
  proposal_stats AS (
    SELECT 
      COUNT(*) as total_proposals,
      COUNT(*) FILTER (WHERE status = 'pending') as pending_proposals
    FROM proposals 
    WHERE professional_id = p_user_id
  ),
  review_stats AS (
    SELECT 
      COALESCE(AVG(rating), 0.0) as average_rating,
      COUNT(*) as review_count
    FROM reviews 
    WHERE professional_id = p_user_id
  ),
  view_stats AS (
    SELECT COUNT(*) as profile_views
    FROM service_views sv
    INNER JOIN services s ON sv.service_id = s.id
    WHERE s.professional_id = p_user_id
  ),
  earnings_stats AS (
    SELECT COALESCE(total_earnings, 0.0) as total_earnings
    FROM professional_profiles
    WHERE user_id = p_user_id
  )
  SELECT 
    ss.total_services::INTEGER,
    ss.active_services::INTEGER,
    ps.total_proposals::INTEGER,
    ps.pending_proposals::INTEGER,
    rs.average_rating,
    rs.review_count::INTEGER,
    vs.profile_views::INTEGER,
    es.total_earnings
  FROM service_stats ss
  CROSS JOIN proposal_stats ps
  CROSS JOIN review_stats rs
  CROSS JOIN view_stats vs
  CROSS JOIN earnings_stats es;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. OPTIMIZED PROJECT DISCOVERY QUERY
-- ================================================================

CREATE OR REPLACE FUNCTION discover_projects_for_professional(
  p_professional_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  project_id UUID,
  title TEXT,
  description TEXT,
  budget_min DECIMAL,
  budget_max DECIMAL,
  deadline TIMESTAMPTZ,
  location TEXT,
  skills_required TEXT[],
  proposals_count INTEGER,
  created_at TIMESTAMPTZ,
  client_name TEXT,
  client_location TEXT,
  client_verified BOOLEAN,
  category_name TEXT,
  skill_match_score INTEGER
) AS $$
DECLARE
  professional_skills TEXT[];
BEGIN
  -- Get professional's skills
  SELECT specialties INTO professional_skills
  FROM professional_profiles 
  WHERE user_id = p_professional_id;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.description,
    p.budget_min,
    p.budget_max,
    p.deadline,
    p.location,
    p.skills_required,
    p.proposals_count,
    p.created_at,
    u.name,
    u.location,
    u.verified,
    c.name,
    -- Calculate skill match score
    CASE 
      WHEN professional_skills IS NULL OR p.skills_required IS NULL THEN 0
      ELSE array_length(professional_skills & p.skills_required, 1)
    END as skill_match_score
  FROM projects p
  INNER JOIN users u ON p.client_id = u.id
  LEFT JOIN categories c ON p.category_id = c.id
  WHERE p.status = 'open'
    AND u.deleted_at IS NULL
    -- Exclude projects where professional already submitted proposal
    AND NOT EXISTS (
      SELECT 1 FROM proposals pr 
      WHERE pr.project_id = p.id 
        AND pr.professional_id = p_professional_id
    )
  ORDER BY 
    skill_match_score DESC,
    p.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 5. OPTIMIZED NOTIFICATION DELIVERY QUERY
-- ================================================================

CREATE OR REPLACE FUNCTION get_unread_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  notification_id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  action_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type::TEXT,
    n.title,
    n.message,
    n.action_url,
    n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND n.read = false
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. MARKETPLACE ANALYTICS QUERIES
-- ================================================================

-- Top performing categories
CREATE OR REPLACE FUNCTION get_top_categories(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  category_id UUID,
  category_name TEXT,
  service_count INTEGER,
  avg_service_price DECIMAL,
  total_views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.service_count,
    COALESCE(AVG(s.price), 0) as avg_service_price,
    COALESCE(SUM(s.view_count), 0)::INTEGER as total_views
  FROM categories c
  LEFT JOIN services s ON c.id = s.category_id AND s.active = true
  GROUP BY c.id, c.name, c.service_count
  ORDER BY c.service_count DESC, total_views DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- User engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_users INTEGER,
  active_users INTEGER,
  new_registrations INTEGER,
  professionals_count INTEGER,
  clients_count INTEGER,
  services_created INTEGER,
  projects_created INTEGER,
  proposals_submitted INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_users,
    COUNT(*) FILTER (WHERE updated_at >= p_start_date)::INTEGER as active_users,
    COUNT(*) FILTER (WHERE created_at >= p_start_date)::INTEGER as new_registrations,
    COUNT(*) FILTER (WHERE user_type = 'professional')::INTEGER as professionals_count,
    COUNT(*) FILTER (WHERE user_type = 'client')::INTEGER as clients_count,
    (SELECT COUNT(*)::INTEGER FROM services WHERE created_at >= p_start_date) as services_created,
    (SELECT COUNT(*)::INTEGER FROM projects WHERE created_at >= p_start_date) as projects_created,
    (SELECT COUNT(*)::INTEGER FROM proposals WHERE created_at >= p_start_date) as proposals_submitted
  FROM users 
  WHERE deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;