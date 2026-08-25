---
layout: default
title: Repository map
---

# Repository map

| Repository | Responsibility |
| --- | --- |
| [storemesh-user-service](https://github.com/sartim/storemesh-user-service) | Identity, users, roles, sessions, HTTP and gRPC contracts |
| [storemesh-product-service](https://github.com/sartim/storemesh-product-service) | Product catalog contract and future product ownership boundary |
| [storemesh-inventory-service](https://github.com/sartim/storemesh-inventory-service) | Stock quantities and reservation ownership boundary |
| [storemesh-order-service](https://github.com/sartim/storemesh-order-service) | Order lifecycle and cross-service commerce coordination |
| [storemesh-helm-repo](https://github.com/sartim/storemesh-helm-repo) | Helm charts and chart release automation |
| [storemesh-argocd-repo](https://github.com/sartim/storemesh-argocd-repo) | Argo CD project and application definitions |
| [storemesh-kind-cluster](https://github.com/sartim/storemesh-kind-cluster) | Local multi-node Kind cluster configuration |
| [storemesh-scripts](https://github.com/sartim/storemesh-scripts) | Repeatable local platform operations |
| [storemesh-docs](https://github.com/sartim/storemesh-docs) | Architecture, roadmap, and contributor guide |

## Ownership rule

Application source, deployment configuration, and cluster bootstrapping remain
separate so a service change cannot silently alter platform policy. Shared
operational scripts contain no credentials and are safe to run repeatedly.
