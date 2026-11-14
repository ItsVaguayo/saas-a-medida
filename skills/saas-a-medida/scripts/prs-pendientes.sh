#!/usr/bin/env bash
# Hook de saas-a-medida: avisa de los PR del equipo que esperan revisión.
# Lo lanzan SessionStart (argumento "inicio") y UserPromptSubmit (argumento "mensaje").
# Al abrir la sesión dice también qué fases están en curso. Fuera de un proyecto con
# .claude/saas-a-medida.json, o sin python3, sale sin decir nada; sin gh, solo dice las fases.
entrada=$(cat 2>/dev/null || true)
command -v python3 >/dev/null 2>&1 || exit 0
printf '%s' "$entrada" | python3 "$(dirname "$0")/prs_pendientes.py" "${1:-inicio}" 2>/dev/null || true
exit 0
