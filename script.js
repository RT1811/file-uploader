import { prisma } from "./lib/prisma.js";

async function main() {
  const user = await prisma.user.create({
    data: {
      username: "testuser",
      password: "not-a-real-hash-yet",
    },
  });

  console.log("Created user:", user);

  const allUsers = await prisma.user.findMany();
  console.log("All users:", allUsers);
}

main()
  .catch((err) => console.error(err))
  .finally(() => prisma.$disconnect());