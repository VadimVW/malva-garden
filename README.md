# Malva Garden

Монорепозиторій інтернет-магазину: публічний сайт на **Next.js** та **REST API** на **NestJS** + **PostgreSQL** (Prisma).

## Структура

- `apps/web` — Next.js (App Router), `lang="uk"`, маршрути: `/catalog`, `/product/[slug]`, `/cart`, `/checkout`, `/pages/[slug]`
- `apps/admin` — Next.js адмін-панель (порт **3001**): категорії, товари, замовлення, сторінки, налаштування
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
Скопіюйте `apps/admin/.env.example` → `apps/admin/.env` (той самий `NEXT_PUBLIC_API_URL`).  
Файл **`apps/api/.env`** можна створити вручну або він з’явиться автоматично при першому запуску **`npm run db:migrate:init`** / **`npm run db:seed`** (копія з `apps/api/.env.example`). У `apps/api/.env` додайте **`ADMIN_ORIGIN=http://localhost:3001`** для CORS адмінки.

```bash
npm run db:migrate:init
npm run db:seed
```

Або з `apps/api`: `npm run prisma:migrate -- --name init` та `npm run prisma:seed`.

Не запускайте голий `npx prisma …` з кореня репозиторію без `--schema` — npm може підтягнути **Prisma 7**, де змінилась конфігурація. У проєкті зафіксовано **Prisma 6.3.1** у `apps/api`.

- Сайт: http://localhost:3000  
- **Адмін-панель:** http://localhost:3001 (логін `admin@malva.local` / пароль з `ADMIN_SEED_PASSWORD`, за замовчуванням `admin123`)  
- API: http://localhost:4000/api/v1/health  
- Токен: `POST /api/v1/admin/auth/login` → `Authorization: Bearer …` для `GET/PATCH /api/v1/admin/...`

## Розробка

```bash
npm run dev
```

Запускає вітрину, API та адмінку паралельно (`concurrently`). Окремо: `npm run dev:admin` (лише адмінка на порту 3001).

## Верстка з Figma

Поточний UI — лише **каркас** (навігація + списки) без макетів. Перед **піксельною версткою** надішліть, будь ласка, **посилання на Figma** (файл і ключові фрейми / mobile + desktop), щоб узгодити компоненти й токени.

## Далі по продукту

- Завантаження зображень (S3 / локальний стор), WebP
- Sitemap, robots, JSON-LD Product
- Далі: refresh-токен, rate limit на логін, завантаження зображень (замість URL)
- LiqPay webhook і зміна `paymentStatus`
