---
layout: default
title: Operations
---

# Operations and deployment

## Local platform

Clone the configuration repositories beside one another, then use the scripts
repository to create the Kind cluster and install Argo CD:

```sh
./storemesh-scripts/scripts/create-kind-cluster.sh
./storemesh-scripts/scripts/bootstrap-local-data-services.sh
./storemesh-scripts/scripts/bootstrap-argocd.sh
```

Before submitting the user-service application, create the Kubernetes Secret
`storemesh-user-service-secrets` in the `storemesh-user-service` namespace.
Use External Secrets or a secret manager for shared environments; never commit
runtime credentials to a chart, manifest, script, or documentation page.

The Secret must contain `DATABASE_URL`, `REDIS_URL`, and `JWT_SECRET` (at least
32 characters). For a local-only cluster, create it from values kept outside
Git, for example:

```sh
kubectl create namespace storemesh-user-service --dry-run=client -o yaml | kubectl apply -f -
kubectl -n storemesh-user-service create secret generic storemesh-user-service-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=REDIS_URL="$REDIS_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --dry-run=client -o yaml | kubectl apply -f -
```

PostgreSQL and Redis endpoints referenced by those values must also be
available before the user-service readiness check can pass.

## Health and observability

| Endpoint | Meaning |
| --- | --- |
| `/healthz` | Process is alive; no dependency call |
| `/readyz` | PostgreSQL and Redis are reachable within the check timeout |
| `/metrics` | Prometheus application, runtime, and process metrics |

HTTP traces use W3C Trace Context and Baggage and export to the configured
OTLP endpoint. Metrics use normalized route templates to avoid high-cardinality
labels.

## Release model

Service and chart repositories use semantic versions. CI validates code and
charts before merge; release workflows publish versioned artifacts. Argo CD
reconciles the selected chart revision into the target cluster.

The user-service release workflow explicitly dispatches container publication
after creating a semantic version, because GitHub-token-created tags do not
start a second workflow automatically.
