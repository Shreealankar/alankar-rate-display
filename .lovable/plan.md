## Goal

Convert the Help-page complaint form into a full ticketing system (email via Resend, customer & owner portals), and add Google login.

## 1. Complaint Form (Help page)

- Remove the "Subscribe for rate updates" phone field from `WhatsAppForm.tsx`. Keep only: Name, Phone, Email, Subject, Message, Submit button.
- On submit:
  1. Insert row into new `complaints` table → DB trigger generates ticket number like `TKT-2026-0001`.
  2. Call edge function `send-complaint-email` (Resend) → sends:
     - Confirmation email to customer with ticket number + tracking link.
     - Notification email to owner (`kiranjadhav3231@gmail.com`) with full complaint details + ticket number.
  3. Show ticket number to customer in a success dialog.

## 2. Database

New table `complaints`:
- ticket_number (auto-generated: TKT-YYYY-NNNN)
- customer_id (nullable — for guests), name, phone, email, subject, message
- status: `raised` | `in_progress` | `resolved` | `closed` (default `raised`)
- created_at, updated_at

New table `complaint_updates`:
- complaint_id, status, description, created_at
- Tracks every owner update with a note that the customer can see.

RLS:
- Anyone (anon + authenticated) can INSERT complaints.
- Customers can SELECT their own complaints (by email match or customer_id).
- Owner (profiles.is_owner = true) can SELECT/UPDATE all complaints and INSERT updates.
- Customers can SELECT updates for their own complaints.

Trigger: auto-generate `ticket_number` on insert. Trigger: on complaints UPDATE of status, also insert into `complaint_updates`.

## 3. Edge Function: `send-complaint-email`

Uses existing `RESEND_API_KEY` secret. Two emails per call:
- To customer: "Your complaint has been received — Ticket #TKT-..."
- To owner: "New complaint received — Ticket #TKT-..." with all details.

Also add `send-complaint-update-email` to notify customer when owner updates status.

## 4. Customer Portal — "My Tickets"

Add a new tab/section in `CustomerDashboard.tsx`:
- List complaints submitted by the logged-in customer (matched by email).
- Click ticket → show full history: status timeline, owner update descriptions, original message.

## 5. Owner Portal — "Complaints Management"

Add `ComplaintsManagement.tsx` (similar to `OwnerBookingsManagement.tsx`):
- List all complaints with status filter.
- Click → detail view: change status (raised/in_progress/resolved/closed) + add description.
- On update → triggers `send-complaint-update-email` to customer.
- Mounted inside the owner dashboard (`DashboardPage.tsx`).

## 6. Google Login

In `CustomerAuth.tsx`, add a "Continue with Google" button on both Sign In and Sign Up tabs:
```ts
supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/customer` }
});
```

User must enable Google provider in Supabase Dashboard → Authentication → Providers. I'll show the link after implementing.

## Files

**New**
- `supabase/functions/send-complaint-email/index.ts`
- `supabase/functions/send-complaint-update-email/index.ts`
- `src/components/ComplaintsManagement.tsx` (owner)
- `src/components/MyTickets.tsx` (customer)
- migration: complaints + complaint_updates tables, triggers, RLS

**Edited**
- `src/components/WhatsAppForm.tsx` — remove subscribe field, route to complaints table + edge function, show ticket number
- `src/components/CustomerDashboard.tsx` — add "My Tickets" tab
- `src/pages/DashboardPage.tsx` — add Complaints tab for owner
- `src/components/CustomerAuth.tsx` — Google login buttons
- `supabase/config.toml` — register new edge functions

## Notes for user

- Google login requires you to enable the Google provider in your Supabase dashboard (Authentication → Providers → Google). I'll share the direct link.
- Owner notification emails go to `kiranjadhav3231@gmail.com`.
- Customers can track tickets only when logged in (email match).
