import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import {
  PUBLIC_SITE_SETTING_DEFAULTS,
  PUBLIC_SITE_SETTING_KEYS,
} from "../src/settings/public-site-settings";
import {
  clearOrdersAndProducts,
  seedSadzhantsiProducts,
} from "./seed-sadzhantsi";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD ?? "admin123";
  const hash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@malva.local" },
    update: { passwordHash: hash },
    create: { email: "admin@malva.local", passwordHash: hash },
  });

  const cleared = await clearOrdersAndProducts(prisma);
  console.log(
    `Cleared: ${cleared.orders} orders, ${cleared.carts} carts, ${cleared.products} products`,
  );

  const { total, metaTotal } = await seedSadzhantsiProducts(prisma);
  console.log(`Seeded ${total} products (JSON meta.total=${metaTotal})`);

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

  const catalogHubSettings: { key: string; value: string }[] = [
    {
      key: "catalog_hub_title",
      value: "Оберіть розділ каталогу",
    },
    {
      key: "catalog_hub_subtitle",
      value: "Оберіть категорію, щоб переглянути товари.",
    },
  ];

  const hubByCategorySlug: Record<
    string,
    { hubSubtitle: string; hubImageUrl: string }
  > = {
    kvity: {
      hubSubtitle:
        "Однорічні, багаторічні, хризантеми та інші культури для саду й балкону",
      hubImageUrl: "/images/figma/catalog/hero-kvity.png",
    },
    "dekoratyvni-kushi": {
      hubSubtitle: "Гортензії, троянди, клематиси та інші кущі для ландшафту",
      hubImageUrl:
        "https://svitroslyn.ua/upload/medialibrary/012/01286d729cbc86f33ba7f6a4595fabec.jpg",
    },
    "dekoratyvni-travy": {
      hubSubtitle: "Трави та злаки для клумб, бордюрів і природних композицій",
      hubImageUrl:
        "https://svitroslyn.ua/upload/medialibrary/72c/72cbc797c9e729c37b808c7f1681a001.jpg",
    },
  };

  for (const [slug, hub] of Object.entries(hubByCategorySlug)) {
    await prisma.category.updateMany({
      where: { slug },
      data: hub,
    });
  }

  const publicSettings = PUBLIC_SITE_SETTING_KEYS.map((key) => ({
    key,
    value: PUBLIC_SITE_SETTING_DEFAULTS[key],
  }));

  for (const row of [...catalogHubSettings, ...publicSettings]) {
    await prisma.siteSetting.upsert({
      where: { key: row.key },
      update: { value: row.value },
      create: row,
    });
  }

  await prisma.siteSetting.deleteMany({
    where: { key: "header_whatsapp_url" },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
