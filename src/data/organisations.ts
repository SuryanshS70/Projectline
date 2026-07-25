import type { Organisation } from "./types";

export const organisations: Organisation[] = [
  { id: "org-c1", name: "Northwind Retail", type: "client", industry: "Retail" },
  { id: "org-c2", name: "Meridian Health", type: "client", industry: "Healthcare" },
  { id: "org-v1", name: "Axiom Consulting", type: "vendor", industry: "Software Consulting" },
  { id: "org-v2", name: "Bluewave Systems", type: "vendor", industry: "Cloud Infrastructure" },
];

export const getOrgById = (id: string) => organisations.find((o) => o.id === id);
