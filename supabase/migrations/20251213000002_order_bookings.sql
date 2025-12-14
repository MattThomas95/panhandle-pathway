-- Link bookings to orders without overloading order_items
CREATE TABLE order_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id),
  slot_id UUID REFERENCES time_slots(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_bookings_order_id ON order_bookings(order_id);
CREATE INDEX idx_order_bookings_booking_id ON order_bookings(booking_id);

ALTER TABLE order_bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own order bookings
CREATE POLICY "Users can view their order bookings"
  ON order_bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Users can insert rows tied to their orders
CREATE POLICY "Users can insert their order bookings"
  ON order_bookings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_bookings.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Admins can manage all rows
CREATE POLICY "Admins manage order bookings"
  ON order_bookings FOR ALL
  USING (true)
  WITH CHECK (true);

GRANT ALL ON order_bookings TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
