#!/usr/bin/env python3
"""Avisa de los PR del equipo que esperan algo de quien tiene la sesión abierta.

- PR de compañeros con revisión pedida a esta persona (en pareja, también los que aún no ha revisado).
- PR propios con cambios pedidos o ya aprobados y sin integrar.
- PR que esta persona ya revisó y que han recibido commits después: vuelven a salir.
- Al abrir la sesión, además, las fases que están en curso según .claude/saas-a-medida.json.

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
NOMBRES_FASE = {"0": "equipo y proyecto", "1": "información del cliente", "2": "maqueta base",
                "3": "documento de alcance", "4": "plan de la plataforma", "5": "mockups y estilo",
                "6": "plan técnico", "7": "desarrollo por módulos", "8": "demo al cliente",
                "9": "producción", "10": "soporte"}


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
    nombre_evento = "SessionStart" if evento == "inicio" else "UserPromptSubmit"

    def emitir(partes):
        if partes:
            print(json.dumps({"hookSpecificOutput": {"hookEventName": nombre_evento,
                                                     "additionalContext": "\n".join(partes)}}, ensure_ascii=False))

    # Al abrir la sesión, en qué fase está el proyecto: vale para cualquier modo y no necesita gh.
    cabecera = []
    fases = config.get("fases")
    if evento == "inicio" and isinstance(fases, dict):
        en_curso = [f"{n} ({NOMBRES_FASE.get(str(n), '')})".replace(" ()", "")
                    for n, e in sorted(fases.items(), key=lambda x: int(x[0]) if str(x[0]).isdigit() else 99)
                    if str(e).lower() == "en curso"]
        if en_curso:
            cabecera.append(f"Proyecto {config.get('proyecto') or os.path.basename(raiz)} (saas-a-medida). "
                            f"Fases en curso: {', '.join(en_curso)}. Lee solo la guía de la fase en la que se vaya a trabajar.")
    if modo == "individual":
        emitir(cabecera)
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
            emitir(cabecera)
            return
        json.dump({"login": yo, "t": ahora}, open(login_path, "w", encoding="utf-8"))

    try:
        salida = sh(["gh", "pr", "list", "--state", "open", "--limit", "50", "--json",
                     "number,title,url,author,isDraft,reviewRequests,reviews,reviewDecision,createdAt,headRefOid"], raiz)
        prs = json.loads(salida or "[]")
    except Exception:
        emitir(cabecera)
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
        mias = sorted((r for r in pr.get("reviews", [])
                       if ((r.get("author") or {}).get("login", "")).lower() == yo.lower()),
                      key=lambda r: r.get("submittedAt") or "")
        revisado_por_mi = bool(mias)
        # Si el autor ha subido commits después de mi última revisión, vuelve a tocarme.
        visto = ((mias[-1].get("commit") or {}).get("oid") if mias else None)
        cabeza = pr.get("headRefOid")
        pr["_otra_vez"] = bool(visto and cabeza and visto != cabeza)
        if autor.lower() != yo.lower():
            le_toca = modo == "pareja" or autor.lower() in me_toca
            if yo.lower() in pedidos or (le_toca and (not revisado_por_mi or pr["_otra_vez"])):
                por_revisar.append(pr)
        else:
            if pr.get("reviewDecision") == "CHANGES_REQUESTED":
                con_cambios.append(pr)
            elif pr.get("reviewDecision") == "APPROVED":
                aprobados.append(pr)

    contados = set(estado.get("contados", {}).get(sesion, []))
    def marca(p, tipo):  # la de revisión lleva el commit, para que un PR con cambios nuevos vuelva a contarse
        return f"r:{p['number']}:{(p.get('headRefOid') or '')[:7]}" if tipo == "r" else f"{tipo}:{p['number']}"

    def nuevos(lista, tipo):
        return [p for p in lista if marca(p, tipo) not in contados]

    if evento == "mensaje":
        por_revisar, con_cambios, aprobados = (nuevos(por_revisar, "r"), nuevos(con_cambios, "c"),
                                                nuevos(aprobados, "a"))

    estado["ultima"] = ahora
    sesiones = estado.get("contados", {})
    sesiones[sesion] = sorted(contados | {marca(p, "r") for p in por_revisar}
                              | {marca(p, "c") for p in con_cambios}
                              | {marca(p, "a") for p in aprobados})
    estado["contados"] = dict(list(sesiones.items())[-20:])
    json.dump(estado, open(estado_path, "w", encoding="utf-8"))

    if not (por_revisar or con_cambios or aprobados):
        emitir(cabecera)
        return

    def linea(p):
        autor = quien((p.get("author") or {}).get("login", ""))
        otra = ", con commits nuevos desde su última revisión" if p.get("_otra_vez") else ""
        return f"#{p['number']} «{p['title']}» de {autor}, abierto {dias_desde(p.get('createdAt', ''))}{otra} ({p['url']})"

    partes = cabecera + [f"Aviso de saas-a-medida sobre los PR del proyecto {config.get('proyecto') or os.path.basename(raiz)} "
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

    emitir(partes)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
