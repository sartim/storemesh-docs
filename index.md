---
layout: default
title: StoreMesh
---

# StoreMesh

StoreMesh is an open-source, cloud-native commerce platform built as a set of
independently deployable services. This guide records the architecture, the
delivery model, and the roadmap for contributors and operators.

## Start here

- [Architecture](architecture.md)
- [Repository map](repositories.md)
- [Development guide](development.md)
- [Operations and deployment](operations.md)
- [Observability](observability.md)
- [Roadmap](roadmap.md)

## Current platform baseline

The user service provides identity, authentication, sessions, role management,
explicit HTTP handlers, and an internal gRPC API. It includes production
readiness endpoints, Prometheus metrics, OpenTelemetry tracing, security
scanning, Helm packaging, and Argo CD configuration.

The platform does not currently include a BFF layer. The HTTP API is owned by
the user service itself, while gRPC is reserved for internal service-to-service
communication. A BFF becomes appropriate only when web or mobile clients need
cross-service aggregation, client-specific composition, or an edge policy
boundary that does not belong inside a domain service.
