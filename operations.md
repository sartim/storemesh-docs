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
./storemesh-scripts/scripts/bootstrap-argocd.sh
```

Before submitting the user-service application, create the Kubernetes Secret
`storemesh-user-service-secrets` in the `storemesh-user-service` namespace.
Use External Secrets or a secret manager for shared environments; never commit
runtime credentials to a chart, manifest, script, or documentation page.

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
