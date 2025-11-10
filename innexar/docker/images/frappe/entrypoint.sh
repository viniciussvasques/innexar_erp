#!/bin/sh
set -e

SITE=${SITE_NAME:-innexar.local}
DB_ROOT_PW=${MYSQL_ROOT_PASSWORD:-root}
ADMIN_PW=${ADMIN_PASSWORD:-admin}

# 1. Cria site se ainda não existir
if [ ! -f "/workspace/sites/${SITE}/site_config.json" ]; then
  echo "[ENTRYPOINT] Criando site ${SITE} automaticamente"
  bench new-site --no-mariadb-socket --mariadb-root-username root --mariadb-root-password "${DB_ROOT_PW}" \
    --admin-password "${ADMIN_PW}" "${SITE}"
  bench --site "${SITE}" install-app erpnext
  # garante que o domínio do site seja reconhecido
  bench --site "${SITE}" set-config host_name "${SITE}"
fi

# 2. (Para execuções futuras) garante que o host_name exista mesmo se o site já estiver criado
bench --site "${SITE}" set-config host_name "${SITE}"

# 3. Gera assets se ainda não existirem
if [ ! -s /workspace/sites/assets/js/frappe-web.bundle.js ]; then
  echo "[ENTRYPOINT] Gerando assets para ${SITE}"
  bench --site "${SITE}" build --force
fi

exec "$@"
