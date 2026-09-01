import type { Metadata } from "next";
import Link from "next/link";
import { SearchBox } from "../components/SearchBox";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "StoreMesh Docs", template: "%s · StoreMesh Docs" },
  description: "Architecture and delivery guide for the StoreMesh commerce platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><header className="site-header"><Link className="brand" href="/">StoreMesh <span>Docs</span></Link><SearchBox /><div className="header-links"><Link href="/architecture/">Architecture map</Link><Link href="/api-explorer/">API explorer</Link><a href="https://github.com/sartim/storemesh-docs">GitHub</a></div></header>{children}</body></html>;
}
