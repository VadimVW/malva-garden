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
- Set the same env vars on **Render** (API service).

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
