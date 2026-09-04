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
5. Architecture improvements, including BFF composition, only when they are
   tied to a demonstrated client or operational need.

Every material pull request must update the relevant documentation in this
repository: architecture for boundary changes, operations for runtime or
deployment changes, development guidance for workflow changes, and this roadmap
when milestone status or priority changes.

| Milestone | Status | Outcome |
| --- | --- | --- |
| Platform foundation | Complete | User service, Helm chart, Argo CD, Kind, scripts, and documentation repositories created |
| Identity and authorization | In progress | Keycloak/OIDC is the target authority; the local realm, BFF JWKS validation, web PKCE foundation, and Android/iOS native PKCE flows are implemented. The legacy User Service HS256 JWT path and separate Order-to-Product service JWT remain transitional; downstream Keycloak-token validation, platform-tool SSO, final role validation, and password-login retirement remain next |
| Eventing and analytics platform | In progress | Order Service writes transactional `OrderCreated` records to a PostgreSQL outbox. Kafka remains an opt-in integration: the publisher is packaged but disabled by default, no Kafka/CFK is installed by local Argo bootstrap, and an external broker is required before enabling delivery; leasing, Cart/Inventory events, and downstream analytics consumers remain next |
| API contracts and transports | Complete | gRPC contracts, explicit HTTP handlers, OpenAPI generation, and transport authorization |
| Production readiness | In progress | User, Product, Inventory, and Order Services expose the shared `/metrics` contract with Go/process collectors; all four charts provide opt-in Prometheus scraping, while live discovery and production storage/access validation remain environment work |
| Delivery automation | Complete | CI, linting, security scans, CodeQL, container validation, semantic release configuration, and Helm validation |
| Feature management | In progress | The Go BFF has an OpenFeature boundary with the official Flagsmith provider, safe defaults, and a client-safe `/api/v1/config` response ([BFF commit 414b258](https://github.com/sartim/storemesh-bff-service/commit/414b258)); the opt-in self-hosted Flagsmith Argo application is published ([Argo commit bba8f5b](https://github.com/sartim/storemesh-argocd-repo/commit/bba8f5b)); and Next.js now consumes the BFF flags with local defaults ([frontend commit 4bdca9f](https://github.com/sartim/storemesh-frontend/commit/4bdca9f)). Helm configuration is opt-in ([Helm commit 2dc5456](https://github.com/sartim/storemesh-helm-repo/commit/2dc5456)); native clients now load the client-safe flags with local fallbacks ([Android commit 483fabd](https://github.com/sartim/storemesh-android/commit/483fabd), [iOS commit a51b4f9](https://github.com/sartim/storemesh-ios/commit/a51b4f9)). Governance and the architecture guidance are documented in [feature management](feature-management.md); environment key activation remains next. GitHub Actions and Helm continue to own infrastructure/deployment flags; Keycloak remains the identity and authorization authority. |
| Local platform bootstrap | Complete | Repeatable Kind and Argo CD scripts merged in [storemesh-scripts pull request #1](https://github.com/sartim/storemesh-scripts/pull/1); the disposable GitHub Actions Kind platform smoke is green, including application readiness, Istio gRPC enrollment, demo catalog/inventory/order traffic, and observability validation ([run 33857216027](https://github.com/sartim/storemesh-scripts/actions/runs/33857216027)) |
| Local data services | Complete | Development-only PostgreSQL and Redis bootstrap is implemented and validated in [storemesh-scripts pull request #4](https://github.com/sartim/storemesh-scripts/pull/4) |
| GitOps deployment verification | Complete | Argo CD synchronized the user service; PostgreSQL, Redis, and two user-service replicas reached healthy state in the recreated Kind cluster |
| Additional domain services | Complete | Product, Inventory, and Order Services are deployed and healthy in the local Kind cluster. Inventory uses PostgreSQL-backed replica-safe reservations ([runtime PR #2](https://github.com/sartim/storemesh-inventory-service/pull/2)); Order consumes Product and Inventory gRPC contracts, authenticates to Product with service JWTs, coordinates price snapshots and reservations, and supports PostgreSQL-backed idempotent retries. The deployed workflow was verified end to end, including a successful order, a same-key retry, and persistent stock reduction. |
| Edge composition / BFF | In progress | Go BFF exposes REST/JSON for resource and operational routes plus authenticated GraphQL queries and mutations for products, cart, orders, cart replacement, and idempotent order creation, backed by canonical internal gRPC APIs. Production promotion remains pending environment setup; resolver hardening and client adoption remain next. |
| Web frontend | In progress | Next.js, React, and TypeScript frontend provides Keycloak login, GraphQL-backed catalog/cart/order/checkout flows, a role-aware admin area, and REST-backed cancellation/admin operations. Payment, fulfillment, GraphQL cancellation, and admin mutations remain future scope. |
| Native mobile clients | In progress | Android and iOS have native splash/login, Keycloak PKCE, secure Keychain/Keystore sessions, configurable localhost/ngrok routing, catalog search/filtering, product details, order history, and native cart/checkout foundations. Catalog and cart reads now use the authenticated BFF GraphQL contract; Android cart checkout is implemented, while iOS checkout UI and mobile integration tests remain next. |
| Documentation platform evolution | In progress | Next.js + TypeScript site consumes canonical Markdown and provides responsive navigation, client-side search, an interactive architecture map, versioned routes, and a BFF API explorer; publishing cutover and richer API execution remain next |
| Production platform hardening | In progress | Domain Helm charts include one-replica PodDisruptionBudgets and gRPC ingress NetworkPolicies ([PR #9](https://github.com/sartim/storemesh-helm-repo/pull/9)), opt-in ExternalSecret resources ([PR #10](https://github.com/sartim/storemesh-helm-repo/pull/10)), an opt-in User Service HTTPS Ingress ([PR #11](https://github.com/sartim/storemesh-helm-repo/pull/11)), a pinned cert-manager Argo CD application ([PR #4](https://github.com/sartim/storemesh-argocd-repo/pull/4)), a non-applied Let's Encrypt issuer template ([PR #5](https://github.com/sartim/storemesh-argocd-repo/pull/5)), opt-in Prometheus alert rules ([PR #12](https://github.com/sartim/storemesh-helm-repo/pull/12)), and opt-in Istio sidecar enrollment with a `PERMISSIVE` gRPC mTLS migration policy ([Argo CD commit b04e728](https://github.com/sartim/storemesh-argocd-repo/commit/b04e728)); Istio is optional to install per environment but supported by the local gRPC deployment path. Staged observability now covers Prometheus/Grafana/Alertmanager ([monitoring PR #8](https://github.com/sartim/storemesh-argocd-repo/pull/8)), OpenTelemetry with Istio telemetry when the mesh is enabled ([Tempo PR #9](https://github.com/sartim/storemesh-argocd-repo/pull/9), [Istio PR #11](https://github.com/sartim/storemesh-argocd-repo/pull/11)), and ECK-managed Elasticsearch/Kibana with Fluent Bit ([operator PR #6](https://github.com/sartim/storemesh-argocd-repo/pull/6), [logging template PR #7](https://github.com/sartim/storemesh-argocd-repo/pull/7), [Fluent Bit template PR #10](https://github.com/sartim/storemesh-argocd-repo/pull/10)). Backup/recovery requirements and an environment activation checklist are documented; restore evidence and approved production activation remain next |

## Milestone definition of done

A milestone is complete when its API and operational behavior are documented,
tests and checks pass, deployment configuration exists where relevant, and the
roadmap is updated with evidence.

## Next prioritized work

1. Complete Keycloak token acceptance in downstream protected service paths,
   configure platform-tool OIDC role mappings, and remove direct User Service
   password login after migration evidence.
2. Adopt the BFF GraphQL contract in Android and iOS, finish iOS checkout UI,
   and add client integration tests for cart persistence and order creation.
3. Add cross-repository API/UI integration tests and harden admin/order
   authorization, including GraphQL resolver authorization tests.
4. Enable `ServiceMonitor` resources and verify Prometheus discovery and scrape
   health across all domain services.
5. Add outbox leasing/claiming, publish Cart and Inventory events, and build
   the first Kafka analytics projection.
6. Complete restore rehearsal, HTTPS/cert-manager activation, and Fluent Bit
   redaction/TLS validation in a controlled environment.
7. Add GraphQL cancellation/admin mutations only after authorization,
   idempotency, and audit requirements are defined; keep mobile releases
   SemVer-tagged through Actions.
   platform repositories' manually triggered GitHub Actions workflows.
