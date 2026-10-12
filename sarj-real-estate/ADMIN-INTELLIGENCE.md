# Sarj leadership intelligence

The admin experience adds a decision-making layer over the existing portfolio and inquiry APIs. Investor and admin pages share a black, white, and green identity, with denser data presentation in admin. The investor header/footer and admin sidebar use `components/shared/sarj-logo.tsx` for the same mark, typography, Arabic lettering, and proportions.

The shared language switch changes English/LTR to Arabic/RTL and persists the choice locally. District labels use the existing English and Arabic database fields. Free-text investor records keep their original language. No database migration is required for the interface language.

Portfolio analysis is cached when records change. Drawer selection uses a separate context so opening a detail drawer does not invalidate dashboard data consumers. Dialogs and sheets use short transitions without full-screen backdrop blur. Production compilation and analytics tests validate the implementation; browser frame timing still needs verification in the deployed environment.

## Routes and main flow

| Route | Purpose |
| --- | --- |
| `/admin` | Portfolio metrics, inquiry pipeline, demand charts, actionable insights, oldest inventory, priority follow-ups |
| `/admin/insights` | Data-derived observations with links to the affected records |
| `/admin/demand` | Area × land type × transaction demand/supply comparison, budget-aware unmatched demand, opportunity gap indicators |
| `/admin/parcels` | Search, status/type/transaction/area/district/price filters, stale inventory, investor matches, table/card views, parcel drawers |
| `/admin/inquiries` | Search, status/intent/area/type/buy-or-lease filters, priority/unmatched views, investor details, matching parcels, contact and status actions |

Dashboard → demand segment → filtered inquiries → inquiry drawer → matching parcel → contact or status update. Chart series can be toggled, chart legends and bars drill into records, and filter state is carried in the URL. Tables are paginated locally in groups of 12 after the full backend dataset is loaded.

## Data connection

`features/intelligence/lib/api.ts` loads every page of parcels and inquiries from the existing backend. The same-origin bridge at `/api/admin/[...path]` accepts portfolio/inquiry GET requests and status-only inquiry PATCH requests. It uses the same `API_URL` / `NEXT_PUBLIC_API_URL` configuration as the investor bridge, defaulting to `http://localhost:8000/api/v1`.

The provider loads both datasets together, supports explicit refresh, shows loading skeletons and retry states, and never substitutes fictional records when the backend fails. A successful status update replaces that inquiry in the shared snapshot; demand, pipeline counts, matches, and insights recompute immediately. A failure keeps the original record and displays a retryable error.

No schema migrations or new backend services are needed. Existing API/schema behavior supports the status updates. The admin assistant is deliberately a frontend preview, as requested, and does not call the backend LLM or send messages to investors.

## Business definitions

- **Open demand:** every inquiry except `closed`, `won`, or `lost`. Status counts include all recorded statuses.
- **Priority investor:** an open inquiry marked `ready to move`, `qualified`, or `negotiating`. Dashboard follow-ups are ordered by oldest inquiry date.
- **Available supply:** parcels with status `available`; reserved, sold, and leased parcels are excluded from recommendations.
- **Good fit:** available land satisfying the stated area, type, and sale/lease preference, plus a compatible price/budget basis when a budget is provided. Broad `any` preferences are unconstrained. Missing investor budgets allow a potential preference fit and are flagged for confirmation. A missing parcel price cannot satisfy a supplied budget.
- **Alignment percentage:** four equally weighted checks: area, type, transaction, budget. An unknown budget does not earn the budget point. Intended project use and zoning are not inferred from this score.
- **Stale inventory:** available parcels with 90+ reported days on market. The five oldest available parcels are shown even if all are younger than that threshold. Days on market use the database field, rather than inventing an elapsed-time measure.
- **High gap:** at least half of a specific segment's open inquiries have no good current fit. **Watch:** some are unmatched, or demand count exceeds supply count. **Balanced:** all supplied requirements have a fit and supply count is at least inquiry count. **No demand:** no assigned open inquiries.
- **Segment assignment:** only explicit area, land type, and transaction preferences are assigned to one of the 20 segments. Broad or unrecognized preferences are disclosed separately, rather than counted multiple times.
- **Budget averages:** total purchase budgets and annual lease budgets are reported separately, with missing/incompatible values excluded. The dashboard average uses all recorded inquiries, not only the open pipeline.

Inquiry counts and parcel counts are signals, not reserved capacity. Multiple investors can match the same parcel. The pipeline chart represents current status counts, not measured conversion rates. Observations use the current loaded records across all dates; no historical growth or week-over-week claims are fabricated.

The initial repository fixture has 120 parcels, 62 available, 48 inquiries, 14 open inquiries without a good current fit, and three high-gap market segments. Runtime metrics are recomputed from the connected backend and may differ as the business changes.

## Interaction and assistant adapter

Drawers use the existing shadcn/Base UI focus-managed sheet component. Inquiry detail shows all stored fields, the full stated ambition, up to three ranked available parcels with reasons and tradeoffs, a status editor, and investor phone/WhatsApp links. Contact links open only when clicked. Parcel detail shows pricing basis, location links, market age, matching open inquiries, and the investor-facing listing.

`features/intelligence/lib/advisor.ts` exports suggested questions and `adminAnswer`, a deterministic adapter over the loaded records. Its structured response contains summary text, parcel records, inquiry records, and drill-down links. Replacing that adapter with a real async LLM endpoint can preserve the existing reply UI. The preview is labeled in the drawer; unknown questions receive a current business summary rather than an invented answer.

## Structure and checks

The analytics module is separate from rendering. Components under `features/intelligence/components/` cover the shared provider/shell, dashboard, charts, records/filters, demand view, and detail drawers. Styles are scoped in `app/admin/admin.css`, including portal-rendered drawers, responsive sidebar/table layouts, and reduced-motion support.

```sh
npx tsc --noEmit
npm run lint
npx next build --webpack
node --test tests/intelligence.test.mjs
```

The analytics tests use Node's built-in runner and native TypeScript stripping (Node 22.18+). Six tests cover segment reconciliation, missing prices, budget basis, separate averages, budget-driven gaps, pipeline status changes, and empty data. Additional checks validate filtered component rendering, complete API pagination, safe status-only forwarding, invalid statuses, outage handling, and persistence through the existing FastAPI status endpoint in an isolated SQLite fixture.

The production build and tests pass. Lint retains one pre-existing unused import warning in `features/chat/types/chat.ts`. This sandbox cannot launch Chrome or reach the live local backend, so browser and live-service checks remain unverified. Start the existing backend, run `npm run dev`, and open `http://localhost:3000/admin` for local review.
