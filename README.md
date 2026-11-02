# WeddingSlot

WeddingSlot is a frontend-only prototype for wedding meal time-slot booking.

## Current features
- Bengali-first responsive UI
- Sample event discovery and event details
- Guest name, phone and group-size booking flow
- Time-slot capacity demo
- Booking confirmation ticket with a demo QR-like code
- Organizer dashboard mockup
- Super-admin approval queue mockup
- Browser localStorage for demo data only

## Important limitations
This version has **no database, no real authentication, no server-side capacity locking, and no secure QR check-in**. Data is saved only in the current browser on the current device. Do not use it for real events or sensitive guest information.

## Run locally
Install Node.js 18+ then:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build for deployment
```bash
npm run build
```
Upload the project to GitHub. For a static site deployment, configure the host to run `npm run build` and publish the `dist` folder.

## Next stage
Connect a backend (e.g. Supabase) for real event approvals, shared bookings, secure organizer accounts, atomic slot capacity checks, and verified one-time QR check-in.
