#!/usr/bin/env bash
# Copia de cada noche de los datos de la app, con una segunda copia fuera del servidor.
# Corre EN EL SERVIDOR (cron o temporizador de systemd), no en tu máquina.
#
# Uso:
#   copia-nocturna.sh /srv/mi-app/copia.env             hace la copia de hoy
#   copia-nocturna.sh /srv/mi-app/copia.env --probar    además la descomprime en una carpeta temporal
#                                                       y comprueba que las bases de datos se abren
# Instalación (como el usuario de la app):
#   crontab -e   →   15 3 * * * /srv/mi-app/copia-nocturna.sh /srv/mi-app/copia.env >> /srv/mi-app/copias-noche/copia.log 2>&1
#
# copia.env (sin secretos en el repo: este fichero vive en el servidor):
#   ORIGEN=/srv/mi-app/compartido        carpeta con los datos y las subidas
#   DESTINO=/srv/mi-app/copias-noche     dónde se guardan en este servidor
#   DIAS=14                              cuántos días se conservan
#   VOLCADO_CMD=""                       si la base no es SQLite: comando que escribe el volcado en $VOLCADO
#                                        (ejemplo: pg_dump -Fc mi_app > "$VOLCADO")
#   EXTERNO=usuario@otro-servidor:/copias/mi-app    destino de rsync en OTRA máquina; o rclone:remoto:ruta
#   AVISO_CMD=""                         comando que avisa si la copia falla; recibe el motivo en $MOTIVO
set -Eeuo pipefail

conf=${1:?Uso: copia-nocturna.sh <copia.env> [--probar]}
probar=${2:-}
[ -f "$conf" ] || { echo "No existe $conf" >&2; exit 2; }
# shellcheck disable=SC1090
source "$conf"
: "${ORIGEN:?Falta ORIGEN en $conf}" "${DESTINO:?Falta DESTINO en $conf}"
DIAS=${DIAS:-14}
VOLCADO_CMD=${VOLCADO_CMD:-}
EXTERNO=${EXTERNO:-}
AVISO_CMD=${AVISO_CMD:-}

fallo() {
  echo "$(date '+%F %T') COPIA FALLIDA: $1" >&2
  if [ -n "$AVISO_CMD" ]; then MOTIVO="$1" bash -c "$AVISO_CMD" || true; fi
  exit 1
}
trap 'fallo "error en la línea $LINENO"' ERR

[ -d "$ORIGEN" ] || fallo "no existe $ORIGEN"
mkdir -p "$DESTINO"
sello=$(date +%Y%m%d-%H%M%S)
trabajo=$(mktemp -d)
trap 'rm -rf "$trabajo"' EXIT
mkdir -p "$trabajo/datos"

# Las bases SQLite se copian con .backup (una copia con cp mientras la app escribe puede salir rota).
# El resto de ficheros, tal cual.
tar -cf - -C "$ORIGEN" --exclude='*.db' --exclude='*.db-wal' --exclude='*.db-shm' --exclude='*.sqlite' \
  --exclude='*.sqlite-wal' --exclude='*.sqlite-shm' . | tar -xf - -C "$trabajo/datos"
if command -v sqlite3 >/dev/null 2>&1; then
  while IFS= read -r -d '' db; do
    mkdir -p "$trabajo/datos/$(dirname "$db")"
    sqlite3 "$ORIGEN/$db" ".backup '$trabajo/datos/$db'"
  done < <(cd "$ORIGEN" && find . -type f \( -name '*.db' -o -name '*.sqlite' \) -print0)
elif (cd "$ORIGEN" && find . -type f \( -name '*.db' -o -name '*.sqlite' \) | grep -q .); then
  fallo "hay bases SQLite y falta sqlite3 para copiarlas bien"
fi
if [ -n "$VOLCADO_CMD" ]; then
  VOLCADO="$trabajo/datos/volcado.bd" bash -c "set -euo pipefail; $VOLCADO_CMD"
  [ -s "$trabajo/datos/volcado.bd" ] || fallo "el volcado de la base ha salido vacío"
fi

fichero="$DESTINO/copia-$sello.tar.gz"
tar -czf "$fichero" -C "$trabajo" datos
[ -s "$fichero" ] || fallo "la copia ha salido vacía"
echo "$(date '+%F %T') copia hecha: $fichero ($(du -h "$fichero" | cut -f1))"

if [ "$probar" = "--probar" ]; then
  prueba=$(mktemp -d)
  tar -xzf "$fichero" -C "$prueba"
  n=0
  while IFS= read -r -d '' db; do
    [ "$(sqlite3 "$db" 'PRAGMA integrity_check;')" = "ok" ] || { rm -rf "$prueba"; fallo "la base $db de la copia no pasa la comprobación"; }
    n=$((n + 1))
  done < <(find "$prueba" -type f \( -name '*.db' -o -name '*.sqlite' \) -print0)
  echo "restauración de prueba correcta: $(find "$prueba" -type f | wc -l | tr -d ' ') ficheros, $n bases comprobadas"
  rm -rf "$prueba"
fi

# Fuera del servidor: si la máquina se pierde, la copia de al lado se pierde con ella.
if [ -z "$EXTERNO" ]; then
  fallo "la copia de hoy está hecha, pero solo en este servidor: falta EXTERNO en $conf"
elif [ "${EXTERNO#rclone:}" != "$EXTERNO" ]; then
  rclone copy "$fichero" "${EXTERNO#rclone:}" || fallo "no se ha podido subir la copia con rclone"
else
  rsync -a "$fichero" "$EXTERNO/" || fallo "no se ha podido enviar la copia a $EXTERNO"
fi
echo "$(date '+%F %T') copia enviada fuera: $EXTERNO"

find "$DESTINO" -maxdepth 1 -name 'copia-*.tar.gz' -mtime +"$DIAS" -delete
