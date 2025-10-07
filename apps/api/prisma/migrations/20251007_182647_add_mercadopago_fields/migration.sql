-- CreateEnum for additional payment statuses
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus_new') THEN
        CREATE TYPE "PaymentStatus_new" AS ENUM ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back', 'paid', 'released', 'disputed');
    END IF;
END $$;

-- Add new fields to payments table for MercadoPago integration
ALTER TABLE "payments" 
  ADD COLUMN IF NOT EXISTS "service_id" TEXT,
  ADD COLUMN IF NOT EXISTS "mp_payment_id" TEXT,
  ADD COLUMN IF NOT EXISTS "mp_preference_id" TEXT,
  ADD COLUMN IF NOT EXISTS "external_reference" TEXT,
  ADD COLUMN IF NOT EXISTS "status_detail" TEXT,
  ADD COLUMN IF NOT EXISTS "user_id" TEXT,
  ADD COLUMN IF NOT EXISTS "professional_id" TEXT,
  ADD COLUMN IF NOT EXISTS "payer_email" TEXT,
  ADD COLUMN IF NOT EXISTS "payer_name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "approval_url" TEXT,
  ADD COLUMN IF NOT EXISTS "transaction_data" JSONB;

-- Make job_id optional (nullable)
ALTER TABLE "payments" ALTER COLUMN "job_id" DROP NOT NULL;

-- Add constraints and indexes
ALTER TABLE "payments" ADD CONSTRAINT "payments_mp_payment_id_key" UNIQUE ("mp_payment_id");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "payments_service_id_idx" ON "payments"("service_id");
CREATE INDEX IF NOT EXISTS "payments_user_id_idx" ON "payments"("user_id");
CREATE INDEX IF NOT EXISTS "payments_professional_id_idx" ON "payments"("professional_id");
CREATE INDEX IF NOT EXISTS "payments_mp_payment_id_idx" ON "payments"("mp_payment_id");
CREATE INDEX IF NOT EXISTS "payments_external_reference_idx" ON "payments"("external_reference");

-- Create PaymentPreference table
CREATE TABLE IF NOT EXISTS "payment_preferences" (
    "id" TEXT NOT NULL,
    "mp_preference_id" TEXT NOT NULL,
    "external_reference" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "payer_email" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT,
    "job_id" TEXT,
    "professional_id" TEXT,
    "success_url" TEXT,
    "failure_url" TEXT,
    "pending_url" TEXT,
    "init_point" TEXT,
    "sandbox_init_point" TEXT,
    "client_id" TEXT,
    "collector_id" INTEGER,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_preferences_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payment_preferences_mp_preference_id_key" UNIQUE ("mp_preference_id")
);

-- Create indexes for PaymentPreference
CREATE INDEX IF NOT EXISTS "payment_preferences_user_id_idx" ON "payment_preferences"("user_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_professional_id_idx" ON "payment_preferences"("professional_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_service_id_idx" ON "payment_preferences"("service_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_job_id_idx" ON "payment_preferences"("job_id");
CREATE INDEX IF NOT EXISTS "payment_preferences_mp_preference_id_idx" ON "payment_preferences"("mp_preference_id");

-- Add foreign key constraints if users table exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Add foreign keys for payments table
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payments_user_id_fkey') THEN
            ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payments_professional_id_fkey') THEN
            ALTER TABLE "payments" ADD CONSTRAINT "payments_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        -- Add foreign keys for payment_preferences table
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payment_preferences_user_id_fkey') THEN
            ALTER TABLE "payment_preferences" ADD CONSTRAINT "payment_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payment_preferences_professional_id_fkey') THEN
            ALTER TABLE "payment_preferences" ADD CONSTRAINT "payment_preferences_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Add foreign key constraints for services table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payments_service_id_fkey') THEN
            ALTER TABLE "payments" ADD CONSTRAINT "payments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payment_preferences_service_id_fkey') THEN
            ALTER TABLE "payment_preferences" ADD CONSTRAINT "payment_preferences_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Add foreign key constraints for jobs table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'jobs') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'payment_preferences_job_id_fkey') THEN
            ALTER TABLE "payment_preferences" ADD CONSTRAINT "payment_preferences_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- Update PaymentStatus enum values (this needs to be done carefully in production)
-- For now, we'll just ensure the new enum exists and can be used

-- Add trigger to update updated_at timestamp for payment_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_payment_preferences_updated_at') THEN
        CREATE TRIGGER update_payment_preferences_updated_at 
            BEFORE UPDATE ON payment_preferences 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;