import { PrismaPg } from "@prisma/adapter-pg";
import { auth } from "../lib/auth";
import { PrismaClient } from "../lib/generated/prisma/client";
import { DATABASE_URL } from "../config/env";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: DATABASE_URL,
  }),
});
async function seed() {
  await auth.api.signUpEmail({
    body: {
      email: "admin@example.com",
      password: "password123",
      name: "Admin",
    },
  });

  await prisma.user.update({
    where: { email: "admin@example.com" },
    data: { role: "SuperAdmin", status: "ACTIVE" }
  })

  console.log("SuperAdmin created!")
}


seed();
