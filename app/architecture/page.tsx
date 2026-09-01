import Link from "next/link";
import { ArchitectureMap } from "../../components/ArchitectureMap";

export default function ArchitecturePage() {
  return <main className="shell"><p className="eyebrow">Interactive architecture</p><h1>How StoreMesh fits together</h1><p className="lede">Select a boundary to see its responsibility. The diagram is a navigational overview; the full architecture guide remains the source of detailed decisions.</p><ArchitectureMap /><p><Link className="button" href="/docs/architecture/">Open the complete architecture guide</Link> <Link className="text-link" href="/api-explorer/">Explore the BFF API →</Link></p></main>;
}
