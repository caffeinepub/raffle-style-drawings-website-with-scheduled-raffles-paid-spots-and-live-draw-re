# Specification

## Summary
**Goal:** Build a raffle-style drawings website with scheduled weekday/weekend raffles, paid spot purchasing, admin management, and live drawing/result publishing.

**Planned changes:**
- Public raffle browsing experience showing upcoming/active/completed raffles with spot price, total/remaining spots, pot/prize amount, schedule, and status.
- Raffle detail pages with spot quantity selection, clear pricing (spot price × quantity), and sold-out handling.
- Internet Identity authentication with sign-in/out and a “My entries” area showing a user’s purchased spots per raffle and outcomes.
- Stripe Checkout payment flow for buying spots; only record/count entries after payment confirmation.
- Backend (single Motoko actor) data models and stable persistence for raffles, entries, and finalized immutable results (winner + draw timestamp + audit metadata).
- Admin-only dashboard to create/update/manage raffles (schedule, spots, pot/prize, open/close) and trigger a single, irreversible winner draw per raffle.
- Per-raffle “Live Drawing” page with countdown to draw time, optional admin-configured live video embed URL, and winner display after finalization (on refresh).
- Completed raffle transparency fields: spots sold, participant count, draw timestamp, and draw reference ID.
- Cohesive non-blue/non-purple visual theme applied across pages; responsive layout.
- Add and use static generated theme images (logo in header, hero/banner on landing) served from the frontend.

**User-visible outcome:** Visitors can view scheduled raffles, sign in, purchase paid spots, and see winners and audit info after draws; admins can manage raffles, embed a live video link, and run each draw once with results shown publicly.
