#!/usr/bin/env bash
# Despliegue con copia previa, comprobación de salud y vuelta atrás automática.
# Cada versión va a su carpeta (versiones/<id>) y «actual» apunta a la que funciona, así volver atrás
# es cambiar el enlace. Datos, .env y ficheros subidos viven en «compartido» y no se tocan al copiar.
#
# Uso, desde la raíz del repo:
#   deploy/desplegar.sh              despliega lo que hay en la rama actual (tiene que estar limpia)
#   deploy/desplegar.sh --simular    enseña lo que haría sin tocar el servidor
#   deploy/desplegar.sh --atras      vuelve a la versión anterior
# Configuración: deploy/desplegar.env (copia desplegar.env.ejemplo). Sin secretos: las claves van en el servidor.
set -Eeuo pipefail

aqui=$(cd "$(dirname "$0")" && pwd)
raiz=$(git -C "$aqui" rev-parse --show-toplevel)
conf="${DESPLEGAR_ENV:-$aqui/desplegar.env}"
[ -f "$conf" ] || { echo "Falta $conf (copia desplegar.env.ejemplo y rellénalo)." >&2; exit 2; }
# shellcheck disable=SC1090
source "$conf"
: "${RUTA:?Falta RUTA en $conf}"
SERVIDOR=${SERVIDOR:-}
REINICIAR=${REINICIAR:-}
SALUD=${SALUD:-}
SALUD_CMD=${SALUD_CMD:-}
COMPARTIDO=${COMPARTIDO:-"data .env"}
EXCLUIR=${EXCLUIR:-"/.git /node_modules /data /.env /deploy/desplegar.env"}
INSTALAR=${INSTALAR:-"npm ci --omit=dev"}
MIGRAR=${MIGRAR:-}
PRUEBAS_LOCALES=${PRUEBAS_LOCALES:-"npm test"}
COMPILAR=${COMPILAR:-"npm run build"}
CONSERVAR=${CONSERVAR:-5}
SALUD_INTENTOS=${SALUD_INTENTOS:-15}
modo=${1:-desplegar}

paso_actual=""
paso() { paso_actual="$*"; printf '\n== %s\n' "$*"; }
trap 'echo "El despliegue se ha parado en «$paso_actual». Si fue antes de «Activando», la versión activa no ha cambiado." >&2' ERR
remoto() {  # ejecuta en el servidor, o en local si SERVIDOR está vacío (útil para probar el script)
  if [ "$modo" = "--simular" ]; then echo "[servidor] $*"; return 0; fi
  if [ -n "$SERVIDOR" ]; then ssh -o BatchMode=yes "$SERVIDOR" "set -euo pipefail; $*"; else bash -c "set -euo pipefail; $*"; fi
}
salud() {
  local i
  for i in $(seq 1 "$SALUD_INTENTOS"); do
    if [ -n "$SALUD_CMD" ]; then remoto "$SALUD_CMD" >/dev/null 2>&1 && return 0
    elif [ -n "$SALUD" ]; then curl -fsS -m 5 -o /dev/null "$SALUD" && return 0
    else echo "Sin SALUD ni SALUD_CMD: no se puede comprobar." >&2; return 1; fi
    sleep 2
  done
  return 1
}

if [ "$modo" = "--atras" ]; then
  paso "Volviendo a la versión anterior"
  remoto "cd '$RUTA' && hoy=\$(basename \"\$(readlink actual)\") && anterior=\$(ls -1 versiones | sort | awk -v c=\"\$hoy\" '\$0==c{print p; exit} {p=\$0}') && [ -n \"\$anterior\" ] || { echo 'No hay versión anterior a '\"\$hoy\"; exit 1; } && ln -sfn \"versiones/\$anterior\" actual.nuevo && mv -T actual.nuevo actual && echo \"actual: \$hoy -> \$anterior\""
  [ -n "$REINICIAR" ] && remoto "$REINICIAR"
  salud && echo "La versión anterior responde." || { echo "La versión anterior tampoco responde: revisa el servidor." >&2; exit 1; }
  exit 0
fi

cd "$raiz"
paso "Comprobaciones en local"
if [ -n "$(git status --porcelain)" ] && [ "$modo" != "--simular" ]; then
  echo "Hay cambios sin guardar en git. Despliega solo código con commit." >&2; exit 1
fi
version="$(date +%Y%m%d-%H%M%S)-$(git rev-parse --short HEAD)"
echo "Versión: $version (rama $(git branch --show-current))"
if [ -x "$raiz/deploy/comprobar-texto-demo.sh" ] && [ "${PRODUCCION:-0}" = "1" ]; then
  "$raiz/deploy/comprobar-texto-demo.sh" "$raiz"
fi
[ -n "$PRUEBAS_LOCALES" ] && bash -c "$PRUEBAS_LOCALES"
[ -n "$COMPILAR" ] && bash -c "$COMPILAR"

paso "Copia de seguridad en el servidor"
remoto "mkdir -p '$RUTA/versiones' '$RUTA/compartido' '$RUTA/copias' && cd '$RUTA/compartido' && copia='$RUTA/copias/$version' && mkdir -p \"\$copia\" && for f in $COMPARTIDO; do if [ -e \"\$f\" ]; then if command -v sqlite3 >/dev/null 2>&1 && ls \"\$f\"/*.db >/dev/null 2>&1; then mkdir -p \"\$copia/\$f\"; for db in \"\$f\"/*.db; do sqlite3 \"\$db\" \".backup '\$copia/\$db'\"; done; cp -a \$(ls -d \"\$f\"/* | grep -v -E '\\.db(-wal|-shm)?\$') \"\$copia/\$f/\" 2>/dev/null || true; else cp -a \"\$f\" \"\$copia/\"; fi; fi; done && echo \"copia en \$copia\""

paso "Subiendo la versión"
excl=(); for e in $EXCLUIR; do excl+=(--exclude "$e"); done
destino="${SERVIDOR:+$SERVIDOR:}$RUTA/versiones/$version/"
if [ "$modo" = "--simular" ]; then echo "rsync -a ${excl[*]} ./ $destino"; else
  remoto "mkdir -p '$RUTA/versiones/$version'"
  rsync -a --delete "${excl[@]}" ./ "$destino"
fi

paso "Preparando la versión en el servidor"
remoto "cd '$RUTA/versiones/$version' && for f in $COMPARTIDO; do ln -sfn \"$RUTA/compartido/\$f\" \"\$f\"; done && $INSTALAR${MIGRAR:+ && $MIGRAR}"

paso "Activando"
remoto "cd '$RUTA' && if [ -L actual ]; then readlink actual > anterior.txt; fi && ln -sfn 'versiones/$version' actual.nuevo && mv -T actual.nuevo actual"
[ -n "$REINICIAR" ] && remoto "$REINICIAR"

paso "Comprobando que responde"
if [ "$modo" = "--simular" ] || salud; then
  echo "Desplegado: $version"
else
  echo "No responde. Vuelvo a la versión anterior y restauro la copia de datos." >&2
  remoto "cd '$RUTA' && if [ -s anterior.txt ]; then ln -sfn \"\$(cat anterior.txt)\" actual.nuevo && mv -T actual.nuevo actual; fi && mkdir -p fallidas && mv 'versiones/$version' fallidas/ && cd compartido && for f in $COMPARTIDO; do if [ -e \"$RUTA/copias/$version/\$f\" ]; then rm -rf -- \"\$f\" && cp -a \"$RUTA/copias/$version/\$f\" \"\$f\"; fi; done && echo 'versión fallida guardada en fallidas/$version'"
  [ -n "$REINICIAR" ] && remoto "$REINICIAR"
  salud && echo "La versión anterior vuelve a responder." >&2 || echo "La versión anterior tampoco responde: revisa el servidor ya." >&2
  exit 1
fi

paso "Limpieza"
remoto "cd '$RUTA/versiones' && ls -1 | sort | head -n -$CONSERVAR | while read -r v; do [ -n \"\$v\" ] && rm -rf -- \"\$v\"; done; cd '$RUTA/copias' && ls -1 | sort | head -n -14 | while read -r c; do [ -n \"\$c\" ] && rm -rf -- \"\$c\"; done; echo listo"
