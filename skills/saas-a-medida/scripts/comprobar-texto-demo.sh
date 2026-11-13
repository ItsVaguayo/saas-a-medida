#!/usr/bin/env bash
# Lista los textos de demo que quedan en el código. Antes de producción tiene que salir limpio.
# Uso: comprobar-texto-demo.sh [carpeta del código] [--estricto]
#   --estricto  también falla si siguen existiendo el componente o su hoja de estilos.
# Sale con 0 si no queda ninguno y con 1 si quedan, con fichero y línea de cada uno.
set -uo pipefail
carpeta=${1:-.}
estricto=${2:-}
[ "$carpeta" = "--estricto" ] && { carpeta=.; estricto=--estricto; }
[ -d "$carpeta" ] || { echo "No existe la carpeta $carpeta" >&2; exit 2; }

excluir=(--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build
         --exclude-dir=coverage --exclude-dir=.next --exclude-dir=docs --exclude-dir=.claude)
patron='<TextoDemo[ >/]|data-texto-demo|class(Name)?="[^"]*texto-demo|AvisoModoDemo'

usos=$(grep -rnE "${excluir[@]}" \
  --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx' --include='*.vue' \
  --include='*.svelte' --include='*.html' --include='*.php' --include='*.erb' --include='*.hbs' \
  --include='*.py' --include='*.astro' \
  "$patron" "$carpeta" 2>/dev/null | grep -vE '/TextoDemo\.(jsx|tsx|js|ts|vue|svelte)[:]|/texto-demo\.(html|js)[:]' || true)

estado=0
if [ -n "$usos" ]; then
  n=$(printf '%s\n' "$usos" | wc -l | tr -d ' ')
  echo "Quedan textos de demo ($n):"
  printf '%s\n' "$usos"
  estado=1
else
  echo "Sin textos de demo en el código."
fi

definiciones=$(find "$carpeta" \( -name node_modules -o -name .git -o -name dist \) -prune -o \
  \( -name 'TextoDemo.*' -o -name 'texto-demo.css' \) -print 2>/dev/null)
if [ -n "$definiciones" ]; then
  if [ "$estricto" = "--estricto" ]; then
    echo "Siguen existiendo el componente o su estilo (modo estricto):"; printf '%s\n' "$definiciones"; estado=1
  else
    echo "Aviso: el componente sigue en el código sin usarse. Bórralo si ya no habrá más demos:"
    printf '%s\n' "$definiciones"
  fi
fi

for compilado in "$carpeta/dist" "$carpeta/build" "$carpeta/web/dist"; do
  if [ -d "$compilado" ] && grep -rqE 'data-texto-demo|texto-demo__' "$compilado" 2>/dev/null; then
    echo "La compilación de $compilado todavía contiene texto de demo: vuelve a compilar después de quitarlo."
    estado=1
  fi
done
exit $estado
