-- FIXIA MARKETPLACE - DATA ANALYTICS TRACKING IMPLEMENTATION
-- Comprehensive business metrics tracking and event sourcing system
-- Real-time KPIs and data pipeline for business intelligence

-- ================================================================
-- 1. EVENT SOURCING INFRASTRUCTURE
-- ================================================================

-- Core events table for event sourcing
CREATE TABLE IF NOT EXISTS marketplace_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  user_id UUID,
  entity_id UUID,
  entity_type TEXT,
  event_data JSONB NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Indexes for event querying
CREATE INDEX IF NOT EXISTS idx_marketplace_events_type_created 
ON marketplace_events (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_events_user_created 
ON marketplace_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_events_entity 
ON marketplace_events (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_events_category_created 
ON marketplace_events (event_category, created_at DESC);

-- GIN index for JSONB event data queries
CREATE INDEX IF NOT EXISTS idx_marketplace_events_data_gin 
ON marketplace_events USING GIN (event_data);

-- ================================================================
-- 2. BUSINESS METRICS TRACKING TABLES
-- ================================================================

-- Daily business metrics aggregation
CREATE TABLE IF NOT EXISTS daily_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  new_users INTEGER DEFAULT 0,
  new_professionals INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  new_services INTEGER DEFAULT 0,
  new_projects INTEGER DEFAULT 0,
  new_proposals INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  service_views INTEGER DEFAULT 0,
  project_views INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  avg_service_price DECIMAL(10,2) DEFAULT 0,
  avg_project_budget DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_metrics_date 
ON daily_metrics (metric_date);

-- User cohort analysis table
CREATE TABLE IF NOT EXISTS user_cohorts (
  id SERIAL PRIMARY KEY,
  cohort_month DATE NOT NULL,
  user_type TEXT NOT NULL,
  period INTEGER NOT NULL, -- months since registration
  users_count INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  retention_rate DECIMAL(5,4) NOT NULL,
  revenue DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_cohorts_unique 
ON user_cohorts (cohort_month, user_type, period);

-- Service performance metrics
CREATE TABLE IF NOT EXISTS service_metrics (
  id SERIAL PRIMARY KEY,
  service_id UUID NOT NULL,
  metric_date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_service_metrics_unique 
ON service_metrics (service_id, metric_date);

-- ================================================================
-- 3. EVENT TRACKING FUNCTIONS
-- ================================================================

-- Generic event tracking function
CREATE OR REPLACE FUNCTION track_marketplace_event(
  p_event_type TEXT,
  p_event_category TEXT,
  p_user_id UUID DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_event_data JSONB DEFAULT '{}',
  p_metadata JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO marketplace_events (
    event_type, event_category, user_id, entity_id, entity_type,
    event_data, metadata, ip_address, user_agent, session_id
  ) VALUES (
    p_event_type, p_event_category, p_user_id, p_entity_id, p_entity_type,
    p_event_data, p_metadata, p_ip_address, p_user_agent, p_session_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- User registration tracking
CREATE OR REPLACE FUNCTION track_user_registration(
  p_user_id UUID,
  p_user_type TEXT,
  p_referral_source TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN track_marketplace_event(
    'user_registered',
    'user_lifecycle',
    p_user_id,
    p_user_id,
    'user',
    jsonb_build_object(
      'user_type', p_user_type,
      'referral_source', p_referral_source
    ),
    jsonb_build_object('ip_address', p_ip_address),
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql;

-- Service interaction tracking
CREATE OR REPLACE FUNCTION track_service_interaction(
  p_interaction_type TEXT, -- 'view', 'click', 'inquiry', 'purchase'
  p_service_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_referral_page TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN track_marketplace_event(
    p_interaction_type,
    'service_interaction',
    p_user_id,
    p_service_id,
    'service',
    jsonb_build_object(
      'interaction_type', p_interaction_type,
      'referral_page', p_referral_page
    ),
    '{}',
    p_ip_address
  );
END;
$$ LANGUAGE plpgsql;

-- Project interaction tracking
CREATE OR REPLACE FUNCTION track_project_interaction(
  p_interaction_type TEXT, -- 'view', 'proposal_submit', 'proposal_accept'
  p_project_id UUID,
  p_user_id UUID,
  p_proposal_amount DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
BEGIN
  RETURN track_marketplace_event(
    p_interaction_type,
    'project_interaction',
    p_user_id,
    p_project_id,
    'project',
    jsonb_build_object(
      'interaction_type', p_interaction_type,
      'proposal_amount', p_proposal_amount
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. REAL-TIME METRICS CALCULATION
-- ================================================================

-- Calculate daily metrics (run daily via cron)
CREATE OR REPLACE FUNCTION calculate_daily_metrics(
  p_date DATE DEFAULT CURRENT_DATE - INTERVAL '1 day'
)
RETURNS BOOLEAN AS $$
DECLARE
  metrics_row daily_metrics%ROWTYPE;
BEGIN
  -- Calculate metrics for the specified date
  SELECT 
    p_date,
    COUNT(*) FILTER (WHERE event_type = 'user_registered'),
    COUNT(*) FILTER (WHERE event_type = 'user_registered' AND event_data->>'user_type' = 'professional'),
    COUNT(*) FILTER (WHERE event_type = 'user_registered' AND event_data->>'user_type' = 'client'),
    COUNT(*) FILTER (WHERE event_type = 'service_created'),
    COUNT(*) FILTER (WHERE event_type = 'project_created'),
    COUNT(*) FILTER (WHERE event_type = 'proposal_submit'),
    COUNT(DISTINCT user_id) FILTER (WHERE event_category IN ('service_interaction', 'project_interaction')),
    COUNT(*) FILTER (WHERE event_type = 'view' AND entity_type = 'service'),
    COUNT(*) FILTER (WHERE event_type = 'view' AND entity_type = 'project'),
    0, -- conversion_rate (calculated separately)
    0, -- revenue (calculated separately)
    0, -- avg_service_price (calculated separately)
    0  -- avg_project_budget (calculated separately)
  INTO 
    metrics_row.metric_date,
    metrics_row.new_users,
    metrics_row.new_professionals,
    metrics_row.new_clients,
    metrics_row.new_services,
    metrics_row.new_projects,
    metrics_row.new_proposals,
    metrics_row.active_users,
    metrics_row.service_views,
    metrics_row.project_views,
    metrics_row.conversion_rate,
    metrics_row.revenue,
    metrics_row.avg_service_price,
    metrics_row.avg_project_budget
  FROM marketplace_events
  WHERE DATE(created_at) = p_date;

  -- Calculate additional metrics from database
  SELECT 
    COALESCE(AVG(price), 0),
    (SELECT COALESCE(AVG((budget_min + budget_max) / 2), 0) FROM projects WHERE DATE(created_at) = p_date)
  INTO 
    metrics_row.avg_service_price,
    metrics_row.avg_project_budget
  FROM services 
  WHERE DATE(created_at) = p_date;

  -- Insert or update daily metrics
  INSERT INTO daily_metrics (
    metric_date, new_users, new_professionals, new_clients,
    new_services, new_projects, new_proposals, active_users,
    service_views, project_views, conversion_rate, revenue,
    avg_service_price, avg_project_budget
  ) VALUES (
    metrics_row.metric_date, metrics_row.new_users, metrics_row.new_professionals,
    metrics_row.new_clients, metrics_row.new_services, metrics_row.new_projects,
    metrics_row.new_proposals, metrics_row.active_users, metrics_row.service_views,
    metrics_row.project_views, metrics_row.conversion_rate, metrics_row.revenue,
    metrics_row.avg_service_price, metrics_row.avg_project_budget
  )
  ON CONFLICT (metric_date) 
  DO UPDATE SET
    new_users = EXCLUDED.new_users,
    new_professionals = EXCLUDED.new_professionals,
    new_clients = EXCLUDED.new_clients,
    new_services = EXCLUDED.new_services,
    new_projects = EXCLUDED.new_projects,
    new_proposals = EXCLUDED.new_proposals,
    active_users = EXCLUDED.active_users,
    service_views = EXCLUDED.service_views,
    project_views = EXCLUDED.project_views,
    avg_service_price = EXCLUDED.avg_service_price,
    avg_project_budget = EXCLUDED.avg_project_budget,
    updated_at = NOW();

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 5. COHORT ANALYSIS FUNCTIONS
-- ================================================================

-- Calculate user cohort retention
CREATE OR REPLACE FUNCTION calculate_user_cohorts()
RETURNS BOOLEAN AS $$
DECLARE
  cohort_record RECORD;
BEGIN
  -- Calculate cohorts for each registration month
  FOR cohort_record IN 
    SELECT 
      DATE_TRUNC('month', created_at) as cohort_month,
      user_type
    FROM users 
    WHERE deleted_at IS NULL
    GROUP BY DATE_TRUNC('month', created_at), user_type
  LOOP
    -- Calculate retention for each period (0-12 months)
    INSERT INTO user_cohorts (cohort_month, user_type, period, users_count, active_users, retention_rate)
    SELECT 
      cohort_record.cohort_month,
      cohort_record.user_type,
      period_months,
      cohort_size,
      active_in_period,
      ROUND(active_in_period::DECIMAL / cohort_size, 4) as retention_rate
    FROM (
      SELECT 
        generate_series(0, 12) as period_months,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', u.created_at) = cohort_record.cohort_month) as cohort_size,
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', u.created_at) = cohort_record.cohort_month
          AND EXISTS (
            SELECT 1 FROM marketplace_events e 
            WHERE e.user_id = u.id 
            AND DATE_TRUNC('month', e.created_at) = cohort_record.cohort_month + (generate_series(0, 12) || ' months')::INTERVAL
          )
        ) as active_in_period
      FROM users u 
      WHERE u.user_type = cohort_record.user_type
        AND u.deleted_at IS NULL
    ) cohort_data
    WHERE cohort_size > 0
    ON CONFLICT (cohort_month, user_type, period) 
    DO UPDATE SET
      users_count = EXCLUDED.users_count,
      active_users = EXCLUDED.active_users,
      retention_rate = EXCLUDED.retention_rate;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. BUSINESS INTELLIGENCE VIEWS
-- ================================================================

-- KPI Dashboard View
CREATE OR REPLACE VIEW marketplace_kpis AS
SELECT 
  -- Current period metrics
  SUM(new_users) as total_new_users_30d,
  SUM(new_professionals) as total_new_professionals_30d,
  SUM(new_clients) as total_new_clients_30d,
  SUM(active_users) as total_active_users_30d,
  AVG(conversion_rate) as avg_conversion_rate_30d,
  SUM(revenue) as total_revenue_30d,
  AVG(avg_service_price) as avg_service_price_30d,
  
  -- Growth rates
  ROUND(
    (SUM(new_users) FILTER (WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days') * 4.3 - 
     SUM(new_users) FILTER (WHERE metric_date BETWEEN CURRENT_DATE - INTERVAL '37 days' AND CURRENT_DATE - INTERVAL '30 days') * 4.3)
    / NULLIF(SUM(new_users) FILTER (WHERE metric_date BETWEEN CURRENT_DATE - INTERVAL '37 days' AND CURRENT_DATE - INTERVAL '30 days') * 4.3, 0) * 100, 2
  ) as user_growth_rate_pct,
  
  -- Current totals
  (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
  (SELECT COUNT(*) FROM users WHERE user_type = 'professional' AND deleted_at IS NULL) as total_professionals,
  (SELECT COUNT(*) FROM services WHERE active = true) as total_active_services,
  (SELECT COUNT(*) FROM projects WHERE status = 'open') as total_open_projects
FROM daily_metrics 
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days';

-- Service performance view
CREATE OR REPLACE VIEW service_performance_dashboard AS
SELECT 
  s.id,
  s.title,
  s.price,
  u.name as professional_name,
  c.name as category_name,
  s.view_count,
  COUNT(r.id) as review_count,
  COALESCE(AVG(r.rating), 0) as avg_rating,
  -- Performance metrics from events
  COUNT(e.id) FILTER (WHERE e.event_type = 'view') as event_views,
  COUNT(e.id) FILTER (WHERE e.event_type = 'inquiry') as inquiries,
  ROUND(
    COUNT(e.id) FILTER (WHERE e.event_type = 'inquiry')::DECIMAL / 
    NULLIF(COUNT(e.id) FILTER (WHERE e.event_type = 'view'), 0) * 100, 2
  ) as inquiry_conversion_rate
FROM services s
JOIN users u ON s.professional_id = u.id
LEFT JOIN categories c ON s.category_id = c.id
LEFT JOIN reviews r ON s.id = r.service_id
LEFT JOIN marketplace_events e ON s.id = e.entity_id AND e.entity_type = 'service'
WHERE s.active = true
GROUP BY s.id, s.title, s.price, u.name, c.name, s.view_count
ORDER BY s.view_count DESC;

-- ================================================================
-- 7. AUTOMATED ANALYTICS PROCESSING
-- ================================================================

-- Function to process events and update metrics (run hourly)
CREATE OR REPLACE FUNCTION process_analytics_events()
RETURNS BOOLEAN AS $$
BEGIN
  -- Process unprocessed events
  UPDATE marketplace_events 
  SET processed_at = NOW()
  WHERE processed_at IS NULL;
  
  -- Update real-time counters
  UPDATE services SET view_count = (
    SELECT COUNT(*) FROM marketplace_events 
    WHERE entity_id = services.id 
      AND entity_type = 'service' 
      AND event_type = 'view'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;