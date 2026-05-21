# SMTP — листи підтвердження email (особистий кабінет)

API надсилає лист після **реєстрації** та **повторного запиту** (`POST /customer/me/resend-verification`), якщо увімкнено SMTP.

## Змінні середовища (`apps/api`)

| Змінна | Обов’язково | Приклад | Опис |
|--------|-------------|---------|------|
| `SMTP_ENABLED` | так (для відправки) | `true` | Увімкнути відправку |
| `SMTP_HOST` | так | `smtp-relay.brevo.com` | Хост SMTP |
| `SMTP_PORT` | ні | `587` | Порт (587 STARTTLS, 465 SSL) |
| `SMTP_SECURE` | ні | `false` | `true` для порту 465 |
| `SMTP_USER` | зазвичай так | `apikey` або login | Логін SMTP |
| `SMTP_PASS` | зазвичай так | секрет | Пароль / API key |
| `MAIL_FROM` | ні | `"Malva Garden" <noreply@yourdomain.com>` | Повний заголовок From |
| `MAIL_FROM_NAME` | ні | `Malva Garden` | Якщо немає `MAIL_FROM` |
| `MAIL_FROM_EMAIL` | ні | `noreply@yourdomain.com` | Якщо немає `MAIL_FROM` |
| `WEB_ORIGIN` | так | `https://web-….vercel.app` | База для посилання verify |
| `EMAIL_VERIFICATION_DEV` | ні | `false` на staging | Якщо `true` і лист **не** відправився — API поверне `verificationUrl` у JSON (для дебагу) |

**Локально без SMTP:** `EMAIL_VERIFICATION_DEV=true`, `SMTP_ENABLED` не задавати — посилання в відповіді API.

## Staging (Render)

1. Обрати провайдера (див. нижче).
2. **Render** → **malva-api-staging** → **Environment** → додати змінні з таблиці.
3. `WEB_ORIGIN` = URL вітрини Vercel (вже в blueprint).
4. `EMAIL_VERIFICATION_DEV` = **`false`** (не показувати посилання в API).
5. **Manual Deploy** API.
6. Перевірка: реєстрація на staging → лист на пошту → перехід за посиланням → `/account/verify-email`.

У логах Render після старту: `Verification email sent to …` або `SMTP send failed …`.

## Провайдери (рекомендації)

### Brevo (Sendinblue) — зручно для staging

1. [brevo.com](https://www.brevo.com) → SMTP & API → SMTP.
2. `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`.
3. `SMTP_USER` = ваш login email, `SMTP_PASS` = SMTP key.
4. У Brevo підтвердити **відправника** (From email) — той самий домен, що в `MAIL_FROM`.

### Resend

1. [resend.com](https://resend.com) → API Keys → SMTP.
2. `SMTP_HOST=smtp.resend.com`, `SMTP_PORT=587`, `SMTP_USER=resend`, `SMTP_PASS=re_…`.
3. `MAIL_FROM` = верифікований домен у Resend.

### Gmail (лише тест, не production)

1. Увімкнути 2FA → App Password.
2. `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER=your@gmail.com`, `SMTP_PASS=app-password`.
3. Ліміти та спам-фільтри — не для продакшену.

## Шаблон листа

Тема: **Підтвердження email — Malva Garden**  
Посилання: `{WEB_ORIGIN}/account/verify-email?token=…` (дійсне 48 год).

Код: `apps/api/src/mail/mail.service.ts`.

## Усунення несправностей

| Симптом | Що перевірити |
|---------|----------------|
| Листа немає | Спам; `SMTP_ENABLED=true`; логи Render; From верифікований у провайдері |
| `verificationUrl` у JSON на staging | `EMAIL_VERIFICATION_DEV=true` — вимкніть |
| 535 Authentication failed | `SMTP_USER` / `SMTP_PASS`; для Brevo — SMTP key, не пароль акаунта |
| Connection timeout | Порт 587 vs 465, `SMTP_SECURE` |
