# Malva Garden

Монорепозиторій інтернет-магазину: публічний сайт на **Next.js** та **REST API** на **NestJS** + **PostgreSQL** (Prisma).

## Структура

- `apps/web` — Next.js (App Router), `lang="uk"`: Figma-вітрина (`/`, `/catalog/kvity`, товар, кошик, checkout, інфо-сторінки) + MVP-каталог `/catalog/[slug]` на `SiteShell`
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

**Корисні URL вітрини:** `/catalog/kvity`, `/product/<slug>`, `/cart`, `/checkout`, `/pages/dostavka-ta-oplata`, `/order/success` (після оформлення).

## Розробка

```bash
npm run dev
```

Запускає вітрину, API та адмінку паралельно (`concurrently`). Окремо: `npm run dev:admin` (лише адмінка на порту 3001).

## Staging (тимчасовий тест)

Повна інструкція: **[docs/STAGING.md](docs/STAGING.md)** — Render (API + Postgres) + Vercel (web/admin), без прив’язки до Vercel як до фінального production.

Коротко: Blueprint з [`render.yaml`](render.yaml) → `npm run staging:vercel-env -- https://<api-host>`.

## Тестовий деплой (Vercel)

Монорепо: **два проєкти Vercel** + API з БД окремо.

| Проєкт | Root Directory | Build | Env |
|--------|----------------|-------|-----|
| **malva-web** | `apps/web` | `npm run build -w web` (або через `vercel.json`) | `NEXT_PUBLIC_API_URL` → URL API |
| **malva-admin** | `apps/admin` | `npm run build -w admin` | `NEXT_PUBLIC_API_URL` |
| **API** | — | Nest на Railway / Render / Fly тощо | `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`, `ADMIN_ORIGIN` |

1. Підняти **PostgreSQL** (Neon, Vercel Postgres, або Docker на VPS) і задеплоїти **API** (`npm run build -w api`, `prisma migrate deploy`, `db:seed` на staging).
2. У Vercel створити проєкт для `apps/web`, вказати Root Directory `apps/web`, додати `NEXT_PUBLIC_API_URL=https://…/api/v1`.
3. Другий проєкт для `apps/admin`, Root `apps/admin`; у API виставити `ADMIN_ORIGIN` = preview-URL адмінки.
4. У API: `WEB_ORIGIN` = preview-URL вітрини. Перевірити логін адмінки та каталог з `?page=2`.

**Поточні production URL (Vercel, акаунт vadimvw):**

| Додаток | URL |
|---------|-----|
| Вітрина | https://web-black-nine-61.vercel.app |
| Адмінка | https://admin-swart-rho-88.vercel.app |

Поки API не задеплоєно, у Vercel для **web** і **admin** треба виставити `NEXT_PUBLIC_API_URL` (після появи публічного URL API). У API — `WEB_ORIGIN` і `ADMIN_ORIGIN` з таблиці вище.

CLI: `npm run deploy:web` / `npm run deploy:admin` (потрібен `npx vercel login`).

Локально каталог: `/catalog/kvity?page=2` — пагінація 24 товари на сторінку.

## Вітрина (UI)

- **Figma desktop:** головна, каталоги (`/catalog/kvity`, декоративні кущі/трави), картка товару, кошик, checkout, інфо-сторінки з адмінки (`/pages/[slug]`).
- **Кошик:** гостьовий токен у `localStorage` (`X-Cart-Token`); після «Додати в кошик» — toast і бейдж у шапці.
- **Анімації:** CSS у `apps/web/src/app/globals.css` (класи `mg-*`, `prefers-reduced-motion`);

## Далі по продукту

- SEO: `robots.txt`, `sitemap.xml`, JSON-LD для товару (базові metadata на інфо-сторінках уже є)
- Мобільна головна (окремий Figma-кадр)
- Завантаження зображень (S3 / локальний стор), WebP
- Refresh-токен, rate limit на логін (адмінка)
- LiqPay webhook і зміна `paymentStatus`
