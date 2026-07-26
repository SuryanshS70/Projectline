import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";

import { createAccessToken, toAuthenticatedUser } from "../auth.js";
import { prisma } from "../db/prisma.js";
import { authenticate } from "../middleware/authenticate.js";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const invalidCredentials = {
  success: false,
  error: {
    message: "Invalid email or password",
  },
};

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const credentials = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({
      where: { email: credentials.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      response.status(401).json(invalidCredentials);
      return;
    }

    response.json({
      success: true,
      data: {
        token: createAccessToken(user.id),
        user: toAuthenticatedUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authenticate, (request, response) => {
  response.json({
    success: true,
    data: request.user,
  });
});

authRouter.post("/logout", authenticate, (_request, response) => {
  response.json({
    success: true,
    data: {
      message: "Logged out",
    },
  });
});
