-- Create a diagnostic function to check what auth.uid() returns
CREATE OR REPLACE FUNCTION get_current_auth_uid()
RETURNS TABLE (
  current_uid uuid,
  has_admin_profile boolean,
  profile_role text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth.uid() as current_uid,
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    ) as has_admin_profile,
    (SELECT role FROM profiles WHERE id = auth.uid()) as profile_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
