import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "../config/env";
import { username } from "better-auth/plugins";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: DATABASE_URL,
  }),
});

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
        type: "string" as const,
        required: true,
        defaultValue: "User",
        input: false,
      },
    },
  },
});
