---
layout: default
title: StoreMesh
---

# StoreMesh

StoreMesh is an open-source, cloud-native commerce platform built as a set of
independently deployable services. This guide is the shared reference for
contributors, application developers, and platform operators: it explains the
system boundaries, the client-facing API, local development workflow, and the
remaining delivery priorities.

## Start here

- [Interactive architecture map](architecture/)
- [BFF API explorer](api-explorer/)
- [Architecture](architecture.md)
- [Identity and OIDC](identity.md)
- [Feature management](feature-management.md)
- [Repository map](repositories.md)
- [Operations and deployment](operations.md)
- [Observability](observability.md)
- [Backup and recovery](backup-recovery.md)
- [Roadmap](roadmap.md)
- [Execution plan](execution-plan.md)

## Current platform baseline

Keycloak is the target identity authority for web and native clients through
OIDC and Authorization Code + PKCE. User Service remains the customer-profile
and legacy compatibility boundary while the migration is completed. The
domain services expose internal gRPC contracts, health endpoints, metrics,
tracing, security scanning, Helm packaging, and Argo CD definitions.

The platform includes a Go BFF for the client edge. REST/JSON remains the
resource and operational surface; GraphQL composes catalog, cart, and order
views for browser and native clients. The BFF consumes canonical internal
gRPC APIs exposed by the domain services. The Next.js frontend is deployed
behind the BFF, with Istio available for mesh-aware local and on-premises
deployments. Current deployment validation uses explicit manual Helm Actions
and disposable GitHub Actions Kind smoke tests; Argo CD definitions remain
available for a reachable GitOps environment.
