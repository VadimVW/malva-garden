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

### SMTP (підтвердження email в особистому кабінеті)

Повна інструкція: [`EMAIL_SMTP.md`](EMAIL_SMTP.md).

1. Обрати провайдера (напр. **Brevo** або **Resend**) і створити SMTP-облікові дані.
2. **malva-api-staging** → **Environment** → додати:

| Змінна | Приклад |
|--------|---------|
| `SMTP_ENABLED` | `true` |
| `SMTP_HOST` | `smtp-relay.brevo.com` |
| `SMTP_PORT` | `587` (вже в blueprint) |
| `SMTP_SECURE` | `false` |
| `SMTP_USER` | login / `resend` |
| `SMTP_PASS` | SMTP key |
| `MAIL_FROM` | `"Malva Garden" <noreply@yourdomain.com>` |
| `EMAIL_VERIFICATION_DEV` | `false` |

3. **Manual Deploy** API.
4. Тест: реєстрація на вітрині → лист на пошту → перехід за посиланням → замовлення в кабінеті.

`WEB_ORIGIN` має збігатися з URL вітрини Vercel (для посилання в листі).

### Альтернатива: Neon + Render

1. [Neon](https://neon.tech) → новий проєкт → скопіювати `DATABASE_URL` (з `?sslmode=require`).
2. На Render створити **Web Service** вручну (без Blueprint):
   - Root Directory: `apps/api`
   - Build: `npm install && npm run build`
   - Start: `npm run start:staging`
   - Env: `DATABASE_URL`, `JWT_SECRET`, `WEB_ORIGIN`, `ADMIN_ORIGIN`, `ADMIN_SEED_PASSWORD=admin123`

## 2. Vercel: змінні вітрини та адмінки

### Налаштування проєкту web (обовʼязково)

У [Vercel Dashboard](https://vercel.com) → проєкт **web** → **Settings** → **General**:

| Поле | Значення |
|------|----------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |

Якщо Root Directory порожній, збірка з кореня репо падає з `Missing script: "build"` (скрипт `build` є в кореневому `package.json` і в `apps/web`).

`apps/web/vercel.json`: install з кореня монорепо (`npm install -w web`), build — `next build` у `apps/web`.

### Де яка змінна

| Змінна | Проєкт | Де задавати |
|--------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | **web**, **admin** | Vercel |
| `NEXT_PUBLIC_SITE_URL` | **web** лише | Vercel |
| `WEB_ORIGIN`, `ADMIN_ORIGIN` | API | **Render** → malva-api-staging |
| `DATABASE_URL`, `JWT_SECRET`, WayForPay, НП | API | Render |

**Не плутати:** `NEXT_PUBLIC_SITE_URL` **не** додавати на Render. На API вже є `WEB_ORIGIN` з тим самим URL вітрини — для CORS і WayForPay, не для SEO.

### `NEXT_PUBLIC_API_URL`

Після появи URL API (локально, з кореня репо):

```bash
npm run staging:vercel-env -- https://malva-api-staging.onrender.com
```

Скрипт прописує `NEXT_PUBLIC_API_URL` у **web** і **admin** і робить `vercel deploy --prod`.

Вручну (Vercel Dashboard → **web** / **admin** → Settings → Environment Variables → **Production**):

```
NEXT_PUBLIC_API_URL=https://malva-api-staging.onrender.com/api/v1
```

### `NEXT_PUBLIC_SITE_URL` (SEO вітрини)

Лише проєкт **web** (не admin, не Render):

```
NEXT_PUBLIC_SITE_URL=https://web-black-nine-61.vercel.app
```

**Навіщо:** canonical-посилання, Open Graph / Twitter Card, абсолютні URL у `sitemap.xml`. Без змінної на Vercel часто підставляється `VERCEL_URL` (зазвичай ок для production-аліаса, але явне значення надійніше при зміні домену).

Після додавання або зміни — **Redeploy** вітрини (змінні `NEXT_PUBLIC_*` потрапляють у збірку).

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
| SEO robots | https://web-black-nine-61.vercel.app/robots.txt |
| SEO sitemap | https://web-black-nine-61.vercel.app/sitemap.xml |
| Canonical | View Source на `/product/<slug>` — `<link rel="canonical" href="https://web-black-nine-61.vercel.app/...">` |
| JSON-LD | View Source на товарі — `<script type="application/ld+json">` з `@type":"Product"` |

## 4. Обмеження free tier

- **Render free**: сервіс «засинає» після простою; перший запит 30–60 с.
- **Vercel**: preview/production окремо; staging зараз на production-аліасах — для тесту достатньо.

## 5. Міграція з staging (пізніше)

Не прив’язуйтесь до Render/Vercel URL у контенті. Для релізу:

1. Новий хост API + БД (експорт/імпорт Postgres).
2. Оновити `NEXT_PUBLIC_API_URL`, **`NEXT_PUBLIC_SITE_URL`** (Vercel web), `WEB_ORIGIN`, `ADMIN_ORIGIN` (Render).
3. Власні домени за потреби; після зміни домену — redeploy вітрини з новим `NEXT_PUBLIC_SITE_URL`.
