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
| Production readiness | Complete | Liveness/readiness, metrics, OpenTelemetry tracing, structured logging, and secure workload defaults |
| Delivery automation | Complete | CI, linting, security scans, CodeQL, container validation, semantic release configuration, and Helm validation |
| Local platform bootstrap | Complete | Repeatable Kind and Argo CD scripts merged in [storemesh-scripts pull request #1](https://github.com/sartim/storemesh-scripts/pull/1) |
| Local data services | Complete | Development-only PostgreSQL and Redis bootstrap is implemented and validated in [storemesh-scripts pull request #4](https://github.com/sartim/storemesh-scripts/pull/4) |
| GitOps deployment verification | Complete | Argo CD synchronized the user service; PostgreSQL, Redis, and two user-service replicas reached healthy state in the recreated Kind cluster |
| Additional domain services | Complete | Product, Inventory, and Order Services are deployed and healthy in the local Kind cluster. Inventory uses PostgreSQL-backed replica-safe reservations ([runtime PR #2](https://github.com/sartim/storemesh-inventory-service/pull/2)); Order consumes Product and Inventory gRPC contracts, authenticates to Product with service JWTs, coordinates price snapshots and reservations, and supports PostgreSQL-backed idempotent retries. The deployed workflow was verified end to end, including a successful order, a same-key retry, and persistent stock reduction. |
| Edge composition / BFF | Deferred | Target a Go BFF exposing REST/JSON over HTTPS and consuming canonical internal gRPC APIs; implement after client journeys demonstrate cross-service aggregation or client-specific composition. GraphQL remains a later option, not an initial dependency. |
| Documentation platform evolution | Deferred | Re-evaluate a Next.js static-export site after API and domain-service maturity justifies interactive documentation |
| Production platform hardening | In progress | Domain Helm charts include one-replica PodDisruptionBudgets and gRPC ingress NetworkPolicies ([PR #9](https://github.com/sartim/storemesh-helm-repo/pull/9)), opt-in ExternalSecret resources ([PR #10](https://github.com/sartim/storemesh-helm-repo/pull/10)), an opt-in User Service HTTPS Ingress ([PR #11](https://github.com/sartim/storemesh-helm-repo/pull/11)), a pinned cert-manager Argo CD application ([PR #4](https://github.com/sartim/storemesh-argocd-repo/pull/4)), and a non-applied Let's Encrypt issuer template ([PR #5](https://github.com/sartim/storemesh-argocd-repo/pull/5)); environment-specific issuer activation, dashboards, alerts, and backup/recovery evidence remain next |

## Milestone definition of done

A milestone is complete when its API and operational behavior are documented,
tests and checks pass, deployment configuration exists where relevant, and the
roadmap is updated with evidence.
