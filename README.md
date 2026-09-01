# StoreMesh documentation

The published StoreMesh project guide. GitHub Pages deploys the Markdown files
in this repository from the `main` branch.

This repository is the architectural and operational reference for StoreMesh.
It covers service boundaries, client integration, local development, delivery,
observability, identity, recovery, and priorities. Individual service
repositories remain authoritative for protobuf contracts, endpoint details, and
service-level test instructions.

## Local preview

GitHub Pages renders this site with Jekyll. The source remains plain Markdown,
so it can also be read directly on GitHub without installing a documentation
toolchain.

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
