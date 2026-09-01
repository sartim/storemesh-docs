import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { documents, versions } from "./doc-index";
export { documents, versions } from "./doc-index";

export async function getDocument(slug: string) {
  const metadata = documents.find((document) => document.slug === slug);
  if (!metadata) return null;

  const source = await fs.readFile(path.join(process.cwd(), `${slug}.md`), "utf8");
  const parsed = matter(source);
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(parsed.content);
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const html = String(processed)
    .replace(/href="([./a-z0-9-]+)\.md"/gi, `href="${basePath}/docs/$1/"`)
    .replace(/src="assets\//g, `src="${basePath}/assets/`);

  return { ...metadata, html };
}
