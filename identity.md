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
