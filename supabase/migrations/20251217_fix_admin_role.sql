-- Check current user's profile and role
-- Run this to see your current role:
SELECT id, email, role, full_name FROM profiles ORDER BY created_at DESC LIMIT 5;

-- Update your profile to have admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';

-- Alternative: Set the first user as admin
UPDATE profiles
SET role = 'admin'
WHERE id = (SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1);

-- Verify the update
SELECT id, email, role, full_name FROM profiles WHERE role = 'admin';
