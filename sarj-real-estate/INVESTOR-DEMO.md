# Sarj investor experience

The public Next.js frontend is connected to the existing FastAPI backend. It uses TypeScript, Tailwind CSS, shadcn/ui primitives, and Framer Motion. There is no sample-listing fallback: a backend failure shows a retry state.

## Connection

Run the existing backend on port 8000 and the frontend on port 3000. The frontend's server-side `API_URL` defaults to `http://localhost:8000/api/v1`; `NEXT_PUBLIC_API_URL` is also accepted for compatibility with the existing admin setup. Configure the address in `sarj-real-estate/.env.local` when necessary and restart Next.js. Backend database, OpenAI, and Qdrant configuration remains in the existing backend environment.

A narrow same-origin bridge at `/api/investor/[...path]` forwards parcel GET requests, inquiry POST requests, and investor-chat POST requests. It retains backend validation/status codes, handles unreachable services with a useful error, and avoids cross-origin browser configuration. It does not expose admin chat or inquiry reads.

## Live data and interactions

- The shared portfolio provider loads every page from `GET /api/v1/parcels/`. The backend limits pages to 100, so the 120-parcel portfolio requires two requests. Metrics are derived from the loaded records: portfolio size, distinct districts, and available parcels.
- Homepage opportunities, all discovery filters, matching, details, inquiry selection, comparisons, and similar land use those database records and their real parcel IDs. Newly added records work without rebuilding static parcel paths. Reload the experience to refresh the portfolio snapshot.
- Central Riyadh is supported alongside North, East, West, and South. Available, reserved, sold, and leased statuses remain distinct. Null prices render as “Price on request,” are excluded from budget-filtered results, and do not earn a budget match point. Lease prices and budgets are annual; sale prices are total purchase prices.
- Inquiry submission calls `POST /api/v1/inquiries/`, with the backend's existing schema. Name, phone, goal, location/type/transaction preferences, channel, date, and status are recorded. The selected parcel ID and district are retained in `wants_to`, following the existing inquiry form convention; no schema migration is required. There is no separate parcel foreign key in the current inquiry schema. The UI shows success only after the backend accepts the inquiry and displays its reference. Failed requests retain the form and show an error. A stable inquiry ID prevents duplicate records on retry.
- The advisor calls `POST /api/v1/chat/investor`. It displays the backend answer and resolves returned parcel IDs to database-backed cards. No mock AI responses are used. Errors have a retry action.
- `ChatRequest` now accepts an optional `parcel_ids` list of one or two IDs. Detail questions and comparisons pass their selection. The backend retrieves those exact current SQL records, bypassing semantic retrieval/filter extraction for explicit selections. Existing requests without `parcel_ids` retain the previous discovery behavior. Restart the backend after pulling these changes. The real advisor needs the backend's existing OpenAI/Qdrant configuration.

## Structure

```text
app/(investor)/                    Public routes, shared layout and transitions
app/api/investor/[...path]/        Same-origin FastAPI bridge
components/investor/portfolio.tsx Live portfolio provider and loading/error states
components/investor/               Homepage, cards, discovery, wizard, details, inquiry/advisor shell
lib/investor/api.ts                Typed backend requests and complete pagination
lib/investor/parcels.ts            Backend-to-UI adapter, metrics, formatting and scoring
lib/investor/advisor.ts            Suggested prompts and chat UI types
public/images/                    Local illustrative WebP imagery
app/fonts/                        Locally hosted Geist fonts
```

Matching remains a frontend preference score over live records: each of indicative intended use, type, buy/lease preference, area, and budget contributes 20%. The database does not contain zoning or approved-use fields, so intent alignment is inferred from land type and clearly marked subject to use approval. Only available parcels are recommended; imperfect recommendations disclose tradeoffs. This is not an investment assessment.

## Verification

TypeScript and production compilation via Webpack pass. Frontend lint has one pre-existing warning in the old chat types. The changed Python modules pass Ruff checks.

An isolated SQLite fixture populated from the repository's 120-parcel dataset verifies API pagination, 88 districts, 62 available parcels, parcel details/404, inquiry persistence and duplicate prevention, exact-ID comparison retrieval, selection validation, and investor-only chat responses. The model response is stubbed for this check; no real AI calls or live database writes are made.

This sandbox blocks connections to the running backend and cannot launch Chrome or bind a server port. A live end-to-end/browser check still needs to run on the development machine with the existing services running.

## Imagery

The active homepage image is `public/images/riyadh-hero-v2.webp`, edited with the built-in image-generation tool to show a cool daytime Riyadh skyline, Kingdom Centre, KAFD-style towers, and green trees without the previous yellow cast. The generation prompt is recorded in `public/images/prompts.json`. The original hero and the residential, commercial, and neighborhood assets remain available. These images are illustrative, not photographs of the database parcels. Listing coordinates come from the backend; the embedded location diagram is illustrative and its external map link uses the actual record coordinates.

Investor and admin pages share black, white, and green styling. The language toggle persists English/LTR or Arabic/RTL locally and uses the existing Arabic district fields; it does not alter database values. Dialogs use short transitions without full-screen blur, and investor action callbacks retain stable references to avoid unnecessary context updates.

The “Let’s talk” modal has a compact introduction and a responsive two-column form. It stores investment purpose in `wants_to` and readiness in `intent` (`exploring`, `comparing options`, or `ready to move`). Type, area, transaction, and budget use canonical values regardless of interface language. Budget is optional; an entered budget requires buy/lease, with total purchase or annual rent as its basis. Phone numbers are normalized to international format. The selected parcel is saved in nullable `selected_parcel_id`, independently of purpose, and is accessible in the admin inquiry drawer.

Deploy the backend migration before using the updated submission flow: run `alembic upgrade head` from the configured backend environment, then restart the backend. The migration adds the nullable parcel foreign key and preserves existing inquiries. No live database migration was executed during implementation; upgrade and downgrade were checked on a temporary SQLite database.

The exact image-generation prompts are recorded in `public/images/prompts.json`. Replace the illustrative imagery when real parcel photographs become available.
