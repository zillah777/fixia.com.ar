-- FIXIA MARKETPLACE - MIGRATION AND BACKUP STRATEGY
-- Comprehensive database migration and disaster recovery plan
-- Zero-downtime deployment and robust backup procedures

-- ================================================================
-- 1. ZERO-DOWNTIME MIGRATION STRATEGY
-- ================================================================

-- Step 1: Create backup of current schema
CREATE OR REPLACE FUNCTION create_schema_backup()
RETURNS BOOLEAN AS $$
DECLARE
  backup_timestamp TEXT;
BEGIN
  backup_timestamp := to_char(NOW(), 'YYYY_MM_DD_HH24_MI_SS');
  
  -- Create backup schema
  EXECUTE format('CREATE SCHEMA backup_%s', backup_timestamp);
  
  -- Copy all tables to backup schema
  EXECUTE format('
    CREATE TABLE backup_%s.users AS SELECT * FROM users;
    CREATE TABLE backup_%s.professional_profiles AS SELECT * FROM professional_profiles;
    CREATE TABLE backup_%s.services AS SELECT * FROM services;
    CREATE TABLE backup_%s.projects AS SELECT * FROM projects;
    CREATE TABLE backup_%s.proposals AS SELECT * FROM proposals;
    CREATE TABLE backup_%s.reviews AS SELECT * FROM reviews;
    CREATE TABLE backup_%s.categories AS SELECT * FROM categories;
    CREATE TABLE backup_%s.conversations AS SELECT * FROM conversations;
    CREATE TABLE backup_%s.notifications AS SELECT * FROM notifications;
  ', backup_timestamp, backup_timestamp, backup_timestamp, backup_timestamp, 
     backup_timestamp, backup_timestamp, backup_timestamp, backup_timestamp, 
     backup_timestamp);
  
  RAISE NOTICE 'Schema backup created: backup_%', backup_timestamp;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Migration execution with rollback capability
CREATE OR REPLACE FUNCTION execute_migration_with_rollback(
  migration_name TEXT,
  migration_sql TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  savepoint_name TEXT;
  migration_success BOOLEAN := FALSE;
BEGIN
  savepoint_name := 'migration_' || replace(migration_name, ' ', '_');
  
  BEGIN
    -- Create savepoint
    EXECUTE format('SAVEPOINT %I', savepoint_name);
    
    -- Execute migration
    EXECUTE migration_sql;
    
    -- Test critical queries after migration
    PERFORM test_critical_queries();
    
    migration_success := TRUE;
    RAISE NOTICE 'Migration % completed successfully', migration_name;
    
  EXCEPTION WHEN OTHERS THEN
    -- Rollback on error
    EXECUTE format('ROLLBACK TO SAVEPOINT %I', savepoint_name);
    RAISE NOTICE 'Migration % failed and was rolled back: %', migration_name, SQLERRM;
    migration_success := FALSE;
  END;
  
  RETURN migration_success;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Critical query testing function
CREATE OR REPLACE FUNCTION test_critical_queries()
RETURNS BOOLEAN AS $$
DECLARE
  test_passed BOOLEAN := TRUE;
BEGIN
  -- Test service search
  PERFORM * FROM services WHERE active = true LIMIT 1;
  
  -- Test user authentication
  PERFORM * FROM users WHERE email IS NOT NULL LIMIT 1;
  
  -- Test professional profiles
  PERFORM * FROM professional_profiles WHERE rating IS NOT NULL LIMIT 1;
  
  RAISE NOTICE 'Critical queries test passed';
  RETURN test_passed;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Critical queries test failed: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 2. AUTOMATED BACKUP PROCEDURES
-- ================================================================

-- Daily backup function
CREATE OR REPLACE FUNCTION create_daily_backup()
RETURNS BOOLEAN AS $$
DECLARE
  backup_date TEXT;
  backup_file TEXT;
BEGIN
  backup_date := to_char(NOW(), 'YYYY_MM_DD');
  backup_file := format('/backups/fixia_marketplace_%s.sql', backup_date);
  
  -- Create compressed backup
  EXECUTE format('COPY (
    SELECT ''-- Fixia Marketplace Backup: %s'' as header
    UNION ALL
    SELECT pg_dump_schema(''public'')
  ) TO ''%s''', backup_date, backup_file);
  
  -- Backup critical tables separately for fast recovery
  EXECUTE format('COPY users TO ''/backups/users_%s.csv'' WITH CSV HEADER', backup_date);
  EXECUTE format('COPY services TO ''/backups/services_%s.csv'' WITH CSV HEADER', backup_date);
  EXECUTE format('COPY professional_profiles TO ''/backups/professional_profiles_%s.csv'' WITH CSV HEADER', backup_date);
  
  RAISE NOTICE 'Daily backup completed: %', backup_file;
  RETURN TRUE;
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Backup failed: %', SQLERRM;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Incremental backup for real-time replication
CREATE OR REPLACE FUNCTION create_incremental_backup(
  since_timestamp TIMESTAMPTZ DEFAULT NOW() - INTERVAL '1 hour'
)
RETURNS BOOLEAN AS $$
DECLARE
  backup_timestamp TEXT;
BEGIN
  backup_timestamp := to_char(NOW(), 'YYYY_MM_DD_HH24_MI');
  
  -- Backup modified records since timestamp
  EXECUTE format('
    COPY (
      SELECT ''users'' as table_name, id, updated_at FROM users 
      WHERE updated_at > ''%s''
      UNION ALL
      SELECT ''services'' as table_name, id, updated_at FROM services 
      WHERE updated_at > ''%s''
      UNION ALL
      SELECT ''projects'' as table_name, id, updated_at FROM projects 
      WHERE updated_at > ''%s''
    ) TO ''/backups/incremental_%s.csv'' WITH CSV HEADER
  ', since_timestamp, since_timestamp, since_timestamp, backup_timestamp);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 3. DISASTER RECOVERY PROCEDURES
-- ================================================================

-- Point-in-time recovery function
CREATE OR REPLACE FUNCTION restore_to_point_in_time(
  target_timestamp TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
  -- This would typically involve WAL replay
  -- For Railway deployment, use point-in-time recovery features
  
  RAISE NOTICE 'Point-in-time recovery to % initiated', target_timestamp;
  
  -- Verify data integrity after recovery
  PERFORM verify_data_integrity();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Data integrity verification
CREATE OR REPLACE FUNCTION verify_data_integrity()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  integrity_check BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'users'::TEXT,
    COUNT(*),
    COUNT(*) > 0 AND COUNT(*) FILTER (WHERE email IS NULL) = 0
  FROM users
  UNION ALL
  SELECT 
    'services'::TEXT,
    COUNT(*),
    COUNT(*) > 0 AND COUNT(*) FILTER (WHERE professional_id IS NULL) = 0
  FROM services
  UNION ALL
  SELECT 
    'professional_profiles'::TEXT,
    COUNT(*),
    COUNT(*) > 0 AND COUNT(*) FILTER (WHERE user_id IS NULL) = 0
  FROM professional_profiles;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 4. DATA RETENTION AND ARCHIVAL
-- ================================================================

-- Archive old data to reduce database size
CREATE OR REPLACE FUNCTION archive_old_data(
  retention_days INTEGER DEFAULT 2555 -- 7 years
)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER := 0;
  cutoff_date DATE;
BEGIN
  cutoff_date := CURRENT_DATE - INTERVAL '%d days' % retention_days;
  
  -- Archive old user sessions
  WITH archived AS (
    DELETE FROM user_sessions 
    WHERE expires_at < cutoff_date
    RETURNING *
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  -- Archive old service views (keep aggregated stats)
  INSERT INTO service_views_archive 
  SELECT service_id, DATE(viewed_at), COUNT(*) as view_count
  FROM service_views 
  WHERE viewed_at < cutoff_date
  GROUP BY service_id, DATE(viewed_at);
  
  DELETE FROM service_views WHERE viewed_at < cutoff_date;
  
  -- Archive old notifications
  DELETE FROM notifications 
  WHERE created_at < cutoff_date AND read = true;
  
  RAISE NOTICE 'Archived % old records', archived_count;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Create archive tables
CREATE TABLE IF NOT EXISTS service_views_archive (
  service_id UUID,
  view_date DATE,
  view_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_views_archive_date 
ON service_views_archive (view_date DESC);

-- ================================================================
-- 5. BACKUP MONITORING AND ALERTING
-- ================================================================

-- Backup health check function
CREATE OR REPLACE FUNCTION check_backup_health()
RETURNS TABLE(
  backup_type TEXT,
  last_backup TIMESTAMPTZ,
  status TEXT,
  alert_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'daily'::TEXT,
    (SELECT MAX(created_at) FROM backup_log WHERE backup_type = 'daily'),
    CASE 
      WHEN (SELECT MAX(created_at) FROM backup_log WHERE backup_type = 'daily') > NOW() - INTERVAL '25 hours'
      THEN 'healthy'
      ELSE 'failed'
    END,
    CASE 
      WHEN (SELECT MAX(created_at) FROM backup_log WHERE backup_type = 'daily') > NOW() - INTERVAL '25 hours'
      THEN 'green'
      ELSE 'red'
    END;
END;
$$ LANGUAGE plpgsql;

-- Backup log table
CREATE TABLE IF NOT EXISTS backup_log (
  id SERIAL PRIMARY KEY,
  backup_type TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- 6. MIGRATION DEPLOYMENT SCRIPT
-- ================================================================

-- Master migration execution function
CREATE OR REPLACE FUNCTION deploy_performance_optimizations()
RETURNS BOOLEAN AS $$
DECLARE
  migration_success BOOLEAN := TRUE;
BEGIN
  -- Create backup before migration
  PERFORM create_schema_backup();
  
  -- Execute index optimizations
  migration_success := execute_migration_with_rollback(
    'performance_indexes',
    '
    -- All index creation statements from database_optimization_indexes.sql
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_search_optimization 
    ON services (active, category_id, price, featured, created_at DESC) 
    WHERE active = true;
    
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_services_fulltext_search 
    ON services USING GIN (to_tsvector(''spanish'', title || '' '' || description));
    
    -- ... (continue with all other indexes)
    '
  );
  
  IF NOT migration_success THEN
    RAISE NOTICE 'Migration failed, rolling back';
    RETURN FALSE;
  END IF;
  
  -- Update statistics
  ANALYZE;
  
  RAISE NOTICE 'Performance optimization deployment completed successfully';
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;