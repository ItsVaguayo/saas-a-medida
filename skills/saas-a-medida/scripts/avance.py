#!/usr/bin/env python3
"""Calcula el avance del proyecto a partir de un fichero por módulo.

Uso: avance.py [carpeta]        (por defecto docs/avance)

Cada fichero (docs/avance/M4-asistencia.md) lleva una línea «Peso: N» y una tabla
«| Punto | Estado | Nota |». Un punto vale 1 si está «hecho», 0,5 si está «a medias» y 0 si «falta»
o «espera al cliente». Avance global = suma de (peso × avance) ÷ suma de pesos.

No escribe nada: imprime la tabla. Así no hay un fichero común que todos editen y choque al integrar.
"""
import glob
import os
import re
import sys

VALOR = {"hecho": 1.0, "a medias": 0.5, "falta": 0.0, "espera al cliente": 0.0}


def leer(ruta):
    titulo, peso, cuenta, raros = os.path.basename(ruta), None, {k: 0 for k in VALOR}, []
    for linea in open(ruta, encoding="utf-8"):
        linea = linea.strip()
        if linea.startswith("# "):
            titulo = linea[2:].strip()
        m = re.match(r"peso:\s*(\d+)", linea, re.I)
        if m:
            peso = int(m.group(1))
        if linea.startswith("|"):
            celdas = [c.strip() for c in linea.strip("|").split("|")]
            if len(celdas) < 2 or not celdas[0] or celdas[0].lower() == "punto" or set(celdas[0]) <= set("-: "):
                continue
            estado = celdas[1].lower()
            if estado in VALOR:
                cuenta[estado] += 1
            else:
                raros.append(f"{celdas[0]}: «{celdas[1]}»")
    return titulo, peso, cuenta, raros


def main():
    carpeta = sys.argv[1] if len(sys.argv) > 1 else "docs/avance"
    ficheros = sorted(glob.glob(os.path.join(carpeta, "*.md")),
                      key=lambda f: [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", os.path.basename(f))])
    if not ficheros:
        print(f"No hay ficheros de avance en {carpeta}.")
        return 1
    avisos, suma, pesos = [], 0.0, 0
    print("| Módulo | Peso | Avance | Hecho | A medias | Falta | Espera al cliente |")
    print("|---|---|---|---|---|---|---|")
    for f in ficheros:
        titulo, peso, c, raros = leer(f)
        total = sum(c.values())
        if peso is None:
            avisos.append(f"{f}: falta la línea «Peso: N»; no cuenta en el global.")
        if not total:
            avisos.append(f"{f}: no tiene puntos.")
        avisos += [f"{f}: estado no reconocido en {r}" for r in raros]
        avance = sum(VALOR[k] * n for k, n in c.items()) / total if total else 0.0
        if peso is not None:
            suma += peso * avance
            pesos += peso
        print(f"| {titulo} | {peso if peso is not None else '?'} | {avance:.0%} | {c['hecho']} | {c['a medias']} "
              f"| {c['falta']} | {c['espera al cliente']} |")
    print(f"\nAvance global: {suma / pesos:.0%}" if pesos else "\nAvance global: sin pesos, no se puede calcular.")
    for a in avisos:
        print("Aviso:", a)
    return 0


if __name__ == "__main__":
    sys.exit(main())
