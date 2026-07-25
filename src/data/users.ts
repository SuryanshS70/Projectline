import type { User } from "./types";

export const users: User[] = [
  {
    id: "u-ava",
    name: "Ava Chen",
    email: "ava.chen@northwind.co",
    role: "client",
    organisationId: "org-c1",
    title: "Program Director",
  },
  {
    id: "u-marcus",
    name: "Marcus Reid",
    email: "marcus.reid@northwind.co",
    role: "client",
    organisationId: "org-c1",
    title: "Operations Lead",
  },
  {
    id: "u-lena",
    name: "Lena Park",
    email: "lena.park@meridian.health",
    role: "client",
    organisationId: "org-c2",
    title: "CTO",
  },
  {
    id: "u-jamal",
    name: "Jamal Osei",
    email: "jamal.osei@axiom.io",
    role: "vendor",
    organisationId: "org-v1",
    title: "Delivery Manager",
  },
  {
    id: "u-priya",
    name: "Priya Nair",
    email: "priya.nair@axiom.io",
    role: "vendor",
    organisationId: "org-v1",
    title: "Senior Engineer",
  },
  {
    id: "u-tom",
    name: "Tom Weiss",
    email: "tom.weiss@axiom.io",
    role: "vendor",
    organisationId: "org-v1",
    title: "Product Designer",
  },
  {
    id: "u-hana",
    name: "Hana Sato",
    email: "hana.sato@bluewave.com",
    role: "vendor",
    organisationId: "org-v2",
    title: "Cloud Architect",
  },
  {
    id: "u-diego",
    name: "Diego Alvarez",
    email: "diego@bluewave.com",
    role: "vendor",
    organisationId: "org-v2",
    title: "DevOps Lead",
  },
];

export const getUserById = (id: string): User | undefined => users.find((u) => u.id === id);

export const demoClient = users[0];
export const demoVendor = users[3];
