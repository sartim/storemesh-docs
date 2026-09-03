---
layout: default
title: Feature management
---

# Feature management

StoreMesh uses two complementary mechanisms: GitHub Actions and Helm for
deployment/infrastructure decisions, and Flagsmith for runtime product flags.
Keycloak is separate and remains the authority for identity and authorization.

## Decision boundaries

| If the decision changes… | Use… |
| --- | --- |
| What is installed, where it runs, or how it is resourced | GitHub Actions + Helm |
| What a running product shows or enables | Flagsmith |
| Who may authenticate or perform an operation | Keycloak plus server-side authorization |

Runtime flags are evaluated behind the Go BFF. The BFF exposes only an
allow-listed, client-safe subset at `GET /api/v1/config` for the Next.js,
Android, and iOS applications. Clients keep local defaults so a temporary
Flagsmith or network failure does not prevent the catalog from loading. Client
applications never contain a Flagsmith server-side API key.

## Recommended operating model

1. Create a flag with a descriptive name, owner, purpose, safe default, and
   removal target date.
2. Implement the behavior behind the flag and add metrics for both branches.
3. Evaluate server-sensitive flags only in the BFF or owning service. Return a
   flag to clients only when it is safe to expose.
4. Roll out to internal users, then a small percentage or explicit segment,
   while watching errors, latency, conversion, and support signals.
5. Use a kill switch only for operational protection; investigate the cause,
   communicate the change, and remove temporary flags after stabilization.

Flags are not authorization. A hidden button is not access control: every
BFF and domain-service operation must validate the Keycloak token, subject,
and role independently.

## Current StoreMesh flags

The initial client-safe set is:

- `graphql_checkout` — enables the composed checkout path.
- `admin_dashboard_v2` — enables the newer admin experience.
- `mobile_cart_v2` — enables the native cart experience.

`kafka_analytics` is intentionally server-side and is not returned to clients.
The BFF uses OpenFeature as the application abstraction, allowing the
provider implementation to evolve without coupling product code to Flagsmith.
Kafka infrastructure remains a separate deployment decision: the runtime flag
can control analytics behavior when a broker is available, but it must not be
used to install Kafka. Helm keeps the outbox publisher disabled by default, so
orders continue to work and pending events remain durable when Kafka is off.

## Local and CI/CD usage

The self-hosted Flagsmith Argo CD application is opt-in. A local environment
can enable it through the Argo manifest, create a server-side environment key,
store that key in a Kubernetes Secret, and enable the BFF Helm values. Normal
Kind bootstrap remains usable without Flagsmith; the BFF falls back to its
safe defaults when no key is configured.

The sibling `storemesh-scripts` repository provides
`scripts/activate-flagsmith-local.sh` to perform this activation without
putting the key in Git or shell output. It requires the operator to provide
`FLAGSMITH_SERVER_KEY` and the in-cluster `FLAGSMITH_BASE_URL` explicitly.
The helper also creates the Flagsmith Django secret key before synchronization,
so the local chart does not depend on an image-based secret-generation Job.

GitHub Actions and Helm remain the source of truth for deployment flags and
must not be replaced by runtime product flags. Changes to either class should
be reviewed, linked to a roadmap item, and tested with the relevant default
and enabled/disabled paths.
