# Virginia tax and benefit reform calculator

An interactive PolicyEngine calculator for modeling the impact of federal and Virginia state tax and benefit reforms on households and statewide.

## Getting started

```bash
bun install
make dev
```

## Stack

- **Frontend:** Next.js 14 (App Router), Tailwind CSS v4, @policyengine/ui-kit, Recharts
- **Backend:** Modal (gateway + worker), policyengine-us
- **Testing:** Vitest
- **Deployment:** Vercel (frontend), Modal (backend)
