---
layout: default
title: Development guide
---

# Development guide

## Contribution flow

1. Branch from `main` with a focused semantic name, such as
   `feat/add-session-audit-events`.
2. Keep protocol, domain, transport, and tests aligned in one change.
3. Run formatting, `go vet`, tests, race detection, contract validation, and
   relevant security checks locally where practical.
4. Open a pull request with a concise summary and validation evidence.
5. Update [the roadmap](roadmap.md) when the change completes a milestone.

## Go quality baseline

The service CI enforces `gofmt`, `go vet`, unit tests, race detection,
golangci-lint, govulncheck, gosec SARIF reporting, Buf contract checks, CodeQL,
and container validation.

`golangci-lint` complements rather than replaces `gofmt` and `go vet`:

- `gofmt` guarantees canonical formatting.
- `go vet` catches standard Go correctness issues.
- `golangci-lint` aggregates additional static checks and project lint rules.
