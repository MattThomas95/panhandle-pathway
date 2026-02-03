-- Fix permissions for site_settings for authenticated users
GRANT SELECT ON site_settings TO authenticated;
GRANT SELECT ON site_settings TO anon;

-- Ensure service_role has all permissions
ALTER TABLE site_settings OWNER TO postgres;
