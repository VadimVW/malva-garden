# Malva Garden API — контракт адмінки (JWT)

Базовий URL: `http://localhost:4000/api/v1` (або ваш `PORT`). Усі шляхи нижче — відносно цього префікса.

Авторизація: `POST /auth/login` з JSON `{ "email", "password" }` → у відповіді `accessToken`. Далі заголовок `Authorization: Bearer <accessToken>`.

---

## Категорії та підкатегорії

Одна таблиця `Category`: **кореневі** записи (`parentId: null`) — розділи вітрини (наприклад «Квіти»), **нащадки** — підкатегорії (наприклад «Однорічні» з `parentId` = id «Квіти»). Унікальний **slug** глобально.

| Метод | Шлях | Опис |
|--------|------|------|
| GET | `/categories/tree` | Публічно: дерево для меню |
| GET | `/admin/categories` | Список (плоский) |
| POST | `/admin/categories` | Створити: `parentId?`, `name`, `slug`, `description?`, `imageUrl?`, `seoTitle?`, `seoDescription?`, `sortOrder?` |
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
| GET | `/site-settings` | Публічно: `[{ key, value }, …]` |
| GET | `/admin/settings` | Повний список з `id` |
| GET | `/admin/settings/:key` | Один запис |
| POST | `/admin/settings` | Створити `{ key, value }` (ключ має бути унікальним) |
| PUT | `/admin/settings/:key` | Upsert значення `{ value }` |
| DELETE | `/admin/settings/:key` | Видалити |

---

## Кошик (гість)

Публічні ендпоінти кошика без зміни контракту етапу 4; токен `X-Cart-Token` + `POST /orders` з кошика для оформлення.
