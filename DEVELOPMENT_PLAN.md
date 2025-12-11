# Panhandle Pathway - Development Plan

## Current Stack Assessment

| Requirement | Current Stack | Fits? | Notes |
|-------------|---------------|-------|-------|
| User accounts & organizations | Supabase Auth + Database | ✅ Yes | Supabase Auth handles authentication, DB for organization hierarchy |
| Booking with calendar | Supabase Database + React | ✅ Yes | Need to add a calendar library (e.g., FullCalendar, react-big-calendar) |
| Store/E-commerce | Supabase + Stripe | ⚠️ Partial | Need to add Stripe for payments |
| Admin dashboard | React Admin + ra-supabase | ✅ Yes | Already installed |
| Automatic emails | Supabase Edge Functions + Resend/SendGrid | ⚠️ Partial | Need to add email service |

### Recommended Additions
```bash
npm install @supabase/auth-helpers-nextjs  # Auth helpers for Next.js
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction  # Calendar
npm install stripe @stripe/stripe-js  # Payments
npm install resend  # Email service (or use Supabase Edge Functions with any SMTP)
```

---

## Database Schema Overview

```
organizations
├── id, name, email, phone, settings
└── has many → users (parent org manages child accounts)

users (extends Supabase Auth)
├── id, email, organization_id, role, profile info
└── belongs to → organization

services (bookable items)
├── id, name, description, duration, capacity, price
└── has many → bookings

bookings
├── id, user_id, service_id, slot_id, status, created_at
└── belongs to → user, service, time_slot

time_slots
├── id, service_id, start_time, end_time, capacity, booked_count
└── belongs to → service

products (store items)
├── id, name, description, price, inventory, images
└── has many → order_items

orders
├── id, user_id, status, total, stripe_payment_id
└── has many → order_items

order_items
├── id, order_id, product_id, quantity, price
└── belongs to → order, product

email_logs
├── id, user_id, type, status, sent_at
└── for tracking sent emails
```

---

## Implementation Phases

### Phase 1: Authentication & User Management (Week 1)
**Goal:** Users can sign up, log in, and belong to organizations

#### Steps:
1. **Set up Supabase Auth**
   - [X] Create migration for `organizations` table
   - [X] Create migration for `profiles` table (extends auth.users)
   - [X] Set up Row Level Security (RLS) policies

2. **Build Auth UI**
   - [x] Create `/auth/login` page
   - [x] Create `/auth/signup` page
   - [x] Create `/auth/forgot-password` page
   - [x] Add auth middleware for protected routes

3. **Organization Management**
   - [x] Create organization signup flow
   - [x] Build organization dashboard for managing child accounts
   - [x] Add invite system for adding users to organization

4. **Admin Panel Setup**
   - [x] Configure React Admin with Supabase auth
   - [x] Add Users resource to admin
   - [x] Add Organizations resource to admin
   - [x] Fix React Admin authentication with session transfer
   - [x] Configure proper RLS policies and PostgreSQL GRANT permissions

---

### Phase 2: Booking System (Week 2-3)
**Goal:** Calendar-based booking with capacity limits

#### Steps:
1. **Database Setup**
   - [x] Create migration for `services` table
   - [x] Create migration for `time_slots` table
   - [x] Create migration for `bookings` table
   - [x] Set up RLS policies for bookings

2. **Admin: Service Management**
   - [x] Add Services resource to React Admin
   - [x] Add Bookings resource to React Admin
   - [ ] Build time slot generator (recurring slots)
   - [ ] Add capacity management

3. **Public Booking Interface**
   - [x] Create `/book` page with calendar view
   - [x] Implement service selection
   - [x] Show available slots (hide/disable full slots)
   - [x] Build booking confirmation flow

4. **User Dashboard**
   - [x] Create `/dashboard` for logged-in users
   - [x] Show upcoming bookings
   - [x] Allow booking cancellation

---

### Phase 3: E-commerce Store (Week 4)
**Goal:** Sell books and merchandise

#### Steps:
1. **Database Setup**
   - [x] Create migration for `products` table
   - [ ] Create migration for `orders` table
   - [ ] Create migration for `order_items` table
   - [ ] Set up RLS policies

2. **Stripe Integration**
   - [ ] Set up Stripe account and API keys
   - [ ] Create Stripe webhook endpoint
   - [ ] Implement checkout session creation

3. **Store Pages**
   - [ ] Create `/store` product listing page
   - [ ] Create `/store/[id]` product detail page
   - [ ] Build shopping cart (localStorage + context)
   - [ ] Create checkout flow

4. **Admin: Product Management**
   - [x] Add Products resource to React Admin
   - [ ] Add Orders resource to React Admin
   - [ ] Add inventory tracking

---

### Phase 4: Email Notifications (Week 5)
**Goal:** Automatic emails for bookings and orders

#### Steps:
1. **Email Service Setup**
   - [ ] Set up Resend account (or SendGrid/Postmark)
   - [ ] Create email templates
   - [ ] Set up Supabase Edge Function for sending emails

2. **Booking Emails**
   - [ ] Booking confirmation email
   - [ ] Booking reminder (24h before)
   - [ ] Booking cancellation email

3. **Order Emails**
   - [ ] Order confirmation email
   - [ ] Shipping notification email

4. **Database Triggers**
   - [ ] Create trigger for new bookings → send email
   - [ ] Create trigger for new orders → send email
   - [ ] Set up scheduled function for reminders

---

### Phase 5: Polish & Launch (Week 6)
**Goal:** Final touches and deployment

#### Steps:
1. **UI/UX Improvements**
   - [ ] Responsive design review
   - [ ] Loading states and error handling
   - [ ] Toast notifications

2. **Testing**
   - [ ] Test booking flow end-to-end
   - [ ] Test payment flow with Stripe test mode
   - [ ] Test email delivery
   - [ ] Test organization/user permissions

3. **Deployment**
   - [ ] Set up production environment variables
   - [ ] Deploy to Vercel
   - [ ] Configure custom domain
   - [ ] Set up Stripe production keys

---

## File Structure (Target)

```
panhandle-pathway/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                # User dashboard
│   ├── book/
│   │   └── page.tsx                # Booking calendar
│   ├── store/
│   │   ├── page.tsx                # Product listing
│   │   └── [id]/page.tsx           # Product detail
│   ├── checkout/
│   │   └── page.tsx
│   ├── admin/
│   │   └── [[...slug]]/page.tsx    # React Admin
│   └── api/
│       ├── stripe/
│       │   └── webhook/route.ts
│       └── emails/
│           └── send/route.ts
├── components/
│   ├── AdminApp.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   ├── booking/
│   │   ├── Calendar.tsx
│   │   └── BookingForm.tsx
│   ├── store/
│   │   ├── ProductCard.tsx
│   │   ├── Cart.tsx
│   │   └── CartProvider.tsx
│   └── ui/
│       └── (shared components)
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts          # Server-side client
│   ├── stripe.ts
│   └── email.ts
├── supabase/
│   ├── migrations/
│   │   ├── 20241209000000_initial_schema.sql
│   │   ├── 20241209000001_auth_and_organizations.sql
│   │   ├── 20241209000002_bookings.sql
│   │   ├── 20241209000003_store.sql
│   │   └── 20241209000004_email_logs.sql
│   └── config.toml
├── .env.local
└── package.json
```

---

## Quick Start - Next Steps

1. **Install additional dependencies:**
   ```bash
   npm install @supabase/auth-helpers-nextjs @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction stripe @stripe/stripe-js resend
   ```

2. **Start with Phase 1** - Get authentication working first, as everything depends on it

3. **Update `.env.local`** with additional keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For server-side operations
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   ```

---

## Notes

- **React Admin** is great for the business owner's admin panel - easy CRUD for all entities
- **Supabase RLS** will handle most authorization logic at the database level
- **Stripe** handles PCI compliance for payments
- **Edge Functions** can handle email sending without a separate backend
- Consider adding **Supabase Realtime** for live calendar updates if needed

---

## Recent Fixes & Solutions

### React Admin Authentication Fix (Completed)

**Problem:** React Admin was getting 403 Forbidden errors when trying to create records (services, bookings, etc.) despite being authenticated.

**Root Cause:** Two separate issues:
1. Session was stored in cookies (SSR client) but React Admin needed localStorage-based client for proper Authorization headers
2. PostgreSQL table-level GRANT permissions were missing for the `authenticated` role (separate from RLS policies)

**Solution:**
1. **Dual Client Setup** ([lib/supabase.ts](lib/supabase.ts)):
   - `supabase` - SSR client using `@supabase/ssr` (cookies-based)
   - `supabaseJsClient` - JS client using `@supabase/supabase-js` (localStorage-based)

2. **Session Transfer** ([components/AdminApp.tsx](components/AdminApp.tsx:152-165)):
   ```typescript
   // Transfer session from SSR client to JS client
   const { data: { session } } = await supabaseClient.auth.getSession();
   await supabaseJsClient.auth.setSession({
     access_token: session.access_token,
     refresh_token: session.refresh_token,
   });
   ```

3. **PostgreSQL GRANT Permissions** (run in Supabase SQL Editor):
   ```sql
   GRANT ALL ON services TO authenticated;
   GRANT ALL ON bookings TO authenticated;
   GRANT ALL ON time_slots TO authenticated;
   GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
   ```

4. **Proper RLS Policies** ([setup-rls-proper.sql](setup-rls-proper.sql)):
   - Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
   - All policies target the `authenticated` role with `USING (true)` and `WITH CHECK (true)`

**Key Learnings:**
- Supabase RLS requires **both** PostgreSQL GRANT permissions AND RLS policies
- `@supabase/ssr` client doesn't send Authorization headers in REST API calls (by design for security)
- React Admin needs explicit Authorization headers, so use `@supabase/supabase-js` client
- Session can be transferred between clients using `setSession()`

**Files Modified:**
- [components/AdminApp.tsx](components/AdminApp.tsx) - Session transfer and data provider
- [lib/supabase.ts](lib/supabase.ts) - Dual client setup
- [setup-rls-proper.sql](setup-rls-proper.sql) - Working RLS policies
