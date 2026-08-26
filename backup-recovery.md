---
layout: default
title: Backup and recovery
---

# Backup and recovery

Backups are an environment responsibility and must be tested before the
production-hardening milestone can be marked complete. Credentials and backup
payloads must never be committed to Git.

## Required coverage

| System | Backup scope | Restore evidence |
| --- | --- | --- |
| PostgreSQL | User, Product, Inventory, and Order databases; schema migrations | Restore into an isolated database and run service readiness plus an order/reservation smoke test |
| Elasticsearch (ECK) | Indexed logs and lifecycle policy | Restore a representative index/snapshot and query it from Kibana |
| Tempo | Trace blocks and retention configuration | Restore a trace block or validate documented loss boundaries when using short retention |
| GitOps | Argo CD repositories and pinned versions | Recreate applications in a clean cluster from Git |

## Verification cadence

1. Define RPO/RTO and retention per environment.
2. Configure encrypted storage and least-privilege backup credentials through
   the approved secret manager.
3. Run a scheduled restore rehearsal in an isolated namespace or cluster.
4. Record timestamp, versions, restore duration, validation queries, and any
   follow-up work in the environment operations record.

The local Kind bootstrap is not a backup system. Its data services and
observability stores are disposable development resources.
