#!/usr/bin/env bash
# Pone en GitHub el nivel de protección de develop y main que eligió el equipo.
# Uso, desde la raíz del repo del proyecto:
#   proteger-ramas.sh [--nivel ninguna|pr|revision|estricta] [--simular]
#
#   ninguna    sin protección: se puede subir directo. El CI avisa pero no impide nada.
#   pr         todo entra por PR y con el CI en verde. No hace falta que nadie apruebe.
#   revision   lo anterior y, además, una aprobación de otra persona.
#   estricta   lo anterior y, además, tampoco se lo puede saltar quien administra el repo.
#
# Sin --nivel usa el campo «proteccion» de .claude/saas-a-medida.json. --simular enseña lo que enviaría.
# Hace falta gh identificado con permiso de administración del repo. En repos privados, la protección
# de ramas exige un plan de pago de GitHub: si no lo hay, el script lo dice y no cambia nada.
set -euo pipefail
nivel=""; simular=0
while [ $# -gt 0 ]; do
  case "$1" in
    --nivel) nivel=${2:?Falta el nivel}; shift 2 ;;
    --simular) simular=1; shift ;;
    *) echo "Opción desconocida: $1" >&2; exit 2 ;;
  esac
done
if [ -z "$nivel" ] && [ -f .claude/saas-a-medida.json ] && command -v python3 >/dev/null 2>&1; then
  nivel=$(python3 -c "import json; print(json.load(open('.claude/saas-a-medida.json')).get('proteccion') or '')" 2>/dev/null || true)
fi
case "$nivel" in
  ninguna) ;;
  pr) aprobaciones=0; admins=false ;;
  revision) aprobaciones=1; admins=false ;;
  estricta) aprobaciones=1; admins=true ;;
  "") echo "Falta el nivel: --nivel ninguna|pr|revision|estricta (o el campo «proteccion» del fichero de proyecto)." >&2; exit 2 ;;
  *) echo "Nivel desconocido: $nivel (ninguna, pr, revision o estricta)." >&2; exit 2 ;;
esac
command -v gh >/dev/null 2>&1 || { echo "Falta gh (https://cli.github.com) identificado con gh auth login." >&2; exit 2; }
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner) || { echo "Esta carpeta no tiene un repo de GitHub." >&2; exit 2; }

if [ "$nivel" != ninguna ]; then
cuerpo=$(cat <<JSON
{
  "required_status_checks": { "strict": false, "contexts": ["comprobar"] },
  "enforce_admins": $admins,
  "required_pull_request_reviews": { "required_approving_review_count": $aprobaciones },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
)
fi
estado=0
for rama in develop main; do
  ruta="repos/$repo/branches/$rama/protection"
  if [ "$nivel" = ninguna ]; then
    if [ "$simular" = 1 ]; then echo "DELETE $ruta"; continue; fi
    if salida=$(gh api -X DELETE "$ruta" 2>&1); then echo "$rama: sin protección."
    else case "$salida" in
      *"Branch not protected"*|*"404"*) echo "$rama: ya estaba sin protección." ;;
      *) estado=1; echo "$rama: $salida" >&2 ;;
    esac; fi
    continue
  fi
  if [ "$simular" = 1 ]; then echo "PUT $ruta"; echo "$cuerpo"; continue; fi
  if salida=$(printf '%s' "$cuerpo" | gh api -X PUT "$ruta" --input - 2>&1); then
    echo "$rama: nivel «$nivel» (PR obligatorio, CI «comprobar» en verde, $aprobaciones aprobaciones$([ "$admins" = true ] && echo ', también para quien administra'))."
  else
    estado=1
    case "$salida" in
      *"Upgrade to"*|*"403"*) echo "$rama: GitHub no deja proteger ramas en este repo con el plan actual (repo privado sin plan de pago) o falta permiso de administración." >&2 ;;
      *"Branch not found"*|*"404"*) echo "$rama: la rama no existe todavía en GitHub; súbela y vuelve a pasar el script." >&2 ;;
      *) echo "$rama: $salida" >&2 ;;
    esac
  fi
done
exit $estado
