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

## Local-first application development

Use two different environments for two different jobs:

| Task | Preferred environment |
| --- | --- |
| Build and iterate on the frontend, BFF, or a changed domain service | Run the application directly on localhost using its normal development command |
| Validate deployment manifests, service discovery, Istio sidecars, Argo CD, and observability | Use the local Kind cluster or the disposable GitHub Actions smoke workflow |
| Validate a complete release across images and cluster resources | Use GitHub Actions before changing the local cluster |

The normal fast loop is: run only the application being changed locally, point
it at required localhost or forwarded dependencies, and use the cluster for
integration checks. This avoids waiting for image builds and Argo reconciliation
during feature work while preserving confidence that the same application can
be deployed by Helm. Keep deployment-specific checks in CI and do not delete
or recreate the local cluster for ordinary code changes.

Infrastructure work follows a stricter rule: use Docker and Kubernetes only
when the change requires container, image, networking, scheduling, or cluster
behavior. Prefer the disposable GitHub Actions workflows to validate and debug
those changes first, and use the persistent local cluster only for interactive
investigation that CI cannot reproduce efficiently.

When a local application needs a dependency that is not running locally, use a
targeted port-forward or run that dependency from the cluster. The frontend
should call the BFF, the BFF should call the domain services through its
configured local addresses, and clients must not bypass the BFF to call
internal gRPC services.

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
