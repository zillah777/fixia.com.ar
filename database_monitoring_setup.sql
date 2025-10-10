-- FIXIA MARKETPLACE - DATABASE MONITORING & ALERTING SETUP
-- Comprehensive database performance monitoring and alerting system
-- Production-ready monitoring for marketplace operations

-- ================================================================
-- 1. PERFORMANCE MONITORING TABLES
-- ================================================================

-- Query performance tracking
CREATE TABLE IF NOT EXISTS query_performance_log (
  id SERIAL PRIMARY KEY,
  query_hash TEXT NOT NULL,
  query_text TEXT,
  execution_time_ms DECIMAL(10,3) NOT NULL,
  rows_examined BIGINT,
  rows_returned BIGINT,
  user_id UUID,
  endpoint TEXT,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  database_name TEXT DEFAULT current_database()
);

CREATE INDEX IF NOT EXISTS idx_query_perf_hash_time 
ON query_performance_log (query_hash, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_perf_slow 
ON query_performance_log (execution_time_ms DESC, occurred_at DESC)
WHERE execution_time_ms > 100;

-- Database connection monitoring
CREATE TABLE IF NOT EXISTS connection_monitoring (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  active_connections INTEGER NOT NULL,
  idle_connections INTEGER NOT NULL,
  total_connections INTEGER NOT NULL,
  max_connections INTEGER NOT NULL,
  connection_utilization DECIMAL(5,2) NOT NULL,
  waiting_connections INTEGER DEFAULT 0,
  database_name TEXT DEFAULT current_database()
);

-- Index usage monitoring
CREATE TABLE IF NOT EXISTS index_usage_log (
  id SERIAL PRIMARY KEY,
  schema_name TEXT NOT NULL,
  table_name TEXT NOT NULL,
  index_name TEXT NOT NULL,
  scans BIGINT NOT NULL,
  tuples_read BIGINT NOT NULL,
  tuples_fetched BIGINT NOT NULL,
  usage_ratio DECIMAL(5,4) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Database size monitoring
CREATE TABLE IF NOT EXISTS database_size_log (
  id SERIAL PRIMARY KEY,
  database_name TEXT NOT NULL,
  total_size_bytes BIGINT NOT NULL,
  total_size_mb DECIMAL(10,2) NOT NULL,
  table_sizes JSONB NOT NULL,
  index_sizes JSONB NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error and deadlock monitoring
CREATE TABLE IF NOT EXISTS database_errors_log (
  id SERIAL PRIMARY KEY,
  error_type TEXT NOT NULL,
  error_code TEXT,
  error_message TEXT NOT NULL,
  query_text TEXT,
  user_id UUID,
  session_id TEXT,
  database_name TEXT DEFAULT current_database(),
  occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 2. MONITORING FUNCTIONS
-- ================================================================

-- Function to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query(
  p_query_text TEXT,
  p_execution_time_ms DECIMAL,
  p_rows_examined BIGINT DEFAULT NULL,
  p_rows_returned BIGINT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO query_performance_log (
    query_hash,
    query_text,
    execution_time_ms,
    rows_examined,
    rows_returned,
    user_id,
    endpoint
  ) VALUES (
    md5(p_query_text),
    p_query_text,
    p_execution_time_ms,
    p_rows_examined,
    p_rows_returned,
    p_user_id,
    p_endpoint
  );
END;
$$ LANGUAGE plpgsql;

-- Function to monitor database connections
CREATE OR REPLACE FUNCTION monitor_database_connections()
RETURNS VOID AS $$
DECLARE
  conn_stats RECORD;
BEGIN
  SELECT 
    COUNT(*) FILTER (WHERE state = 'active') as active,
    COUNT(*) FILTER (WHERE state = 'idle') as idle,
    COUNT(*) as total,
    (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as max_conn,
    COUNT(*) FILTER (WHERE wait_event IS NOT NULL) as waiting
  INTO conn_stats
  FROM pg_stat_activity
  WHERE datname = current_database();

  INSERT INTO connection_monitoring (
    active_connections,
    idle_connections,
    total_connections,
    max_connections,
    connection_utilization,
    waiting_connections
  ) VALUES (
    conn_stats.active,
    conn_stats.idle,
    conn_stats.total,
    conn_stats.max_conn,
    ROUND((conn_stats.total::DECIMAL / conn_stats.max_conn) * 100, 2),
    conn_stats.waiting
  );
END;
$$ LANGUAGE plpgsql;

-- Function to monitor index usage
CREATE OR REPLACE FUNCTION monitor_index_usage()
RETURNS VOID AS $$
DECLARE
  idx_record RECORD;
BEGIN
  FOR idx_record IN
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch,
      CASE 
        WHEN idx_scan > 0 THEN ROUND(idx_tup_fetch::DECIMAL / idx_scan, 4)
        ELSE 0
      END as usage_ratio
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
  LOOP
    INSERT INTO index_usage_log (
      schema_name,
      table_name,
      index_name,
      scans,
      tuples_read,
      tuples_fetched,
      usage_ratio
    ) VALUES (
      idx_record.schemaname,
      idx_record.tablename,
      idx_record.indexname,
      idx_record.idx_scan,
      idx_record.idx_tup_read,
      idx_record.idx_tup_fetch,
      idx_record.usage_ratio
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to monitor database size
CREATE OR REPLACE FUNCTION monitor_database_size()
RETURNS VOID AS $$
DECLARE
  db_size BIGINT;
  table_sizes JSONB;
  index_sizes JSONB;
BEGIN
  -- Get total database size
  SELECT pg_database_size(current_database()) INTO db_size;
  
  -- Get table sizes
  SELECT jsonb_object_agg(
    tablename,
    pg_total_relation_size(schemaname||'.'||tablename)
  ) INTO table_sizes
  FROM pg_tables
  WHERE schemaname = 'public';
  
  -- Get index sizes
  SELECT jsonb_object_agg(
    indexname,
    pg_relation_size(schemaname||'.'||indexname)
  ) INTO index_sizes
  FROM pg_indexes
  WHERE schemaname = 'public';
  
  INSERT INTO database_size_log (
    database_name,
    total_size_bytes,
    total_size_mb,
    table_sizes,
    index_sizes
  ) VALUES (
    current_database(),
    db_size,
    ROUND(db_size / 1024.0 / 1024.0, 2),
    table_sizes,
    index_sizes
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. REAL-TIME MONITORING VIEWS
-- ================================================================

-- Current database health overview
CREATE OR REPLACE VIEW database_health_overview AS
SELECT 
  current_database() as database_name,
  NOW() as check_time,
  
  -- Connection stats
  COUNT(*) FILTER (WHERE state = 'active') as active_connections,
  COUNT(*) FILTER (WHERE state = 'idle') as idle_connections,
  COUNT(*) as total_connections,
  (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections') as max_connections,
  
  -- Performance stats
  (SELECT COUNT(*) FROM query_performance_log WHERE occurred_at > NOW() - INTERVAL '1 hour' AND execution_time_ms > 1000) as slow_queries_last_hour,
  (SELECT AVG(execution_time_ms) FROM query_performance_log WHERE occurred_at > NOW() - INTERVAL '1 hour') as avg_query_time_ms,
  
  -- Size stats
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  
  -- Cache hit ratio
  ROUND(
    (SELECT sum(blks_hit) * 100.0 / sum(blks_hit + blks_read) 
     FROM pg_stat_database 
     WHERE datname = current_database()), 2
  ) as cache_hit_ratio_pct

FROM pg_stat_activity
WHERE datname = current_database();

-- Slow queries analysis
CREATE OR REPLACE VIEW slow_queries_analysis AS
SELECT 
  query_hash,
  LEFT(query_text, 100) || '...' as query_preview,
  COUNT(*) as execution_count,
  AVG(execution_time_ms) as avg_execution_time,
  MAX(execution_time_ms) as max_execution_time,
  AVG(rows_examined) as avg_rows_examined,
  AVG(rows_returned) as avg_rows_returned,
  MAX(occurred_at) as last_execution
FROM query_performance_log
WHERE occurred_at > NOW() - INTERVAL '24 hours'
  AND execution_time_ms > 100
GROUP BY query_hash, query_text
ORDER BY avg_execution_time DESC, execution_count DESC;

-- Index efficiency analysis
CREATE OR REPLACE VIEW index_efficiency_analysis AS
SELECT 
  schemaname || '.' || tablename as table_name,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_tup_fetch::DECIMAL / idx_scan < 1 THEN 'LOW_EFFICIENCY'
    WHEN idx_tup_fetch::DECIMAL / idx_scan < 10 THEN 'MEDIUM_EFFICIENCY'
    ELSE 'HIGH_EFFICIENCY'
  END as efficiency_rating,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Table bloat analysis
CREATE OR REPLACE VIEW table_bloat_analysis AS
SELECT 
  schemaname || '.' || tablename as table_name,
  n_dead_tup as dead_tuples,
  n_live_tup as live_tuples,
  CASE 
    WHEN n_live_tup > 0 
    THEN ROUND((n_dead_tup::DECIMAL / n_live_tup) * 100, 2)
    ELSE 0
  END as bloat_ratio_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;

-- ================================================================
-- 4. ALERTING FUNCTIONS
-- ================================================================

-- Function to check and alert on critical conditions
CREATE OR REPLACE FUNCTION check_database_alerts()
RETURNS TABLE(
  alert_type TEXT,
  severity TEXT,
  message TEXT,
  metric_value DECIMAL,
  threshold_value DECIMAL,
  check_time TIMESTAMPTZ
) AS $$
DECLARE
  conn_utilization DECIMAL;
  slow_query_count INTEGER;
  cache_hit_ratio DECIMAL;
  largest_table_size BIGINT;
  max_query_time DECIMAL;
BEGIN
  -- Check connection utilization
  SELECT 
    ROUND((COUNT(*)::DECIMAL / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections')) * 100, 2)
  INTO conn_utilization
  FROM pg_stat_activity
  WHERE datname = current_database();
  
  IF conn_utilization > 80 THEN
    RETURN QUERY SELECT 
      'HIGH_CONNECTION_USAGE'::TEXT,
      'CRITICAL'::TEXT,
      'Database connection usage is critically high'::TEXT,
      conn_utilization,
      80.00::DECIMAL,
      NOW();
  ELSIF conn_utilization > 60 THEN
    RETURN QUERY SELECT 
      'HIGH_CONNECTION_USAGE'::TEXT,
      'WARNING'::TEXT,
      'Database connection usage is high'::TEXT,
      conn_utilization,
      60.00::DECIMAL,
      NOW();
  END IF;
  
  -- Check slow queries
  SELECT COUNT(*)
  INTO slow_query_count
  FROM query_performance_log
  WHERE occurred_at > NOW() - INTERVAL '5 minutes'
    AND execution_time_ms > 1000;
  
  IF slow_query_count > 10 THEN
    RETURN QUERY SELECT 
      'SLOW_QUERIES'::TEXT,
      'CRITICAL'::TEXT,
      'High number of slow queries detected'::TEXT,
      slow_query_count::DECIMAL,
      10.00::DECIMAL,
      NOW();
  END IF;
  
  -- Check cache hit ratio
  SELECT 
    ROUND(sum(blks_hit) * 100.0 / sum(blks_hit + blks_read), 2)
  INTO cache_hit_ratio
  FROM pg_stat_database 
  WHERE datname = current_database();
  
  IF cache_hit_ratio < 95 THEN
    RETURN QUERY SELECT 
      'LOW_CACHE_HIT_RATIO'::TEXT,
      'WARNING'::TEXT,
      'Database cache hit ratio is below optimal'::TEXT,
      cache_hit_ratio,
      95.00::DECIMAL,
      NOW();
  END IF;
  
  -- Check for extremely slow queries
  SELECT MAX(execution_time_ms)
  INTO max_query_time
  FROM query_performance_log
  WHERE occurred_at > NOW() - INTERVAL '5 minutes';
  
  IF max_query_time > 5000 THEN
    RETURN QUERY SELECT 
      'EXTREMELY_SLOW_QUERY'::TEXT,
      'CRITICAL'::TEXT,
      'Query execution time exceeded 5 seconds'::TEXT,
      max_query_time,
      5000.00::DECIMAL,
      NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 5. AUTOMATED MONITORING PROCEDURES
-- ================================================================

-- Function to run all monitoring checks (call every minute)
CREATE OR REPLACE FUNCTION run_monitoring_cycle()
RETURNS BOOLEAN AS $$
BEGIN
  -- Monitor connections
  PERFORM monitor_database_connections();
  
  -- Monitor index usage (every 5 minutes)
  IF EXTRACT(minute FROM NOW()) % 5 = 0 THEN
    PERFORM monitor_index_usage();
  END IF;
  
  -- Monitor database size (every hour)
  IF EXTRACT(minute FROM NOW()) = 0 THEN
    PERFORM monitor_database_size();
  END IF;
  
  -- Clean old monitoring data (keep 7 days)
  DELETE FROM query_performance_log WHERE occurred_at < NOW() - INTERVAL '7 days';
  DELETE FROM connection_monitoring WHERE timestamp < NOW() - INTERVAL '7 days';
  DELETE FROM index_usage_log WHERE logged_at < NOW() - INTERVAL '7 days';
  DELETE FROM database_size_log WHERE logged_at < NOW() - INTERVAL '30 days';
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. PERFORMANCE BASELINE ESTABLISHMENT
-- ================================================================

-- Function to establish performance baselines
CREATE OR REPLACE FUNCTION establish_performance_baseline()
RETURNS TABLE(
  metric_name TEXT,
  baseline_value DECIMAL,
  measurement_unit TEXT,
  established_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'avg_query_time'::TEXT,
    COALESCE(AVG(execution_time_ms), 0),
    'milliseconds'::TEXT,
    NOW()
  FROM query_performance_log
  WHERE occurred_at > NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  SELECT 
    'connection_utilization'::TEXT,
    ROUND((COUNT(*)::DECIMAL / (SELECT setting::INTEGER FROM pg_settings WHERE name = 'max_connections')) * 100, 2),
    'percentage'::TEXT,
    NOW()
  FROM pg_stat_activity
  WHERE datname = current_database()
  
  UNION ALL
  
  SELECT 
    'cache_hit_ratio'::TEXT,
    ROUND(sum(blks_hit) * 100.0 / sum(blks_hit + blks_read), 2),
    'percentage'::TEXT,
    NOW()
  FROM pg_stat_database 
  WHERE datname = current_database()
  
  UNION ALL
  
  SELECT 
    'database_size_mb'::TEXT,
    ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2),
    'megabytes'::TEXT,
    NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 7. MONITORING DASHBOARD QUERIES
-- ================================================================

-- Query for real-time dashboard
CREATE OR REPLACE FUNCTION get_monitoring_dashboard()
RETURNS JSONB AS $$
DECLARE
  dashboard_data JSONB;
BEGIN
  SELECT jsonb_build_object(
    'database_health', (SELECT row_to_json(database_health_overview) FROM database_health_overview LIMIT 1),
    'active_alerts', (SELECT jsonb_agg(row_to_json(alerts)) FROM (SELECT * FROM check_database_alerts()) alerts),
    'slow_queries', (SELECT jsonb_agg(row_to_json(sq)) FROM (SELECT * FROM slow_queries_analysis LIMIT 10) sq),
    'connection_trend', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'timestamp', timestamp,
          'active', active_connections,
          'total', total_connections,
          'utilization', connection_utilization
        )
      )
      FROM connection_monitoring 
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      ORDER BY timestamp DESC
    ),
    'table_sizes', (
      SELECT jsonb_object_agg(
        tablename,
        pg_size_pretty(pg_total_relation_size('public.'||tablename))
      )
      FROM pg_tables
      WHERE schemaname = 'public'
    )
  ) INTO dashboard_data;
  
  RETURN dashboard_data;
END;
$$ LANGUAGE plpgsql;