#!/usr/bin/env bash
# Genera un PDF A4 desde un HTML con Chrome o Chromium sin ventana.
# Uso: generar-pdf.sh entrada.html salida.pdf [--previas]
#   --previas  además guarda una imagen PNG por página en <salida>-previas/ para revisarlas.
# Si Chrome no está o se cuelga, prueba con Playwright (npx playwright).
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Uso: $0 entrada.html salida.pdf [--previas]" >&2
  exit 2
fi

entrada=$(cd "$(dirname "$1")" && pwd)/$(basename "$1")
salida_dir=$(mkdir -p "$(dirname "$2")" && cd "$(dirname "$2")" && pwd)
salida="$salida_dir/$(basename "$2")"
previas=${3:-}

[ -f "$entrada" ] || { echo "No existe $entrada" >&2; exit 1; }

# La hoja de estilo va junto a la plantilla: si el HTML no está en assets/documento, se copia al lado.
aqui=$(cd "$(dirname "$0")/.." && pwd)
if [ ! -f "$(dirname "$entrada")/documento.css" ]; then
  cp "$aqui/assets/documento/documento.css" "$(dirname "$entrada")/documento.css"
fi

buscar_chrome() {
  for c in google-chrome google-chrome-stable chromium chromium-browser chrome; do
    command -v "$c" >/dev/null 2>&1 && { command -v "$c"; return; }
  done
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Chromium.app/Contents/MacOS/Chromium"; do
    [ -x "$c" ] && { echo "$c"; return; }
  done
}

con_limite() {
  # Corta a los 90 s para que un Chrome colgado no bloquee la sesión.
  if command -v timeout >/dev/null 2>&1; then timeout 90 "$@"
  elif command -v gtimeout >/dev/null 2>&1; then gtimeout 90 "$@"
  else "$@"; fi
}

chrome=$(buscar_chrome || true)
hecho=0
if [ -n "${chrome:-}" ]; then
  perfil=$(mktemp -d)
  if con_limite "$chrome" --headless=new --disable-gpu --no-first-run --no-default-browser-check \
      --user-data-dir="$perfil" --no-pdf-header-footer --virtual-time-budget=15000 \
      --run-all-compositor-stages-before-draw \
      --print-to-pdf="$salida" "file://$entrada" >/dev/null 2>&1; then
    hecho=1
  fi
  rm -rf "$perfil"
fi

if [ "$hecho" != 1 ]; then
  if command -v npx >/dev/null 2>&1; then
    echo "Chrome no ha podido; pruebo con Playwright." >&2
    con_limite npx --yes playwright pdf --paper-format=A4 "file://$entrada" "$salida" >/dev/null
    hecho=1
  else
    echo "No hay Chrome, Chromium ni npx para generar el PDF." >&2
    exit 1
  fi
fi

[ -s "$salida" ] || { echo "El PDF ha salido vacío." >&2; exit 1; }
paginas=$( (command -v pdfinfo >/dev/null && pdfinfo "$salida" 2>/dev/null | awk '/^Pages:/{print $2}') || true)
echo "PDF: $salida${paginas:+ ($paginas páginas)}"

if [ "$previas" = "--previas" ]; then
  if command -v pdftoppm >/dev/null 2>&1; then
    dir="${salida%.pdf}-previas"
    rm -rf "$dir" && mkdir -p "$dir"
    pdftoppm -r 60 -png "$salida" "$dir/pagina"
    echo "Previas: $dir (mira todas antes de enseñar el PDF)"
  else
    echo "Para las previas hace falta pdftoppm (paquete poppler-utils o, en Mac, brew install poppler)." >&2
  fi
fi
