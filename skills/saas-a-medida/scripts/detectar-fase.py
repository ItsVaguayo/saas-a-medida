#!/usr/bin/env python3
"""Mira un proyecto y propone en qué fase está, con el rastro en el que se basa.

Uso: detectar-fase.py [carpeta del proyecto] [--json]

Sirve cuando se pone la skill sobre un proyecto ya empezado, o cuando el fichero de proyecto no tiene
«fases». No escribe nada y no decide: propone. Quien confirma es la persona, con el menú.

Cada fase sale con una de estas propuestas:
  hecha      hay rastro de lo que sale de esa fase
  en curso   es donde parece estar el trabajo ahora
  hueco      no hay rastro, pero hay fases posteriores con trabajo hecho: falta algo de esta
  pendiente  todavía no toca
"""
import glob
import json
import os
import re
import subprocess
import sys

NOMBRES = ["Equipo y proyecto", "Información del cliente", "Maqueta base", "Documento de alcance",
           "Plan de la plataforma", "Mockups y estilo", "Plan técnico", "Desarrollo por módulos",
           "Demo al cliente", "Producción", "Soporte"]
IGNORAR = {".git", "node_modules", "vendor", "dist", "build", ".next", "coverage", ".venv", "venv", "__pycache__"}
CODIGO = (".js", ".jsx", ".ts", ".tsx", ".vue", ".svelte", ".py", ".php", ".rb", ".go", ".java", ".cs", ".astro")


def git(raiz, *args):
    try:
        r = subprocess.run(["git", "-C", raiz, *args], capture_output=True, text=True, timeout=8)
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""


def leer(ruta):
    try:
        return open(ruta, encoding="utf-8", errors="replace").read()
    except Exception:
        return ""


def relleno(ruta):
    """True si el documento existe y tiene contenido propio, no solo la plantilla."""
    texto = leer(ruta)
    if not texto.strip():
        return False
    lineas = [l for l in texto.splitlines()
              if l.strip() and not l.startswith("#") and "{{" not in l and not l.strip().startswith("<!--")
              and not set(l.strip()) <= set("|-: ")]
    return len(lineas) >= 4


def primero(raiz, *patrones):
    for p in patrones:
        for f in sorted(glob.glob(os.path.join(raiz, p), recursive=True)):
            if not IGNORAR & set(os.path.relpath(f, raiz).split(os.sep)):
                return os.path.relpath(f, raiz)
    return ""


def ficheros_de_codigo(raiz, tope=4000):
    n, tests, css = 0, 0, []
    for carpeta, subs, fs in os.walk(raiz):
        subs[:] = [s for s in subs if s not in IGNORAR and not s.startswith(".")]
        for f in fs:
            ruta = os.path.join(carpeta, f)
            if f.endswith(CODIGO):
                n += 1
                if re.search(r"(\.|_)(test|spec)\.|(^|/)tests?/", os.path.relpath(ruta, raiz)):
                    tests += 1
            elif f.endswith(".css") and len(css) < 40:
                css.append(ruta)
        if n > tope:
            break
    return n, tests, css


def detectar(raiz):
    r = {n: [] for n in range(11)}   # rastro por fase
    notas = []
    d = lambda *p: os.path.join(raiz, *p)

    # 0
    cfg = {}
    if os.path.isfile(d(".claude", "saas-a-medida.json")):
        try:
            cfg = json.load(open(d(".claude", "saas-a-medida.json"), encoding="utf-8"))
        except Exception:
            notas.append(".claude/saas-a-medida.json no se puede leer.")
        r[0].append(".claude/saas-a-medida.json")

    # 1
    if relleno(d("docs", "informacion-cliente.md")):
        r[1].append("docs/informacion-cliente.md con contenido")
    f = primero(raiz, "docs/**/*cuestionario*", "docs/**/*briefing*", "*cuestionario*", "*briefing*")
    if f:
        r[1].append(f)

    # 2
    n_codigo, n_tests, css = ficheros_de_codigo(raiz)
    manifiesto = primero(raiz, "package.json", "composer.json", "requirements.txt", "pyproject.toml", "Gemfile",
                         "go.mod", "*/package.json")
    if manifiesto and n_codigo >= 5:
        r[2].append(f"{manifiesto} y {n_codigo}{'+' if n_codigo > 4000 else ''} ficheros de código")
    if relleno(d("docs", "referencias.md")):
        r[2].append("docs/referencias.md con contenido")

    # 3
    if relleno(d("docs", "viabilidad.md")):
        r[3].append("docs/viabilidad.md con contenido")
    carpetas_pdf = [raiz] + ([os.path.expanduser(cfg["docs_cliente"])] if cfg.get("docs_cliente") else [])
    for c in carpetas_pdf:
        f = primero(c, "**/*[Aa]lcance*.pdf", "**/*[Pp]ropuesta*.pdf", "**/*[Pp]resupuesto*.pdf")
        if f:
            r[3].append(os.path.join(c if c != raiz else "", f))
            break

    # 4
    if relleno(d("docs", "plan-plataforma.md")):
        r[4].append("docs/plan-plataforma.md con contenido")

    # 5
    f = primero(raiz, "**/catalogo*", "**/styleguide*", "**/*.stories.*")
    if f:
        r[5].append(f"catálogo de componentes ({f})")
    for ruta in css:
        if len(re.findall(r"^\s*--[\w-]+\s*:", leer(ruta), re.M)) >= 8:
            r[5].append(f"variables de estilo en {os.path.relpath(ruta, raiz)}")
            break
    if primero(raiz, "tailwind.config.*", "**/tokens.*", "DESIGN.md"):
        r[5].append(primero(raiz, "tailwind.config.*", "**/tokens.*", "DESIGN.md"))

    # 6
    espec = leer(d("docs", "especificacion.md"))
    modulos = re.findall(r"^###\s+M(\d+)\.\s*(.+)$", espec, re.M)
    modulos = [(n, t.strip()) for n, t in modulos if "{{" not in t]
    if modulos:
        r[6].append(f"docs/especificacion.md con {len(modulos)} módulos")
    if relleno(d("docs", "plan-tecnico.md")):
        r[6].append("docs/plan-tecnico.md con contenido")
    if not modulos:
        f = primero(raiz, "docs/**/*espec*", "docs/**/*spec*", "SPEC*.md", "docs/**/*requisitos*")
        if f:
            notas.append(f"Hay algo parecido a una especificación en {f}, pero sin módulos «### M1. …»: "
                         "la fase 6 no se da por hecha hasta pasarla a ese formato.")

    # 7
    ramas = git(raiz, "branch", "-a", "--format=%(refname:short)").splitlines()
    abiertas = sorted({b.split("/", 1)[1] if b.startswith("origin/") else b for b in ramas
                       if re.search(r"(^|/)(modulo|feature|feat)/", b)})
    integrados = len(re.findall(r"^M\d+\b", git(raiz, "log", "--format=%s", "-n", "400"), re.M))
    commits = git(raiz, "rev-list", "--count", "HEAD")
    avances = sorted(glob.glob(d("docs", "avance", "*.md")))
    hechos = 0
    for a in avances:
        est = [c.split("|")[2].strip().lower() for c in leer(a).splitlines()
               if c.startswith("|") and c.count("|") >= 3]
        est = [e for e in est if e in ("hecho", "a medias", "falta", "espera al cliente")]
        if est and all(e == "hecho" for e in est):
            hechos += 1
    if avances:
        r[7].append(f"docs/avance/: {hechos} de {len(avances)} módulos completos")
    if integrados:
        r[7].append(f"{integrados} commits de módulo integrados (títulos «M4 · …»)")
    if abiertas:
        r[7].append(f"ramas de módulo: {', '.join(abiertas[:6])}{'…' if len(abiertas) > 6 else ''}")
    if not r[7] and n_tests >= 3 and commits.isdigit() and int(commits) >= 30:
        r[7].append(f"{commits} commits y {n_tests} ficheros de test")
    desarrollo_cerrado = bool(modulos) and bool(avances) and hechos >= len(modulos)

    # 8
    f = primero(raiz, "GUION-DEMO.md", "docs/**/*guion*demo*", "docs/plan-reunion-*.md")
    if f:
        r[8].append(f)
    conforme = re.search(r"conformidad", leer(d("docs", "decisiones.md")), re.I)
    if conforme:
        r[8].append("conformidad del cliente apuntada en docs/decisiones.md")

    # 9
    etiquetas = [t for t in git(raiz, "tag", "--list", "v*").splitlines() if t]
    f = primero(raiz, "deploy/desplegar.env", "deploy/desplegar.sh", "deploy/*", "Dockerfile", "docker-compose*.yml",
                ".github/workflows/*deploy*")
    if f:
        r[9].append(f"despliegue preparado ({f})")
    if etiquetas:
        r[9].append(f"versiones etiquetadas: {', '.join(etiquetas[-4:])}")
    en_produccion = bool(etiquetas) and bool(f)

    # 10
    soporte = leer(d("docs", "soporte.md"))
    filas = [l for l in soporte.splitlines() if re.match(r"\|\s*\d{1,4}[-/]", l)]
    if filas:
        r[10].append(f"docs/soporte.md con {len(filas)} entradas")
    if len(etiquetas) >= 2:
        r[10].append("más de una versión publicada")

    # Propuesta
    con_rastro = [n for n in range(11) if r[n]]
    # tener el despliegue preparado no es estar en producción; tener guion no es tener la conformidad
    hecha = {n: bool(r[n]) for n in range(11)}
    hecha[7] = desarrollo_cerrado or any(r[n] for n in (8, 9, 10)) and bool(r[7])
    hecha[8] = bool(conforme) or en_produccion
    hecha[9] = en_produccion
    hecha[10] = False
    mayor = max([n for n in range(11) if hecha[n]] + [m for m in con_rastro if m >= 7] + [-1])
    propuesta = {}
    for n in range(11):
        if hecha[n]:
            propuesta[n] = "hecha"
        elif r[n]:
            propuesta[n] = "en curso"
        elif n < mayor:
            propuesta[n] = "hueco"
        else:
            propuesta[n] = "pendiente"
    if en_produccion:
        propuesta[10] = "en curso"
    if "en curso" not in propuesta.values():
        siguiente = next((n for n in range(11) if propuesta[n] == "pendiente"), None)
        if siguiente is not None:
            propuesta[siguiente] = "en curso"
    if propuesta[0] == "hueco":
        propuesta[0] = "en curso"   # la fase 0 es justo lo que se está haciendo ahora

    if n_codigo >= 5 and not modulos:
        notas.append("Hay código pero no una especificación por módulos: es lo mínimo para seguir en la fase 7.")
    if en_produccion and not primero(raiz, "deploy/copia-nocturna.sh", "deploy/*copia*", "deploy/*backup*"):
        notas.append("Parece estar en producción y no se ve un script de copias en deploy/: compruébalo hoy.")
    declarado = cfg.get("fases") if isinstance(cfg.get("fases"), dict) else None
    return {"fases": [{"fase": n, "nombre": NOMBRES[n], "propuesta": propuesta[n], "rastro": r[n],
                       "declarado": (declarado or {}).get(str(n))} for n in range(11)],
            "notas": notas, "tiene_fichero_de_proyecto": bool(r[0]), "tiene_fases": bool(declarado)}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    raiz = os.path.abspath(args[0] if args else ".")
    if not os.path.isdir(raiz):
        print(f"No existe la carpeta {raiz}", file=sys.stderr)
        return 2
    res = detectar(git(raiz, "rev-parse", "--show-toplevel") or raiz)
    if "--json" in sys.argv:
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0
    if not any(f["rastro"] for f in res["fases"]):
        print("No hay rastro de ninguna fase: el proyecto empieza por la fase 0.")
        return 0
    print("| Fase | Propuesta | En qué se basa |")
    print("|---|---|---|")
    for f in res["fases"]:
        dif = f" (el fichero de proyecto dice «{f['declarado']}»)" if f["declarado"] and f["declarado"] != f["propuesta"] else ""
        print(f"| {f['fase']}. {f['nombre']} | {f['propuesta']}{dif} | {'; '.join(f['rastro']) or 'sin rastro'} |")
    for n in res["notas"]:
        print("\nAviso:", n)
    print("\nEs una propuesta a partir de los ficheros y del historial de git. Confírmala con la persona antes de escribir «fases».")
    return 0


if __name__ == "__main__":
    sys.exit(main())
