#!/usr/bin/env bash
# Protege develop y main en GitHub: nadie sube directo, todo entra por PR y con el CI en verde.
# Uso, desde la raíz del repo del proyecto:
#   proteger-ramas.sh [--aprobaciones N] [--simular]
#     --aprobaciones N   revisiones aprobadas que hacen falta para integrar (0 trabajando solo, 1 en pareja o grupo)
#     --simular          enseña lo que enviaría sin cambiar nada
# Hace falta gh identificado con permiso de administración del repo. En repos privados, la protección
# de ramas exige un plan de pago de GitHub: si no lo hay, el script lo dice y no cambia nada.
set -euo pipefail
aprobaciones=1; simular=0
while [ $# -gt 0 ]; do
  case "$1" in
    --aprobaciones) aprobaciones=${2:?Falta el número}; shift 2 ;;
    --simular) simular=1; shift ;;
    *) echo "Opción desconocida: $1" >&2; exit 2 ;;
  esac
done
case "$aprobaciones" in ''|*[!0-9]*) echo "--aprobaciones tiene que ser un número." >&2; exit 2 ;; esac
command -v gh >/dev/null 2>&1 || { echo "Falta gh (https://cli.github.com) identificado con gh auth login." >&2; exit 2; }
repo=$(gh repo view --json nameWithOwner -q .nameWithOwner) || { echo "Esta carpeta no tiene un repo de GitHub." >&2; exit 2; }

cuerpo=$(cat <<JSON
{
  "required_status_checks": { "strict": false, "contexts": ["comprobar"] },
  "enforce_admins": false,
  "required_pull_request_reviews": { "required_approving_review_count": $aprobaciones },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
)
estado=0
for rama in develop main; do
  if [ "$simular" = 1 ]; then
    echo "PUT repos/$repo/branches/$rama/protection"; echo "$cuerpo"; continue
  fi
  if salida=$(printf '%s' "$cuerpo" | gh api -X PUT "repos/$repo/branches/$rama/protection" --input - 2>&1); then
    echo "$rama: protegida (PR obligatorio, $aprobaciones aprobaciones, CI «comprobar» en verde)."
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
