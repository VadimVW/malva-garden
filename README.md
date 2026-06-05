# Malva Garden



Монорепозиторій інтернет-магазину: публічний сайт на **Next.js** та **REST API** на **NestJS** + **PostgreSQL** (Prisma).



## Структура



- `apps/web` — Next.js (App Router), порт **3300**, `lang="uk"`: (`/`, hub `/catalog`, `/catalog/[[...segments]]`, товар, кошик, checkout, ЛК, інфо-сторінки). UI: `src/components/{store,ui,checkout,account}/`

- `apps/admin` — Next.js адмін-панель (порт **3301**): категорії, товари, замовлення, сторінки, налаштування, відгуки

- `apps/api` — NestJS, префікс `/api/v1` (товари, категорії, кошик, замовлення, контент, адмін JWT, WayForPay, НП)

- `docker-compose.yml` — PostgreSQL 16 для локальної розробки

- `docker-compose.prod.yml` — production-стек (Postgres, API, web, admin, Caddy)



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

Файл **`apps/api/.env`** можна створити вручну або він з’явиться автоматично при першому запуску **`npm run db:migrate:init`** / **`npm run db:seed`** (копія з `apps/api/.env.example`). У `apps/api/.env` додайте **`ADMIN_ORIGIN=http://localhost:3301`** для CORS адмінки.



**Порти dev (3300/3301):** на Windows порти 3000–3035 часто зарезервовані Hyper-V (`EACCES`). Якщо у вас уже є `apps/api/.env` з `localhost:3000` — оновіть на `3300`/`3301`.



```bash

npm run db:migrate:init

npm run db:seed

```



Або з `apps/api`: `npm run prisma:migrate -- --name init` та `npm run prisma:seed`.



Не запускайте голий `npx prisma …` з кореня репозиторію без `--schema` — npm може підтягнути **Prisma 7**, де змінилась конфігурація. У проєкті зафіксовано **Prisma 6.3.1** у `apps/api`.



- Сайт: http://localhost:3300

- **Адмін-панель:** http://localhost:3301 — логін **`admin@malva.local`** / пароль з `ADMIN_SEED_PASSWORD` (за замовч. `admin123`). На **prod** email адміна — доменний (`info@malva-garden.com`); див. `docs/EMAIL_CLOUDFLARE_ROUTING.md`

- API: http://localhost:4000/api/v1/health

- Токен: `POST /api/v1/admin/auth/login` → `Authorization: Bearer …` для `GET/PATCH /api/v1/admin/...`



**Корисні URL вітрини:** `/catalog`, `/catalog/kvity`, `/product/<slug>`, `/cart`, `/checkout`, `/account/login`, `/pages/dostavka-ta-oplata`, `/order/success` (після оформлення).



## Розробка



```bash

npm run dev

```



Запускає вітрину, API та адмінку паралельно (`concurrently`). Окремо: `npm run dev:web`, `npm run dev:api`, `npm run dev:admin`.



**Корисні скрипти (з кореня):**



| Команда | Призначення |

|---------|-------------|

| `npm run lint` | ESLint у web, api, admin |

| `npm run build:web` / `build:api` / `build:admin` | Збірка workspace |

| `npm run db:migrate` | Prisma migrate dev |

| `npm run db:seed` | Seed (~160 товарів, категорії, сторінки) |

| `npm run db:studio` | Prisma Studio |



## Production



Деплой на **Netcup VPS** (Docker Compose + Caddy). Детальний runbook — у `docs/PRODUCTION_VPS.md`.



| Компонент | URL |

|-----------|-----|

| Вітрина | https://malva-garden.com |

| Адмінка | https://admin.malva-garden.com |

| API health | https://malva-garden.com/api/v1/health |



**CI/CD:** push гілки `deploy/vps-production` → GitHub Actions (`.github/workflows/deploy-vps.yml`).



**Локально на VPS (орієнтир):** скопіювати `.env.production.example` → `.env`, потім:



```bash

npm run compose:prod:build

npm run compose:prod:up

```



Логи: `npm run compose:prod:logs`. Після зміни `NEXT_PUBLIC_*` — перезбірка контейнера `web` / `admin`.



## Вітрина (UI)



- **Desktop (Figma):** головна, hub `/catalog`, динамічні розділи `/catalog/[[...segments]]`, картка товару, кошик, checkout, інфо-сторінки з адмінки (`/pages/[slug]`).

- **Mobile:** chrome (header, tab bar, drawer), головна та каталог (2 колонки); товар/кошик/checkout — responsive desktop fallback.

- **Кошик:** гостьовий токен у `localStorage` (`X-Cart-Token`); toast і бейдж у шапці.

- **ЛК:** реєстрація, Google Sign-In, адреси НП, історія замовлень.

- **Оплата:** WayForPay (онлайн) + готівка при отриманні; доставка НП / самовивіз.

- **SEO:** `robots.txt`, `sitemap.xml`, metadata, JSON-LD товару.

- **Анімації:** CSS у `apps/web/src/app/globals.css` (класи `mg-*`, `prefers-reduced-motion`).



## Документація (локально в `docs/`)



Runbook’и зберігаються в `docs/` і не комітяться в git (див. `.gitignore`). У супроводжувача репозиторію зазвичай є:



- `PRODUCTION_VPS.md` — VPS, Caddy, CI/CD, env

- `PAYMENTS_WAYFORPAY.md` — WayForPay

- `EMAIL_SMTP.md` — Brevo / verify-email

- `GOOGLE_SIGNIN.md` — OAuth origins

- `SEO_GOOGLE.md` — Google Search Console



API-контракти в репозиторії: `apps/api/docs/ADMIN_API.md`, `apps/api/docs/CUSTOMER_AUTH.md`.



## Беклог (коротко)



- Пошта `@malva-garden.com` (Cloudflare Email Routing → Gmail), prod admin email

- `NOVA_POSHTA_API_KEY` на production VPS

- Індексація ключових сторінок у GSC (sitemap уже подано)

- Бекапи Postgres (`pg_dump`), моніторинг

- Адмінка: httpOnly cookies на prod (`NEXT_PUBLIC_ADMIN_AUTH_COOKIES`)

- Mobile polish: touch nav; окремі mobile-макети товару/кошика/checkout (опційно)


