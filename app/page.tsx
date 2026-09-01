import Link from "next/link";
import { documents, versions } from "../lib/docs";

export default function Home() {
  return <main className="shell">
    <section className="hero"><p className="eyebrow">Open-source commerce platform</p><h1>Build and operate StoreMesh with confidence.</h1><p className="lede">A living guide to StoreMesh architecture, APIs, identity, operations, observability, and delivery priorities.</p><Link className="button" href="/docs/architecture/">Read the architecture</Link></section>
    <section className="docs-grid" aria-label="Documentation sections">{documents.map((document) => <Link className="doc-card" key={document.slug} href={`/docs/${document.slug}/`}><h2>{document.title}</h2><p>{document.description}</p><span>Read guide →</span></Link>)}</section><section className="platform-links"><h2>Explore the platform</h2><Link href="/architecture/">Interactive architecture map →</Link><Link href="/api-explorer/">BFF API explorer →</Link><div><span>Documentation versions:</span>{versions.map((version) => <Link key={version.slug} href={`/docs/${version.slug}/architecture/`}>{version.label}</Link>)}</div></section>
  </main>;
}
