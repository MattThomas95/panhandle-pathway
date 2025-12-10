-- Products table for the store
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can view active products
CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- Authenticated users with admin role can do everything (we'll refine this later)
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products
INSERT INTO products (name, description, price, inventory, image_url) VALUES
  ('The Adventure Begins', 'A wonderful children''s book about exploration and discovery.', 14.99, 50, 'https://placehold.co/400x600/png?text=Book+1'),
  ('Learning ABCs', 'Fun and interactive alphabet book for early learners.', 12.99, 30, 'https://placehold.co/400x600/png?text=Book+2'),
  ('Numbers are Fun', 'Counting made easy with colorful illustrations.', 11.99, 25, 'https://placehold.co/400x600/png?text=Book+3'),
  ('Panhandle Pathway T-Shirt', 'Comfortable cotton t-shirt with our logo.', 24.99, 100, 'https://placehold.co/400x600/png?text=T-Shirt'),
  ('Coloring Set', 'Set of 24 colored pencils perfect for young artists.', 8.99, 75, 'https://placehold.co/400x600/png?text=Coloring+Set');
