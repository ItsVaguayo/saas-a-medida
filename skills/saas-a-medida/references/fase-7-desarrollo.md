# Fase 7. Desarrollo por módulos

Se construye módulo a módulo, en el orden de la especificación y según el reparto del plan técnico. Cada módulo pasa por el mismo ciclo.

Cómo se escribe y se comprueba el código está en dos guías, que se leen antes de empezar el primer módulo y se tienen delante en cada uno: `desarrollo-backend.md` (datos, rutas, permisos, reglas, tests y el método general) y `desarrollo-frontend.md` (pantallas, estados, formularios, móvil y la comprobación en el navegador). Están escritas para que las siga cualquier modelo o agente. Si repartes un módulo a un subagente o a otra IA, pásale las dos junto con la sección del módulo de la especificación.

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
2. **Datos y reglas**: migración, reglas de negocio y ruta, con los tests de los casos límite de la especificación. Pasos 1 a 7 de `desarrollo-backend.md`.
3. **Pantallas** contra el ejemplo del contrato primero y contra la API real después, con todos los estados de la tabla de `desarrollo-frontend.md`.
4. **Conexión**: se quita el ejemplo y se prueba el recorrido entero en el navegador (punto 10 de `desarrollo-frontend.md`).

Mientras construyes:

- Los textos de la interfaz siguen `textos-interfaz.md`.
- Donde una explicación ayude en la demo, usa el bloque de texto de demo (`texto-demo.md`), nunca texto explicativo suelto.
- Ningún test lee la hora real: fíjala (por ejemplo, con `vi.useFakeTimers` en Vitest). Los tests con la hora real fallan un día cualquiera y bloquean un despliegue.
- La semilla tiene tests de invariantes (sin citas solapadas, nada con fecha imposible, cifras que cuadran entre sí) y sigue bien después de reiniciarla.
- Si hay varios agentes o personas construyendo a la vez, nadie toca un fichero compartido que no es suyo (ver el plan técnico).
- Las migraciones solo añaden. Renombrar o borrar una columna va en dos entregas (`desarrollo-backend.md`, punto 1).

### 4. Revisiones antes del PR

Hay dos niveles, para no gastar ocho revisiones en cada módulo. Nombres exactos y alternativas en `skills.md`.

**En cada módulo, antes de su PR**, en este orden y resolviendo lo que encuentren:

| Orden | Qué | Cuándo |
|---|---|---|
| 1 | Las listas «Antes de darlo por hecho» de `desarrollo-backend.md` y `desarrollo-frontend.md` | siempre |
| 2 | `/simplify` | siempre |
| 3 | Tests, lint y compilación en verde, después de simplificar | siempre |
| 4 | `/code-review` sobre los cambios de la rama, ya con el código definitivo | siempre |
| 5 | Datos extremos (`break-ui`) y prueba real a 375 px de ancho | si hay pantallas |
| 6 | Permisos: un test por cada «solo lo suyo» de la especificación | si hay rutas nuevas |
| 7 | `/security-review` de los cambios | si toca sesión, permisos, subidas de ficheros, pagos o datos sensibles |

`/simplify` va antes que `/code-review` porque cambia el código: lo que se revisa tiene que ser lo que se integra.

**Una vez sobre `develop`, antes de la demo** (y antes, si la persona lo pide o si el módulo estrena un tipo de pantalla que no existía): la pasada completa de diseño (`impeccable`, `web-design-guidelines`), móvil (`mobile-native`) y accesibilidad (`fixing-accessibility`) sobre todas las pantallas a la vez. Se ven juntas, así que también salen las diferencias entre módulos, y lo que encuentre se arregla en ramas `arreglo/<tema>`.

La revisión visual se hace contra otra instancia con sus propios puertos, nunca contra la que se está enseñando a alguien.

Guarda el resultado de cada ronda en `docs/qa/<fecha>-<módulo>.md`, dentro del proyecto: lo que se probó, lo que falló y cómo se arregló. Si queda en una carpeta temporal, se pierde al cerrar la sesión.

### 5. PR

```bash
git push -u origin modulo/<nombre>
gh pr create --base develop --title "M4 · Asistencia a sesiones" --reviewer <usuario-del-compañero>
gh pr checks --watch      # el CI tiene que acabar en verde
```

La descripción sigue `.github/pull_request_template.md`: qué hace, cómo probarlo, capturas de las pantallas, qué falta y qué dudas quedan abiertas. Pide la revisión a quien diga el plan técnico. Solo, abre el PR igualmente y revísalo tú con las skills.

### 6. Integrar

El PR ya lleva al día el fichero del módulo en `docs/avance/`. Cuando está aprobado y con el CI en verde: «Squash and merge» a `develop` y borra la rama. Si el PR ha recibido commits después de la aprobación, quien lo revisó vuelve a mirarlo (el aviso de PR se lo recuerda).

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

- Las del cliente van al panel de dudas (`dudas-cliente.md`), explicadas fácil, con su detalle técnico aparte. No bloquees el módulo entero: sigue con lo que no dependa de la respuesta y marca el resto «espera al cliente» en el fichero del módulo de `docs/avance/`.
- Las del equipo van a `docs/dudas.md`, en la sección de quien tiene que responder.
- Cuando llegue una respuesta, aplícala primero en la especificación y después en el código.
- Apuntar una duda o una decisión no se hace en la rama del módulo: va en una rama `docs/<tema>` con su PR pequeño. Trabajando solo, directamente en `develop`.

## Se cierra cuando

Todos los módulos de la especificación están integrados en `develop`. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`.
