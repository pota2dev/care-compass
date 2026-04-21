const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to the database...");
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log("Query successful! Data:", users);
  } catch (error) {
    console.error("Query failed!");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
