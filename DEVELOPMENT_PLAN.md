# Panhandle Pathway - Development Plan

## 🎯 Project Status Overview

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Auth & User Management | ✅ Complete | 100% |
| Phase 2: Booking System | ✅ Complete | 100% |
| Phase 3: E-commerce Store | ✅ Complete | 100% |
| Phase 4: Email Notifications | ✅ Complete | 100% |
| Phase 5: Polish & Launch | ⏳ Not Started | 0% |

**Overall Progress: ~90% Complete** 🚀

---

## Current Stack Assessment

| Requirement | Current Stack | Status | Notes |
|-------------|---------------|--------|-------|
| User accounts & organizations | Supabase Auth + Database | ✅ Complete | Full auth flow, organization management, RLS policies |
| Booking with calendar | FullCalendar + Supabase | ✅ Complete | Calendar view, time slot management, capacity limits |
| Store/E-commerce | Supabase + Stripe | ✅ Complete | Full shopping cart, Stripe checkout, webhooks, order management |
| Admin dashboard | React Admin + Supabase | ✅ Complete | All resources, revenue analytics, dark mode |
| Automatic emails | Resend | ✅ Complete | Booking & order confirmations, HTML templates, see [EMAIL_SETUP.md](EMAIL_SETUP.md) |

### All Dependencies Installed ✅
```bash
# All packages already installed:
✅ @supabase/auth-helpers-nextjs
✅ @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
✅ stripe @stripe/stripe-js
✅ resend
```

---

## 🎉 Recent Accomplishments

### Latest: Multi-Day Booking Support - COMPLETED! ✅
**Services can now be configured as multi-day activities with intelligent consecutive-day grouping**

> **⚠️ Important**: This feature requires running the database migration `20251214000001_add_is_multi_day_to_services.sql` in Supabase before it will work. See the migration file for SQL code.

#### What's Working:
- ✅ **Multi-Day Service Flag**: New `is_multi_day` boolean column on services table
- ✅ **Admin Configuration**: Checkbox in ServiceCreate/ServiceEdit to mark services as multi-day activities
- ✅ **Smart Day Grouping**: Algorithm groups consecutive days (including Saturday-Sunday wrap-around)
  - Example: Friday + Saturday + Sunday → ONE multi-day slot (not 3 separate slots)
  - Handles edge case: [5,6,0] (Fri-Sat-Sun) treated as single consecutive group
- ✅ **Multi-Day Slot Generation**: TimeSlotGenerator creates continuous time slots
  - Start time from first day (e.g., Friday 9:00 AM)
  - End time from last day (e.g., Sunday 3:00 PM)
  - Single capacity value applied to entire multi-day event
- ✅ **Visual Indicators**:
  - Green "Multi-Day Mode" badge in admin interface
  - Helper text explaining consecutive day grouping
  - Preview table shows date ranges (e.g., "Fri, Jan 2 - Sun, Jan 4")
- ✅ **Calendar Display**: Multi-day events appear as single continuous blocks on FullCalendar
- ✅ **Booking Confirmation**: Modal displays full date range for multi-day bookings (e.g., "12/19/2025 - 12/21/2025")

#### Technical Implementation:
**Database Migration:**
- `supabase/migrations/20251214000001_add_is_multi_day_to_services.sql` - Adds `is_multi_day` column

**Files Modified:**
- [components/admin/ServiceCreate.tsx](components/admin/ServiceCreate.tsx) - Multi-day checkbox
- [components/admin/ServiceEdit.tsx](components/admin/ServiceEdit.tsx) - Passes `isMultiDay` prop to generator
- [components/admin/TimeSlotGenerator.tsx](components/admin/TimeSlotGenerator.tsx) - Core logic:
  - `groupConsecutiveDays()` function with Saturday-Sunday wrap-around handling
  - Multi-day slot generation algorithm
  - Visual badge and helper text
  - Preview table with date range display
- [app/book/page.tsx](app/book/page.tsx) - Booking confirmation modal shows date ranges

#### Use Cases:
- **Weekend Retreats**: Friday-Sunday events show as one booking
- **Multi-Day Workshops**: Monday-Friday training courses
- **Holiday Programs**: Thursday-Sunday holiday activities
- **Summer Camps**: Week-long programs

---

### Enhanced Admin Dashboard - COMPLETED! ✅
**Comprehensive admin interface with analytics, CSV exports, and time slot management**

#### What's Working:
- ✅ **Dashboard Metrics**: 13+ key metrics including:
  - Total/Confirmed/Pending/Cancelled Bookings
  - Total/Active Services
  - Total/Available/Full Time Slots
  - Total Users and Organizations
  - Total Products and Revenue
  - Booking Confirmation Rate & Capacity Utilization
- ✅ **Date Range Filtering**: Filter all metrics by custom date ranges
- ✅ **CSV Export**: Export functionality on all admin list pages with human-readable field names
- ✅ **Revenue Analytics**: Dedicated revenue page with:
  - Separate booking/product revenue tracking
  - Clickable stat cards with modal detail views
  - Dark mode toggle
  - Issue tracking (cancelled/refunded orders)
  - Success rate calculations
- ✅ **Time Slot Management**:
  - List view with bulk operations
  - Create/Edit individual time slots
  - Auto-generate recurring time slots
  - Template-based slot generator
  - Bulk selection with checkboxes
- ✅ **Dark Mode**: Toggle for both main Dashboard and Revenue Analytics

#### Key Admin Components Created:
- `components/admin/Dashboard.tsx` - Main dashboard with 13+ metrics
- `components/admin/RevenuePage.tsx` - Revenue analytics with dark mode
- `components/admin/TimeSlotList.tsx` - Time slot management list
- `components/admin/TimeSlotCreate.tsx` - Create individual slots
- `components/admin/TimeSlotEdit.tsx` - Edit slot details
- `components/admin/TimeSlotGenerator.tsx` - Auto-generate recurring slots
- `components/admin/TimeSlotTemplateGenerator.tsx` - Template-based generator
- `components/admin/BookingList.tsx` & `BookingEdit.tsx` - Booking management
- `components/admin/OrderList.tsx`, `OrderEdit.tsx`, `OrderShow.tsx` - Order management
- `components/admin/useExportCSV.ts` - Reusable CSV export hook

---

### Phase 3: E-commerce Store - COMPLETED! ✅
**16 new files created, complete end-to-end shopping experience with Stripe payments**

#### What's Working:
- ✅ **Product Browsing**: Responsive grid layout, product cards with images, prices, inventory status
- ✅ **Product Details**: Full product pages with quantity selector, large images, add to cart
- ✅ **Shopping Cart**: Persistent cart with localStorage, add/remove/update quantities, live totals
- ✅ **Cart Icon**: Badge showing item count, accessible from all store pages
- ✅ **Checkout Flow**: Complete form with shipping address, contact info, order summary
- ✅ **Stripe Integration**: Secure payment processing, redirects to Stripe Checkout
- ✅ **Webhook Handling**: Automatic order status updates (pending → processing → completed/refunded)
- ✅ **Order Confirmation**: Beautiful confirmation page with order details, shipping info
- ✅ **Unified Cart System**: Support for both products AND bookings in single checkout
- ✅ **Documentation**: Complete [STRIPE_SETUP.md](STRIPE_SETUP.md) guide for local & production setup

#### Key Store Files Created:
- `components/store/CartContext.tsx` - Shopping cart state management
- `components/store/CartIcon.tsx` - Cart badge component
- `components/store/AddToCartButton.tsx` - Product add-to-cart component
- `app/store/page.tsx` - Product listing page
- `app/store/[id]/page.tsx` - Product detail pages
- `app/cart/page.tsx` - Shopping cart page
- `app/checkout/page.tsx` - Checkout with Stripe
- `app/order-confirmation/[id]/page.tsx` - Order confirmation
- `app/api/stripe/checkout/route.ts` - Stripe session creation
- `app/api/stripe/webhook/route.ts` - Payment event handling
- `STRIPE_SETUP.md` - Complete setup documentation

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
├── id, name, description, duration, capacity, price, is_multi_day
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
   - [x] Add `is_multi_day` column to services (migration 20251214000001)
   - [x] Set up RLS policies for bookings

2. **Admin: Service Management**
   - [x] Add Services resource to React Admin
   - [x] Add Bookings resource to React Admin
   - [x] Build time slot generator (recurring slots)
   - [x] Add multi-day booking support with consecutive-day grouping
   - [ ] Verify capacity management works correctly

3. **Public Booking Interface**
   - [x] Create `/book` page with calendar view
   - [x] Implement service selection
   - [x] Show available slots (hide/disable full slots)
   - [x] Build booking confirmation flow
   - [x] Display date ranges for multi-day bookings in confirmation modal

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
   - [x] Create migration for `orders` table
   - [x] Create migration for `order_items` table
   - [x] Set up RLS policies

2. **Stripe Integration**
   - [x] Set up Stripe packages (stripe, @stripe/stripe-js)
   - [x] Create Stripe checkout session API endpoint (/api/stripe/checkout)
   - [x] Create Stripe webhook endpoint (/api/stripe/webhook)
   - [x] Implement Stripe Checkout redirect flow
   - [x] Handle payment events (success, failure, refund)
   - [x] Create comprehensive setup guide (STRIPE_SETUP.md)
   - [ ] Configure production Stripe keys and webhook

3. **Store Pages**
   - [x] Create `/store` product listing page with cart icon
   - [x] Create `/store/[id]` product detail page
   - [x] Build shopping cart (localStorage + context)
   - [x] Create `/cart` page with item management
   - [x] Create checkout flow with Stripe integration
   - [x] Create order confirmation page

4. **Admin: Product Management**
   - [x] Add Products resource to React Admin
   - [x] Add Orders resource to React Admin (OrderList, OrderEdit, OrderShow)
   - [x] Revenue Analytics with separate booking/product revenue tracking
   - [x] Clickable stat cards with modal snapshots for orders/bookings
   - [x] Dark mode toggle for Revenue Analytics page
   - [ ] Add inventory tracking UI

---

### Phase 4: Email Notifications - COMPLETED! ✅
**Goal:** Automatic emails for bookings and orders

#### What's Working:
- ✅ **Email Service**: Resend integration with beautiful HTML templates
- ✅ **Booking confirmation emails**: Sent immediately after booking creation
- ✅ **Order confirmation emails**: Sent via Stripe webhook after successful payment
- ✅ **Email templates**: Responsive HTML with booking/order details
- ✅ **Non-blocking sends**: Emails don't block user operations
- ✅ **Comprehensive documentation**: See [EMAIL_SETUP.md](EMAIL_SETUP.md) for setup guide

#### Files Created:
- `lib/email.ts` - Email utility with Resend integration and HTML templates
- `app/api/bookings/send-confirmation/route.ts` - Booking email API endpoint
- `EMAIL_SETUP.md` - Complete setup and configuration guide
- `.env.example` - Environment variable template

#### Implementation Details:
1. **Email Service Setup**
   - [x] Resend account setup
   - [x] Beautiful HTML email templates (4 types)
   - [x] Centralized email utility in `lib/email.ts`

2. **Booking Emails**
   - [x] Booking confirmation email (sent on booking creation)
   - [x] Booking cancellation email template (ready to use)
   - [ ] Booking reminder (24h before) - Optional, requires scheduled job

3. **Order Emails**
   - [x] Order confirmation email (integrated with Stripe webhook)
   - [ ] Shipping notification email - Optional, for future enhancement

4. **Email Triggers**
   - [x] Booking creation → API endpoint → Resend
   - [x] Stripe checkout completion → Webhook → Resend
   - [ ] Scheduled reminders - Optional (documented in EMAIL_SETUP.md)

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
   - [ ] Run database migrations in production (including `20251214000001_add_is_multi_day_to_services.sql`)

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
