---
layout: default
title: Execution plan
---

# StoreMesh execution plan

This is the working delivery tracker for StoreMesh. The [roadmap](roadmap.md)
records milestone-level progress; this document records the order of work,
dependencies, acceptance criteria, and decisions needed to reach those
milestones.

## How to use this tracker

- Keep one item **In progress** per workstream unless work is explicitly
  parallelized.
- Update status, evidence, and the last-updated date in the same pull request
  that changes the implementation.
- Use `P0` for a blocker or security/correctness issue, `P1` for the next
  release capability, `P2` for important follow-up work, and `P3` for optional
  improvements.
- A feature is not complete until its implementation, tests, deployment path,
  and documentation are all represented.

**Last updated:** 2026-09-01

## Current focus

### P1 — Customer and admin frontend journeys

**Status:** Implemented; dashboard and integration hardening next
**Repositories:** `storemesh-frontend`, `storemesh-bff`, `storemesh-docs`

The first usable release is now implemented around the existing REST BFF
surface:

- decode the authenticated session into a small client-side user context;
- role-aware navigation and an admin-only view;
- customer order history with pagination and cancellation;
- admin user listing, role assignment/removal, and account deletion flows;
- loading, empty, error, and unauthorized states;
- use Recharts only for dashboard metrics after the operational data contract
  is settled.

**Acceptance criteria:** met in the frontend implementation; production-like
integration coverage and final backend authorization hardening remain follow-up
work. All journeys use BFF REST and no browser code calls internal gRPC
services.

### P1 — Complete the missing order-history API contract

**Status:** Implemented; frontend integration next
**Repositories:** `storemesh-order-service`, `storemesh-bff`,
`storemesh-frontend`

The Order Service and BFF now support a paginated `ListOrders` operation with
customer and status filters. Customer history uses an explicit customer scope;
administrative wide listing remains dependent on the shared authorization
interceptor.

**Acceptance criteria:** customer list requests are scoped to the authenticated
customer; admin requests have an intentional scope/filter; pagination and
status fields are documented; service, BFF, and frontend tests cover the
contract.

### P1 — Keep the delivery path reproducible

**Status:** In progress  
**Repositories:** `storemesh-helm-repo`, `storemesh-kind-cluster`,
`storemesh-scripts`, `storemesh-docs`

- Keep temporary Kind smoke deployment available from GitHub Actions.
- Keep staging/production Helm deployments manually triggered and protected by
  GitHub Environments.
- Keep Argo CD manifests available for a future reachable server, but do not
  make Argo a prerequisite for current deployment.
- Record any failed action with the workflow URL, cause, fix, and rerun result.

**Acceptance criteria:** a clean runner can lint and deploy the selected chart
to an ephemeral Kind cluster; environment deployment requires an explicit
manual trigger and immutable image tag.

### P1 — Establish native mobile clients

**Status:** Login/catalog/order-history MVP implemented on Android and iOS; checkout next
**Repositories:** `storemesh-android`, `storemesh-ios`, `storemesh-bff`,
`storemesh-docs`

StoreMesh will have two independent native clients. Android uses Kotlin,
Jetpack Compose, Material 3, and coroutines/Flow. iOS uses Swift, SwiftUI,
Swift concurrency, and platform-native navigation/accessibility. Neither client
will use Flutter, React Native, Kotlin Multiplatform, or a shared cross-platform
UI layer. Both clients consume the BFF REST/JSON surface; internal gRPC remains
service-to-service only.

**Acceptance criteria:** each client opens in its native IDE/toolchain, has a
typed BFF client boundary, supports local emulator/device configuration, and
implements login, catalog, checkout, and order history with platform-native
tests and accessibility behavior. Both clients now meet splash, login,
refresh-session, local/ngrok API routing, drawer/menu, catalog, search,
filtering, product details, and order-history slices. Checkout and mobile
integration tests remain release work.

## Ordered backlog

| Priority | Item | Repository or owner | Depends on | Status |
| --- | --- | --- | --- | --- |
| P0 | Resolve failing CI/action regressions when observed | Affected repository | Failure evidence | Ready as needed |
| P1 | Add paginated `ListOrders` API and authorization rules | Order Service + BFF | Shared authorization interceptor for final enforcement | Implemented; authorization hardening next |
| P1 | Implement frontend customer order history | Frontend | `ListOrders` | Implemented; integration hardening next |
| P1 | Implement role-aware admin users and roles screens | Frontend + BFF | Existing admin routes | Implemented; integration hardening next |
| P1 | Add API and UI integration tests for the journeys | Service/BFF/frontend/mobile | Journey implementations | In progress |
| P1 | Verify staging promotion workflow with a real target cluster | Helm + docs | Cluster credentials/context | Waiting for environment |
| P2 | Enable and verify Prometheus `ServiceMonitor` discovery | Helm + Argo | Monitoring-enabled cluster | Planned |
| P2 | Run PostgreSQL and observability restore rehearsal | Scripts + docs | Backup target/storage | Planned |
| P2 | Activate cert-manager and HTTPS in a controlled environment | Helm + Argo | DNS/certificate target | Planned |
| P2 | Configure Fluent Bit redaction/TLS and validate Kibana | Argo + docs | ECK credentials | Planned |
| P3 | Add admin dashboard visualizations with Recharts | Frontend + BFF | Stable metrics/data contract | Deferred |
| P3 | Reassess GraphQL | BFF + frontend | Concrete composition need | Deferred |
| P1 | Create native Android foundation and catalog journey | Android + BFF | Stable REST contract | Android MVP slice implemented |
| P1 | Create native iOS foundation and catalog journey | iOS + BFF | Stable REST contract | Login/catalog MVP implemented |
| P2 | Add native mobile authentication and secure session storage | Android/iOS + User Service | Login/refresh contract | Access/refresh persistence and startup refresh implemented on both |
| P2 | Add native mobile product details and order history | Android/iOS + BFF | Product and `ListOrders` contracts | Implemented; integration hardening next |
| P1 | Add persistent cross-device cart and checkout | Order Service + BFF + Android/iOS + frontend | CartService contract, authentication, order contract, idempotency | Cart contract, PostgreSQL persistence, local-memory fallback, BFF routes, and native API methods implemented; client sync/UI next |

## Cross-repository completion checklist

For each feature, check the applicable items before moving it to Complete:

- [ ] Protocol/domain behavior is implemented and generated contracts are
      updated.
- [ ] Service authorization and error behavior are tested.
- [ ] BFF REST mapping and browser-safe response shape are documented.
- [ ] Frontend loading, empty, error, and unauthorized states are covered.
- [ ] Helm values, policies, and deployment configuration are updated.
- [ ] CI validates the affected repository and the relevant Kind smoke path.
- [ ] Documentation, roadmap status, and evidence links are updated.

## Decisions and constraints

| Decision | Rationale |
| --- | --- |
| Browser clients use BFF REST/JSON; BFF uses internal gRPC | Keeps browser contracts stable while preserving canonical service-to-service contracts. |
| Next.js + React + TypeScript | Chosen frontend foundation for the first web client. |
| Native mobile UI | Android uses Kotlin/Jetpack Compose; iOS uses Swift/SwiftUI. Product behavior and REST contracts align, while UI and platform integrations remain native. |
| Recharts for initial visualizations | Small React/TypeScript footprint appropriate for admin charts; defer until metrics requirements are concrete. |
| Direct Helm Actions for current deploys | No reachable remote Argo CD server is available; deployments must be explicit manual GitHub Actions runs. |
| Temporary Kind for CI smoke | Provides repeatable open-source validation without requiring a remote cluster. |
| MetalLB and Istio remain environment capabilities | Useful for local/on-prem testing; managed environments may provide their own load balancer. |
| Keycloak is the final identity authority | Keycloak will own authentication, OIDC sessions, credentials, and platform roles. User Service will retain customer profiles and domain data, but direct password login will be removed after the OIDC migration is validated. |
| Keycloak rollout starts local-only | The first chart uses Keycloak `start-dev` for Kind development. Production requires an externalized database, managed secrets, TLS, realm backup/restore, and explicit OIDC client configuration. |
| Kafka is an additive event backbone | Start with Confluent for Kubernetes and KRaft in local Kind, then add transactional outbox events before consumers or analytics pipelines. Kafka does not replace PostgreSQL, gRPC, or the BFF. |
| Outbox precedes Kafka publishing | Every event must be committed with its business transaction, then published by a retryable idempotent worker. Consumers must tolerate duplicates and out-of-order delivery. |

## Change log

| Date | Change |
| --- | --- |
| 2026-08-28 | Added this execution tracker; made order-history API a prerequisite for the frontend journey; recorded current BFF, Next.js, Helm, Kind, and visualization decisions. |
| 2026-08-28 | Added paginated `ListOrders` to the Order Service and BFF; frontend order history can now begin against the published contract. |
| 2026-09-01 | Added native Android and iOS repository foundations and documented mobile priorities; no cross-platform UI framework is planned. |
| 2026-09-01 | Published the generated iOS Xcode project and added the Android splash/login/customer-catalog MVP slice. Android emulator development uses `10.0.2.2:8080` for the local BFF. Mobile release automation uses manually triggered `semantic-release` workflows that derive SemVer from Conventional Commits. |
| 2026-09-01 | Release validation passed for backend tests, frontend production build, and Android debug packaging. Frontend CI lint now runs non-interactive TypeScript checking; iOS release validation targets the generated `storemesh-ios` scheme. Product, Inventory, and Order protobuf clone paths now use deep `proto.Clone` copies and pass `go vet`. |
| 2026-09-01 | Documented optional ngrok access for physical-device and remote demos. Only the BFF port 8080 may be tunneled; internal services and observability ports remain local-only. |
| 2026-09-01 | Advanced both native clients with refresh-session persistence, order history, product details, and reusable feature-file structure; checkout is now the next mobile milestone. |
| 2026-09-01 | Defined the customer-owned cart boundary separately from orders; added the CartService protobuf contract and reusable native checkout API methods. Persistent storage, BFF routes, and client cart UI remain outstanding. |
| 2026-09-01 | Added PostgreSQL cart persistence, local-memory fallback, and BFF cart routes; client synchronization and cart UI remain the next slice. |
| 2026-09-01 | Chose Keycloak/OIDC as the final authentication architecture; User Service remains the customer-profile authority, while direct User Service password login will be retired after migration. |
| 2026-09-01 | Added local StoreMesh realm import with separate web, Android, iOS, Grafana, Kiali, Kibana, and Argo CD clients; BFF JWKS validation, tool SSO, and application login migration remain next. |
| 2026-09-01 | Added the Android native AppAuth Authorization Code + PKCE callback and token exchange, with encrypted Keystore session storage; local emulator testing uses BFF `10.0.2.2:8080` and Keycloak `10.0.2.2:8081`. |
| 2026-09-01 | Added the native iOS `ASWebAuthenticationSession` Authorization Code + PKCE component, token exchange, and `storemesh-ios://` callback registration; device integration and Keychain session wiring remain next. |
| 2026-09-01 | Wired iOS OIDC into the app with a native login screen, Keychain token persistence, startup session restoration, logout, and authenticated BFF catalog requests. |
| 2026-09-01 | Adopted the Confluent for Kubernetes KRaft quickstart as the reference for a future local Kafka analytics/eventing milestone; ZooKeeper is intentionally excluded. |
| 2026-09-01 | Added the Order Service `event_outbox` migration and transactional `OrderCreated` write; publisher worker and consumer projections remain next. |
| 2026-09-01 | Added the initial single-instance outbox publisher worker; production worker leasing, Kafka delivery hardening, and analytics consumers remain next. |
