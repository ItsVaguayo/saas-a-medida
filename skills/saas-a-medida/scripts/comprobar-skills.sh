#!/usr/bin/env bash
# Comprueba qué skills, plugins y servidores MCP recomendados tiene esta persona y, si se pide, instala los que falten.
# Uso:
#   comprobar-skills.sh                      lista por grupos lo que hay y lo que falta
#   comprobar-skills.sh --instalar g1,g2     instala lo que falte de esos grupos (los nombres salen en la lista)
# El catálogo está en skills-recomendadas.tsv, junto a este script.
set -uo pipefail
aqui=$(cd "$(dirname "$0")" && pwd)
catalogo="$aqui/skills-recomendadas.tsv"
[ -f "$catalogo" ] || { echo "Falta el catálogo $catalogo" >&2; exit 2; }

instalar=""
if [ "${1:-}" = "--instalar" ]; then instalar=",${2:-},"; fi

command -v claude >/dev/null 2>&1 || { echo "No encuentro el comando claude en el PATH." >&2; exit 2; }
plugins=$(claude plugin list --json 2>/dev/null | python3 -c '
import json, sys
try:
    for p in json.load(sys.stdin):
        if p.get("enabled") or p.get("projectEnabled"):
            print(p["id"])
except Exception:
    pass' 2>/dev/null)
mcps=$(claude mcp list 2>/dev/null | sed -n 's/^\([^:]*\):.*/\1/p')

tiene() {  # tipo id
  case "$1" in
    integrada|incluida) return 0 ;;
    plugin) printf '%s\n' "$plugins" | grep -q "^$2@" ;;
    comando) command -v "$2" >/dev/null 2>&1 ;;
    mcp) printf '%s\n' "$mcps" | grep -qiE "(^|[ .])$2\$" ;;
    skill)
      [ -e "$HOME/.claude/skills/$2/SKILL.md" ] || [ -e "./.claude/skills/$2/SKILL.md" ] ||
        printf '%s\n' "$plugins" | grep -q "^$2@" ;;
    *) return 1 ;;
  esac
}

grupo_actual=""
faltan=0
while IFS=$'\t' read -r grupo nombre tipo id comando nota; do
  case "$grupo" in ''|\#*) continue ;; esac
  if [ "$grupo" != "$grupo_actual" ]; then echo; echo "== $grupo"; grupo_actual=$grupo; fi
  if tiene "$tipo" "$id"; then
    printf '  ✔ %-28s %s\n' "$nombre" "$nota"
  else
    faltan=$((faltan + 1))
    printf '  ✘ %-28s %s\n' "$nombre" "$nota"
    if [ -n "$instalar" ] && [[ "$instalar" == *",$grupo,"* ]]; then
      echo "    instalando: $comando"
      if bash -c "$comando" </dev/null; then echo "    hecho"; else echo "    no se ha podido; prueba a mano: $comando"; fi
    fi
  fi
done < "$catalogo"

echo
if [ "$faltan" -gt 0 ] && [ -z "$instalar" ]; then
  echo "Faltan $faltan. Para instalar un grupo: $0 --instalar <grupo>[,<grupo>]"
  echo "Después reinicia Claude Code (o /reload-plugins) para que las cargue."
fi
