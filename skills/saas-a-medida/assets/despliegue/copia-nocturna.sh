#!/usr/bin/env bash
# Copia de cada noche de los datos de la app, con una segunda copia cifrada fuera del servidor.
# Corre EN EL SERVIDOR (cron o temporizador de systemd), no en tu máquina.
# La copia lleva datos personales del cliente: lo que sale del servidor va cifrado con una clave pública.
# La clave privada, la que descifra, NO vive en el servidor (si se lo llevan, no debe llevarse también la llave).
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
#   CIFRADO=age                          age (recomendado), gpg o ninguno (solo si el destino externo ya cifra
#                                        y lo ha decidido la persona; deja un aviso en el registro cada noche)
#   CIFRAR_PARA=/srv/mi-app/destinatarios-age.txt
#                                        con age: fichero con una o más claves públicas (age1…), una por línea;
#                                        con gpg: el id o el correo de la clave pública, ya importada en el servidor
#
# Preparar las claves (una vez, en el ordenador de quien custodia las copias, nunca en el servidor):
#   age-keygen -o copias-<proyecto>.key        la privada: guárdala en el gestor de contraseñas del equipo
#   grep 'public key' copias-<proyecto>.key    la pública (age1…): va a CIFRAR_PARA en el servidor
# Pon dos destinatarios (dos personas, o una persona y una copia en papel) para no depender de un solo portátil.
#
# Restaurar una copia externa (en una máquina del equipo):
#   age -d -i copias-<proyecto>.key copia-AAAAMMDD-HHMMSS.tar.gz.age > copia.tar.gz && tar -xzf copia.tar.gz
#   gpg -d copia-AAAAMMDD-HHMMSS.tar.gz.gpg > copia.tar.gz && tar -xzf copia.tar.gz
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
CIFRADO=${CIFRADO:-age}
CIFRAR_PARA=${CIFRAR_PARA:-}

fallo() {
  echo "$(date '+%F %T') COPIA FALLIDA: $1" >&2
  if [ -n "$AVISO_CMD" ]; then MOTIVO="$1" bash -c "$AVISO_CMD" || true; fi
  exit 1
}
trap 'fallo "error en la línea $LINENO"' ERR

[ -d "$ORIGEN" ] || fallo "no existe $ORIGEN"
# El cifrado se comprueba antes de copiar nada: mejor fallar en el primer segundo que a mitad de la noche.
case "$CIFRADO" in
  age)
    command -v age >/dev/null 2>&1 || fallo "falta age para cifrar la copia (apt install age)"
    [ -s "$CIFRAR_PARA" ] || fallo "falta CIFRAR_PARA: el fichero con las claves públicas de age"
    if grep -q 'AGE-SECRET-KEY' "$CIFRAR_PARA"; then fallo "$CIFRAR_PARA tiene una clave PRIVADA: en el servidor solo va la pública"; fi
    grep -q '^age1' "$CIFRAR_PARA" || fallo "$CIFRAR_PARA no tiene ninguna clave pública de age (age1…)"
    ;;
  gpg)
    command -v gpg >/dev/null 2>&1 || fallo "falta gpg para cifrar la copia"
    [ -n "$CIFRAR_PARA" ] || fallo "falta CIFRAR_PARA: el id o el correo de la clave pública de gpg"
    gpg --batch --list-keys "$CIFRAR_PARA" >/dev/null 2>&1 || fallo "gpg no tiene importada la clave pública $CIFRAR_PARA"
    ;;
  ninguno) echo "$(date '+%F %T') AVISO: la copia sale del servidor SIN CIFRAR (CIFRADO=ninguno)" >&2 ;;
  *) fallo "CIFRADO desconocido: $CIFRADO (age, gpg o ninguno)" ;;
esac
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
# Lo que sale va cifrado; la copia de este servidor se queda como está para restaurar rápido.
[ -n "$EXTERNO" ] || fallo "la copia de hoy está hecha, pero solo en este servidor: falta EXTERNO en $conf"
case "$CIFRADO" in
  age)
    enviar="$trabajo/$(basename "$fichero").age"
    destinatarios=(); while IFS= read -r clave; do destinatarios+=(-r "$clave"); done < <(grep '^age1' "$CIFRAR_PARA")
    age "${destinatarios[@]}" -o "$enviar" "$fichero" || fallo "no se ha podido cifrar la copia con age"
    [ "$(head -c 21 "$enviar")" = "age-encryption.org/v1" ] || fallo "la copia cifrada no tiene la cabecera de age"
    ;;
  gpg)
    enviar="$trabajo/$(basename "$fichero").gpg"
    gpg --batch --yes --trust-model always -e -r "$CIFRAR_PARA" -o "$enviar" "$fichero" || fallo "no se ha podido cifrar la copia con gpg"
    ;;
  ninguno) enviar="$fichero" ;;
esac
[ -s "$enviar" ] || fallo "la copia cifrada ha salido vacía"
if [ "${EXTERNO#rclone:}" != "$EXTERNO" ]; then
  rclone copy "$enviar" "${EXTERNO#rclone:}" || fallo "no se ha podido subir la copia con rclone"
else
  rsync -a "$enviar" "$EXTERNO/" || fallo "no se ha podido enviar la copia a $EXTERNO"
fi
echo "$(date '+%F %T') copia enviada fuera ($([ "$CIFRADO" = ninguno ] && echo 'sin cifrar' || echo "cifrada con $CIFRADO")): $EXTERNO/$(basename "$enviar")"

find "$DESTINO" -maxdepth 1 -name 'copia-*.tar.gz' -mtime +"$DIAS" -delete
