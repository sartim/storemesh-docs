import Link from "next/link";

const operations = [
  ["GraphQL", "POST /api/v1/graphql", "Composed products, cart, orders, and checkout operations for web and mobile clients."],
  ["REST", "GET /api/v1/products", "Resource-oriented compatibility and operational routes exposed by the Go BFF."],
  ["Health", "GET /healthz", "Readiness and liveness checks for the BFF edge service."],
];

export default function ApiExplorer() {
  return <main className="shell"><p className="eyebrow">API explorer</p><h1>StoreMesh edge API</h1><p className="lede">A lightweight contract index for the BFF. Interactive request execution will be enabled when a local or ngrok API URL is configured.</p><div className="api-list">{operations.map(([kind, path, description]) => <article key={path}><span>{kind}</span><code>{path}</code><p>{description}</p></article>)}</div><p><Link href="/docs/architecture/">← Read the API boundary in the architecture guide</Link></p></main>;
}
