"use client";

import { useState } from "react";

const nodes = [
  { id: "clients", label: "Web + native clients", detail: "Next.js, Android, and iOS use PKCE with Keycloak and call the edge API." },
  { id: "bff", label: "Go BFF", detail: "The composition boundary exposes REST/JSON and GraphQL while consuming internal gRPC." },
  { id: "services", label: "Domain services", detail: "User, Product, Inventory, and Order remain independently deployable Go services." },
  { id: "platform", label: "Platform + telemetry", detail: "Istio, Kafka, Prometheus, Grafana, Tempo, Fluent Bit, Elasticsearch, and Kibana provide platform capabilities." },
];

export function ArchitectureMap() {
  const [selected, setSelected] = useState(nodes[1]);
  return <section className="architecture-map" aria-label="Interactive StoreMesh architecture"><div className="map-canvas">{nodes.map((node, index) => <button className={`map-node node-${index} ${selected.id === node.id ? "selected" : ""}`} key={node.id} onClick={() => setSelected(node)}>{node.label}</button>)}<div className="map-line line-one" /><div className="map-line line-two" /><div className="map-line line-three" /></div><div className="map-detail"><p className="eyebrow">Selected boundary</p><h3>{selected.label}</h3><p>{selected.detail}</p></div></section>;
}
