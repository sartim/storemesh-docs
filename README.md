# StoreMesh documentation

The published StoreMesh project guide. The repository keeps Markdown as the
canonical source and now includes a Next.js + TypeScript site for richer
navigation and interactive views.

This repository is the architectural and operational reference for StoreMesh.
It covers service boundaries, client integration, local development, delivery,
observability, identity, recovery, and priorities. Individual service
repositories remain authoritative for protobuf contracts, endpoint details, and
service-level test instructions.

## Local preview

Run the Next.js site locally:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. `npm run build` creates a static `out/` export.
The site includes a responsive docs index, client-side section search,
versioned routes (`/docs/current/...` and `/docs/v0.1/...`), an interactive
architecture map, and a BFF API contract explorer. The root Markdown files
remain directly readable on GitHub and remain the content source for both
Jekyll and Next.js.

The legacy Jekyll configuration remains available while the Next.js publishing
workflow is evaluated; this keeps the migration reversible.

GitHub Pages deploys the Next.js static export from `.github/workflows/pages.yml`
on pushes to `main` or a manual workflow dispatch. The project-site base path is
configured as `/storemesh-docs`; after the workflow succeeds, the site is
available at `https://sartim.github.io/storemesh-docs/`.

## Keeping the roadmap current

Update `roadmap.md` in the same pull request that completes a milestone. Move
the milestone between Planned, In Progress, and Complete, and link the related
repository pull request or release.

Use [`execution-plan.md`](execution-plan.md) for the active prioritized
backlog, cross-repository dependencies, acceptance criteria, and decisions.

## Recommended reading order

1. [Architecture](architecture.md) for boundaries, transports, identity, and
   platform trade-offs.
2. [Development guide](development.md) for contribution rules and code
   organization.
3. [Operations](operations.md) for Kind, Helm, Argo CD, secrets, and runtime
   verification.
4. [Identity and OIDC](identity.md) for Keycloak, PKCE, redirect URIs, and
   platform-tool SSO.
5. [Observability](observability.md) and [Backup and recovery](backup-recovery.md)
   for production-readiness requirements.
6. [Roadmap](roadmap.md) and [Execution plan](execution-plan.md) for priorities
   and delivery evidence.
