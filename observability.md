---
layout: default
title: Observability
---

# Observability

StoreMesh uses separate, correlated pipelines for metrics, logs, and traces.
Services emit the signals; platform components collect, retain, query, and
alert on them.

## Selected stack

| Signal | Components | Purpose |
| --- | --- | --- |
| Metrics and alerts | Prometheus Operator, Grafana, Alertmanager | SLO dashboards, recording rules, and notifications |
| Logs | Fluent Bit, Elasticsearch managed by ECK, Kibana | Central search, retention, and operational investigation |
| Traces | OpenTelemetry Collector and Grafana Tempo (preferred) | Cross-service request correlation |
| Mesh telemetry | Istio (optional), Prometheus, OpenTelemetry, optional Kiali | mTLS, traffic policy, service graph, and golden signals |

Grafana Tempo is the preferred OTLP trace backend because it integrates with
the selected Grafana metrics experience. The deployment chart must be sourced
from the maintained Grafana Community repository and pinned after compatibility
validation; the older Grafana `tempo-distributed` chart is deprecated.

ECK is the lifecycle boundary for Elasticsearch and Kibana. It provides
Kubernetes-native resources for versioned deployments, upgrades, credentials,
and persistent volume configuration. It does not replace Fluent Bit, which
remains responsible for collecting node and container logs and applying
redaction before indexing.

## Rollout order

1. Install the pinned Prometheus Operator-compatible stack and enable the
   service `PrometheusRule` resources.
2. Install OpenTelemetry Collector and configure OTLP exporters. Add Istio
   only when mTLS, traffic policy, or mesh-level telemetry is needed.
3. Install the pinned ECK operator, then declare Elasticsearch and Kibana with
   environment-specific storage, retention, and access settings.
4. Deploy Fluent Bit and validate log redaction, index lifecycle, and backup
   recovery before onboarding all namespaces.

All observability components are opt-in Argo CD applications and are excluded
from the default local Kind bootstrap. Production enablement requires resource
limits, persistent storage, network policies, secret delivery, retention, and
restore evidence.
