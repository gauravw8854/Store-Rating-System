require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("DemoPass!1", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "System Administrator Gaurav",
      email: "admin@gmail.com",
      address: "Pune, Maharashtra",
      passwordHash,
      role: "ADMIN"
    }
  });

  const owner1 = await prisma.user.upsert({
    where: { email: "owner1@gmail.com" },
    update: {},
    create: {
      name: "Demo Store Owner Account1",
      email: "owner1@gmail.com",
      address: "Pune, Maharashtra",
      passwordHash,
      role: "STORE_OWNER"
    }
  });
  const owner2 = await prisma.user.upsert({
    where: { email: "owner2@gmail.com" },
    update: {},
    create: {
      name: "Demo Store Owner Account2",
      email: "owner2@gmail.com",
      address: "Pune, Maharashtra",
      passwordHash,
      role: "STORE_OWNER"
    }
  });

  const user = await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      name: "Demo Normal User Account",
      email: "user@gmail.com",
      address: "Pune, Maharashtra",
      passwordHash,
      role: "USER"
    }
  });

  const store1 = await prisma.store.upsert({
    where: { ownerId: owner1.id },
    update: {},
    create: {
      name: "Demo Store1",
      email: "store1@gmail.com",
      address: "Koregaon Park, Pune",
      ownerId: owner1.id
    }
  });

    const store2 = await prisma.store.upsert({
    where: { ownerId: owner2.id },
    update: {},
    create: {
      name: "Demo Store2",
      email: "store2@gmail.com",
      address: "Wagholi, Pune",
      ownerId: owner2.id
    }
  });

 await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId: store1.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      storeId: store1.id,
      rating: 5
    }
  });

  
  await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId: user.id,
        storeId: store2.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      storeId: store2.id,
      rating: 5
    }
  });

  console.log("Seed completed successfully!");
  console.log("Password for newly created demo accounts: DemoPass!1");
  console.log("Admin:", admin.email);
  console.log("Owner 1:", owner1.email);
  console.log("Owner 2:", owner2.email);
  console.log("User:", user.email);
  console.log("Store 1:", store1.name);
  console.log("Store 2:", store2.name);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });