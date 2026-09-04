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

PKCE protects public clients because no client secret is shipped in browser or
mobile binaries. Redirect URIs must be exact and separately registered for
each client.

## Local development

The local Helm realm is `storemesh`. The development clients and redirects are
declared in the Helm chart; local passwords and client values are not suitable
for shared environments. Android emulator builds use the host alias
`10.0.2.2`, while the iOS Simulator uses `localhost`:

| Client | Redirect | Local issuer |
| --- | --- | --- |
| Web | `http://localhost:3000/*` | `http://localhost:8081/realms/storemesh` |
| Android | `com.storemesh.android://oauth/callback` | `http://10.0.2.2:8081/realms/storemesh` |
| iOS | `storemesh-ios://oauth/callback` | `http://localhost:8081/realms/storemesh` |

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

## Operations checklist

- Use managed secrets and an external PostgreSQL database outside Kind.
- Use HTTPS redirect URIs and disable Keycloak `start-dev` mode.
- Configure Grafana, Kiali, Kibana, and Argo CD as separate confidential OIDC
  clients with protected secrets.
- Map only required Keycloak roles to platform tools and BFF authorization.
- Rotate signing keys and verify BFF JWKS refresh behavior during key rotation.
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
Argo CD, but client registration alone does not enable SSO. Each tool still
requires an environment-specific OIDC configuration, callback URL, role
mapping, and confidential client secret. The current local defaults are:

| Tool | Current local access | OIDC rollout requirement |
| --- | --- | --- |
| Grafana | Local admin login | Configure `auth.generic_oauth`, issuer, scopes, role mapping, and a Secret-backed client secret |
| Kiali | Anonymous local access | Change the Kiali auth strategy to OpenID and map approved roles |
| Kibana | ECK-generated `elastic` user | Configure the Elastic OIDC provider and callback settings with protected credentials |
| Argo CD | Local admin credential | Configure Argo CD Dex/OIDC, group claims, and admin role mapping |

This staged approach keeps the disposable Kind cluster usable while avoiding
committing secrets or accidentally changing access policy in a shared cluster.
The activation order is Keycloak health and issuer discovery, tool callback and
secret configuration, role-mapping verification, then removal or restriction
of local fallback accounts. Record the result in the environment's deployment
evidence before calling platform SSO complete.

Non-applied Grafana and Argo CD configuration examples are maintained in the
[`storemesh-argocd-repo`](https://github.com/sartim/storemesh-argocd-repo/tree/main/examples)
repository. They are templates only and require environment-specific issuer,
HTTPS callback, secret, and role values before use.
