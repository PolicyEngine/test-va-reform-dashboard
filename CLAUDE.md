# va-reform-dashboard

An interactive calculator that lets users model the impact of reforms to the Child Tax Credit (CTC), Earned Income Tax Credit (EITC), and income tax rates at both the federal and Virginia state levels for Virginia residents. Users configure their household and adjust reform parameters, then see household-level impacts via line charts and summary metrics, plus statewide impacts via microsimulation.

## Architecture

- Next.js App Router with Tailwind CSS v4 and @policyengine/ui-kit theme
- @policyengine/ui-kit for standard UI components (Header, SidebarLayout, Tabs, MetricCard, charts, inputs)
- Custom Modal backend (gateway + worker pattern) for household and statewide microsimulation
- Frontend polling via @tanstack/react-query for async computation results
- Two endpoints: `household-impact` (fast, ~10-40s) and `statewide-impact` (slow, ~2-5 min microsimulation)

## Development

```bash
bun install
make dev            # Deploy worker + start gateway + frontend (random port)
make dev-frontend   # Frontend only (uses production API or NEXT_PUBLIC_API_URL)
make dev-backend    # Gateway only (worker must already be deployed)
```

## Testing

```bash
make test           # Frontend tests (vitest)
make test-backend   # Backend tests (pytest)
```

## Build

```bash
make build
```

## Design standards
- Uses Tailwind CSS v4 with @policyengine/ui-kit/theme.css (single import for all tokens)
- @policyengine/ui-kit for all standard UI components
- Primary teal: `bg-teal-500` / `text-teal-500`
- Semantic colors: `bg-primary`, `text-foreground`, `text-muted-foreground`
- Font: Inter (via next/font/google)
- Sentence case for all headings
- Charts use `fill="var(--chart-1)"` for series colors
- Recharts axes use `niceTicks` with `domain={["auto", "auto"]}`
- Negative currency formatted as `-$100` not `$-100`
