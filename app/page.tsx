import Link from "next/link";
import { documents, versions } from "../lib/docs";

export default function Home() {
  return <main className="shell">
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">Open-source commerce platform</p><h1>Understand the system. Ship the next capability.</h1><p className="lede">StoreMesh is a cloud-native commerce platform built from independently deployable services, native clients, and an operationally reproducible platform.</p><div className="hero-actions"><Link className="button" href="/docs/architecture/">Read the architecture</Link><Link className="text-link" href="/docs/development/">Start developing →</Link></div></div>
      <aside className="hero-panel"><span className="status-dot">● Active baseline</span><h2>One guide for builders and operators</h2><p>Canonical Markdown stays readable in GitHub while this site adds search, versioned routes, an architecture map, and an API explorer.</p><Link href="/docs/roadmap/">See current priorities →</Link></aside>
    </section>
    <section className="signal-grid" aria-label="Platform summary"><div><strong>Go + gRPC</strong><span>Canonical service boundaries</span></div><div><strong>REST + GraphQL</strong><span>BFF client composition</span></div><div><strong>Keycloak + PKCE</strong><span>Web and native identity</span></div><div><strong>Kind + GitHub Actions</strong><span>Repeatable validation</span></div></section>
    <section className="section-heading"><p className="eyebrow">Documentation</p><h2>Choose a path through the platform</h2><p>Use the architecture and development guides to understand the system, then use operations and observability when you are ready to run it.</p></section>
    <section className="docs-grid" aria-label="Documentation sections">{documents.map((document) => <Link className="doc-card" key={document.slug} href={`/docs/${document.slug}/`}><h2>{document.title}</h2><p>{document.description}</p><span>Read guide →</span></Link>)}</section>
    <section className="platform-links"><div><p className="eyebrow">Interactive tools</p><h2>Explore the platform visually</h2></div><Link href="/architecture/">Interactive architecture map →</Link><Link href="/api-explorer/">BFF API explorer →</Link><div><span>Documentation versions:</span>{versions.map((version) => <Link key={version.slug} href={`/docs/${version.slug}/architecture/`}>{version.label}</Link>)}</div></section>
  </main>;
}
