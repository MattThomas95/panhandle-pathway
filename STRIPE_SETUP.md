# Stripe Integration Setup Guide

This guide will help you set up Stripe payment processing for Panhandle Pathway.

## Prerequisites

- Stripe account (sign up at https://stripe.com)
- Stripe CLI installed (for webhook testing locally)

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Update Environment Variables

Update your [.env.local](.env.local) file with your actual Stripe keys:

```env
# Replace these placeholder values with your actual Stripe keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# Also add your Supabase Service Role Key (for webhooks)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Getting Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the `service_role` secret key
4. Add it to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

## Step 3: Install Stripe CLI (for local webhook testing)

### macOS
```bash
brew install stripe/stripe-cli/stripe
```

### Windows
Download from: https://github.com/stripe/stripe-cli/releases/latest

### Linux
```bash
curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

## Step 4: Login to Stripe CLI

```bash
stripe login
```

This will open a browser window to authorize the CLI.

## Step 5: Forward Webhooks to Local Development

While your Next.js dev server is running, open a new terminal and run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret that starts with `whsec_`. Copy this value and add it to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LOCAL_WEBHOOK_SECRET
```

**Important:** Restart your Next.js dev server after updating `.env.local`

## Step 6: Test the Integration

1. Navigate to http://localhost:3000/store
2. Add a product to your cart
3. Go to checkout and fill in your shipping information
4. Click "Continue to Payment"
5. You'll be redirected to Stripe Checkout

### Test Card Numbers

Use these test card numbers in Stripe Checkout:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

For all test cards:
- Use any future expiration date (e.g., `12/34`)
- Use any 3-digit CVC (e.g., `123`)
- Use any ZIP code (e.g., `12345`)

## Step 7: Verify Webhook Events

In the terminal running `stripe listen`, you should see webhook events like:

```
✔ Received event checkout.session.completed
```

Check your database to confirm the order status was updated to "processing".

## Production Setup

### 1. Switch to Live Mode

1. Go to https://dashboard.stripe.com/apikeys (without `/test/`)
2. Copy your **live** publishable and secret keys
3. Update your production environment variables

### 2. Create Production Webhook

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** and add it to your production environment

### 3. Update Production Environment Variables

In your production environment (Vercel, etc.), set:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Webhook Events Handled

Our integration handles these Stripe events:

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Updates order status to "processing", sets payment as "succeeded" |
| `payment_intent.succeeded` | Logs successful payment |
| `payment_intent.payment_failed` | Updates order status to "cancelled" |
| `charge.refunded` | Updates order status to "refunded" |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/stripe/checkout` | POST | Creates Stripe checkout session |
| `/api/stripe/webhook` | POST | Handles Stripe webhook events |

## Troubleshooting

### Issue: "Stripe failed to load"

**Solution:** Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set and starts with `pk_test_` or `pk_live_`

### Issue: Webhook events not received

**Solution:**
1. Ensure `stripe listen` is running
2. Check that webhook secret matches in `.env.local`
3. Restart your Next.js dev server after updating environment variables

### Issue: Order status not updating

**Solution:**
1. Check webhook logs in terminal running `stripe listen`
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Check Supabase logs for RLS policy errors

### Issue: 401 Unauthorized in webhook

**Solution:** Ensure `SUPABASE_SERVICE_ROLE_KEY` is set. The webhook uses this to bypass RLS policies.

## Testing Checklist

- [ ] Stripe keys configured in `.env.local`
- [ ] Supabase service role key added
- [ ] Stripe CLI installed and logged in
- [ ] Webhook forwarding running (`stripe listen`)
- [ ] Next.js dev server restarted
- [ ] Can add products to cart
- [ ] Can proceed to checkout
- [ ] Redirects to Stripe Checkout
- [ ] Test payment succeeds with `4242 4242 4242 4242`
- [ ] Order status updates to "processing"
- [ ] Order appears in admin panel

## Need Help?

- Stripe Documentation: https://stripe.com/docs
- Stripe Testing: https://stripe.com/docs/testing
- Stripe CLI: https://stripe.com/docs/stripe-cli
