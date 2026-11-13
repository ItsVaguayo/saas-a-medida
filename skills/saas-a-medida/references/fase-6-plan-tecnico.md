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
   - reglas;
   - casos límite;
   - contrato: ruta, entrada, salida y errores;
   - tests.
5. **Fuera de alcance.** Lo que se habló y no se hace.

Los casos límite y los tests son lo que más vale. Un módulo sin casos límite escritos se construye para el caso feliz y falla en la demo. Si algo no está claro, va al panel de dudas o a `docs/dudas.md` y no se construye hasta resolverlo.

Al terminar, repásala contra el documento de alcance y `docs/plan-plataforma.md`: cada punto debe estar en un módulo o en «Fuera de alcance».

Si está instalada, `compound-engineering:ce-plan` ayuda a escribirla; la estructura de arriba manda.

## 2. El plan técnico: `docs/plan-tecnico.md`

Plantilla en `assets/docs/plan-tecnico.md`.

### Lo común va primero

Inicio de sesión, roles y permisos, avisos, ajustes, la estructura de carpetas y el despliegue básico. Lo monta una sola persona antes de que empiece el trabajo en paralelo, o ya viene en la demo. Si cada uno lo resuelve a su manera, después no encaja.

### El reparto (pareja o grupo)

El objetivo es que nadie espere a nadie. Se reparte **por módulos enteros**, no por capas: quien coge un módulo hace sus datos, su API, sus pantallas y sus tests. Repartir por capas (uno el back, otro las pantallas) obliga a la persona de las pantallas a esperar a la API en cada módulo.

Reglas para que los módulos sean independientes:

1. **Cada módulo es dueño de lo suyo**: sus tablas, sus rutas, sus pantallas y su carpeta. Nadie toca la carpeta de otro módulo sin hablarlo.
2. **Los contratos que cruzan módulos van primero.** Si el módulo B lee datos del A, el contrato del A (esquema y respuesta de ejemplo) se escribe e integra antes, en un PR pequeño, y B trabaja contra ese ejemplo hasta que A esté hecho.
3. **Cada fichero compartido tiene un único dueño**, apuntado en el plan: el enrutador, el menú, el catálogo de permisos, los estilos globales, la semilla común. Mejor todavía, que cada módulo se registre solo desde su carpeta (sus rutas, su entrada de menú, sus permisos) y el fichero central los cargue sin que nadie lo edite.
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
- Al integrar en `develop`, «Squash and merge»: un commit por módulo.
- De `develop` a `main` en cada entrega, con merge commit y una etiqueta de versión (`v1.0`, `v1.1`).

Explícalo en el plan en lenguaje llano, con los comandos de cada paso (crear la rama, subirla, abrir el PR, integrarlo), porque es lo que más se olvida.

En modo individual también se trabaja con rama y PR: el PR es donde corren las revisiones automáticas y desde donde se deshace un módulo entero si hace falta.

### Revisiones

- En pareja, cada uno revisa los PR del otro.
- En grupo, por turnos: el plan dice quién revisa a quién (por ejemplo, A revisa a B, B a C, C a A).
- Solo, la revisión la hacen las skills antes del PR (ver fase 7).
- Quien revisa aprueba o pide cambios; quien escribió el módulo lo integra cuando está aprobado.
- Los avisos de PR pendientes llegan solos al abrir Claude (hook de esta skill), si `gh` está identificado.

### Cuándo está hecho un módulo

1. Pasan los tests de su especificación.
2. Ha pasado las revisiones de la fase 7 y lo que encontraron está resuelto.
3. Alguien lo ha probado en el móvil y en el ordenador con la semilla.
4. Su PR está aprobado e integrado en `develop`.
5. `docs/avance.md` está actualizado.

## 3. El avance: `docs/avance.md`

Plantilla en `assets/docs/avance.md`. Cada módulo tiene un peso fijo según su tamaño y una lista de puntos sacada de su especificación. Un punto vale 1 si está en código con su test, 0,5 si está a medias y 0 si falta. Lo que depende del cliente cuenta como 0 hasta que responda. El avance global es la suma de peso por avance dividida por la suma de pesos. Sirve para responder «¿cuánto queda?» sin adivinar.

## Se cierra cuando

La persona da por buenos la especificación y el plan con el menú. Actualiza la tabla «Estado» y apunta en `docs/decisiones.md` el reparto y el modelo de ramas.
