import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
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
    {
      key: "catalog_section_kvity_title",
      value: "Квіти",
    },
    {
      key: "catalog_section_kvity_subtitle",
      value:
        "Однорічні, багаторічні, хризантеми та інші культури для саду й балкону",
    },
    {
      key: "catalog_section_kvity_image",
      value: "/images/figma/catalog/hero-kvity.png",
    },
    {
      key: "catalog_section_kushi_title",
      value: "Декоративні кущі",
    },
    {
      key: "catalog_section_kushi_subtitle",
      value: "Гортензії, троянди, клематиси та інші кущі для ландшафту",
    },
    {
      key: "catalog_section_kushi_image",
      value: "/images/figma/home/banner-bg.png",
    },
    {
      key: "catalog_section_travy_title",
      value: "Декоративні трави",
    },
    {
      key: "catalog_section_travy_subtitle",
      value: "Трави та злаки для клумб, бордюрів і природних композицій",
    },
    {
      key: "catalog_section_travy_image",
      value: "/images/figma/home/banner-bg.png",
    },
  ];

  const headerSettings: { key: string; value: string }[] = [
    { key: "header_phone", value: "+380 67 258 98 28" },
    { key: "header_whatsapp_url", value: "https://wa.me/380672589828" },
    { key: "header_telegram_url", value: "https://t.me/malvagarden" },
  ];

  for (const row of [...catalogHubSettings, ...headerSettings]) {
    await prisma.siteSetting.upsert({
      where: { key: row.key },
      update: { value: row.value },
      create: row,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
