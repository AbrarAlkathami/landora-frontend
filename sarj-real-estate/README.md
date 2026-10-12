# Sarj Real Estate

A premium Riyadh investor frontend connected to the existing Landora FastAPI backend and database, alongside a leadership workspace for portfolio, demand, and pipeline intelligence.

Start the backend from `landora-backend`:

```sh
uv run uvicorn landora_backend.main:app --reload --app-dir src
```

Start this frontend:

```sh
npm install
npm run dev
```

Open `http://localhost:3000`. The investor API bridge defaults to `http://localhost:8000/api/v1`. For another backend address, set `API_URL` in this project's `.env.local` and restart Next.js. See `.env.example` for configuration.

The public flow is homepage → matching → recommendations → parcel details → interest or AI advisor. Listings and counts come from the database; inquiries are saved through the backend; the advisor uses the existing investor AI endpoint.

See [INVESTOR-DEMO.md](./INVESTOR-DEMO.md) for integration details and remaining limitations.

```sh
npx tsc --noEmit
npm run lint
npm run build
```

`npx next build --webpack` is available for environments that restrict Turbopack workers. The leadership workspace at `/admin` reads the existing database, supports inquiry status updates, and offers an LLM intelligence assistant grounded in current database records. See [ADMIN-INTELLIGENCE.md](./ADMIN-INTELLIGENCE.md) for routes, business definitions, and tests.
