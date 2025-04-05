import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2"; // Import Argon2

const prisma = new PrismaClient();

async function main() {
  // Fetch admin email and password from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD is not set in the environment variables.");
  }

  // Check if an admin already exists
  const adminExists = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    // If no admin user exists, create one
    const hashedPassword = await argon2.hash(adminPassword);
    await prisma.user.create({
      data: {
        email: adminEmail!,
        password: hashedPassword,
        name: "Admin User",
        role: Role.ADMIN, // Ensure this matches your enum
      },
    });

    console.log("Admin user created!");
  } else {
    console.log("Admin user already exists!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
