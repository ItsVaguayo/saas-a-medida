#!/usr/bin/env python3
"""Avisa de los PR del equipo que esperan algo de quien tiene la sesión abierta.

- PR de compañeros con revisión pedida a esta persona (en pareja, también los que aún no ha revisado).
- PR propios con cambios pedidos o ya aprobados y sin integrar.

Al abrir la sesión ("inicio") cuenta todo lo pendiente. En cada mensaje ("mensaje") mira como mucho
cada 15 minutos y solo cuenta lo que no se haya contado ya en esta sesión.
Escribe JSON con additionalContext para que Claude lo vea. Si no hay nada, no escribe nada.
"""
import hashlib
import json
import os
import subprocess
import sys
import time
from datetime import datetime, timezone

CADA_SEGUNDOS = 15 * 60


def sh(args, cwd, timeout=8):
    r = subprocess.run(args, cwd=cwd, capture_output=True, text=True, timeout=timeout)
    if r.returncode != 0:
        raise RuntimeError(r.stderr.strip())
    return r.stdout.strip()


def dias_desde(iso):
    try:
        t = datetime.fromisoformat(iso.replace("Z", "+00:00"))
    except ValueError:
        return ""
    d = (datetime.now(timezone.utc) - t).days
    return "hoy" if d == 0 else ("hace 1 día" if d == 1 else f"hace {d} días")


def main():
    evento = sys.argv[1] if len(sys.argv) > 1 else "inicio"
    try:
        datos = json.loads(sys.stdin.read() or "{}")
    except json.JSONDecodeError:
        datos = {}
    carpeta = datos.get("cwd") or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    sesion = datos.get("session_id", "sin-sesion")

    try:
        raiz = sh(["git", "rev-parse", "--show-toplevel"], carpeta, timeout=3)
    except Exception:
        return
    config_path = os.path.join(raiz, ".claude", "saas-a-medida.json")
    if not os.path.isfile(config_path):
        return
    try:
        config = json.load(open(config_path, encoding="utf-8"))
    except Exception:
        return
    modo = (config.get("modo") or "individual").lower()
    if modo == "individual":
        return

    cache_dir = os.environ.get("CLAUDE_PLUGIN_DATA") or os.path.expanduser("~/.cache/saas-a-medida")
    os.makedirs(cache_dir, exist_ok=True)
    clave = hashlib.sha1(raiz.encode()).hexdigest()[:12]
    estado_path = os.path.join(cache_dir, f"prs-{clave}.json")
    try:
        estado = json.load(open(estado_path, encoding="utf-8"))
    except Exception:
        estado = {}
    ahora = time.time()
    if evento == "mensaje" and ahora - estado.get("ultima", 0) < CADA_SEGUNDOS:
        return

    login_path = os.path.join(cache_dir, "login.json")
    try:
        login_cache = json.load(open(login_path, encoding="utf-8"))
        if ahora - login_cache.get("t", 0) > 86400:
            raise ValueError
        yo = login_cache["login"]
    except Exception:
        try:
            yo = sh(["gh", "api", "user", "-q", ".login"], raiz)
        except Exception:
            return
        json.dump({"login": yo, "t": ahora}, open(login_path, "w", encoding="utf-8"))

    try:
        salida = sh(["gh", "pr", "list", "--state", "open", "--limit", "50", "--json",
                     "number,title,url,author,isDraft,reviewRequests,reviews,reviewDecision,createdAt"], raiz)
        prs = json.loads(salida or "[]")
    except Exception:
        return

    nombres = {(p.get("github") or "").lower(): p.get("nombre") or p.get("github")
               for p in config.get("integrantes", []) if p.get("github")}
    # "revisiones": {"<github del autor>": "<github de quien le revisa>"}, del plan técnico.
    me_toca = {a.lower() for a, r in (config.get("revisiones") or {}).items()
               if (r or "").lower() == yo.lower()}

    def quien(login):
        return nombres.get(login.lower(), login)

    por_revisar, con_cambios, aprobados = [], [], []
    for pr in prs:
        if pr.get("isDraft"):
            continue
        autor = (pr.get("author") or {}).get("login", "")
        pedidos = [(r.get("login") or "").lower() for r in pr.get("reviewRequests", []) if r]
        revisado_por_mi = any(((r.get("author") or {}).get("login", "")).lower() == yo.lower()
                              for r in pr.get("reviews", []))
        if autor.lower() != yo.lower():
            le_toca = modo == "pareja" or autor.lower() in me_toca
            if yo.lower() in pedidos or (le_toca and not revisado_por_mi):
                por_revisar.append(pr)
        else:
            if pr.get("reviewDecision") == "CHANGES_REQUESTED":
                con_cambios.append(pr)
            elif pr.get("reviewDecision") == "APPROVED":
                aprobados.append(pr)

    contados = set(estado.get("contados", {}).get(sesion, []))
    def nuevos(lista, tipo):
        return [p for p in lista if f"{tipo}:{p['number']}" not in contados]

    if evento == "mensaje":
        por_revisar, con_cambios, aprobados = (nuevos(por_revisar, "r"), nuevos(con_cambios, "c"),
                                                nuevos(aprobados, "a"))

    estado["ultima"] = ahora
    sesiones = estado.get("contados", {})
    sesiones[sesion] = sorted(contados | {f"r:{p['number']}" for p in por_revisar}
                              | {f"c:{p['number']}" for p in con_cambios}
                              | {f"a:{p['number']}" for p in aprobados})
    estado["contados"] = dict(list(sesiones.items())[-20:])
    json.dump(estado, open(estado_path, "w", encoding="utf-8"))

    if not (por_revisar or con_cambios or aprobados):
        return

    def linea(p):
        autor = quien((p.get("author") or {}).get("login", ""))
        return f"#{p['number']} «{p['title']}» de {autor}, abierto {dias_desde(p.get('createdAt', ''))} ({p['url']})"

    partes = [f"Aviso de saas-a-medida sobre los PR del proyecto {config.get('proyecto') or os.path.basename(raiz)} "
              f"para {quien(yo)}:"]
    if por_revisar:
        partes.append(f"- {len(por_revisar)} PR de compañeros esperan su revisión: "
                      + "; ".join(linea(p) for p in por_revisar) + ".")
    if con_cambios:
        partes.append("- Tiene cambios pedidos en: " + "; ".join(linea(p) for p in con_cambios) + ".")
    if aprobados:
        partes.append("- Aprobados y sin integrar: " + "; ".join(linea(p) for p in aprobados) + ".")
    partes.append("La skill saas-a-medida (fase 7, «Revisar el PR de un compañero») explica cómo revisarlos. "
                  "Nada se publica en GitHub sin que la persona lo confirme.")

    nombre_evento = "SessionStart" if evento == "inicio" else "UserPromptSubmit"
    print(json.dumps({"hookSpecificOutput": {"hookEventName": nombre_evento,
                                             "additionalContext": "\n".join(partes)}}, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
