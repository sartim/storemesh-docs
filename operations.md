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

For coordinated Order-to-Product calls, provide the same Product Service
signing secret to Order Service as `PRODUCT_JWT_SECRET` through a Kubernetes
Secret or external secret manager. Set `PRODUCT_JWT_ISSUER` and
`PRODUCT_JWT_AUDIENCE` only when Product Service uses values different from
`storemesh-product-service` and `storemesh-platform`. Never print or commit
these values.

PostgreSQL and Redis endpoints referenced by those values must also be
available before the user-service readiness check can pass.

The local Kind baseline currently includes healthy Argo CD applications for
the User, Product, Inventory, and Order Services. Product, Inventory, and
Order use namespace-local secrets containing their PostgreSQL connection
strings; the Order Service schema is applied from
`storemesh-order-service/migrations/001_orders.sql` before synchronization.
Apply `storemesh-product-service/migrations/001_products.sql` and
`storemesh-inventory-service/migrations/001_inventory.sql` before exercising
the coordinated workflow. A successful local verification created an order
with a 2,500 minor-unit total, retried it with the same idempotency key, and
confirmed inventory availability decreased only once.
Verify the deployment with:

```sh
kubectl get applications -n argocd
kubectl get pods -n storemesh-product-service
kubectl get pods -n storemesh-inventory-service
kubectl get pods -n storemesh-order-service
```

The domain charts also install one-replica PodDisruptionBudgets and ingress
NetworkPolicies. Product and Inventory accept gRPC traffic from the Order
namespace; Order currently accepts workload traffic from its own namespace
until the future BFF or ingress boundary is introduced. Review these policies
when adding a new client-facing edge component.

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
