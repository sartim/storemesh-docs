---
layout: default
title: StoreMesh
---

# StoreMesh

StoreMesh is an open-source, cloud-native commerce platform built as a set of
independently deployable services. This guide records the architecture, the
delivery model, and the roadmap for contributors and operators.

## Start here

- [Interactive architecture map](architecture/)
- [BFF API explorer](api-explorer/)
- [Architecture](architecture.md)
- [Identity and OIDC](identity.md)
- [Feature management](feature-management.md)
- [Repository map](repositories.md)
- [Development guide](development.md)
- [Operations and deployment](operations.md)
- [Observability](observability.md)
- [Backup and recovery](backup-recovery.md)
- [Roadmap](roadmap.md)
- [Execution plan](execution-plan.md)

## Current platform baseline

The user service provides identity, authentication, sessions, role management,
explicit HTTP handlers, and an internal gRPC API. It includes production
readiness endpoints, Prometheus metrics, OpenTelemetry tracing, security
scanning, Helm packaging, and Argo CD configuration.

The platform includes a Go BFF for the web edge. Browser clients use its
REST/JSON API, while the BFF consumes the canonical internal gRPC APIs exposed
by the domain services. The Next.js frontend is deployed behind the BFF and
Istio ingress in local Kind. Argo CD manifests remain available for a future
reachable GitOps environment, while current CI deployment uses explicit manual
Helm Actions.
