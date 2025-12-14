-- Sample Orders Test Data
-- Copy this entire file and paste into Supabase SQL Editor

DO $$
DECLARE
  v_user_id uuid := '5d20ea0c-987d-4b6f-8019-cffc9a73cad6';
  v_order_id uuid;
  v_product_1 uuid;
  v_product_2 uuid;
  v_product_3 uuid;
BEGIN
  -- Get product IDs
  SELECT id INTO v_product_1 FROM products WHERE name = 'The Adventure Begins';
  SELECT id INTO v_product_2 FROM products WHERE name = 'Learning ABCs';
  SELECT id INTO v_product_3 FROM products WHERE name = 'Panhandle Pathway T-Shirt';

  -- Create Order #1 - Completed
  INSERT INTO orders (user_id, status, total, stripe_payment_id, stripe_payment_status, shipping_address, notes)
  VALUES (
    v_user_id,
    'completed',
    42.97,
    'pi_test_1234567890',
    'succeeded',
    '{"name": "John Doe", "line1": "123 Main St", "city": "Austin", "state": "TX", "postal_code": "78701", "country": "US"}'::jsonb,
    'Customer requested gift wrapping'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES
    (v_order_id, v_product_1, 2, 14.99),
    (v_order_id, v_product_2, 1, 12.99);

  -- Create Order #2 - Pending
  INSERT INTO orders (user_id, status, total, notes)
  VALUES (
    v_user_id,
    'pending',
    24.99,
    'Awaiting payment'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES (v_order_id, v_product_3, 1, 24.99);

  -- Create Order #3 - Processing
  INSERT INTO orders (user_id, status, total, stripe_payment_id, stripe_payment_status)
  VALUES (
    v_user_id,
    'processing',
    59.96,
    'pi_test_9876543210',
    'succeeded'
  )
  RETURNING id INTO v_order_id;

  INSERT INTO order_items (order_id, product_id, quantity, price)
  VALUES
    (v_order_id, v_product_1, 1, 14.99),
    (v_order_id, v_product_2, 1, 12.99),
    (v_order_id, v_product_3, 1, 24.99);

  RAISE NOTICE 'Sample orders created successfully!';
END $$;

-- Verify the orders were created
SELECT
  o.id,
  o.status,
  o.total,
  o.stripe_payment_id,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, o.status, o.total, o.stripe_payment_id, o.created_at
ORDER BY o.created_at DESC;
