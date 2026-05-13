# Malva Garden

Монорепозиторій інтернет-магазину: публічний сайт на **Next.js** та **REST API** на **NestJS** + **PostgreSQL** (Prisma).

## Структура

- `apps/web` — Next.js (App Router), `lang="uk"`, маршрути: `/catalog`, `/product/[slug]`, `/cart`, `/checkout`, `/pages/[slug]`
- `apps/api` — NestJS, префікс `/api/v1` (товари, категорії, кошик, замовлення, контент, адмін JWT)
- `docker-compose.yml` — PostgreSQL 16 для локальної розробки

## Вимоги

- Node.js 20+
- npm 10+
- Docker (для БД) або власний PostgreSQL

## Перший запуск

```bash
cd malva-garden
npm install
docker compose up -d
```

Створіть `apps/web/.env` з `apps/web/.env.example` (для `NEXT_PUBLIC_API_URL`).  
Файл **`apps/api/.env`** можна створити вручну або він з’явиться автоматично при першому запуску **`npm run db:migrate:init`** / **`npm run db:seed`** (копія з `apps/api/.env.example`).

```bash
npm run db:migrate:init
npm run db:seed
```

Або з `apps/api`: `npm run prisma:migrate -- --name init` та `npm run prisma:seed`.

Не запускайте голий `npx prisma …` з кореня репозиторію без `--schema` — npm може підтягнути **Prisma 7**, де змінилась конфігурація. У проєкті зафіксовано **Prisma 6.3.1** у `apps/api`.

- Сайт: http://localhost:3000  
- API: http://localhost:4000/api/v1/health  
- Адмін логін (seed): `admin@malva.local` / пароль з `ADMIN_SEED_PASSWORD` у `apps/api/.env` (за замовчуванням `admin123`).  
- Токен: `POST /api/v1/admin/auth/login` → `Authorization: Bearer …` для `GET/PATCH /api/v1/admin/...`

## Розробка

```bash
npm run dev
```

Запускає Next і Nest паралельно (`concurrently`).

## Верстка з Figma

Поточний UI — лише **каркас** (навігація + списки) без макетів. Перед **піксельною версткою** надішліть, будь ласка, **посилання на Figma** (файл і ключові фрейми / mobile + desktop), щоб узгодити компоненти й токени.

## Далі по продукту

- Завантаження зображень (S3 / локальний стор), WebP
- Sitemap, robots, JSON-LD Product
- Окрема адмін UI (React Admin або власна) поверх REST
- LiqPay webhook і зміна `paymentStatus`
