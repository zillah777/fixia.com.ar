-- FIXIA DATABASE AUDIT SCRIPT
-- Date: November 1, 2025
-- Purpose: Verify all 25 Prisma models are correctly created in PostgreSQL

-- 1. COUNT TOTAL TABLES
SELECT COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. LIST ALL TABLES WITH ROW COUNTS
SELECT
    tablename,
    (SELECT COUNT(*) FROM information_schema.tables t WHERE t.tablename = information_schema.tables.tablename) as exists
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY tablename;

-- 3. DETAILED TABLE SCHEMA AUDIT
-- Check each critical table

-- Users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Professional Profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- Services
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'services'
ORDER BY ordinal_position;

-- Projects
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'projects'
ORDER BY ordinal_position;

-- Jobs
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'jobs'
ORDER BY ordinal_position;

-- Payments
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'payments'
ORDER BY ordinal_position;

-- Reviews
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'reviews'
ORDER BY ordinal_position;

-- Notifications
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- Verification Requests
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'verification_requests'
ORDER BY ordinal_position;

-- 4. CHECK INDEXES
SELECT
    t.relname as table_name,
    i.relname as index_name,
    a.attname as column_name
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relkind = 'r'
ORDER BY t.relname, i.relname;

-- 5. CHECK FOREIGN KEY RELATIONSHIPS
SELECT
    constraint_name,
    table_name,
    column_name,
    referenced_table_name,
    referenced_column_name
FROM information_schema.referential_constraints
WHERE constraint_schema = 'public';

-- 6. CHECK ENUM TYPES
SELECT
    t.typname,
    e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- 7. TABLE SIZES AND RECORD COUNTS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    (SELECT COUNT(*) FROM information_schema.tables t WHERE t.table_name = tablename) as row_count
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 8. IDENTIFY MISSING TABLES FROM PRISMA SCHEMA
-- Expected 25 tables
WITH expected_tables AS (
    VALUES
    ('users'),
    ('professional_profiles'),
    ('categories'),
    ('services'),
    ('projects'),
    ('proposals'),
    ('reviews'),
    ('conversations'),
    ('notifications'),
    ('user_sessions'),
    ('service_views'),
    ('user_activity'),
    ('password_reset_tokens'),
    ('email_verification_tokens'),
    ('password_history'),
    ('jobs'),
    ('job_milestones'),
    ('job_status_updates'),
    ('payments'),
    ('payment_preferences'),
    ('contact_interactions'),
    ('review_helpful_votes'),
    ('review_flags'),
    ('trust_scores'),
    ('verification_requests'),
    ('review_templates'),
    ('favorites'),
    ('feedbacks'),
    ('role_trust_scores')
)
SELECT
    et.column1 as expected_table,
    CASE WHEN it.tablename IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM expected_tables et
LEFT JOIN information_schema.tables it ON it.table_schema = 'public' AND it.tablename = et.column1
ORDER BY status DESC, et.column1;

-- 9. CHECK MIGRATION STATUS
SELECT version, installed_on FROM _prisma_migrations ORDER BY installed_on DESC LIMIT 10;
