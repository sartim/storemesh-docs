import { notFound } from "next/navigation";
import Link from "next/link";
import { documents, getDocument, versions } from "../../../../lib/docs";

export function generateStaticParams() { return versions.flatMap((version) => documents.map(({ slug }) => ({ version: version.slug, slug }))); }

export default async function VersionedDocumentPage({ params }: { params: Promise<{ version: string; slug: string }> }) {
  const { version, slug } = await params;
  const document = versions.some((item) => item.slug === version) ? await getDocument(slug) : null;
  if (!document) notFound();
  return <main className="shell doc-layout"><aside><Link href="/">← All docs</Link><p className="version-label">Version: {versions.find((item) => item.slug === version)?.label}</p><nav>{documents.map((item) => <Link key={item.slug} href={`/docs/${version}/${item.slug}/`}>{item.title}</Link>)}</nav></aside><article className="prose" dangerouslySetInnerHTML={{ __html: document.html }} /></main>;
}
