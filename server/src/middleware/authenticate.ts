import type { RequestHandler } from "express";

import { toAuthenticatedUser, verifyAccessToken } from "../auth.js";
import { prisma } from "../db/prisma.js";

const unauthorized = {
  success: false,
  error: {
    message: "Authentication required",
  },
};

export const authenticate: RequestHandler = async (request, response, next) => {
  const authorization = request.header("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    response.status(401).json(unauthorized);
    return;
  }

  try {
    const userId = verifyAccessToken(token);
    if (!userId) {
      response.status(401).json(unauthorized);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organisationName: true,
      },
    });

    if (!user) {
      response.status(401).json(unauthorized);
      return;
    }

    request.user = toAuthenticatedUser(user);
    next();
  } catch {
    response.status(401).json(unauthorized);
  }
};
