import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "../components/SearchBox";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StoreMesh Docs", template: "%s · StoreMesh Docs" },
  description: "Architecture and delivery guide for the StoreMesh commerce platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="site-header"><Link className="brand" href="/">StoreMesh <span>Docs</span></Link><SearchBox /><nav className="header-links" aria-label="Primary navigation"><Link href="/docs/roadmap/">Roadmap</Link><Link href="/architecture/">Architecture map</Link><Link href="/api-explorer/">API explorer</Link><a href="https://github.com/sartim/storemesh-docs">GitHub</a></nav></header>{children}<footer className="site-footer"><span>StoreMesh documentation</span><span>Canonical source: Markdown in <a href="https://github.com/sartim/storemesh-docs">GitHub</a></span></footer></body></html>;
}
