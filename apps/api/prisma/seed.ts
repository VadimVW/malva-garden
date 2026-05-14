import { PrismaClient, ProductStatus } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@malva.local" },
    update: { passwordHash: hash },
    create: { email: "admin@malva.local", passwordHash: hash },
  });

  const catKvity = await prisma.category.upsert({
    where: { slug: "kvity" },
    update: { parentId: null },
    create: {
      name: "Квіти",
      slug: "kvity",
      sortOrder: 1,
      description: "Насіння та цибулини квітів",
    },
  });

  const catOdnorichni = await prisma.category.upsert({
    where: { slug: "odnorichni" },
    update: { parentId: catKvity.id, name: "Однорічні" },
    create: {
      name: "Однорічні",
      slug: "odnorichni",
      parentId: catKvity.id,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: "bagatorichni" },
    update: { parentId: catKvity.id },
    create: {
      name: "Багаторічні",
      slug: "bagatorichni",
      parentId: catKvity.id,
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: "hrizantemy" },
    update: { parentId: catKvity.id },
    create: {
      name: "Хризантеми",
      slug: "hrizantemy",
      parentId: catKvity.id,
      sortOrder: 3,
    },
  });

  const catShrubs = await prisma.category.upsert({
    where: { slug: "dekoratyvni-kushi" },
    update: { parentId: null },
    create: {
      name: "Декоративні кущі",
      slug: "dekoratyvni-kushi",
      sortOrder: 10,
      description: "Гортензії, троянди, барбарис та інше",
    },
  });

  await prisma.category.upsert({
    where: { slug: "hortenzii" },
    update: { parentId: catShrubs.id },
    create: {
      name: "Гортензії",
      slug: "hortenzii",
      parentId: catShrubs.id,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: "barbaris" },
    update: { parentId: catShrubs.id },
    create: {
      name: "Барбарис",
      slug: "barbaris",
      parentId: catShrubs.id,
      sortOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: "trojanda" },
    update: { parentId: catShrubs.id },
    create: {
      name: "Троянда",
      slug: "trojanda",
      parentId: catShrubs.id,
      sortOrder: 3,
    },
  });

  await prisma.category.upsert({
    where: { slug: "klimatis" },
    update: { parentId: catShrubs.id },
    create: {
      name: "Кліматіс",
      slug: "klimatis",
      parentId: catShrubs.id,
      sortOrder: 4,
    },
  });

  await prisma.category.upsert({
    where: { slug: "dekoratyvni-travy" },
    update: { parentId: null },
    create: {
      name: "Декоративні трави",
      slug: "dekoratyvni-travy",
      sortOrder: 11,
    },
  });

  const catVeg = await prisma.category.upsert({
    where: { slug: "ovochi" },
    update: {},
    create: {
      name: "Овочі",
      slug: "ovochi",
      sortOrder: 20,
    },
  });

  const p1 = await prisma.product.upsert({
    where: { slug: "petuniya-miks" },
    update: { categoryId: catOdnorichni.id },
    create: {
      name: "Петунія мікс",
      slug: "petuniya-miks",
      price: 49.9,
      stockQuantity: 120,
      status: ProductStatus.ACTIVE,
      categoryId: catOdnorichni.id,
      description: "Насіння петунії суміш кольорів.",
      careDescription: "Розсаду висаджувати після заморозків.",
      seoTitle: "Петунія мікс — купити насіння",
      seoDescription: "Насіння петунії Malva Garden.",
    },
  });

  await prisma.productImage.deleteMany({ where: { productId: p1.id } });
  await prisma.productImage.create({
    data: {
      productId: p1.id,
      imageUrl: "https://placehold.co/600x600/png?text=Petunia",
      altText: "Петунія",
      isMain: true,
      sortOrder: 0,
    },
  });

  await prisma.product.upsert({
    where: { slug: "pomidor-cherry" },
    update: {},
    create: {
      name: "Помідор черрі",
      slug: "pomidor-cherry",
      price: 35,
      stockQuantity: 0,
      status: ProductStatus.ACTIVE,
      categoryId: catVeg.id,
      description: "Солодкі черрі для теплиці та відкритого ґрунту.",
    },
  });

  const pages: { slug: string; title: string; content: string }[] = [
    {
      slug: "dostavka-ta-oplata",
      title: "Доставка та оплата",
      content: "<p>Текст сторінки можна змінити в адмін-панелі.</p>",
    },
    {
      slug: "povernennya",
      title: "Повернення товару",
      content: "<p>Умови повернення за домовленістю.</p>",
    },
    {
      slug: "publichna-oferta",
      title: "Публічна оферта",
      content: "<p>Договір оферти.</p>",
    },
    {
      slug: "konfidenciynist",
      title: "Політика конфіденційності",
      content: "<p>Обробка персональних даних.</p>",
    },
    {
      slug: "kontakty",
      title: "Контакти",
      content: "<p>Телефон та email магазину.</p>",
    },
  ];

  for (const p of pages) {
    await prisma.contentPage.upsert({
      where: { slug: p.slug },
      update: { title: p.title, content: p.content },
      create: p,
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: "hero_title" },
    update: { value: "Весна в саду" },
    create: { key: "hero_title", value: "Весна в саду" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
