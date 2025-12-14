Backend
- Added `order_bookings` linking table with RLS/policies (migration `20251213000002_order_bookings.sql`) to tie orders to bookings.
- Checkout API now carries booking metadata to Stripe, supports booking line items, and totals from cart prices.
- Webhook on payment success creates bookings linked to orders and increments slot counts; on refund/failure it restores capacity and cancels bookings.

Admin
- React Admin headers use a minimal logo-only variant so page UI isn’t hidden.
- Added Create buttons to all admin lists (services, products, organizations, profiles, time slots) and cleaned “Export CSV” labels.
- Time slots list keeps bulk delete and CSV export, with cleaned-up labels.

Customer-facing UX
- Site header nav labels updated to “Store” and “Book Training”; admin nav hidden for customers.
- Booking page shows all upcoming slots (even if full), requires sign-in, surfaces notices, prevents booking full slots, and lets users add to cart or book.
- Orders page now scopes to the signed-in user (no global leak), displays linked bookings/members, and supports cancellation; dashboard shows a 3-order snapshot with link to “View all orders.”
- Auth/login UI centered in a simplified panel; account page styling improved.
