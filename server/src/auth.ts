import type { Role, User } from "@prisma/client";
import jwt from "jsonwebtoken";

import { env } from "./config/env.js";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisationName: string;
}

export function toAuthenticatedUser(
  user: Pick<User, "id" | "name" | "email" | "role" | "organisationName">,
): AuthenticatedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    organisationName: user.organisationName,
  };
}

export function createAccessToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "8h",
    subject: userId,
  });
}

export function verifyAccessToken(token: string): string | null {
  const payload = jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
  });

  return typeof payload.sub === "string" ? payload.sub : null;
}
