-- Initial schema migration
-- Add your tables here

-- Example table:
-- CREATE TABLE posts (
--   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
--   title TEXT NOT NULL,
--   content TEXT,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Enable Row Level Security (RLS)
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- CREATE POLICY "Public posts are viewable by everyone"
--   ON posts FOR SELECT
--   USING (true);
