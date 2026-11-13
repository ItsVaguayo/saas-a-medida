# Fase 7. Desarrollo por módulos

Se construye módulo a módulo, en el orden de la especificación y según el reparto del plan técnico. Cada módulo pasa por el mismo ciclo.

## El ciclo de un módulo

### 1. Rama

```bash
git switch develop && git pull
git switch -c modulo/<nombre>
```

### 2. Referencias antes del código

Antes de escribir una línea, mira cómo resuelven ese módulo dos o tres productos reales (ver `referencias-reales.md`). Apunta en la sección del módulo de la especificación qué se toma de cada uno. Esto vale para las pantallas y también para el modelo de datos y las reglas.

### 3. Construir

Con `feature-dev` y en este orden:

1. **Contrato**: esquema de entrada y salida y una respuesta de ejemplo, igual que en la especificación.
2. **Datos y reglas**: migración, reglas de negocio y ruta, con los tests de los casos límite de la especificación.
3. **Pantallas** contra el ejemplo del contrato primero y contra la API real después, con sus estados de carga, vacío y error.
4. **Conexión**: se quita el ejemplo y se prueba el recorrido entero.

Mientras construyes:

- Los textos de la interfaz siguen `textos-interfaz.md`.
- Donde una explicación ayude en la demo, usa el bloque de texto de demo (`texto-demo.md`), nunca texto explicativo suelto.
- Ningún test lee la hora real: fíjala (por ejemplo, con `vi.useFakeTimers` en Vitest). Los tests con la hora real fallan un día cualquiera y bloquean un despliegue.
- La semilla tiene tests de invariantes (sin citas solapadas, nada con fecha imposible, cifras que cuadran entre sí) y sigue bien después de reiniciarla.
- Si hay varios agentes o personas construyendo a la vez, nadie toca un fichero compartido que no es suyo (ver el plan técnico).

### 4. Revisiones antes del PR

Pasa todas las que tocan y resuelve lo que encuentren. Nombres exactos y alternativas en `skills.md`.

| Qué | Cuándo |
|---|---|
| `/code-review` sobre los cambios de la rama | siempre |
| `/simplify` | siempre |
| Tests de la especificación en verde | siempre |
| Revisión de diseño (`impeccable`, `web-design-guidelines`) | si hay pantallas |
| Móvil (`mobile-native`) y prueba real a 375 px de ancho | si hay pantallas |
| Accesibilidad (`fixing-accessibility`) | si hay pantallas |
| Datos extremos (`break-ui`): nombres larguísimos, listas vacías, cifras enormes | si hay pantallas |
| Permisos: un test por cada «solo lo suyo» de la especificación | si hay rutas nuevas |
| `/security-review` de los cambios | si toca sesión, permisos, subidas de ficheros, pagos o datos sensibles |

La revisión visual se hace contra otra instancia con sus propios puertos, nunca contra la que se está enseñando a alguien.

Guarda el resultado de cada ronda en `docs/qa/<fecha>-<módulo>.md`, dentro del proyecto: lo que se probó, lo que falló y cómo se arregló. Si queda en una carpeta temporal, se pierde al cerrar la sesión.

### 5. PR

```bash
git push -u origin modulo/<nombre>
gh pr create --base develop --title "M4 · Asistencia a sesiones" --reviewer <usuario-del-compañero>
```

La descripción sigue `.github/pull_request_template.md`: qué hace, cómo probarlo, capturas de las pantallas, qué falta y qué dudas quedan abiertas. Pide la revisión a quien diga el plan técnico. Solo, abre el PR igualmente y revísalo tú con las skills.

### 6. Integrar

Cuando el PR está aprobado: «Squash and merge» a `develop`, borra la rama, actualiza `docs/avance.md` y, si se cerró algo, la tabla «Estado».

## Revisar el PR de un compañero

Llega como aviso al abrir Claude o porque la persona lo pide.

1. Cuéntale a la persona qué PR hay, de quién y desde cuándo espera.
2. Si quiere revisarlo: `gh pr checkout <número>`, instala dependencias si han cambiado, pasa los tests y arranca la app en otro puerto.
3. Pasa `/code-review <número>` y compara lo hecho con la sección del módulo en la especificación: reglas, casos límite, contrato y tests.
4. Prueba las pantallas en el móvil y en el ordenador.
5. Enseña a la persona lo que has encontrado, ordenado por gravedad. **No publiques comentarios ni apruebes el PR sin que ella lo confirme**: el comentario sale con su nombre.
6. Con su OK, publica la revisión con `gh pr review <número>` (`--approve` o `--request-changes` con el texto acordado).
7. Vuelve a la rama en la que estaba la persona.

## Dudas durante el desarrollo

- Las del cliente van al panel de dudas (`dudas-cliente.md`), explicadas fácil, con su detalle técnico aparte. No bloquees el módulo entero: sigue con lo que no dependa de la respuesta y marca el resto «espera respuesta» en `docs/avance.md`.
- Las del equipo van a `docs/dudas.md`, en la sección de quien tiene que responder.
- Cuando llegue una respuesta, aplícala primero en la especificación y después en el código.

## Se cierra cuando

Todos los módulos de la especificación están integrados en `develop`. Actualiza la tabla «Estado».
