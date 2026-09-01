---
layout: default
title: Identity and OIDC
---

# Identity and OIDC

## Authority model

Keycloak is the StoreMesh identity authority. It owns credentials, OIDC
sessions, tokens, and platform roles. User Service owns customer profiles and
domain data. New clients should not implement a second password authority.

## Client flow

The web, Android, and iOS clients use separate public Keycloak clients with
Authorization Code + PKCE:

1. The client creates a cryptographically random PKCE verifier and challenge.
2. The system browser opens the Keycloak authorization endpoint.
3. Keycloak redirects back with a short-lived authorization code.
4. The client exchanges the code and verifier at the token endpoint.
5. The client stores tokens in the browser session or platform-secure storage
   and sends the access token as `Authorization: Bearer` to the BFF.
6. The BFF validates the JWT signature using Keycloak JWKS, plus issuer,
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

## Operations checklist

- Use managed secrets and an external PostgreSQL database outside Kind.
- Use HTTPS redirect URIs and disable Keycloak `start-dev` mode.
- Configure Grafana, Kiali, Kibana, and Argo CD as separate confidential OIDC
  clients with protected secrets.
- Map only required Keycloak roles to platform tools and BFF authorization.
- Rotate signing keys and verify BFF JWKS refresh behavior during key rotation.
- Retire direct User Service password login only after all clients use PKCE and
  migration/rollback evidence is recorded.

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
