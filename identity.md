---
layout: default
title: Identity and OIDC
---

# Identity and OIDC

## Authority model

Keycloak is the StoreMesh identity authority. It owns credentials, OIDC
sessions, user access/refresh tokens, and platform roles. User Service owns
customer profiles and domain data. New clients should not implement a second
password authority.

There are currently two JWT paths during migration:

- **Keycloak user JWT:** the OIDC access token used by web, Android, and iOS.
  The BFF validates its RS256 signature through Keycloak JWKS, issuer,
  audience, expiry, and claims.
- **Legacy User Service JWT:** the password-login compatibility endpoint still
  issues HS256 access/refresh tokens signed with `JWT_SECRET`. This path is
  temporary and must not be used for new clients or shared environments.

These tokens are not interchangeable. A valid Keycloak JWT cannot be verified
with the legacy User Service `JWT_SECRET`, and a legacy User Service JWT is not
a Keycloak OIDC token.

## Client flow

The web, Android, and iOS clients use separate public Keycloak clients with
Authorization Code + PKCE:

1. The client creates a cryptographically random PKCE verifier and challenge.
2. The system browser opens the Keycloak authorization endpoint.
3. Keycloak redirects back with a short-lived authorization code.
4. The client exchanges the code and verifier at the token endpoint.
5. The client stores tokens in the browser session or platform-secure storage
   and sends the access token as `Authorization: Bearer` to the BFF.
6. The BFF validates the Keycloak JWT signature using Keycloak JWKS, plus issuer,
   audience, expiry, and role claims, before making internal gRPC calls.

The BFF and Product, Order, and Inventory Services verify that the OIDC
discovery document reports the configured issuer. Their validators use bounded
HTTP requests and reload JWKS when a token presents an unknown key ID, with a
short refresh throttle to limit repeated fetches. This supports Keycloak
signing-key rotation while keeping unknown or invalid tokens rejected.

The Product Service also enforces catalog write authorization at its gRPC
boundary: Keycloak OIDC tokens need the `admin` realm role for
`CreateProduct`, `UpdateProduct`, and `ArchiveProduct`. Authenticated customer
tokens can continue to read the catalog. The legacy HS256 compatibility path
is transitional and does not replace OIDC role-based authorization.

The Order Service propagates the verified OIDC `sub` and realm `admin` role
from its gRPC interceptor into service-layer authorization. Customer order
creation, retrieval, cancellation, and list queries are scoped to the subject;
an omitted customer filter is automatically scoped to the caller. Only an
`admin` can query across customers or access another customer's order. The
service intentionally returns `NotFound` for cross-customer order retrieval
and cancellation. Cart operations remain restricted to the owning subject,
including for administrators.

PKCE protects public clients because no client secret is shipped in browser or
mobile binaries. Redirect URIs must be exact and separately registered for
each client.

## Deployment model

The Keycloak chart in `storemesh-helm-repo` is an optional development and
disposable-test fixture. It runs `start-dev`, imports a development realm, and
is not the shared or production identity service. The optional Argo CD app is
not included in the default bootstrap.

For shared environments, the recommended direction is an externally operated
Keycloak deployment (or another identity provider approved by that environment)
whose operator owns availability, the production database, HTTPS, backups,
realm administration, and credential rotation. StoreMesh deployments consume
the provider's issuer and do not assume ownership of its lifecycle. This keeps
the public repositories reusable and avoids coupling application installation
to one operator's identity infrastructure.

Development and CI must remain isolated from shared identities. The open
[Helm change](https://github.com/sartim/storemesh-helm-repo/pull/19) adds a
short-lived Keycloak container smoke using the chart-rendered realm and checks
management health and OIDC discovery; its [feature-branch run passed](https://github.com/sartim/storemesh-helm-repo/actions/runs/39142977801).
Other checks validate issuer/callback/role configuration and token-verification
behavior. This does not test PKCE user login or platform-tool authorization
against a shared realm.
Any future end-to-end login job should provision a disposable identity instance
and credentials for that job only.
Never put real client secrets, admin credentials, or bearer tokens in Git,
workflow inputs, build artifacts, or project documentation. If a GitHub Actions
deployment needs a secret, scope it to a protected environment and expose it
only to the deployment job.

Use one canonical issuer for the tokens consumed by StoreMesh. Browser clients
and server-side validators must be able to reach the endpoints published in
OIDC discovery, and every validator must check the exact `iss` value. An
internal Kubernetes service URL and a public browser URL are not interchangeable
issuers; if a private backchannel is needed, configure it without changing the
issuer claim expected by the applications.

## Local development

The local Helm realm is `storemesh`. The development clients and redirects are
declared in the Helm chart; local passwords and client values are not suitable
for shared environments. Android emulator builds may use `10.0.2.2` as a host
reachability alias, while the iOS Simulator may use `localhost`. These are
network paths, not separate valid token issuers:

| Client | Redirect | Local Keycloak URL example |
| --- | --- | --- |
| Web | `http://localhost:3000/*` | One canonical development issuer, reachable by browser and BFF |
| Android | `com.storemesh.android://oauth/callback` | The same canonical issuer; configure emulator routing/DNS as needed |
| iOS | `storemesh-ios://oauth/callback` | The same canonical issuer; configure simulator routing/DNS as needed |

Do not configure `localhost` for one client and `10.0.2.2` for another as
independent issuer values. Keycloak's discovered issuer and token `iss` claim
must match the value used by every client and validating service. A local
port-forward alone is not a shared browser-and-pod issuer; use a local hostname
and network setup that all participants can reach before testing PKCE end to
end.

For a physical device, use HTTPS and a reachable issuer/API origin such as an
authenticated ngrok tunnel. Never expose PostgreSQL, Redis, gRPC, or
observability ports through the tunnel.

### Downstream service activation

The BFF, Product, Order, and Inventory Helm charts all support the same
`config.keycloakIssuer` and `config.keycloakAudience` settings. The Argo CD
applications keep the issuer empty by default because Keycloak is an optional
local dependency and the legacy-compatible smoke path must remain usable.
When Keycloak is enabled, set the issuer to the exact URL used in the token's
`iss` claim and use the `storemesh-bff` audience consistently. For an
in-cluster-only path this is typically:

```text
http://storemesh-keycloak.<namespace>.svc.cluster.local:8080/realms/storemesh
```

The ready-to-adapt values file is
[`examples/service-keycloak-oidc-values.yaml`](https://github.com/sartim/storemesh-argocd-repo/blob/main/examples/service-keycloak-oidc-values.yaml).
Apply the same values to all four Argo applications only after Keycloak
health and realm discovery succeed. Public web/mobile clients must obtain
tokens from an issuer reachable by those clients; an internal service DNS
name cannot be used as their external issuer.

The optional Keycloak Argo CD Application is
[`storemesh-keycloak-application.yaml`](https://github.com/sartim/storemesh-argocd-repo/blob/main/storemesh-keycloak-application.yaml).
It is intentionally excluded from the default bootstrap and requires the
`storemesh-keycloak-admin` Secret to be created outside Git.

The local realm import also adds a `storemesh-bff` audience mapper to the web,
Android, and iOS clients' access tokens. This is required because signature
validity alone does not prove that a token was issued for the BFF. If clients
or a realm are created manually, reproduce that mapper and verify the decoded
access token contains `aud: storemesh-bff` before enabling strict downstream
validation.

## Operations checklist

- Use managed secrets and an external PostgreSQL database outside Kind.
- Use HTTPS redirect URIs and disable Keycloak `start-dev` mode.
- Configure Grafana, Kiali, Kibana, and Argo CD as separate confidential OIDC
  clients with protected secrets.
- Map only required Keycloak roles to platform tools and BFF authorization.
- Rotate signing keys and verify BFF and downstream service JWKS refresh
  behavior during key rotation; automated tests cover unknown-key refresh.
- Retire direct User Service password login only after all clients use PKCE,
  downstream services accept the Keycloak token contract, and
  migration/rollback evidence is recorded.

## Service-to-service JWT

Order Service also has a separate machine-to-machine JWT option for calls to
Product Service. It is signed with the Product Service shared secret and is
unrelated to human OIDC access tokens. This is a transitional service-auth
mechanism; production deployments should prefer Istio mTLS and/or workload
identity, with authorization claims enforced at the receiving service.

## Platform-tool SSO status

The local Keycloak realm import reserves clients for Grafana, Kiali, Kibana, and
Argo CD, but client registration alone does not enable SSO. Each tool requires
its own confidential client, exact callback, role mapping, and protected
secret. Grafana and Argo CD have non-applied role-aware examples; callback
URIs in the local realm are configurable via Helm values. The local defaults
are:

| Tool | Current local access | OIDC rollout requirement |
| --- | --- | --- |
| Grafana | Local admin login | Example allows only `observability-admin` and `operator`; maps them to Grafana organization Admin and Viewer, respectively, and requires strict role resolution. Callback: `http://localhost:3001/login/generic_oauth`. |
| Argo CD | Local admin credential | Example defaults to read-only and maps only the Keycloak `admin` group to Argo CD admin. Callback: `https://localhost:8443/auth/callback`. |
| Kiali | Anonymous local access | OIDC sign-in does not itself enforce per-user permissions. Per-user access requires Kubernetes API OIDC trust or a supported OIDC-aware API proxy, plus Kubernetes RBAC. The current Kind API is not configured for this, so do not activate Kiali SSO yet. Callback must be the exact Kiali root URL (local port-forward uses HTTPS). |
| Kibana | ECK-generated `elastic` user | OIDC SSO is not included in the free Basic license; the example is gated on an Elastic license that includes SSO. When licensed, map the `groups` claim to explicit Elastic roles. Callback: `https://localhost:5601/api/security/oidc/callback`. |

This staged approach keeps the disposable Kind cluster usable while avoiding
committing secrets or accidentally changing access policy in a shared cluster.
Port-forward `localhost` is browser-only and cannot be used as the issuer from
inside a pod. Use one issuer hostname reachable from both the browser and each
OIDC client pod, then configure that exact issuer consistently in Keycloak,
the application, and the browser. The activation order is Keycloak health and
issuer discovery, exact callback and secret configuration, role-mapping
verification, then removal or restriction of local fallback accounts. Record
runtime login and denial evidence before calling platform SSO complete.

The platform role contract is:

- `admin`: Argo CD administrator.
- `observability-admin`: Grafana administrator and observability administrator.
- `operator`: read-only platform access unless a tool-specific policy grants more.
- Any authenticated role not explicitly elevated: read-only access.

The local Keycloak realm maps realm roles to a `groups` claim for Grafana, Kiali,
Kibana, and Argo CD. This supplies a consistent role input but does not
automatically grant access: each tool enforces its own policy, and Kiali
requires Kubernetes-side OIDC/RBAC. Non-applied activation examples live in
`storemesh-argocd-repo/examples/`; see its README for license and authorization
gates.

Non-applied Grafana, Kiali, Kibana, and Argo CD configuration examples are maintained in the
[`storemesh-argocd-repo`](https://github.com/sartim/storemesh-argocd-repo/tree/main/examples)
repository. They are templates only and require environment-specific issuer,
HTTPS callback, secret, and role values before use.
