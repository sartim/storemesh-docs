---
layout: default
title: Client API contracts
---

# Client API contracts

StoreMesh clients use the Go BFF as their only commerce API boundary. GraphQL
is the composition contract for catalog, cart, order history, and checkout;
REST remains available for authentication, health, resource compatibility, and
operational routes.

The canonical GraphQL schema is maintained in the BFF repository at
`api/graphql/schema.graphqls`. Versioned response fixtures live beside it in
`api/graphql/fixtures/v1/` and are the reference shapes for Android, iOS, and
Next.js contract tests.

The current v1 fixtures cover:

- `catalog.json`: product connection, price in minor units, currency, status,
  and pagination token.
- `cart.json`: customer-scoped persisted cart and line quantities.
- `order.json`: idempotent order creation result and order status.

Clients may use a local golden copy for native test execution, but any shape
change must start with the BFF schema and fixture update. The change should
then update client fixtures and tests in the same delivery batch. This keeps
web and native clients aligned while allowing each platform to use its native
transport and decoding libraries.

All order creation requests require a non-empty idempotency key. Client tests
must verify that retrying the same key does not create a second order.
