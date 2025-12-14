# Email Setup Guide - Resend Integration

This guide explains how to set up automated email notifications for bookings and orders using Resend.

## Table of Contents
- [What's Implemented](#whats-implemented)
- [Getting Started with Resend](#getting-started-with-resend)
- [Environment Variables](#environment-variables)
- [Email Templates](#email-templates)
- [Testing Emails](#testing-emails)
- [Production Setup](#production-setup)

---

## What's Implemented

✅ **Booking Emails:**
- Confirmation email sent immediately after booking
- Beautiful HTML templates with booking details
- Includes service name, date, time, and booking ID

✅ **Order Emails:**
- Confirmation email sent after successful Stripe payment
- Order summary with line items and totals
- Shipping address details

✅ **Email Infrastructure:**
- Centralized email utility (`lib/email.ts`)
- Responsive HTML email templates
- Error handling and logging
- Non-blocking sends (won't fail core operations)

---

## Getting Started with Resend

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Panhandle Pathway Development")
4. Select permissions: **Sending access**
5. Copy the API key (starts with `re_`)

### 3. Verify Your Domain (Optional but Recommended)

**For Development:**
- Use the default `onboarding@resend.dev` sender address
- No domain verification needed
- Has daily sending limits

**For Production:**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `panhandlepathway.com`)
4. Add the DNS records provided by Resend
5. Wait for verification (usually a few minutes)
6. Use email addresses like `noreply@yourdomain.com`

---

## Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Or your verified domain email
```

**Important Notes:**
- `RESEND_API_KEY` - Your Resend API key (required)
- `RESEND_FROM_EMAIL` - The email address that emails will be sent from
  - Development: Use `onboarding@resend.dev`
  - Production: Use your verified domain email like `noreply@yourdomain.com`

---

## Email Templates

Email templates are defined in `lib/email.ts`. Each template includes:

### 1. Booking Confirmation Email
**Sent when:** User creates a booking OR checkout session completes with booking items
**Contains:**
- Service name and description
- Date and time of appointment
- Booking ID for reference
- Important reminders (arrive early, cancellation policy)

### 2. Booking Cancellation Email
**Sent when:** User cancels a booking
**Contains:**
- Cancelled booking details
- Invitation to rebook

### 3. Order Confirmation Email
**Sent when:** Stripe checkout session completes successfully
**Contains:**
- Order number
- Line items with quantities and prices
- Total amount
- Shipping address
- What's next information

### 4. Booking Reminder Email
**Sent when:** 24 hours before appointment (requires scheduled function - see below)
**Contains:**
- Upcoming appointment details
- Reminder to arrive early

---

## Testing Emails

### Local Testing

1. Make sure your `.env.local` has the Resend API key
2. Start your development server:
   ```bash
   npm run dev
   ```

3. **Test Booking Email:**
   - Go to `/book`
   - Create a test booking
   - Check the email inbox for confirmation

4. **Test Order Email:**
   - Go to `/store`
   - Add items to cart
   - Complete checkout with Stripe test card: `4242 4242 4242 4242`
   - Check email inbox for order confirmation

5. **View Email Logs:**
   - Check your Resend dashboard under **Logs**
   - See delivery status and email content

### Test Email Addresses

Resend accepts any valid email address in development mode. Use your personal email or test addresses like:
- `test@example.com`
- `youremail+test@gmail.com` (Gmail plus addressing)

---

## How It Works

### Booking Flow
```
User creates booking → Booking inserted to DB → API call to /api/bookings/send-confirmation → Email sent via Resend
```

**File: `app/book/page.tsx`**
```typescript
const { data: newBooking } = await supabase.from("bookings").insert({...}).select().single();

// Send confirmation email (non-blocking)
if (newBooking?.id) {
  fetch("/api/bookings/send-confirmation", {
    method: "POST",
    body: JSON.stringify({ bookingId: newBooking.id }),
  });
}
```

**File: `app/api/bookings/send-confirmation/route.ts`**
- Fetches booking details from database
- Gets user email from profiles
- Calls `sendBookingConfirmationEmail()` from `lib/email.ts`

### Order Flow
```
Stripe webhook → checkout.session.completed → Order updated → Email sent
```

**File: `app/api/stripe/webhook/route.ts`**
```typescript
case "checkout.session.completed":
  // Update order status...

  // Send order confirmation email
  await sendOrderConfirmationEmail({
    to: profile.email,
    userName: profile.full_name,
    orderId: order.id,
    total: order.total,
    items: emailItems,
    shippingAddress: order.shipping_address,
  });
```

---

## Production Setup

### 1. Domain Verification
- Verify your domain in Resend dashboard
- Update `RESEND_FROM_EMAIL` to use your domain
- Recommended format: `noreply@yourdomain.com` or `hello@yourdomain.com`

### 2. Environment Variables
Update your production environment (Vercel, etc.) with:
```bash
RESEND_API_KEY=re_live_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Email Monitoring
- Monitor email delivery in Resend dashboard
- Set up alerts for bounces and failures
- Review email logs regularly

### 4. Rate Limits
**Free Tier:**
- 100 emails per day
- 3,000 emails per month

**Paid Plans:**
- Start at $20/month for 50,000 emails
- Volume discounts available

---

## Advanced Features (Optional)

### Booking Reminders (24h Before)
To send reminder emails 24 hours before appointments, you'll need to set up a scheduled job:

**Option 1: Supabase Edge Function (Recommended)**
Create a Supabase Edge Function that runs daily:
```typescript
// supabase/functions/send-booking-reminders/index.ts
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

Deno.serve(async () => {
  const supabase = createClient(...)
  const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

  // Find bookings for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, time_slots(*), profiles(*), services(*)')
    .eq('status', 'confirmed')
    .gte('time_slots.start_time', tomorrow.setHours(0,0,0,0))
    .lte('time_slots.start_time', tomorrow.setHours(23,59,59,999))

  // Send reminder emails
  for (const booking of bookings) {
    await resend.emails.send({...})
  }

  return new Response('Reminders sent')
})
```

**Option 2: Vercel Cron Jobs**
Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/booking-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

Create API route: `app/api/cron/booking-reminders/route.ts`

---

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   ```bash
   echo $RESEND_API_KEY
   ```
   Should start with `re_`

2. **Check Logs:**
   - View Resend dashboard logs
   - Check server console for errors
   - Look for "Email sent" messages

3. **Verify Environment:**
   - Restart dev server after adding env variables
   - Check `.env.local` file exists and has correct values

### Emails Going to Spam

1. **Verify Domain:**
   - Add SPF, DKIM, and DMARC records
   - Use your own domain instead of `onboarding@resend.dev`

2. **Improve Content:**
   - Avoid spam trigger words
   - Include unsubscribe link (optional but recommended)
   - Use proper HTML structure (already done in templates)

### Email Delivery Failed

Check Resend dashboard for specific error:
- **Hard Bounce:** Invalid email address
- **Soft Bounce:** Temporary issue (mailbox full, server down)
- **Rejected:** Spam filter rejected
- **Complained:** User marked as spam

---

## Email Analytics

Resend provides analytics for:
- ✅ Delivery rate
- ✅ Open rate (if enabled)
- ✅ Click rate (if tracking links)
- ✅ Bounce rate
- ✅ Complaint rate

Access analytics in Resend dashboard under **Analytics**.

---

## Support & Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Node.js SDK](https://github.com/resendlabs/resend-node)
- [Email Best Practices](https://resend.com/docs/guides/best-practices)
- [Resend Support](https://resend.com/support)

---

## Summary

Email notifications are now fully integrated into your booking and order flows:

✅ Booking confirmation emails sent automatically
✅ Order confirmation emails via Stripe webhooks
✅ Beautiful, responsive HTML templates
✅ Non-blocking sends (won't break user flow)
✅ Error handling and logging
✅ Ready for production with domain verification

**Next Steps:**
1. Get your Resend API key
2. Add to `.env.local`
3. Test with a booking or order
4. Verify domain for production
5. (Optional) Set up booking reminders

**Cost:** Free for development, $20/month for production (50k emails)
