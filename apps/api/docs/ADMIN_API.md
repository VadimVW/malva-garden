# Malva Garden API — контракт адмінки (JWT)

Базовий URL: `http://localhost:4000/api/v1` (або ваш `PORT`). Усі шляхи нижче — відносно цього префікса.

Авторизація:

| Метод | Шлях | Опис |
|--------|------|------|
| POST | `/admin/auth/login` | `{ "email", "password" }`. Rate limit за IP (10 / 15 хв). **Bearer mode (dev):** `{ access_token, refresh_token, expires_in }`. **Cookie mode (prod):** заголовок `X-Admin-Auth: cookie` + `credentials: include` → `Set-Cookie` httpOnly, тіло `{ expires_in, auth_mode: "cookie" }`. |
| POST | `/admin/auth/refresh` | Bearer: `{ refresh_token }`. Cookie: `X-Admin-Auth: cookie` + cookie `mg_admin_refresh`. Ротація refresh. |
| POST | `/admin/auth/logout` | Відклик refresh; cookie mode — `Clear-Cookie`. |
| GET | `/admin/auth/me` | JWT (Bearer або cookie `mg_admin_access`) → `{ id, email }`. |

**Dual-mode:** локально — `Authorization: Bearer <access_token>`; production — httpOnly `mg_admin_access` / `mg_admin_refresh` (`Domain=.malva-garden.com`, `Path=/api/v1/admin*`). Env: `NEXT_PUBLIC_ADMIN_AUTH_COOKIES=true` (admin build), `ADMIN_COOKIE_DOMAIN` (API).

Access token **15 хв**; refresh **7 днів** у `AdminRefreshToken`.

---

## Категорії та підкатегорії

Одна таблиця `Category`: **кореневі** записи (`parentId: null`) — розділи вітрини (наприклад «Квіти»), **нащадки** — підкатегорії (наприклад «Однорічні» з `parentId` = id «Квіти»). Унікальний **slug** глобально.

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/categories/tree` | Публічно: дерево для меню |
| GET | `/categories/:slug` | Публічно: категорія + крихти; поля банера: `bannerImageUrl`, `bannerTitle`, `bannerSubtitle` (тексти необовʼязкові) |
| GET | `/admin/categories` | Список (плоский) |
| POST | `/admin/categories` | Створити: `parentId?`, `name`, `slug`, `description?`, `imageUrl?`, `bannerImageUrl?`, `bannerTitle?`, `bannerSubtitle?`, `seoTitle?`, `seoDescription?`, `sortOrder?` |
| PATCH | `/admin/categories/:id` | Часткове оновлення; перевірка циклу в дереві |
| DELETE | `/admin/categories/:id` | Видалити (якщо немає дітей і товарів у цій категорії) |

---

## Товари

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/products` | Публічний список (query: `page`, `limit`, `categorySlug`, `sort`, `q`, …) |
| GET | `/products/:slug` | Публічна картка |
| GET | `/admin/products` | Усі товари (включно приховані) |
| POST | `/admin/products` | Створити + опційно `images[]` |
| PATCH | `/admin/products/:id` | Оновити поля товару (**без** масиву `images` — зображення окремими ендпоінтами) |
| DELETE | `/admin/products/:id` | М’яке видалення (`status: HIDDEN`) |

Поля тіла (create / patch): `name`, `slug`, `description?`, `careDescription?`, `price`, `stockQuantity`, `status` (`ACTIVE` \| `HIDDEN`), `categoryId?`, `seoTitle?`, `seoDescription?`. У POST можна додати `images: [{ imageUrl, altText?, sortOrder?, isMain? }]` .

### Зображення товару

| Метод | Шлях | Опис |
|--------|------|------|
| POST | `/admin/products/:productId/images` | `imageUrl`, `altText?`, `sortOrder?`, `isMain?` |
| PATCH | `/admin/products/:productId/images/:imageId` | Часткове оновлення; рівно одне головне фото нормалізується автоматично |
| DELETE | `/admin/products/:productId/images/:imageId` | Видалити; якщо це було головне — інше стає головним |

### Завантаження файлів

| Метод | Шлях | Опис |
|--------|------|------|
| POST | `/admin/uploads` | `multipart/form-data`, поле `file` (JPEG/PNG/WebP/GIF, до 5 MB) → `{ "url": "https://…/uploads/<uuid>.ext" }` |

Файли віддаються публічно з `GET /uploads/<filename>` (поза префіксом `/api/v1`). URL у відповіді будується з `API_PUBLIC_ORIGIN`.

---

## Замовлення

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/admin/orders` | Список (`page`, `limit`) |
| GET | `/admin/orders/:id` | Деталі + позиції |
| PATCH | `/admin/orders/:id/status` | `{ "orderStatus": "NEW" \| "PROCESSING" \| … }` |
| PATCH | `/admin/orders/:id/payment-status` | `{ "paymentStatus": "PENDING" \| "PAID" \| "FAILED" }` |
| PATCH | `/admin/orders/:id/manager-comment` | `{ "managerComment": "..." }` |

---

## Контент-сторінки

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/pages/:slug` | Публічно |
| GET | `/admin/pages` | Список |
| POST | `/admin/pages` | `{ title, slug, content, seoTitle?, seoDescription? }` |
| PATCH | `/admin/pages/:slug` | Оновити |
| DELETE | `/admin/pages/:slug` | Видалити |

---

## Налаштування сайту (`key` / `value`)

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/site-settings` | Публічно: `[{ key, value }, …]` — лише **whitelist** ключів (див. `apps/api/src/settings/public-site-settings.ts`) |
| GET | `/admin/settings` | Повний список з `id` |
| GET | `/admin/settings/:key` | Один запис |
| POST | `/admin/settings` | Створити `{ key, value }` (ключ має бути унікальним) |
| PUT | `/admin/settings/:key` | Upsert значення `{ value }` |
| DELETE | `/admin/settings/:key` | Видалити |

---

## Кошик (гість)

Публічні ендпоінти кошика без зміни контракту етапу 4; токен `X-Cart-Token` + `POST /orders` з кошика для оформлення.
