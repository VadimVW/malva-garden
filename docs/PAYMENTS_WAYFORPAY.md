# WayForPay — Malva Garden

## Env (API)

| Variable | Description |
|----------|-------------|
| `WAYFORPAY_MERCHANT_ACCOUNT` | Merchant login from WayForPay cabinet |
| `WAYFORPAY_MERCHANT_SECRET` | Secret key (HMAC signatures) |
| `WAYFORPAY_MERCHANT_PASSWORD` | Merchant password (cabinet / future API; not used in Purchase form) |
| `WAYFORPAY_MERCHANT_DOMAIN` | Store domain registered in WFP (e.g. `web-black-nine-61.vercel.app`) |
| `API_PUBLIC_ORIGIN` | Public HTTPS URL of API (for default `serviceUrl`) |
| `WAYFORPAY_RETURN_URL` | Optional; default `{WEB_ORIGIN}/api/payment/wayforpay/return` (POST handler → redirect to return page) |
| `WAYFORPAY_SERVICE_URL` | Optional; default `{API_PUBLIC_ORIGIN}/api/v1/payments/wayforpay/callback` |

Copy `apps/api/.env.example` → `apps/api/.env`. **Never commit real secrets.**

## Flow

1. Checkout → `paymentMethod: wayforpay` → `POST /api/v1/orders`
2. Web → `/order/pay?orderNumber=...` → `POST /api/v1/orders/:orderNumber/payment/wayforpay` → auto-POST to `https://secure.wayforpay.com/pay`
3. WayForPay → `serviceUrl` callback → updates `paymentStatus` (`PAID` / `FAILED`)
4. Browser → `returnUrl` (WayForPay **POST**) → `/api/payment/wayforpay/return` → redirect → `/order/payment/return` → poll `POST .../payment/wayforpay/sync` then `GET .../payment-status`

WayForPay sends **POST** to `returnUrl` by default. Do not point `returnUrl` at an App Router **page** — Next.js returns `Server action not found`. Either use the route above or enable “Вимкнути відправку POST на returnUrl” in the [WayForPay merchant settings](https://help.wayforpay.com/view/3342451).

## Staging

- Storefront: `https://web-black-nine-61.vercel.app`
- API callback: `https://malva-api-staging.onrender.com/api/v1/payments/wayforpay/callback`
- Set the same env vars on **Render** (API service). Див. [`STAGING.md`](STAGING.md).

## Production (VPS, §14.1.2)

**Хостинг:** Netcup VPS, домен **malva-garden.com** — API і вітрина на **одному** origin (Caddy: `/api/v1` → `api`, `/api/payment/*` → `web`).

### 1. Кабінет WayForPay

1. [merchant.wayforpay.com](https://merchant.wayforpay.com/) → **Налаштування магазину**.
2. **Домен магазину** = `malva-garden.com` (без `https://`, без `www` — як у полі `merchantDomainName`).
3. Скопіювати **Merchant login**, **Secret key**, **Merchant password**.
4. **Service URL (callback):** `https://malva-garden.com/api/v1/payments/wayforpay/callback`  
   (якщо в кабінеті є окреме поле — має збігатися з `WAYFORPAY_SERVICE_URL` або дефолтом з `API_PUBLIC_ORIGIN`).
5. **Return URL:** `https://malva-garden.com/api/payment/wayforpay/return`  
   **Не** вказувати `/order/payment/return` напряму — WayForPay шле **POST**, сторінка Next.js його не приймає; спочатку Route Handler, потім редірект (див. Flow вище).
6. Опційно: увімкнути **«Вимкнути відправку POST на returnUrl»**, якщо WFP дозволяє GET-редирект — тоді можна спростити, але поточний код розрахований на POST → `/api/payment/wayforpay/return`.
7. Для першого тесту — **тестовий режим** / тестові картки з документації WFP; для бойових платежів — вимкнути test mode.

### 2. `.env` на VPS

Файл: `/opt/malva-garden/.env` (шаблон — `.env.production.example` у корені репо).

```env
WEB_ORIGIN=https://malva-garden.com
API_PUBLIC_ORIGIN=https://malva-garden.com

WAYFORPAY_MERCHANT_ACCOUNT=<login з кабінету>
WAYFORPAY_MERCHANT_SECRET=<secret key>
WAYFORPAY_MERCHANT_PASSWORD=<merchant password>
WAYFORPAY_MERCHANT_DOMAIN=malva-garden.com
```

Явні URL **зазвичай не потрібні** (дефолти в `wayforpay.service.ts`):

| Змінна | Дефолт при prod `.env` вище |
|--------|-----------------------------|
| `WAYFORPAY_RETURN_URL` | `https://malva-garden.com/api/payment/wayforpay/return` |
| `WAYFORPAY_SERVICE_URL` | `https://malva-garden.com/api/v1/payments/wayforpay/callback` |

Перевизначайте лише якщо API на **окремому** піддомені (у нас — ні).

### 3. Застосувати на сервері

```bash
ssh root@159.195.148.48
cd /opt/malva-garden
nano .env   # додати WAYFORPAY_* (секрети не комітити)
docker compose -f docker-compose.prod.yml --env-file .env up -d api
docker compose -f docker-compose.prod.yml --env-file .env logs -f api --tail 50
```

Після зміни return-handler або `NEXT_PUBLIC_SITE_URL` — **rebuild web** (`docker compose … up -d --build web`). API — при зміні лише `WAYFORPAY_*` достатньо `up -d api`.

### 4. Перевірка

| Крок | Очікування |
|------|------------|
| `curl -sS https://malva-garden.com/api/v1/health` | `{"status":"ok"}` |
| Checkout → «Онлайн (WayForPay)» → замовлення | редірект на `/order/pay?orderNumber=...` → форма на `secure.wayforpay.com` |
| Успішна тестова оплата | адмінка: замовлення → **Оплачено**; `paymentStatus=PAID` |
| Логи API після оплати | рядки WayForPay callback без `invalid signature` |

Якщо статус лишається **Очікує оплату** після успіху на WFP:

1. Перевірити `WAYFORPAY_MERCHANT_SECRET` і домен `malva-garden.com` у кабінеті.
2. Cloudflare → **Security → Events** — чи не блокується POST на `/api/v1/payments/wayforpay/callback`.
3. Сторінка return викликає `POST .../payment/wayforpay/sync` — має підтягнути статус з WFP API.

**Секрети не додавати в GitHub Actions** — лише в `.env` на VPS (`docs/PRODUCTION_VPS.md` §7.2).

### Troubleshooting: return після невдалої оплати

| Симптом | Причина | Дія |
|---------|---------|-----|
| «Інформація не захищена» / insecure form submit | У формі WFP `returnUrl` був **`http://`** (часто `WEB_ORIGIN` на VPS без `https://`) | `.env`: `WEB_ORIGIN=https://malva-garden.com`; перезапуск **api** (нові замовлення отримують https у формі). API також піднімає `http→https` для не-localhost |
| **HTTP 405** на `/api/payment/wayforpay/return` | Браузер відкрив URL методом **GET**, а handler приймав лише POST | Оновити **web** (є `GET` + `POST` → редірект на `/order/payment/return`) |
| Після фіксу все одно старе замовлення | `returnUrl` зашитий у сесії WFP на момент оплати | Новий тестовий checkout |
| Редірект на **`https://0.0.0.0:3000/order/payment/return`** | Route Handler будував URL з `request.url` (Docker `HOSTNAME=0.0.0.0`) | Оновити **web** (`getPublicOrigin` + `NEXT_PUBLIC_SITE_URL=https://malva-garden.com` у build); перевірити `WEB_ORIGIN` у `.env` |

## Local callback

WayForPay must reach `serviceUrl` over HTTPS. Use [ngrok](https://ngrok.com/) (or similar), set:

```env
API_PUBLIC_ORIGIN=https://YOUR_SUBDOMAIN.ngrok-free.app
WAYFORPAY_SERVICE_URL=https://YOUR_SUBDOMAIN.ngrok-free.app/api/v1/payments/wayforpay/callback
```

## Migration

```bash
npm run db:migrate
```

Adds `Order.paidAt` and `PaymentCallbackLog`.

## Admin

Payment status is updated automatically; manual override via **Замовлення → Статус оплати** still works.
