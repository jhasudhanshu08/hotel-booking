# Hotel Room Reservation System

A full-stack reservation system for a 97-room, 10-floor hotel. Books up to 5 rooms per guest using a travel-time-optimal algorithm: same floor first, otherwise the configuration that minimizes total travel time between the first and last room.

Built as an assessment submission for the Unstop SDE 3 role.

## Stack

- **Backend** — Node.js + Express, in-memory state, REST API
- **Frontend** — React + Vite + Tailwind CSS
- **Deployment** — Frontend on Netlify, backend on Render

## Project Structure

```
hotel-booking/
├── backend/                # Express API
│   ├── src/
│   │   ├── data/rooms.js              # Hotel configuration (10 floors, 97 rooms)
│   │   ├── services/
│   │   │   ├── bookingService.js      # The booking algorithm
│   │   │   └── hotelService.js        # In-memory state singleton
│   │   ├── routes/rooms.js            # REST endpoints
│   │   └── index.js                   # Express bootstrap
│   ├── test-algo.js                   # Algorithm sanity tests
│   └── package.json
├── frontend/               # React app (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hotel.jsx              # Building visualization
│   │   │   ├── Floor.jsx              # Single floor row
│   │   │   ├── Room.jsx               # Single room cell
│   │   │   ├── Controls.jsx           # Input + action buttons
│   │   │   └── BookingInfo.jsx        # Summary + stats
│   │   ├── api/client.js              # Backend client
│   │   └── App.jsx                    # Composition root
│   └── package.json
├── netlify.toml            # Frontend deploy config
└── render.yaml             # Backend deploy config
```

## Booking Algorithm

Given a request for `N` rooms (1 ≤ N ≤ 5):

1. **Same-floor preference.** For every floor with ≥ N available rooms, slide a window of size N across the floor's available rooms (sorted by position) and pick the window minimizing `lastPos − firstPos`. Pick the lowest-cost window across all floors. Ties broken by lower floor.
2. **Cross-floor fallback.** If no single floor can satisfy the request, take all available rooms globally, sort by `(floor, position)`, and pick the contiguous window of N rooms minimizing travel time between its endpoints.

**Travel time:**

- Same floor: `|pos₁ − pos₂|` minutes
- Different floors: `(pos₁ − 1) + 2 · |floor₁ − floor₂| + (pos₂ − 1)` minutes — i.e., walk to stairs, take stairs, walk to destination.

Validated against the example scenarios in the assignment PDF — see `backend/test-algo.js`.

## Running locally

You need Node.js ≥ 18. Open two terminals.

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm start                  # listens on http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
cp .env.example .env       # default points at localhost:4000
npm run dev                # opens http://localhost:5173
```

Run the algorithm sanity tests:
```bash
cd backend && npm test
```

## API Reference

| Method | Path           | Body                       | Returns                                    |
| ------ | -------------- | -------------------------- | ------------------------------------------ |
| GET    | `/api/rooms`   | —                          | `{ rooms, lastBooking, stats }`            |
| POST   | `/api/book`    | `{ count: 1..5 }`          | `{ booking, rooms, stats }` or `{ error }` |
| POST   | `/api/random`  | `{ fillRatio?: 0..1 }`     | `{ rooms, stats }`                         |
| POST   | `/api/reset`   | —                          | `{ rooms, stats }`                         |
| GET    | `/health`      | —                          | `{ status: "ok" }`                         |

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. On [render.com](https://render.com), New → Web Service → connect the repo.
3. Render reads `render.yaml` and picks `backend/` as root.
4. After deploy, copy the URL (e.g. `https://hotel-booking-api.onrender.com`).
5. *(optional but recommended)* Set `ALLOWED_ORIGINS` to your Netlify URL once you have it.

### Frontend → Netlify

1. On [netlify.com](https://app.netlify.com), Add new site → Import from Git.
2. Netlify reads `netlify.toml` and uses `frontend/` as base directory.
3. **Important:** in Site settings → Environment variables, add:
   - `VITE_API_BASE_URL` = your Render backend URL
4. Trigger a redeploy so the env var takes effect.

> ⚠ Render's free tier sleeps after inactivity — first request after a quiet period takes ~30–60 s to wake up. If that matters, paid tier (~$7/mo) or a keep-alive cron pinging `/health` solves it.

## Notes

- State is in-memory, so it resets when the backend restarts. That's intentional for an assessment; a DB layer would be a one-evening addition.
- The "Just booked" highlight shows only the most recent booking; previous bookings appear in the standard "Occupied" red.
- Built and tested with Node 20.
