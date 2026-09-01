"use client";

import Link from "next/link";
import { useState } from "react";
import { documents } from "../lib/doc-index";

export function SearchBox() {
  const [query, setQuery] = useState("");
  const matches = query.trim() ? documents.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())) : [];
  return <div className="search"><label htmlFor="docs-search">Search the docs</label><input id="docs-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “Keycloak”, “Kind”, or “GraphQL”" />{query && <div className="search-results">{matches.length ? matches.map((item) => <Link key={item.slug} href={`/docs/${item.slug}/`} onClick={() => setQuery("")}><strong>{item.title}</strong><span>{item.description}</span></Link>) : <p>No matching sections.</p>}</div>}</div>;
}
