---
layout: default
title: Roadmap
---

# Roadmap

Update this document in the pull request that changes a milestone’s state.
Completed items should link to their evidence: a pull request, release, or
deployment record.

## Prioritization policy

This roadmap is the source of truth for delivery sequencing. Prioritize work in
this order:

1. Security, correctness, and broken delivery paths.
2. Capabilities required to run and observe the existing platform reliably.
3. The next dependency-free domain milestone that advances the commerce flow.
4. Developer experience and documentation that reduce repeated operational
   work.
5. Optional architecture, including a BFF, only when a demonstrated product
   need justifies a new service boundary.

Every material pull request must update the relevant documentation in this
repository: architecture for boundary changes, operations for runtime or
deployment changes, development guidance for workflow changes, and this roadmap
when milestone status or priority changes.

| Milestone | Status | Outcome |
| --- | --- | --- |
| Platform foundation | Complete | User service, Helm chart, Argo CD, Kind, scripts, and documentation repositories created |
| Identity and authorization | Complete | JWT authentication, refresh/logout, Redis sessions, persisted roles, and management operations |
| API contracts and transports | Complete | gRPC contracts, explicit HTTP handlers, OpenAPI generation, and transport authorization |
| Production readiness | In progress | User, Product, Inventory, and Order Services expose the shared `/metrics` contract with Go/process collectors; all four charts provide opt-in Prometheus scraping, while live discovery and production storage/access validation remain environment work |
| Delivery automation | Complete | CI, linting, security scans, CodeQL, container validation, semantic release configuration, and Helm validation |
| Local platform bootstrap | Complete | Repeatable Kind and Argo CD scripts merged in [storemesh-scripts pull request #1](https://github.com/sartim/storemesh-scripts/pull/1) |
| Local data services | Complete | Development-only PostgreSQL and Redis bootstrap is implemented and validated in [storemesh-scripts pull request #4](https://github.com/sartim/storemesh-scripts/pull/4) |
| GitOps deployment verification | Complete | Argo CD synchronized the user service; PostgreSQL, Redis, and two user-service replicas reached healthy state in the recreated Kind cluster |
| Additional domain services | Complete | Product, Inventory, and Order Services are deployed and healthy in the local Kind cluster. Inventory uses PostgreSQL-backed replica-safe reservations ([runtime PR #2](https://github.com/sartim/storemesh-inventory-service/pull/2)); Order consumes Product and Inventory gRPC contracts, authenticates to Product with service JWTs, coordinates price snapshots and reservations, and supports PostgreSQL-backed idempotent retries. The deployed workflow was verified end to end, including a successful order, a same-key retry, and persistent stock reduction. |
| Edge composition / BFF | In progress | Go BFF exposes REST/JSON routes, including authenticated admin management routes, while consuming canonical internal gRPC APIs. It is deployed with the Next.js frontend and Istio ingress in local Kind; production promotion remains pending environment setup. GraphQL remains a later option, not an initial dependency. |
| Web frontend | In progress | Next.js, React, and TypeScript frontend provides login, catalog loading, and order creation through the BFF. The next increment is a dedicated role-aware admin area and fuller checkout/order history journeys. |
| Native mobile clients | In progress | Android and iOS now have splash, persisted login through the BFF, local API configuration, native navigation/menu shells, product loading, search, and catalog views. Checkout, order history, refresh-token handling, and mobile integration tests remain next. |
| Documentation platform evolution | Deferred | Re-evaluate a Next.js static-export site after API and domain-service maturity justifies interactive documentation |
| Production platform hardening | In progress | Domain Helm charts include one-replica PodDisruptionBudgets and gRPC ingress NetworkPolicies ([PR #9](https://github.com/sartim/storemesh-helm-repo/pull/9)), opt-in ExternalSecret resources ([PR #10](https://github.com/sartim/storemesh-helm-repo/pull/10)), an opt-in User Service HTTPS Ingress ([PR #11](https://github.com/sartim/storemesh-helm-repo/pull/11)), a pinned cert-manager Argo CD application ([PR #4](https://github.com/sartim/storemesh-argocd-repo/pull/4)), a non-applied Let's Encrypt issuer template ([PR #5](https://github.com/sartim/storemesh-argocd-repo/pull/5)), and opt-in Prometheus alert rules ([PR #12](https://github.com/sartim/storemesh-helm-repo/pull/12)); staged observability now covers Prometheus/Grafana/Alertmanager ([monitoring PR #8](https://github.com/sartim/storemesh-argocd-repo/pull/8)), OpenTelemetry with optional Istio telemetry ([Tempo PR #9](https://github.com/sartim/storemesh-argocd-repo/pull/9), [Istio PR #11](https://github.com/sartim/storemesh-argocd-repo/pull/11), [policy template PR #12](https://github.com/sartim/storemesh-argocd-repo/pull/12)), and ECK-managed Elasticsearch/Kibana with Fluent Bit ([operator PR #6](https://github.com/sartim/storemesh-argocd-repo/pull/6), [logging template PR #7](https://github.com/sartim/storemesh-argocd-repo/pull/7), [Fluent Bit template PR #10](https://github.com/sartim/storemesh-argocd-repo/pull/10)). Backup/recovery requirements and an environment activation checklist are documented; restore evidence and approved production activation remain next |

## Milestone definition of done

A milestone is complete when its API and operational behavior are documented,
tests and checks pass, deployment configuration exists where relevant, and the
roadmap is updated with evidence.

## Next prioritized work

1. Enable the opt-in `ServiceMonitor` resources in a monitoring-enabled
   environment and verify Prometheus discovery and scrape health across
   Product, Inventory, and Order replicas.
2. Complete a production-style restore rehearsal for PostgreSQL and the
   observability stores, recording measured RPO/RTO evidence.
3. Activate cert-manager and HTTPS ingress in a controlled environment, then
   enroll Istio namespaces using the documented `PERMISSIVE`-to-`STRICT` plan.
4. Configure Fluent Bit with ECK credentials, TLS, and redaction policy, and
   validate Kibana queries before onboarding all namespaces.
5. Complete the frontend customer and admin journeys, including role-aware
   navigation and management screens backed by the BFF admin routes.
6. Reassess GraphQL only if a concrete web/mobile journey demonstrates a need
   for client-specific composition beyond the BFF REST surface.
7. Complete the native Android customer journey with refresh-token handling,
   product details, checkout, and order history; then bring the equivalent
   SwiftUI flows to iOS.
8. Keep mobile releases SemVer-tagged (`vMAJOR.MINOR.PATCH`) through the
   platform repositories' manually triggered GitHub Actions workflows.
