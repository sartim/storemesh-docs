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
| Local platform bootstrap | In review | Repeatable Kind and Argo CD scripts in `storemesh-scripts` pull request #1 |
| GitOps deployment verification | Planned | Deploy user service through Argo CD to Kind using externally supplied local credentials |
| Additional domain services | Planned | Product, inventory, cart, order, payment, notification, and frontend services, each with clear ownership |
| Edge composition / BFF | Deferred | Evaluate only after a client needs cross-service aggregation or client-specific composition |
| Production platform hardening | Planned | External Secrets, ingress, certificate management, policy enforcement, dashboards, alerts, backup and recovery drills |

## Milestone definition of done

A milestone is complete when its API and operational behavior are documented,
tests and checks pass, deployment configuration exists where relevant, and the
roadmap is updated with evidence.
