-- Script para actualizar tu usuario a profesional
-- Ejecuta esto en tu base de datos PostgreSQL

UPDATE "User"
SET user_type = 'professional'
WHERE email = 'mmata@chubut.gov.ar'
  AND is_professional_active = true;

-- Verificar que se actualizó correctamente
SELECT
  email,
  user_type,
  is_professional_active,
  subscription_type,
  subscription_status,
  subscription_expires_at
FROM "User"
WHERE email = 'mmata@chubut.gov.ar';
