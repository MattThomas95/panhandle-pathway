# Production Deployment Guide

## 🚀 Deployment Checklist

### ✅ Completed:
- [x] Deployed to Vercel
- [x] Environment variables configured in Vercel
- [x] Stripe webhook configured

### 📋 To Do:
- [ ] Run database migrations on production Supabase
- [ ] Test the live site
- [ ] Create test data (services, products, time slots)
- [ ] Test booking flow
- [ ] Test payment flow
- [ ] Test email delivery

---

## Step 1: Run Database Migrations

**IMPORTANT:** Your production Supabase database needs all the schema migrations to work properly.

### Option A: Run Consolidated Migration (Recommended)

1. Open your **production** Supabase dashboard: https://supabase.com/dashboard/project/dadpflmdrtteonntqfkn

2. Go to **SQL Editor** (left sidebar)

3. Click **"+ New query"**

4. Copy the contents of `production_migrations.sql` (1103 lines) and paste into the editor

5. Click **"Run"** to execute all migrations at once

6. Verify success - you should see "Success. No rows returned"

### Option B: Run Individual Migrations

If you prefer to run migrations one by one (useful for debugging):

1. Open Supabase SQL Editor
2. Run each migration in order:
   - `supabase/migrations/20241209000000_initial_schema.sql`
   - `supabase/migrations/20241209000001_products.sql`
   - `supabase/migrations/20241209000002_auth_profiles.sql`
   - ... (continue with remaining 13 migrations)

### Critical Migrations:

**Multi-Day Booking Support:**
- `20251214000001_add_is_multi_day_to_services.sql` - Adds `is_multi_day` column to services

**Order Tracking:**
- `20251214000003_add_shipping_tracking_to_orders.sql` - Adds shipping/tracking fields
- `20251214000004_admin_tracking_rpcs.sql` - RPC functions for tracking updates

**Availability Management:**
- `20251214000005_slots_availability_rpc.sql` - RPC for slot availability

---

## Step 2: Verify Database Schema

After running migrations, verify these tables exist:

**Core Tables:**
- ✅ `profiles` - User profiles
- ✅ `organizations` - Organization management
- ✅ `services` - Bookable services
- ✅ `time_slots` - Available booking slots
- ✅ `bookings` - User bookings
- ✅ `products` - Store products
- ✅ `orders` - Customer orders
- ✅ `order_items` - Order line items
- ✅ `order_bookings` - Links orders to bookings

**Check in Supabase:**
1. Go to **Table Editor** (left sidebar)
2. Verify all tables are listed
3. Check that `services` table has `is_multi_day` column
4. Check that `orders` table has `shipping_tracking` and `shipping_carrier` columns

---

## Step 3: Create Test Data

### Create Admin User

1. Go to your live site: https://panhandle-pathway.vercel.app/auth/signup
2. Sign up with your email
3. Go to Supabase → **Table Editor** → `profiles`
4. Find your user and change `role` to `"admin"`

### Create Sample Service

1. Log in to admin panel: https://panhandle-pathway.vercel.app/admin
2. Go to **Services** → **Create**
3. Add a test service:
   - Name: "Test Workshop"
   - Description: "Sample workshop for testing"
   - Duration: 60 minutes
   - Price: $50
   - Capacity: 10

### Create Time Slots

1. In admin panel → **Time Slots** → **Create**
2. Use **Time Slot Generator** to create recurring slots:
   - Select your test service
   - Choose date range (next week)
   - Set time range (9 AM - 5 PM)
   - Generate slots

### Create Sample Product

1. In admin panel → **Products** → **Create**
2. Add a test product:
   - Name: "Test Product"
   - Description: "Sample product"
   - Price: $25
   - Inventory: 100

---

## Step 4: Test the Application

### Test Booking Flow

1. Open incognito/private browsing window
2. Go to https://panhandle-pathway.vercel.app
3. Sign up with a new test account
4. Navigate to `/book`
5. Select a service and time slot
6. Complete booking
7. **Check email:** You should receive booking confirmation email
8. **Check dashboard:** Booking should appear in `/dashboard`

### Test Store Flow

1. Navigate to `/store`
2. Browse products
3. Add product to cart
4. Go to cart `/cart`
5. Proceed to checkout
6. Fill out shipping form
7. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
8. Complete payment
9. **Check email:** You should receive order confirmation
10. **Verify webhook:** Check Vercel deployment logs for webhook events

### Test Admin Features

1. Log in as admin
2. Go to `/admin`
3. Verify all resources load:
   - Dashboard metrics
   - Bookings list
   - Orders list
   - Services list
   - Products list
   - Time slots list
4. Test CSV exports
5. Check revenue analytics

---

## Step 5: Monitor & Troubleshoot

### Check Vercel Logs

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Deployments** → Click latest deployment
4. Click **Runtime Logs**
5. Filter for errors

### Check Stripe Webhook Events

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click your webhook endpoint
3. View **Events** tab
4. Check for successful deliveries

### Common Issues

**Webhook not firing:**
- Verify `STRIPE_WEBHOOK_SECRET` in Vercel matches Stripe
- Check webhook URL is correct: `https://panhandle-pathway.vercel.app/api/stripe/webhook`
- Look for failed attempts in Stripe dashboard

**Emails not sending:**
- Verify `RESEND_API_KEY` in Vercel
- Check Resend dashboard for delivery status
- Look for email errors in Vercel logs

**Database errors:**
- Verify all migrations ran successfully
- Check RLS policies are enabled
- Ensure service role key is correct

---

## Step 6: Production Readiness (Optional)

### Switch to Production Stripe Keys

**When ready to accept real payments:**

1. Get production keys from Stripe dashboard (https://dashboard.stripe.com/apikeys)
2. Update Vercel environment variables:
   ```bash
   vercel env rm STRIPE_SECRET_KEY production
   vercel env rm NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
   vercel env add STRIPE_SECRET_KEY production  # Use sk_live_...
   vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production  # Use pk_live_...
   ```
3. Create new production webhook in Stripe (use same events)
4. Update webhook secret in Vercel

### Add Custom Domain

1. Go to Vercel project settings → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., panhandlepathways.com)
4. Follow DNS configuration instructions
5. Update Stripe webhook URL to use custom domain

### Enable Domain in Stripe

- Update webhook endpoint URL to custom domain
- Update success/cancel URLs in checkout code (optional - auto-detects)

---

## Deployment Summary

**Your Live URLs:**
- **Main Site:** https://panhandle-pathway.vercel.app
- **Admin Panel:** https://panhandle-pathway.vercel.app/admin
- **Store:** https://panhandle-pathway.vercel.app/store
- **Booking:** https://panhandle-pathway.vercel.app/book

**Environment:**
- **Database:** Production Supabase (dadpflmdrtteonntqfkn)
- **Hosting:** Vercel
- **Payments:** Stripe (Test Mode)
- **Email:** Resend

**Status:**
- ✅ Code deployed
- ✅ Environment variables set
- ✅ Stripe webhook configured
- ⏳ Database migrations (run Step 1)
- ⏳ Test data creation (run Step 3)
- ⏳ End-to-end testing (run Step 4)

---

## Next Steps

1. **Run migrations** (Step 1) - **START HERE**
2. **Create admin user** (Step 3)
3. **Add test data** (Step 3)
4. **Test everything** (Step 4)
5. **Monitor** (Step 5)
6. **Go live** (Step 6) when ready

Good luck! 🚀
