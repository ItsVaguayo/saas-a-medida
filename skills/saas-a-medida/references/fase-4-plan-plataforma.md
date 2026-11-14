# Fase 4. Plan de la plataforma

Con el alcance aprobado, describe qué tiene que tener la plataforma para poder diseñarla. Es la entrada de los mockups: quién entra, qué módulos hay, qué pantallas importan y qué recorridos hace cada persona.

## Qué lleva `docs/plan-plataforma.md`

Plantilla en `assets/docs/plan-plataforma.md`. Si la fase 2 ya creó el fichero con el inventario de la demo, complétalo.

1. **Quién la usa.** Cada rol con lo que hace en la app y si es de la empresa o de fuera. Para cada rol externo, qué ve y qué no.
2. **Módulos.** Cada módulo del alcance con lo que hace, sus pantallas principales, los datos que maneja y de qué otros módulos depende. Marca los que ya existen en la demo y cuánto falta.
3. **Recorridos.** Para cada rol, los dos o tres recorridos que más hace, como pasos numerados («La oficina busca al alumno, abre su ficha, reserva una práctica, cobra el plazo»). Salen de lo que el cliente contó en la fase 1, no de lo que suele tener una app de este tipo.
4. **Pantallas para los mockups.** Entre cinco y ocho, las que más se usan o las que el cliente más mencionó, en orden de importancia. Para cada una, qué tiene que verse sin hacer scroll.
5. **Datos principales.** Un primer borrador de las entidades y sus relaciones. Se detalla en la especificación de la fase 6.
6. **Integraciones** con su estado de `docs/viabilidad.md`.
7. **Fuera de alcance**, copiado del documento de alcance.

## Antes de darlo por bueno

- Cada punto del documento de alcance está en un módulo o en «Fuera de alcance».
- Cada pantalla para mockups tiene al menos una referencia real (ver `referencias-reales.md`).
- Pregunta con el menú si se aprueba el plan o qué cambiar. En pareja o grupo, quien lleva el contacto con el cliente es quien lo aprueba.

## Se cierra cuando

La persona lo aprueba. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`.
