-- CreateTable
CREATE TABLE IF NOT EXISTS "favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT,
    "professional_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_id_service_id_key" ON "favorites"("user_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "favorites_user_id_professional_id_key" ON "favorites"("user_id", "professional_id");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT IF NOT EXISTS "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
