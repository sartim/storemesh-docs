import { notFound } from "next/navigation";
import Link from "next/link";
import { documents, getDocument } from "../../../lib/docs";

export function generateStaticParams() { return documents.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const document = await getDocument((await params).slug);
  return document ? { title: document.title, description: document.description } : {};
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const document = await getDocument((await params).slug);
  if (!document) notFound();
  return <main className="shell doc-layout"><aside><Link href="/">← All docs</Link><nav>{documents.map((item) => <Link className={item.slug === document.slug ? "active" : ""} key={item.slug} href={`/docs/${item.slug}/`}>{item.title}</Link>)}</nav></aside><article className="prose" dangerouslySetInnerHTML={{ __html: document.html }} /></main>;
}
