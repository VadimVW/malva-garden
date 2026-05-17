# Staging (тимчасовий тестовий стенд)

Vercel — лише для **вітрини** та **адмінки**. API і БД — окремо (Render + Postgres). Це не фінальний production.

## URL (Vercel)

| Додаток | Production |
|---------|------------|
| Вітрина | https://web-black-nine-61.vercel.app |
| Адмінка | https://admin-swart-rho-88.vercel.app |

## 1. API + PostgreSQL на Render

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**.
2. Підключити GitHub-репозиторій `malva-garden` (гілка `main` / поточна).
3. Render прочитає [`render.yaml`](../render.yaml) і створить:
   - **malva-staging-db** (PostgreSQL, free)
   - **malva-api-staging** (Nest API, free)
4. Дочекатися зеленого деплою. Скопіювати URL сервісу, наприклад  
   `https://malva-api-staging.onrender.com`
5. Перевірка: `GET https://<host>/api/v1/health` → `{"status":"ok",...}`

### Помилка P1001 (`Can't reach database server`)

Часті причини на Render:

1. **Різні регіони** — internal `DATABASE_URL` працює лише в одному регіоні. Регіон **не можна змінити** після створення сервісу (поле read-only у Settings).
2. **БД ще піднімається** — `start:staging` робить до 30 спроб migrate (≈5 хв).
3. **Free Postgres** — `malva-staging-db` у статусі **Available**.

#### API Frankfurt + DB Oregon (ваш випадок)

**Варіант A — швидко, без видалення API (рекомендовано зараз)**

1. Render → **malva-staging-db** → **Connections** / **Info**.
2. Скопіюйте **External Database URL** (хост на кшталт `…oregon-postgres.render.com`, не короткий `dpg-…-a`).
3. Додайте в кінець, якщо немає: `?sslmode=require`  
   Приклад: `postgresql://user:pass@dpg-xxx.oregon-postgres.render.com/malva_garden?sslmode=require`
4. **malva-api-staging** → **Environment** → змінити **DATABASE_URL** на цей External URL (замість internal з Blueprint).
5. **Manual Deploy** API.

**Варіант B — чистий internal network (один регіон)**

Видалити **malva-staging-db** (Oregon) → у Blueprint синхронізувати / перестворити БД з `region: frankfurt` у [`render.yaml`](../render.yaml) (API лишається Frankfurt). Потім Manual Deploy API.

**Варіант C — API в Oregon**

Видалити **malva-api-staging** → створити знову з Blueprint (`region: oregon` у `render.yaml`). БД Oregon лишається, internal URL знову працює.

`start:staging` на Render виконує `prisma migrate deploy`, `prisma db seed`, потім запуск API.

### CORS (origins)

У `render.yaml` уже задано:

- `WEB_ORIGIN=https://web-black-nine-61.vercel.app`
- `ADMIN_ORIGIN=https://admin-swart-rho-88.vercel.app`

Якщо змінилися Vercel-аліаси — оновіть змінні в Render → **malva-api-staging** → **Environment** і зробіть **Manual Deploy**.

### WayForPay (оплата)

Додайте в **Environment** API (див. [`PAYMENTS_WAYFORPAY.md`](PAYMENTS_WAYFORPAY.md)):

- `API_PUBLIC_ORIGIN` = `https://malva-api-staging.onrender.com`
- `WAYFORPAY_MERCHANT_ACCOUNT`, `WAYFORPAY_MERCHANT_SECRET`, `WAYFORPAY_MERCHANT_PASSWORD`
- `WAYFORPAY_MERCHANT_DOMAIN` = `web-black-nine-61.vercel.app`
- `WAYFORPAY_RETURN_URL` = `https://web-black-nine-61.vercel.app/api/payment/wayforpay/return`
- `WAYFORPAY_SERVICE_URL` = `https://malva-api-staging.onrender.com/api/v1/payments/wayforpay/callback`

Після деплою з новою міграцією — тест: checkout → «Онлайн (WayForPay)» → оплата → статус **Оплачено** в адмінці.

### Альтернатива: Neon + Render

1. [Neon](https://neon.tech) → новий проєкт → скопіювати `DATABASE_URL` (з `?sslmode=require`).
2. На Render створити **Web Service** вручну (без Blueprint):
   - Root Directory: `apps/api`
   - Build: `npm install && npm run build`
   - Start: `npm run start:staging`
   - Env: `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`, `ADMIN_ORIGIN`, `ADMIN_SEED_PASSWORD=admin123`

## 2. Vercel: `NEXT_PUBLIC_API_URL`

Після появи URL API (локально, з кореня репо):

```bash
npm run staging:vercel-env -- https://malva-api-staging.onrender.com
```

Скрипт прописує `NEXT_PUBLIC_API_URL` у **web** і **admin** і робить `vercel deploy --prod`.

Вручну (Vercel Dashboard → Project → Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL=https://<your-api-host>/api/v1
```

Потім **Redeploy** обох проєктів.

## 3. Перевірка flow

| Крок | Дія |
|------|-----|
| Health | `curl https://<api>/api/v1/health` |
| Каталог | https://web-black-nine-61.vercel.app/catalog/kvity |
| Пагінація | `.../catalog/kvity?page=2` |
| Товар | клік по картці → `/product/<slug>` |
| Адмінка | https://admin-swart-rho-88.vercel.app/login |
| Логін | `admin@malva.local` / `admin123` (з seed) |
| CRUD | категорії, товари, замовлення, сторінки, налаштування |

## 4. Обмеження free tier

- **Render free**: сервіс «засинає» після простою; перший запит 30–60 с.
- **Vercel**: preview/production окремо; staging зараз на production-аліасах — для тесту достатньо.

## 5. Міграція з staging (пізніше)

Не прив’язуйтесь до Render/Vercel URL у контенті. Для релізу:

1. Новий хост API + БД (експорт/імпорт Postgres).
2. Оновити `NEXT_PUBLIC_API_URL`, `WEB_ORIGIN`, `ADMIN_ORIGIN`.
3. Власні домени за потреби.
