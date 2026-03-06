# Strata PoC

> See through every layer.

Vertical observability platform built on OpenTelemetry — giving product developers feature-first visibility into their stack.

## Stack

- React 18
- Vite
- Recharts (charts)
- DM Sans + DM Mono (Google Fonts)

## Getting started

```bash
npm install
npm run dev
```

## Features

- **Dashboard builder** — Datadog-inspired customizable dashboards per domain
- **9 widget types** — Stats, charts, stack view, SLOs, timelines, heat maps, and more
- **Health Map** — Cross-team status view with metrics per team
- **Vertical Stack View** — Causal ranking from business metric → service → infra
- **OpenTelemetry-native** — Built around trace_id context propagation

## Project structure

```
src/
  App.jsx        # Full application (single-file PoC)
  main.jsx       # React entry point
index.html
vite.config.js
package.json
```

## Concepts

The core concept is **vertical observability** — correlating signals across layers
of the stack (business → application → service → infra) using OpenTelemetry's
context propagation as the connective tissue.

Each domain (Checkout, Catalog, Logistics) has its own customizable dashboard.
When an incident occurs, the Stack View automatically ranks probable causes
with a causal correlation score (0–1).
