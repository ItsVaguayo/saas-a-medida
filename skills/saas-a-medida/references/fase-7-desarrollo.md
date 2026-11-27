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

**Una vez sobre `develop`, antes de la demo** (y antes, si la persona lo pide o si el módulo estrena un tipo de pantalla que no existía): la pasada completa de diseño (`impeccable audit` y después `impeccable polish`, `web-design-guidelines`), móvil (`mobile-native`) y accesibilidad (`fixing-accessibility`) sobre todas las pantallas a la vez. Se ven juntas, así que también salen las diferencias entre módulos, y lo que encuentre se arregla en ramas `arreglo/<tema>`.

La revisión visual se hace contra otra instancia con sus propios puertos, nunca contra la que se está enseñando a alguien.

Guarda el resultado de cada ronda en `docs/qa/`, dentro del proyecto, con la plantilla `assets/docs/qa-campana.md`. Si se queda en una carpeta temporal o fuera del repo, se pierde o nadie más lo encuentra.

### QA

Cada ronda de pruebas a mano es un fichero en `docs/qa/` que dice:

- **sobre qué se probó**: el commit, el entorno y cualquier opción que cambie el comportamiento, como el modo demo. Una prueba de permisos hecha en modo demo no vale;
- **un identificador fijo por fila**, que no cambia entre rondas;
- **el estado de cada fila**: abierto, arreglado (con commit y test), no se reproduce (con lo que se probó), no es un fallo (con el motivo), espera decisión o sin probar.

Para arreglar lo que encontró:

1. Comprueba cada fallo en el código y en la app antes de tocarlo, en una instancia con su propia base y nunca sobre los datos de la persona.
2. Si el arreglo pide una migración, cambia el alcance o toca una regla que decide otra persona, para y explícalo.
3. Escribe un test por arreglo y comprueba que falla sin el arreglo.
4. Lo que no hayas podido probar de verdad (un móvil real, un correo real) queda como «sin probar», con lo que falta.
5. Actualiza el estado de cada fila en el mismo PR que los arreglos.

### Tamaño del PR

Un PR se tiene que poder revisar entero de una sentada. Si junta varias funcionalidades que se pueden integrar por separado, o tiene tantos cambios que no se leen en un rato (como orientación, más de unas 800 líneas), pártelo antes de pedir revisión. Un PR enorme acaba revisado por encima o bloqueado días.

### 5. PR

Antes de crearlo:

- comprueba que el diff no lleva ficheros locales (`.env`, bases de datos, compilados) ni cambios de otro tema;
- comprueba que la rama está al día con `develop` y sin conflictos;
- si tocas ficheros que tienen otro dueño en el plan técnico, ponlos en un commit aparte y di en el PR qué cambia y quién lo tiene que revisar;
- si alguna revisión del punto 4 no se ha pasado, dilo en la descripción. No lo calles.

```bash
git push -u origin modulo/<nombre>
gh pr create --base develop --title "M4 · Asistencia a sesiones" --reviewer <usuario-del-compañero>
gh pr checks --watch      # el CI tiene que acabar en verde
```

La descripción sigue `.github/pull_request_template.md`: qué hace, cómo probarlo, capturas de las pantallas, qué falta y qué dudas quedan abiertas. Pide la revisión a quien diga el plan técnico. Solo, abre el PR igualmente y revísalo tú con las skills.

### 6. Integrar

El PR ya lleva al día el fichero del módulo en `docs/avance/`, con su sección «Relevo» vacía. Al integrarlo, apunta su línea en `docs/gasto.md` (en una rama `docs/`, como el resto de documentos comunes) y haz `/compact` o empieza sesión nueva antes del siguiente módulo. Cuando está aprobado y con el CI en verde: «Squash and merge» a `develop` y borra la rama. Si el PR ha recibido commits después de la aprobación, quien lo revisó vuelve a mirarlo (el aviso de PR se lo recuerda).

## Revisar el PR de un compañero

Llega como aviso al abrir Claude o porque la persona lo pide.

1. Cuéntale a la persona qué PR hay, de quién y desde cuándo espera.
2. Si quiere revisarlo: `gh pr checkout <número>`, instala dependencias si han cambiado, pasa los tests y arranca la app en otro puerto.
3. Compara lo hecho con la sección del módulo en la especificación: reglas, casos límite, contrato y tests, uno por uno. El autor ya pasó `/simplify` y `/code-review` antes de abrir el PR (míralo en la lista «Revisiones pasadas» de su descripción), así que no repitas la revisión automática: lo que aporta quien revisa es lo que una máquina no ve, que el módulo haga lo que pide la especificación y que se use bien. Si la lista no está marcada, pídeselo al autor en vez de hacerlo tú.
4. Solo si el PR es grande o delicado (cambia más de unas 400 líneas sin contar tests, o toca sesión, permisos, pagos o datos sensibles), pasa además los agentes de `pr-review-toolkit` y reparte la revisión por zonas (cálculos, pantallas, permisos y seguridad, datos) en subagentes de solo lectura que trabajen a la vez. Cada hallazgo lleva fichero y línea, un caso concreto y el arreglo.
5. Antes de contar un hallazgo grave, reprodúcelo tú con un test o un script fuera del repo. Lo que no hayas podido reproducir se presenta como «probable».
6. Prueba las pantallas en el móvil y en el ordenador. Después arranca sin semilla y comprueba que lo que el módulo maneja se da de alta, se edita y se da de baja desde la app, según su tabla «Datos que maneja».
7. Enseña a la persona lo que has encontrado, ordenado por gravedad y en tres grupos: lo que frena este PR, lo que puede ir en un PR aparte y lo que es una decisión de alcance, que va a `docs/dudas.md`. **No publiques comentarios ni apruebes el PR sin que ella lo confirme**: el comentario sale con su nombre.
8. Con su OK, publica la revisión con `gh pr review <número>` (`--approve` o `--request-changes` con el texto acordado).
9. Vuelve a la rama en la que estaba la persona.

Lo que entró en `develop` sin revisión (commits directos o PR integrados sin aprobar) se revisa igual. Lo que salga se arregla en una rama `arreglo/<tema>`, no dentro del PR de otra funcionalidad.

## Dudas durante el desarrollo

- Las del cliente van al panel de dudas (`dudas-cliente.md`), explicadas fácil, con su detalle técnico aparte. No bloquees el módulo entero: sigue con lo que no dependa de la respuesta y marca el resto «espera al cliente» en el fichero del módulo de `docs/avance/`.
- Las del equipo van a `docs/dudas.md`, en la sección de quien tiene que responder.
- Cuando llegue una respuesta, aplícala primero en la especificación y después en el código.
- Apuntar una duda o una decisión no se hace en la rama del módulo: va en una rama `docs/<tema>` con su PR pequeño. Trabajando solo, directamente en `develop`.

## Se cierra cuando

Todos los módulos de la especificación están integrados en `develop`. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`.
