-- Add shipping/tracking number to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT;

COMMENT ON COLUMN orders.shipping_tracking_number IS 'Carrier tracking number or fulfillment reference for the order';
