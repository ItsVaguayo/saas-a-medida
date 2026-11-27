# Fase 9. Producción

Pasar de la demo a la app que el cliente usa de verdad. Es la fase en la que un descuido sale más caro, así que va por lista y no se salta ningún punto sin preguntarlo con el menú.

## 1. Fuera lo de demo

1. `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-texto-demo.sh" <carpeta del código>` tiene que terminar sin nada. Si lista textos de demo, quítalos (o conviértelos en ayuda real si la persona lo decide con el menú) y vuelve a pasarlo.
2. Quita el aviso de modo demo, el selector de «entrar como» sin contraseña, el botón de reiniciar la demo y la semilla de ejemplo del arranque de producción.
3. Los datos reales del cliente se importan con el script de migración, que ya se ensayó en la fase 8 (`desarrollo-backend.md`), nunca metidos en la semilla. Se pasa con copia hecha antes, y el cliente cuadra los totales y revisa diez fichas antes de dar de alta a los usuarios.

## 2. Seguridad

Contraseñas, sesión, límite de intentos y cabeceras se montaron con lo común (fase 6). Aquí se comprueba que siguen así con todos los módulos dentro; si alguna no se cumple, es un fallo que viene de atrás y va también a `docs/lecciones.md`.

| Comprobación | Cómo |
|---|---|
| Revisión de todo el repo | `/security-review`; si está instalado, el escaneo de `claude-security`. Si la persona quiere una segunda opinión (datos sensibles, pagos, mucho usuario de fuera), la auditoría completa de `security-audit` de Cloudflare, grupo `seguridad-extra`: pídela explícitamente («auditoría completa del repo»), porque si no se queda en modo consulta. Lanza muchos subagentes y gasta mucho, así que pregúntalo antes con el menú. Deja su informe en `~/security-audit-skill/<repo>/`, fuera del repo: lo que confirme se pasa a `docs/qa/` y se arregla, lo que quede «por validar» se comprueba a mano |
| Dependencias con fallos conocidos | el CI ya pasa `npm audit --omit=dev --audit-level=high` en cada PR; aquí se mira también lo de nivel medio y que no haya PR de Dependabot sin integrar |
| Secretos en el repo o en su historial | el CI ya pasa `gitleaks` sobre todo el historial; aquí se confirma que el paso sigue activo y en verde en `main`. Un secreto que salió alguna vez se cambia en su servicio, aunque ya no esté en el código |
| Contraseñas | guardadas con un hash lento (scrypt, bcrypt o argon2), nunca en claro |
| Sesión | cookie `HttpOnly`, `Secure` y `SameSite`; caduca y se puede cerrar en todos los dispositivos |
| Inicio de sesión | límite de intentos y bloqueo temporal |
| Segundo factor | activo y obligatorio en todas las cuentas de administrador antes de dar de alta a los usuarios reales; los códigos de recuperación funcionan |
| Recuperar la contraseña | el enlace sirve una sola vez y caduca; pedirlo con un correo que no existe responde igual; al cambiarla se cierran las demás sesiones |
| Permisos | los tests de «solo lo suyo» pasan; ninguna ruta devuelve datos de otro cliente o de otro rol |
| Aislamiento en la base | si hay RLS: cada tabla con dueño tiene su política y la app no conecta como propietario de las tablas ni con un rol que se salte RLS |
| CSRF y CORS | una petición que cambia algo sin token, o desde otro origen, responde 403; CORS no devuelve `*` ni refleja cualquier origen |
| Auditoría | entrar, cambiar un rol, cobrar y exportar dejan su fila en el registro de auditoría, y el administrador la ve |
| Subidas de ficheros | tipo comprobado por contenido, tamaño máximo, nunca servidas como HTML |
| Cabeceras | `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy` y bloqueo de iframes |
| Errores | sin trazas ni datos internos en las respuestas |

Lo que encuentre la revisión se arregla antes de desplegar o se apunta, con el menú, como riesgo aceptado por la persona.

## 3. Legal (España y UE)

Qué lleva cada documento y de dónde sale está en `legal.md`. Lo que se prepare es un borrador: los contratos y las políticas los revisa un abogado antes de firmarse o publicarse, y así se le dice a la persona.

| Documento | Cuándo |
|---|---|
| Política de privacidad de la app | siempre que haya datos personales |
| Aviso legal (LSSI) | si la app tiene parte pública |
| Política de cookies y banner | solo si hay cookies que no son técnicas; la cookie de sesión no necesita consentimiento |
| Contrato de encargado del tratamiento (art. 28 RGPD) | siempre: el cliente es responsable de sus datos y nosotros los tratamos por él |
| Evaluación de impacto (EIPD) | si el triaje de la fase 1 lo pidió: menores, salud, datos a gran escala, seguimiento |
| Triaje del Reglamento de IA | si la app decide, clasifica o genera con IA |
| Condiciones de uso | si entran usuarios de fuera de la empresa |

La facturación legal (VeriFactu) queda fuera salvo que el contrato diga lo contrario.

## 4. Despliegue

El despliegue lo hace un script que vive en el repo (`deploy/`), nunca comandos a mano. Si el proyecto no tiene uno, parte de `${CLAUDE_SKILL_DIR}/assets/despliegue/`: `desplegar.sh` y `desplegar.env.ejemplo`, pensados para un servidor Linux por SSH. El script:

1. Se niega si no tiene forma de comprobar la salud, si hay cambios sin commit o, con `PRODUCCION=1`, si no estás en `main` o tu `main` no coincide con la de GitHub. Pasa los tests y la compilación en local.
2. Hace copia de los datos compartidos (la base de datos con `sqlite3 .backup` si es SQLite) antes de tocar nada.
3. Sube la versión a su propia carpeta (`versiones/<fecha>-<commit>`). Las exclusiones de `rsync` van ancladas: `/data`, no `data`, que también borraría carpetas `data` dentro de `node_modules`.
4. Instala dependencias exactas y aplica las migraciones. Si algo falla aquí, para sin tocar la versión activa.
5. Cambia el enlace `actual` a la versión nueva, reinicia y comprueba la salud (una URL o un comando).
6. Si la salud falla, vuelve solo a la versión anterior, restaura la copia de datos y guarda la versión fallida aparte para revisarla.
7. `--atras` vuelve al código de la versión anterior sin tocar los datos; `--atras --con-datos` restaura además la copia de antes de esa versión, para cuando una migración cambió algo que la versión anterior no entiende (se pierde lo escrito desde entonces, y lo que había queda guardado aparte). `--simular` enseña lo que haría.

Para que casi nunca haga falta `--con-datos`, las migraciones solo añaden (`desarrollo-backend.md`, punto 1).

A estas alturas el script ya lleva tiempo desplegando `develop` en la instancia de demo (fase 6). Producción es otro fichero de configuración, `deploy/desplegar.env`, con `PRODUCCION=1`.

Para el primer despliegue: crea en el servidor `RUTA/compartido/` con el `.env` de producción y la carpeta de datos, rellena `deploy/desplegar.env` (sin secretos), copia también `comprobar-texto-demo.sh` a `deploy/` para que el script lo pase con `PRODUCCION=1`, y prueba antes con `--simular`.

Además:

- Variables de entorno y secretos fuera del repo, en el servidor.
- HTTPS con renovación automática del certificado.
- Copias de seguridad cada noche con `copia-nocturna.sh` (en `${CLAUDE_SKILL_DIR}/assets/despliegue/`): se copia al servidor junto con su `copia.env` y se programa con cron. Guarda dos semanas y manda cada copia a otra máquina o a un almacenamiento externo, **cifrada con `age`** (o `gpg`) con una clave pública; si no tiene destino externo o no puede cifrar, falla a propósito. La clave privada se crea en el ordenador de quien custodia las copias, se guarda en el gestor de contraseñas del equipo y nunca va al servidor: si se pierde, las copias externas no sirven. Mejor dos destinatarios (dos personas). Las copias que hace `desplegar.sh` antes de cada despliegue viven en el mismo servidor y no cuentan como copia de seguridad.
- Una restauración de prueba antes de dar la fase por cerrada: `copia-nocturna.sh copia.env --probar`, y además bajar una copia del destino externo, descifrarla con la clave privada en una máquina del equipo (el comando está en la cabecera del script), levantar la app en otra instancia con esa copia y entrar.
- Un aviso si la app deja de responder y registros de errores que se puedan consultar.

Desplegar en el servidor del cliente o en el nuestro, con qué dominio y con qué proveedor son decisiones de la persona: pregúntalas con el menú.

## 5. Entrega

1. Alta de los usuarios reales con invitación (cada uno elige su contraseña).
2. Una guía de uso corta por rol, en PDF con el estilo de `estilo-documentos.md`, con capturas de la app real.
3. `docs/soporte.md` con qué cubre el soporte, cómo se pide un cambio, de quién es el código y quién paga el servidor y el dominio (fase 1, pregunta 11).
4. Etiqueta de versión en `main` (`v1.0`).

## Se cierra cuando

La app funciona en producción, las copias se hacen, salen del servidor y se ha probado una restauración. Marca la fase como hecha en `fases` de `.claude/saas-a-medida.json`, apunta las lecciones del proyecto (`lecciones.md`) y pasa a la fase 10.
