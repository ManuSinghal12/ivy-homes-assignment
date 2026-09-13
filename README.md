# Ivy Homes Portal
This project was made with LLM assistance using Gemini and Chatgpt.
## Run locally

```bash
npm install
npm run dev
```

The production build is `npm run build`. The app uses the assigned Ivy Homes API key and demo accounts from the assignment email.

## What the app covers

- Login with the real auth flow, including refresh-token persistence.
- Paginated listings with local locality, bedroom, furnishing, and price filters.
- Listing detail routes and per-user saved listings persisted in local storage.
- Rental and project browsing with rental prices shown monthly and project prices shown in crores.
- An Insights screen that refreshes live listings and projects every five minutes or on demand.

## API investigation

I first verified authentication behavior instead of trusting the reference: the API requires `X-API-Key`, returns `access_token`, and provides a refresh flow. I then paginated listings and projects to the end, checked `is_live`, grouped listings by coordinates, floor, bedrooms, and carpet area to test physical-property duplication, and cross-referenced project listing counts against listing records.

The documented `/v1/analytics/summary` endpoint was also called with valid authentication and returned 404. The Insights screen therefore exposes that missing endpoint and derives available metrics from the live paginated data instead.

The local snapshot answers are anchored to the assignment reference data. In particular, the average 2BHK price uses only live records with `bedroom === 2`, positive carpet area, and the submitted exclusions. The live dashboard may differ as the API dataset changes.

## Checks that were correct

- The API key belongs in the `X-API-Key` header.
- Login returns `access_token`, not `token`.
- Refresh tokens are available and required for longer sessions.
- Listing and project pagination exposes `has_more` and can be walked to the end.
- Project prices are expressed in crores, while listing and rental prices are rupees.

## With two more days

I would add focused automated tests for pagination, metric calculations, authentication refresh, filters, and per-user favourites. I would also move API access behind a small server-side proxy so the API key is not shipped to every browser, and add explicit city/locality filtering once the API contract is confirmed.
