import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const n = await prisma.productImage.count({
  where: { NOT: { imageUrl: { contains: "placehold.co" } } },
});
console.log("non-placehold images:", n);
await prisma.$disconnect();
