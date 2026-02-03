-- Grant public access to site_settings table for anon role
GRANT SELECT ON site_settings TO anon;

-- Grant admin access for updates (authenticated users)
GRANT INSERT, UPDATE, DELETE ON site_settings TO authenticated;
