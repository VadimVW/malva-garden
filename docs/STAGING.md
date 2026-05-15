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

`start:staging` на Render виконує `prisma migrate deploy`, `prisma db seed`, потім запуск API.

### CORS (origins)

У `render.yaml` уже задано:

- `WEB_ORIGIN=https://web-black-nine-61.vercel.app`
- `ADMIN_ORIGIN=https://admin-swart-rho-88.vercel.app`

Якщо змінилися Vercel-аліаси — оновіть змінні в Render → **malva-api-staging** → **Environment** і зробіть **Manual Deploy**.

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
