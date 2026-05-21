# Customer auth (storefront)

Публічний API для особистого кабінету. **Не плутати** з `POST /admin/auth/login`.

## Env

- `JWT_SECRET` — спільний з адміном; у payload клієнта обов’язково `role: "customer"`.
- `WEB_ORIGIN` — база для посилання підтвердження email.
- `EMAIL_VERIFICATION_DEV=true` — локально: `verificationUrl` у JSON, якщо SMTP не відправив лист.
- **SMTP на staging:** `docs/EMAIL_SMTP.md` — `SMTP_ENABLED=true`, `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`; на staging `EMAIL_VERIFICATION_DEV=false`.

## Auth

| Method | Path | Auth |
|--------|------|------|
| POST | `/customer/auth/register` | — (`acceptPrivacy: true` обов’язково) |
| POST | `/customer/auth/login` | — |
| POST | `/customer/auth/verify-email` | — body `{ token }` |

## Customer JWT

`Authorization: Bearer <access_token>`

## Me

| Method | Path |
|--------|------|
| GET | `/customer/me` |
| PATCH | `/customer/me` — `fullName`, `phone` |
| POST | `/customer/me/resend-verification` |
| GET | `/customer/me/orders` — `page`, `limit` |
| GET | `/customer/me/orders/:orderNumber` |
| GET/POST/PATCH/DELETE | `/customer/me/addresses` |

## Замовлення

- Нові: `customerId` при `POST /orders` з Bearer customer.
- Історичні: після `emailVerifiedAt` — також за `customerEmail` і нормалізованим `customerPhone`.

## Кошик

`POST /cart/merge` — Bearer customer + заголовок `X-Cart-Token` (гостьовий). Повертає оновлений кошик `{ token, items, subtotal }`.
