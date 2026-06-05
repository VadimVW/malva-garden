# Production на VPS (Netcup VPS 500 G12) — Malva Garden

Живий документ: нюанси деплою, рішення, фактичні значення (IP, домени, CCP).  
**Staging** — Vercel + Render: [`STAGING.md`](STAGING.md).

**Обраний тариф prod:** [**Netcup VPS 500 G12**](https://www.netcup.com/en/server/vps) — 2 shared vCore, 4 GB DDR5 ECC, 128 GB NVMe, KVM.  
**ЦА:** Україна → локація **Nuremberg, Germany** (+€0.88/міс) або **No preference Europe** (€0, ДЦ може бути NUE/VIE/AMS).

**Статус інфра в репо:** `docker-compose.prod.yml`, Dockerfile, Caddy, `start-prod.mjs` — ✓. **CI/CD (GitHub Actions)** — ✓ (`ci.yml`, `deploy-vps.yml`, `scripts/deploy-vps.sh`).

---

## 1. Домени — чи можна пізніше?

**Так.** Реліз на VPS не вимагає доменів на першому кроці.

| Етап | Як працюємо | HTTPS |
|------|-------------|--------|
| **A. Перший деплой** | Доступ по **публічному IPv4** (80/443) | Let's Encrypt **не** на голий IP → smoke по HTTP або тимчасовий DNS |
| **B. Тимчасовий hostname** | **DuckDNS**, **sslip.io** (`<ip>.sslip.io`) | Caddy + TLS після DNS на VPS |
| **C. Бойові домени** | A-record → IPv4 VPS → env + Caddy → **rebuild** web/admin | Продакшен |

**Після підключення доменів оновити:**

1. DNS (вітрина, api, admin).
2. **Caddyfile** — `host` для сервісів.
3. **API env:** `WEB_ORIGIN`, `ADMIN_ORIGIN`, `API_PUBLIC_ORIGIN`, `WAYFORPAY_*`.
4. **Web:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` (перезбірка).
5. **Admin:** `NEXT_PUBLIC_API_URL`.
6. WayForPay, Google OAuth, SMTP sender.

### Таблиця доменів

| Роль | FQDN | DNS (A → `159.195.148.48`) | Примітка |
|------|------|---------------------------|----------|
| Вітрина | **malva-garden.com** | A (+ www CNAME або A) | `WEB_ORIGIN`, `NEXT_PUBLIC_SITE_URL`; API на тому ж хості `/api/v1` |
| API (шлях) | той самий домен | — | `NEXT_PUBLIC_API_URL=https://malva-garden.com/api/v1` |
| Адмінка | **admin.malva-garden.com** | A | `ADMIN_ORIGIN`; Basic Auth / UFW бажано |

**Реєстратор / DNS:** Cloudflare, зона **malva-garden.com**  
**Фактичний IPv4 VPS:** `159.195.148.48`  
**Hostname (netcup):** `v2202605363229464961.megasrv.de`  
**Дата підключення доменів:** 2026-05 (Cloudflare)

### Cloudflare (рекомендація для першого TLS)

1. **DNS → Records** (проксі **DNS only** / сіра хмара на старті — простіше для Caddy + Let's Encrypt):
   - `malva-garden.com` → A → `159.195.148.48`
   - `www` → CNAME → `malva-garden.com` (або A на той самий IP)
   - `admin` → A → `159.195.148.48`
2. Після успішних сертифікатів можна увімкнути проксі Cloudflare (помаранчева хмара), SSL mode **Full**.
3. **ACME_EMAIL** у `.env` на VPS — ваш реальний email (для Caddy).

---

## 2. Замовлення VPS 500 G12 (Netcup)

### Параметри (узгоджено)

| Параметр | Рекомендація | Чому |
|----------|--------------|------|
| **Тариф** | **VPS 500 G12** | 2 vCore, 4 GB RAM, 128 GB NVMe — postgres + api + web + admin + Caddy |
| **Локація** | **Nuremberg, Germany** (+€0.88/міс) | Latency для UA; той самий місто, що в планах Hetzner NBG |
| **Економія** | **No preference Europe** (€0) | Ок для тесту; ДЦ не фіксований — записати фактичний у CCP |
| **Не брати** | Manassas, Singapore | Погана latency для UA |
| **IPv4** | **Обовʼязково** (опція в замовленні, ~€0.50/міс) | WayForPay callback, клієнти з UA |
| **ОС** | **Debian 13 (trixie)** — типовий image Netcup; або **Ubuntu 24.04** через ISO | Docker; команди нижче для Debian |
| **Контракт** | **Hourly** (0 міс. min) — для гнучкого тесту; або 12 міс. дешевше/міс | Див. кошик netcup |
| **Setup** | Одноразово ~**€4.20** (перевірити в кошику) | |
| **Swap на VPS** | 2 GB | Піки RAM при compose build |
| **Firewall** | **UFW** на VPS: 22 (ваш IP), 80, 443; **5432 не назовні** | У Netcup немає окремого Cloud Firewall як у Hetzner |
| **SSH** | Ключ у CCP при замовленні | |

### Железо (орієнтир)

| | VPS 500 G12 |
|---|-------------|
| Хост | AMD **EPYC 9645** (Zen 5), shared vCore |
| RAM | **DDR5 ECC** |
| Диск | **128 GB NVMe** |
| Мережа | 2.5 Gbit/s; **fair use:** якщо середній трафік за **24 год > 2 TB** → throttle **200 Mbit/s** до нормалізації |
| Панель | [Customer Control Panel (CCP)](https://www.customercontrolpanel.de/) |

**Після створення записати:**

- CCP / назва сервера: `v2202605363229464961`
- IPv4: `159.195.148.48`
- SSH: `root@159.195.148.48` (пароль — вкладка **Access** у SCP)

### Перше налаштування на сервері

```bash
apt update && apt upgrade -y

fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# Docker (Debian 13 / Ubuntu — get.docker.com)
apt install -y ca-certificates curl
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
docker --version && docker compose version
```

**UFW (приклад):**

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 3. Архітектура на сервері

```
Інтернет → Caddy (:443) ─┬─→ web (Next.js вітрина)
                         ├─→ admin (Next.js адмінка)
                         └─→ api (Nest /api/v1, /uploads)

postgres (volume) ← api
```

- Один VPS, **Docker Compose** (`docker-compose.prod.yml` — коли зʼявиться в репо).
- **Caddy** — TLS після доменів.
- **Uploads:** Docker volume `api_uploads`; пізніше S3 / object storage.
- **Snapshots:** SCP → вкладка **Media** → секція **Snapshots** (на **General** лише лічильник «1 left»).

---

## 4. База даних на релізі

**Узгоджено:** для тестів prod — **dump зі staging**, **без auto-seed** при кожному старті API.

| Що | Staging (Render) | Production (Netcup VPS) |
|----|------------------|-------------------------|
| Міграції | `start:staging` → migrate | **`start-prod`** → migrate only |
| Seed | Авто після migrate | **Ні** при звичайному деплої |
| Перший наповнення | — | Один раз: **pg_restore** з staging **або** seed з **новим** `ADMIN_SEED_PASSWORD` |
| Адмін-пароль | `admin123` (seed) | **Не** копіювати staging |

### Перенос зі staging

1. `pg_dump -Fc -f malva_staging.dump "<RENDER_DATABASE_URL>"`
2. `scp malva_staging.dump root@<IPv4>:/root/`
3. На prod після `migrate deploy`:  
   `pg_restore -d "<PROD_DATABASE_URL>" --clean --if-exists malva_staging.dump`  
   (Postgres **16**; при конфлікті — restore на порожню БД без `--clean`).

**Записати спосіб першого наповнення:**

- [ ] Dump з Render, дата: `________________`
- [ ] Чиста БД + одноразовий seed
- [ ] Інше: `________________`

---

## 5. Змінні середовища (production)

Файл на сервері: `/opt/malva-garden/.env` (не в git). Шаблон: `apps/api/.env.example`.

### 5.1 API

| Змінна | Обовʼязково | Примітка |
|--------|-------------|----------|
| `NODE_ENV` | production | |
| `PORT` | 4000 | |
| `DATABASE_URL` | так | `@db:5432` у Compose |
| `JWT_SECRET` | так | новий, довгий |
| `WEB_ORIGIN` | так | спочатку `http://<IP>` |
| `ADMIN_ORIGIN` | так | |
| `API_PUBLIC_ORIGIN` | так | `https://<api-host>` |
| `UPLOAD_DIR` | так | volume |
| `ADMIN_SEED_PASSWORD` | лише одноразовий seed | не `admin123` |
| `WAYFORPAY_*` | оплата | prod merchant |
| `NOVA_POSHTA_API_KEY` | НП | |
| `SMTP_*`, `MAIL_FROM` | ЛК | `EMAIL_VERIFICATION_DEV=false` |
| `GOOGLE_CLIENT_ID` | Google Sign-In (API) | `docs/GOOGLE_SIGNIN.md` |

### 5.2 Web / Admin (build-time)

| Змінна | Де |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | web + admin |
| `NEXT_PUBLIC_SITE_URL` | web only |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | web (build-time, той самий Client ID) | `docs/GOOGLE_SIGNIN.md` |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | web (build-time, GSC HTML tag) | `docs/SEO_GOOGLE.md` |

### 5.3 Caddy

- ACME email: `________________`

### 5.4 WayForPay (§14.1.2)

Повна інструкція: [`PAYMENTS_WAYFORPAY.md`](PAYMENTS_WAYFORPAY.md) → розділ **Production**.

| Змінна | Production (malva-garden.com) |
|--------|-------------------------------|
| `WAYFORPAY_MERCHANT_ACCOUNT` | login з кабінету WFP |
| `WAYFORPAY_MERCHANT_SECRET` | Secret key (підпис Purchase + callback) |
| `WAYFORPAY_MERCHANT_PASSWORD` | Merchant password (кабінет) |
| `WAYFORPAY_MERCHANT_DOMAIN` | `malva-garden.com` |
| `WAYFORPAY_SERVICE_URL` | *(опційно)* дефолт: `https://malva-garden.com/api/v1/payments/wayforpay/callback` |
| `WAYFORPAY_RETURN_URL` | *(опційно)* дефолт: `https://malva-garden.com/api/payment/wayforpay/return` |

Потрібні також `WEB_ORIGIN` і `API_PUBLIC_ORIGIN` = `https://malva-garden.com` (без слеша в кінці).

Після зміни `.env`:

```bash
cd /opt/malva-garden
docker compose -f docker-compose.prod.yml --env-file .env up -d api
```

Чеклист:

- [ ] Домен `malva-garden.com` у кабінеті WayForPay
- [ ] `WAYFORPAY_*` у `/opt/malva-garden/.env`
- [ ] Restart `api`; smoke: checkout → WayForPay → **PAID** в адмінці
- [ ] Cloudflare: callback не в **Block** (Security → Events)

---

## 6. Порядок першого деплою (чеклист)

### Репо

- [x] `docker-compose.prod.yml`, `deploy/docker/Dockerfile.*`, `deploy/caddy/Caddyfile`, `start-prod.mjs`
- [x] `output: 'standalone'` у web/admin; `.env.production.example`

### Netcup

- [x] VPS 500 G12, Docker
- [ ] Snapshot (Media → Snapshots) перед першим `up`

### Перший деплой на VPS

```bash
# на сервері
sudo mkdir -p /opt/malva-garden && cd /opt/malva-garden
git clone <your-repo-url> .
cp .env.production.example .env
nano .env   # POSTGRES_PASSWORD, JWT_SECRET, URL з вашим IP

docker compose -f docker-compose.prod.yml --env-file .env build
docker compose -f docker-compose.prod.yml --env-file .env up -d
docker compose -f docker-compose.prod.yml --env-file .env logs -f api
```

**URL без доменів (приклад IP `159.195.148.48`):**

| Сервіс | URL |
|--------|-----|
| Вітрина | http://159.195.148.48/ |
| API health | http://159.195.148.48/api/v1/health |
| Адмінка | http://159.195.148.48:3001/ |

### Після `up`

- [ ] `curl http://<IP>/api/v1/health`
- [ ] Одноразово: `pg_restore` зі staging **або** seed з новим `ADMIN_SEED_PASSWORD` (див. §4)
- [ ] Smoke: каталог, адмінка логін

### Домени (пізніше)

- [ ] DNS → Caddy → rebuild web/admin → WFP / Google / SMTP

---

## 7. CI/CD (GitHub Actions)

### 7.1 Workflows

| Файл | Тригер | Дія |
|------|--------|-----|
| [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) | PR / push → `main`, `deploy/vps-production` | `npm ci` + `npm run lint` |
| [`.github/workflows/deploy-vps.yml`](../.github/workflows/deploy-vps.yml) | push → **`deploy/vps-production`**, `workflow_dispatch` | lint → SSH → [`scripts/deploy-vps.sh`](../scripts/deploy-vps.sh) |

**Гілка production:** `deploy/vps-production` (не `main`).

Після push чекайте **15–30 хв** (збірка на VPS). Статус: GitHub → **Actions** → «Deploy VPS (production)».

### 7.2 Одноразова підготовка (Secrets + SSH)

1. **SSH-ключ лише для CI** (на своєму ПК):

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/malva_github_deploy -N ""
   ```

2. **Публічний ключ** на VPS (`root` або `deploy`):

   ```bash
   ssh root@159.195.148.48
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   echo "<вміст malva_github_deploy.pub>" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

3. **GitHub** → репозиторій **Settings → Secrets and variables → Actions → New repository secret:**

   | Secret | Значення |
   |--------|----------|
   | `VPS_SSH_HOST` | `159.195.148.48` |
   | `VPS_SSH_USER` | `root` |
   | `VPS_SSH_PRIVATE_KEY` | повний вміст файлу `malva_github_deploy` (private) |
   | `VPS_DEPLOY_PATH` | `/opt/malva-garden` (опційно) |

   Паролі БД, JWT, WayForPay **не** додавати в GitHub — лише в `.env` на сервері.

4. **Перший pull після додавання CI в репо** (щоб на VPS з’явився `scripts/deploy-vps.sh`):

   ```bash
   ssh root@159.195.148.48
   cd /opt/malva-garden
   git pull origin deploy/vps-production
   ```

5. (Рекомендовано) Snapshot у Netcup CCP перед першим автодеплоєм.

### 7.3 Що робить `deploy-vps.sh`

1. `git fetch` + `checkout deploy/vps-production` + `pull --ff-only`
2. `docker compose -f docker-compose.prod.yml --env-file .env up -d --build`
3. `curl` → `http://127.0.0.1/api/v1/health` (до 5 хв)

Міграції: автоматично в `start-prod.mjs` при старті контейнера `api` (**без seed**).

### 7.4 Ручний деплой (fallback)

```bash
ssh root@159.195.148.48
cd /opt/malva-garden
bash scripts/deploy-vps.sh
```

Або з GitHub UI: **Actions** → **Deploy VPS (production)** → **Run workflow**.

### 7.5 Деплой оновлень (процес)

| Крок | Дія |
|------|-----|
| Розробка | feature-гілка → PR (CI lint) |
| Prod | merge / push у **`deploy/vps-production`** |
| CI | lint → SSH deploy на VPS |
| Перевірка | Actions green; `curl http://159.195.148.48/api/v1/health` |

**Останній prod-деплой:** `________________` (commit: `________________`)

---

## 8. Бекапи та моніторинг

| Що | Частота | Куди |
|----|---------|------|
| `pg_dump` | щодня | off-site (S3, інший сервер) |
| **Snapshot** (CCP) | перед релізом / тижнево | Netcup |
| Health | 1–5 хв | Uptime Kuma / Better Stack |

---

## 9. Staging vs production

| | Staging | Production |
|---|---------|------------|
| Хостинг | Vercel + Render | **Netcup VPS 500 G12** |
| Seed при старті | Так | **Ні** |
| Uploads | Ephemeral (Render) | Docker volume |
| WayForPay | Staging merchant / URL | Prod |

---

## 10. Альтернативи (не обрано)

| Провайдер | Тариф | Примітка |
|-----------|-------|----------|
| Hetzner | CPX22 (~€7.99 + IPv4) | Дорожче; Cloud Firewall; той самий Nürnberg |
| Netcup | VPS Lite 1 G12s | Дешевше, **6 міс.** min, слабша мережа |
| Netcup | VPS 1000 G12 | 8 GB RAM — якщо 4 GB тісно |

---

## 11. Журнал рішень

```text
### 2026-05-31 — вибір prod VPS
- Тариф: Netcup VPS 500 G12 (не Hetzner CPX22 / CX23).
- Локація: Nuremberg (+€0.88) для ЦА Україна.
- БД: dump staging; без auto-seed на старті.
- Домени: пізніше.

### 2026-05-31 — VPS створено
- IPv4: 159.195.148.48, SCP, стан started.
- ОС: **Debian 13 (trixie)** (не Ubuntu — ок для prod).
- Далі: swap, Docker, UFW.

### 2026-05-31 — CI/CD
- Workflows: `ci.yml`, `deploy-vps.yml`; скрипт `scripts/deploy-vps.sh`.
- Deploy по push у `deploy/vps-production`; Secrets: VPS_SSH_*.
```

*(Додавайте нові записи з датою.)*

---

## 12. Посилання

- Staging: [`STAGING.md`](STAGING.md)
- WayForPay: [`PAYMENTS_WAYFORPAY.md`](PAYMENTS_WAYFORPAY.md)
- SMTP: [`EMAIL_SMTP.md`](EMAIL_SMTP.md)
- Google Sign-In: [`GOOGLE_SIGNIN.md`](GOOGLE_SIGNIN.md)
- QA: [`QA_TEST_PLAN.md`](QA_TEST_PLAN.md)
- Агент: [`AGENT_CONTEXT.md`](../AGENT_CONTEXT.md) §4, етап 14

---

*Production на **Netcup VPS 500 G12**. Оновлювати після кожного кроку деплою.*
