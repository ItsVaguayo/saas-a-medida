# Fase 6. Plan técnico

Con el estilo elegido, se escribe lo que hay que construir y cómo se reparte. Son tres documentos: la especificación (qué se construye), el plan técnico (quién, en qué orden y con qué ramas) y el avance (cuánto falta).

## 1. La especificación: `docs/especificacion.md`

Es lo que se sigue para construir cada módulo, así que tiene que bastar para hacerlo sin inventar. Plantilla en `assets/docs/especificacion.md`.

1. **Qué es.** Tres o cuatro frases: para quién, qué resuelve, qué queda fuera.
2. **Roles y permisos.** Tabla de rol por acción. Cada celda: puede, no puede o «solo lo suyo». Escribe qué significa «lo suyo» para cada rol: es lo que más fallos da.
3. **Modelo de datos.** Cada entidad con sus campos, tipos, qué es obligatorio y con qué se relaciona. Los estados (borrador, activo, cerrado…) con las transiciones permitidas y quién puede hacer cada una.
4. **Módulos.** Numerados M1, M2… en orden de dependencia: cada uno solo depende de los anteriores. Cada módulo lleva:
   - de qué depende y quién lo hace;
   - qué hace, en dos o tres frases;
   - referencias reales que se han mirado (ver `referencias-reales.md`);
   - los datos que maneja: para cada entidad y cada lista de opciones, quién la crea, quién la edita, quién la da de baja y desde qué pantalla. Una fila sin pantalla es un hueco, y se ve aquí antes de programar: o se añade la pantalla o se apunta como fijo en el código, con el motivo;
   - reglas;
   - casos límite;
   - contrato: ruta, entrada, salida y errores;
   - tests.
5. **Fuera de alcance.** Lo que se habló y no se hace.

Si los datos que el cliente ya tiene entran en la app (fase 1, pregunta 2), **la migración es un módulo más**, con sus reglas (qué se hace con cada defecto de los datos), sus casos límite y su forma de cuadrar el resultado con el cliente. Va de los últimos, porque depende de las tablas de los demás. Cómo se construye: `desarrollo-backend.md`, «Si el módulo es la migración de los datos reales».

La tabla de datos existe porque es fácil construir un apartado que lista y enseña pero no deja dar de alta: con la semilla cargada parece terminado, y el día que el cliente quiere añadir un servicio nos lo tiene que pedir. Las listas de un desplegable siguen la misma regla. Las que el cliente querrá cambiar (categorías, tarifas, tipos de cita, plantillas de aviso) van en su tabla y se editan en Configuración. Las que arrastran lógica (un estado que dispara un aviso o cambia permisos) se quedan fijas y se apuntan como tales.

Los casos límite y los tests son lo que más vale. Un módulo sin casos límite escritos se construye para el caso feliz y falla en la demo. Si algo no está claro, va al panel de dudas o a `docs/dudas.md` y no se construye hasta resolverlo.

Al terminar, repásala contra el documento de alcance y `docs/plan-plataforma.md`: cada punto debe estar en un módulo o en «Fuera de alcance».

Si está instalada, `compound-engineering:ce-plan` ayuda a escribirla; la estructura de arriba manda.

## 2. El plan técnico: `docs/plan-tecnico.md`

Plantilla en `assets/docs/plan-tecnico.md`.

### Lo común va primero

Inicio de sesión, roles y permisos, avisos, ajustes, la estructura de carpetas, el formato único de error, el reloj que usan las reglas y el despliegue. Lo monta una sola persona antes de que empiece el trabajo en paralelo, o ya viene en la demo. Si cada uno lo resuelve a su manera, después no encaja.

Lo común no está hecho hasta que cumple esto, porque cambiarlo con diez módulos encima sale caro. Si viene de la demo, se comprueba igual: el código de una demo no suele cumplirlo.

| Qué | Cómo tiene que estar |
|---|---|
| Contraseñas | guardadas con un hash lento (scrypt, bcrypt o argon2) |
| Sesión | cookie `HttpOnly`, `Secure` y `SameSite`; caduca y se puede cerrar en todos los dispositivos |
| Inicio de sesión | límite de intentos y bloqueo temporal |
| Segundo factor | obligatorio para administradores y para quien gestiona usuarios, permisos o cobros; opcional para el resto. Código de una app de autenticación (TOTP); el SMS, solo si no hay otra opción. Al activarlo se dan códigos de recuperación de un solo uso, guardados como hash |
| Recuperar la contraseña | enlace de un solo uso que caduca en una hora como mucho, con el token guardado como hash. La respuesta es la misma exista o no el correo. Al cambiarla se cierran las demás sesiones y se avisa por correo |
| Permisos | una sola función que todas las rutas usan, con el filtro por dueño dentro de la consulta |
| Aislamiento en la base | con Postgres (o Supabase) y datos de varias empresas, sedes o usuarios: además del filtro, seguridad por filas (RLS) en cada tabla con dueño, y la app conecta con un rol que no puede saltársela |
| CSRF | con sesión en cookie, toda ruta que cambia algo exige un token CSRF o comprueba que `Origin` es el de la app. `SameSite` ayuda, pero no basta. Nada cambia datos por `GET` |
| CORS | cerrado: solo los orígenes propios de la app, nunca `*` si hay cookies o credenciales |
| Auditoría | registro de quién hizo qué, cuándo y desde dónde en lo sensible: entradas y fallos de entrada, cambios de roles y permisos, cobros y devoluciones, bajas, exportaciones y cambios de ajustes. Solo se añade, nadie lo edita, y lo consulta el administrador desde la app |
| Cabeceras | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` y bloqueo de iframes |
| Errores | formato único, sin trazas en la respuesta |
| CI | `.github/workflows/ci.yml` pasa tests, lint, compilación, búsqueda de secretos y auditoría de dependencias en cada PR; Dependabot propone las actualizaciones |
| Despliegue | `deploy/desplegar.sh` sube `develop` a la instancia de demo (con su `deploy/demo.env` y `PRODUCCION=0`) y se ha probado volver atrás |

Desplegar desde el primer día a la instancia de demo hace que el script esté rodado cuando llegue producción, y que la demo de la fase 8 no sea la primera vez que la app corre fuera de un portátil.

### El reparto (pareja o grupo)

El objetivo es que nadie espere a nadie. Se reparte **por módulos enteros**, no por capas: quien coge un módulo hace sus datos, su API, sus pantallas y sus tests. Repartir por capas (uno el back, otro las pantallas) obliga a la persona de las pantallas a esperar a la API en cada módulo.

Reglas para que los módulos sean independientes:

1. **Cada módulo es dueño de lo suyo**: sus tablas, sus rutas, sus pantallas y su carpeta. Nadie toca la carpeta de otro módulo sin hablarlo.
2. **Los contratos que cruzan módulos van primero.** Si el módulo B lee datos del A, el contrato del A (esquema y respuesta de ejemplo) se escribe e integra antes, en un PR pequeño, y B trabaja contra ese ejemplo hasta que A esté hecho.
3. **Cada fichero compartido tiene un único dueño**, apuntado en el plan: el enrutador, el menú, el catálogo de permisos, los estilos globales, la semilla común. Mejor todavía, que cada módulo se registre solo desde su carpeta (sus rutas, su entrada de menú, sus permisos) y el fichero central los cargue sin que nadie lo edite. Lo mismo vale para los documentos: el avance va en un fichero por módulo, y los documentos comunes (`docs/decisiones.md`, `docs/dudas.md`, `docs/dudas-cliente.md`, `docs/gasto.md`, el estado de las fases) no se tocan desde la rama de un módulo, sino en una rama `docs/<tema>` con un PR pequeño que se integra en el momento.
4. **Migraciones sin choques**: numeradas por módulo o con fecha y hora en el nombre, nunca un contador global que dos personas incrementan a la vez.
5. **Semilla por módulo**: cada uno añade sus datos de ejemplo en su carpeta.
6. **Las esperas se escriben.** Si un módulo no puede empezar hasta que otro integre algo, el plan lo dice: «M5 espera al contrato de M2».
7. **Equilibra por tamaño** (pequeño, mediano, grande), no por número de módulos.

Presenta el reparto como tabla (persona, módulos, tamaño, espera a) y pregunta con el menú si se da por bueno.

En modo individual no hay reparto: el orden de la especificación es el orden de trabajo.

### Ramas

Por defecto, una rama por módulo:

- `main`: lo que está en producción. Nadie trabaja directamente en ella.
- `develop`: lo integrado y probado.
- `modulo/<nombre>` (por ejemplo `modulo/agenda`): sale de `develop`, vuelve con un PR y se borra al integrarse. Cada PR lleva un solo módulo, así que se revisa y se deshace fácil.
- `arreglo/<tema>` para correcciones pequeñas, igual que un módulo.
- `docs/<tema>` para los documentos comunes: PR pequeño, se integra en cuanto pasa el CI.
- Al integrar en `develop`, «Squash and merge»: un commit por módulo.
- De `develop` a `main` en cada entrega, con merge commit y una etiqueta de versión (`v1.0`, `v1.1`).

Explícalo en el plan en lenguaje llano, con los comandos de cada paso (crear la rama, subirla, abrir el PR, integrarlo), porque es lo que más se olvida.

En modo individual también se trabaja con rama y PR: el PR es donde corre el CI y desde donde se deshace un módulo entero si hace falta.

`develop` y `main` llevan la protección que se eligió en la fase 0 (campo `proteccion` del fichero de proyecto). Con `ninguna`, la regla es la misma (nada entra sin PR ni con el CI en rojo) y la cumple quien integra, porque GitHub no lo impide. Al escribir el reparto, si el equipo ha crecido o cambia el modo de trabajo, vuelve a preguntar el nivel con el menú.

### Revisiones

- En pareja, cada uno revisa los PR del otro.
- En grupo, por turnos: el plan dice quién revisa a quién (por ejemplo, A revisa a B, B a C, C a A).
- Solo, la revisión la hacen las skills antes del PR (ver fase 7).
- Quien revisa aprueba o pide cambios; quien escribió el módulo lo integra cuando está aprobado.
- Los avisos de PR pendientes llegan solos al abrir Claude (hook de esta skill), si `gh` está identificado. Un PR que ya revisaste vuelve a salir cuando su autor sube commits nuevos.
- Apunta el reparto de revisiones en `revisiones` de `.claude/saas-a-medida.json` (`{"<github del autor>": "<github de quien le revisa>"}`): de ahí lo lee el aviso.

### Cuándo está hecho un módulo

1. Pasan los tests de su especificación y el CI está en verde.
2. Ha pasado las revisiones de la fase 7 y lo que encontraron está resuelto.
3. Alguien lo ha probado en el móvil y en el ordenador con la semilla.
4. Alguien lo ha usado entero con la base vacía, sin semilla: da de alta lo que el módulo necesita, lo edita y lo da de baja solo con la interfaz. Si para llegar a usarlo hay que tocar la base o el código, falta una pantalla.
5. Su PR está aprobado e integrado en `develop`.
6. Su fichero de `docs/avance/` está al día, dentro del mismo PR.

## 3. El avance: `docs/avance/`

Un fichero por módulo (`docs/avance/M4-asistencia.md`, plantilla en `assets/docs/avance-modulo.md`), que solo toca quien hace ese módulo; así dos PR nunca chocan por el avance. El total no se guarda en ningún sitio: lo calcula `python3 "${CLAUDE_SKILL_DIR}/scripts/avance.py"` cada vez que alguien pregunta.

Cada módulo tiene un peso fijo según su tamaño (pequeño 1, mediano 2, grande 3) y una lista de puntos sacada de su especificación. Un punto vale 1 si está en código con su test, 0,5 si está a medias y 0 si falta. Lo que depende del cliente cuenta como 0 hasta que responda. El avance global es la suma de peso por avance dividida por la suma de pesos. Sirve para responder «¿cuánto queda?» sin adivinar.

## Se cierra cuando

La persona da por buenos la especificación y el plan con el menú. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json` y apunta en `docs/decisiones.md` el reparto y el modelo de ramas.
