export const documents = [
  { slug: "architecture", title: "Architecture", description: "Boundaries, transports, identity, and platform trade-offs." },
  { slug: "identity", title: "Identity and OIDC", description: "Keycloak, PKCE, redirect URIs, and platform-tool SSO." },
  { slug: "feature-management", title: "Feature management", description: "Deployment flags, runtime product flags, rollout, and governance." },
  { slug: "repositories", title: "Repository map", description: "The services, clients, platform, and documentation repositories." },
  { slug: "development", title: "Development guide", description: "Local setup, contribution rules, and code organization." },
  { slug: "operations", title: "Operations and deployment", description: "Kind, Helm, Argo CD, secrets, and runtime verification." },
  { slug: "observability", title: "Observability", description: "Metrics, traces, logs, Grafana, Tempo, and Kibana." },
  { slug: "backup-recovery", title: "Backup and recovery", description: "Recovery objectives and restore evidence." },
  { slug: "roadmap", title: "Roadmap", description: "Milestones, priorities, and delivery evidence." },
  { slug: "execution-plan", title: "Execution plan", description: "The active cross-repository backlog and acceptance criteria." },
] as const;

export const versions = [
  { slug: "current", label: "Current", description: "The actively maintained architecture and delivery guide." },
  { slug: "v0.1", label: "v0.1 baseline", description: "The first documented StoreMesh platform baseline." },
] as const;
