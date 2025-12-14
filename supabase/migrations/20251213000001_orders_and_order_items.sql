-- Orders table for e-commerce
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled', 'refunded')),
  total DECIMAL(10, 2) NOT NULL,
  stripe_payment_id TEXT,
  stripe_payment_status TEXT,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (line items for each order)
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase (in case product price changes later)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending orders (for cancellation)
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can manage all orders
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for order_items
-- Users can view items from their own orders
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can create order items for their own orders
CREATE POLICY "Users can create their own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all order items
CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions to authenticated role
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate order total from order items
CREATE OR REPLACE FUNCTION calculate_order_total(order_id_input UUID)
RETURNS DECIMAL(10, 2) AS $$
  SELECT COALESCE(SUM(quantity * price), 0)
  FROM order_items
  WHERE order_id = order_id_input;
$$ LANGUAGE SQL STABLE;

-- Function to update product inventory after order
CREATE OR REPLACE FUNCTION update_product_inventory_on_order()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease inventory when order item is created
    UPDATE products
    SET inventory = inventory - NEW.quantity
    WHERE id = NEW.product_id
    AND inventory >= NEW.quantity;

    -- Check if update was successful (inventory was sufficient)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', NEW.product_id;
    END IF;

    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Restore inventory when order item is deleted (e.g., order cancelled)
    UPDATE products
    SET inventory = inventory + OLD.quantity
    WHERE id = OLD.product_id;

    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust inventory when quantity changes
    UPDATE products
    SET inventory = inventory + OLD.quantity - NEW.quantity
    WHERE id = NEW.product_id
    AND inventory >= (NEW.quantity - OLD.quantity);

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient inventory for product %', NEW.product_id;
    END IF;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update inventory when order items change
CREATE TRIGGER update_inventory_on_order_item_change
  AFTER INSERT OR UPDATE OR DELETE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_product_inventory_on_order();
