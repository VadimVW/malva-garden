#!/usr/bin/env bash
# Production deploy on VPS — git pull + docker compose rebuild.
# Used by GitHub Actions (SSH) and manual: bash scripts/deploy-vps.sh
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/malva-garden}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-deploy/vps-production}"
COMPOSE_FILE="docker-compose.prod.yml"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1/api/v1/health}"

log() {
  echo "[deploy-vps] $*"
}

cd "$DEPLOY_PATH"
log "Working directory: $(pwd)"

if [[ ! -f .env ]]; then
  echo "[deploy-vps] ERROR: .env not found in $DEPLOY_PATH" >&2
  echo "Copy .env.production.example to .env and configure secrets on the VPS." >&2
  exit 1
fi

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "[deploy-vps] ERROR: $COMPOSE_FILE not found" >&2
  exit 1
fi

log "Fetching origin…"
git fetch origin

log "Checking out $DEPLOY_BRANCH…"
git checkout "$DEPLOY_BRANCH"

log "Pulling latest (ff-only)…"
git pull --ff-only origin "$DEPLOY_BRANCH"

log "Docker compose up --build…"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build

log "Container status:"
docker compose -f "$COMPOSE_FILE" --env-file .env ps

log "Waiting for API health ($HEALTH_URL)…"
for i in $(seq 1 60); do
  if curl -sf "$HEALTH_URL" >/dev/null; then
    log "Health check OK"
    curl -sf "$HEALTH_URL" | head -c 500
    echo
    exit 0
  fi
  sleep 5
done

echo "[deploy-vps] ERROR: health check failed after 5 minutes" >&2
docker compose -f "$COMPOSE_FILE" --env-file .env logs --tail=80 api
exit 1
