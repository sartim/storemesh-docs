---
layout: default
title: Operations
---

# Operations and deployment

## Optional Kafka event delivery

Kafka is not installed in the default Kind cluster. The `storemesh-kafka` chart
is disabled by default, has no Argo CD Application, and is only a CFK-based
optional deployment for an environment that explicitly chooses to run a local
broker. The Order Service's outbox publisher is independently disabled by
default; enabling it requires an externally reachable `KAFKA_BROKERS` value.
This separation lets the application retain its order functionality and
durable outbox when Kafka is absent.

Order events are first written to the Order Service PostgreSQL outbox. Kafka
publishing must be retryable and idempotent; operators should monitor pending
outbox age, publish failures, and consumer lag before treating analytics as
complete.

The disposable platform smoke also exercises the client-facing GraphQL contract
against the running BFF: catalog composition, account-scoped cart persistence,
cart clearing, and repeated order creation with one idempotency key. This is a
network-backed contract check using seeded data; it does not replace hosted
mobile UI tests or production authorization validation.

## Local Keycloak OIDC

The `storemesh-keycloak` Helm chart imports the local `storemesh` realm with
separate clients for the web app, Android, iOS, Grafana, Kiali, Kibana, and
Argo CD. Its localhost callback URLs and development secrets are for Kind
only. Before any shared-environment deployment, use managed secrets, HTTPS
redirect URLs, an external PostgreSQL database, and non-`start-dev` mode.
The complete authority model and Authorization Code + PKCE flow are documented
in [Identity and OIDC](identity.md).
Realm client registration is only the identity-provider prerequisite; platform
tool SSO remains an explicit environment activation step with Secret-backed
confidential client credentials and role mapping. See the platform-tool status
matrix in [Identity and OIDC](identity.md).

## Local platform

Kind requires a running Docker daemon because each cluster node is a Docker
container. Start Docker Desktop before running the cluster bootstrap scripts;
the create script performs this preflight check and reports the recovery step
when Docker is unavailable.

Clone the configuration repositories beside one another, then use the scripts
repository to create the Kind cluster and install Argo CD:

```sh
./storemesh-scripts/scripts/create-kind-cluster.sh
./storemesh-scripts/scripts/bootstrap-local-data-services.sh
./storemesh-scripts/scripts/bootstrap-argocd.sh
```

The local Kind profile uses one control-plane node and one worker to reduce
Docker resource usage while retaining a dedicated scheduling target for
workloads. Existing clusters are not resized or deleted by the scripts; apply
the profile only when intentionally creating a fresh development cluster.

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

### Important order-seeding prerequisite

Order creation reserves inventory and persists an idempotency key in the same
workflow. The Order Service PostgreSQL schema must therefore contain
`orders.idempotency_key` with a unique index, allowing null values for older
records. The local bootstrap applies this migration idempotently before Argo
CD synchronizes the services. If a database predates this field, run the
bootstrap again or apply the Order Service migration before creating orders;
otherwise persistence fails with `column "idempotency_key" of relation
"orders" does not exist`.

Clients should send a stable `Idempotency-Key` header for each create-order
attempt and reuse that exact value when retrying the same checkout. A new
checkout must use a new key. Successful retries return the original order and
do not reserve inventory a second time.

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

For production secret delivery, the User, Product, Inventory, and Order charts
provide opt-in `ExternalSecret` resources. Set
`externalSecrets.enabled=true`, a `secretStoreRef`, `remoteKey`, and
`targetName` in an environment-specific values file. The default remains
disabled for the local Kind workflow, and `secrets.create` must not be enabled
at the same time as an ExternalSecret for the same target.

The User Service chart also provides an opt-in HTTPS Ingress. Enable it only
when an ingress controller and certificate issuer are installed, then set the
host, TLS Secret, and controller-specific annotations in environment values.
The domain gRPC services remain internal ClusterIP services and are not exposed
through this Ingress.

### Istio and internal gRPC

When the opt-in Istio applications are synchronized, Argo CD labels the User,
Product, Inventory, Order, BFF, and frontend namespaces with
`istio-injection=enabled`. New pods must be restarted after enrollment for
sidecars to appear. The mesh policy initially uses `PeerAuthentication` mode
`PERMISSIVE`, allowing existing direct gRPC and sidecar mTLS traffic during
migration. Verify `2/2` pods, gRPC health, and Kiali topology before changing
each namespace to `STRICT`; do not enable strict mTLS globally as a first step.

The service charts provide opt-in `PrometheusRule` resources for deployment
availability; the User Service also includes a repeated-restart alert. Enable
these rules only after installing a Prometheus Operator-compatible monitoring
stack and supply any required release labels through environment values.

Before promoting Istio mTLS from `PERMISSIVE` to `STRICT`, run the read-only
`storemesh-scripts/scripts/validate-istio-grpc.sh` check. It verifies the
enrolled namespaces, `istio-proxy` sidecars, and container readiness without
changing cluster state. Confirm gRPC calls and telemetry after the check, then
promote namespaces individually.

The strict policy template is maintained in the Argo CD repository at
`examples/istio-strict-grpc-policy.yaml`; apply it through an environment
overlay, one namespace at a time, after gRPC smoke tests pass.

The User, Product, Inventory, and Order charts also provide opt-in
`ServiceMonitor` resources. Enable `serviceMonitor.enabled` in an
environment-specific values file after installing the Prometheus Operator.
The domain services expose `/metrics` on the named `http` Service port at
port `8080`; the ServiceMonitor uses a 30-second interval and a 10-second
scrape timeout by default. Confirm that the Prometheus instance selects the
ServiceMonitor labels used by the environment, then verify targets and
`up{}` values for every replica before enabling alert rules.

The Argo CD repository includes a separate, explicitly applied cert-manager
application pinned to Jetstack chart `v1.21.1`. Apply it only in an environment
where certificate issuance, DNS/HTTP challenges, and the ingress controller
have been approved; it is not part of the local Kind bootstrap.
An issuer template is available in the Argo CD repository; customize the ACME
email, ingress class, and hostname prerequisites before applying it.

## Environment activation checklist

Before enabling production-only platform resources, record approval for each
item below:

- [ ] cert-manager, ingress controller, DNS, and ACME rate-limit plan
- [ ] Prometheus/Grafana/Alertmanager storage, access, and notification routes
- [ ] Tempo storage backend, retention, and OTLP authentication
- [ ] ECK Elasticsearch/Kibana sizing, TLS, retention, and backup policy
- [ ] Fluent Bit endpoint, ExternalSecret credentials, and redaction review
- [ ] Istio namespace enrollment, mTLS transition plan, and telemetry provider
- [ ] PostgreSQL and observability restore rehearsal with measured RPO/RTO

Apply Argo applications and example resources only after the corresponding
approval is recorded. The local Kind profile remains intentionally disposable.

## Health and observability

The observability rollout is intentionally staged:

1. Install Prometheus Operator-compatible Prometheus, Grafana, and Alertmanager;
   then enable the service `PrometheusRule` templates.
2. Install an OpenTelemetry Collector and connect service OTLP exports to the
   approved trace backend. If Istio is adopted, send mesh telemetry through the
   same collection path and add Kiali only where a topology view is useful.
3. Install the pinned Elastic Cloud on Kubernetes (ECK) operator and declare
   the environment's Elasticsearch and Kibana resources. Install Fluent Bit (or
   an approved equivalent) as a DaemonSet and forward redacted structured logs
   to the ECK-managed Elasticsearch endpoint; expose Kibana only behind the
   platform authentication boundary.

The logging and metrics stores require environment-specific persistent volume,
retention, sizing, network policy, and backup settings. ECK operator and
Elasticsearch/Kibana versions must be pinned and upgraded independently from
domain services. None of these stateful observability components is part of the
default Kind bootstrap.

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
