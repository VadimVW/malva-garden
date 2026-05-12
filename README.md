# Malva Garden

Монорепозиторій інтернет-магазину: публічний сайт на **Next.js** та **REST API** на **NestJS**.

## Структура

- `apps/web` — Next.js (App Router), українська локаль за замовчуванням у `src/app/layout.tsx`
- `apps/api` — NestJS, префікс API `/api/v1`

## Вимоги

- Node.js 20+
- npm 10+

## Встановлення

```bash
cd malva-garden
npm install
```

## Розробка

Окремо фронт (http://localhost:3000) і бекенд (http://localhost:4000):

```bash
npm run dev:web
npm run dev:api
```

Після `npm install` у корені можна додати скрипт з `concurrently` для одного процесу — зараз залежності ставляться в кожному workspace окремо через `npm install` у корені (hoist).

## CORS

API дозволяє запити з `http://localhost:3000` (налаштування в `apps/api/src/main.ts`).

## Наступні кроки

- PostgreSQL + Prisma (або TypeORM) у `apps/api`
- Адмін-маршрути та JWT
- Змінні середовища: скопіюйте `.env.example` у `apps/web` та `apps/api` після їх додавання
