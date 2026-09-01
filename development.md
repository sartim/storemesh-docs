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

The platform scripts repository also runs Bash syntax validation and ShellCheck
on every pull request and push to `main`.

`golangci-lint` complements rather than replaces `gofmt` and `go vet`:

- `gofmt` guarantees canonical formatting.
- `go vet` catches standard Go correctness issues.
- `golangci-lint` aggregates additional static checks and project lint rules.

## Argo CD manifest validation

The Argo CD repository runs CI on pull requests and `main` pushes. The workflow
parses every YAML document and checks whitespace. Kubernetes schema validation
remains environment-specific because some examples intentionally contain
placeholders and depend on installed CRDs.

The manifest workflow uses Ruby's portable `YAML.load_stream` API so it remains
compatible with the GitHub-hosted Ruby runner.

## Native mobile structure

Keep mobile clients organized by feature and responsibility rather than
growing a single application entry file. Android keeps activity startup in
`MainActivity`, app/session composition in `AppRoot`, authentication in
`AuthScreen`, commerce UI in `ShopScreen`, and shared models/session storage in
`Models`. iOS keeps `ContentView` as the composition root and separates auth
and commerce views into feature files. API clients remain independent from UI
and are the only mobile layer that knows the BFF route details.

Both clients use the BFF REST/JSON boundary for resource operations and will
use its versioned GraphQL boundary for composed multi-domain views. Simulator/local builds default to
the localhost BFF route; physical-device testing may supply an HTTPS ngrok
origin through the documented platform configuration. Do not add direct
mobile calls to internal gRPC services.
