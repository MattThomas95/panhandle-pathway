-- Set the first user as admin automatically
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1)
  AND role != 'admin'; -- Only update if not already admin

-- Show the result
SELECT id, email, role, full_name, created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at ASC;
