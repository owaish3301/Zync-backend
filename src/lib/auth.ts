import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { BYPASS_INVITE } from "../config/env";
import { username } from "better-auth/plugins";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prisma } from "./prisma";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "User",
        input: false,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "PENDING",
        input: false,
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email") {
        const body = ctx.body as { email: string };

        const user = await prisma.user.findUnique({
          where: { email: body.email },
        });
        if (!user) return;

        if (user.status === "PENDING") {
          throw new APIError("FORBIDDEN", {
            message: "Your account is pending approval",
          });
        }
        if (user.status === "BANNED") {
          throw new APIError("FORBIDDEN", {
            message: "Your account has been banned",
          });
        }
        if (user.deletedAt) {
          throw new APIError("FORBIDDEN", { message: "Account not found" });
        }
      }

      if (ctx.path === "/sign-up/email") {
        if (!BYPASS_INVITE) {
          const body = ctx.body as { email: string; inviteCode: string };

          if (!body.inviteCode) {
            throw new APIError("BAD_REQUEST", {
              message: "Invite code is required",
            });
          }

          const invite = await prisma.invite.findUnique({
            where: { code: body.inviteCode },
            include: { createdBy: true },
          });

          if (!invite) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid invite code",
            });
          }
          if (invite.useCount >= invite.maxUses) {
            throw new APIError("BAD_REQUEST", {
              message: "Invite code has reached its limit",
            });
          }
          if (invite.expiresAt < new Date()) {
            throw new APIError("BAD_REQUEST", {
              message: "Invite code has expired",
            });
          }
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (!ctx.path.startsWith("/sign-up")) return;
      const newSession = ctx.context.newSession;
      if (!newSession) return;

      const body = ctx.body as { inviteCode: string };
      if (!body.inviteCode) return;

      const invite = await prisma.invite.findUnique({
        where: { code: body.inviteCode },
        include: { createdBy: true },
      });
      if (!invite) return;

      const status =
        invite.createdBy.role === "SuperAdmin" ? "ACTIVE" : "PENDING";

      await prisma.user.update({
        where: { id: newSession.user.id },
        data: { status },
      });

      await prisma.invite.update({
        where: { code: body.inviteCode },
        data: {
          useCount: { increment: 1 },
          usedById: newSession.user.id,
        },
      });
    }),
  },
});
