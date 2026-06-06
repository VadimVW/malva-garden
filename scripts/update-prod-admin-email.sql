-- §7.23.6 — one-time prod: replace dev seed admin email with domain address.
-- Run on VPS (adjust email if needed):
--
--   docker compose -f docker-compose.prod.yml --env-file .env exec db \
--     psql -U malva -d malva_garden -f - < scripts/update-prod-admin-email.sql
--
-- Or paste into psql interactively.

UPDATE "AdminUser"
SET email = 'info@malva-garden.com'
WHERE email = 'admin@malva.local';

-- Verify:
-- SELECT id, email FROM "AdminUser";
