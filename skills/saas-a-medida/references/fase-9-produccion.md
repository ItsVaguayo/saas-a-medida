# Fase 9. Producción

Pasar de la demo a la app que el cliente usa de verdad. Es la fase en la que un descuido sale más caro, así que va por lista y no se salta ningún punto sin preguntarlo con el menú.

## 1. Fuera lo de demo

1. `bash "${CLAUDE_SKILL_DIR}/scripts/comprobar-texto-demo.sh" <carpeta del código>` tiene que terminar sin nada. Si lista textos de demo, quítalos (o conviértelos en ayuda real si la persona lo decide con el menú) y vuelve a pasarlo.
2. Quita el aviso de modo demo, el selector de «entrar como» sin contraseña, el botón de reiniciar la demo y la semilla de ejemplo del arranque de producción.
3. Los datos reales del cliente se importan con un script aparte, nunca metidos en la semilla.

## 2. Seguridad

| Comprobación | Cómo |
|---|---|
| Revisión de todo el repo | `/security-review`; si está instalado, el escaneo de `claude-security` |
| Dependencias con fallos conocidos | `npm audit --omit=dev` (o el equivalente del stack) |
| Secretos en el repo o en su historial | `gitleaks detect` si está instalado; si no, buscar claves, tokens y `.env` en el historial |
| Contraseñas | guardadas con un hash lento (scrypt, bcrypt o argon2), nunca en claro |
| Sesión | cookie `HttpOnly`, `Secure` y `SameSite`; caduca y se puede cerrar en todos los dispositivos |
| Inicio de sesión | límite de intentos y bloqueo temporal |
| Permisos | los tests de «solo lo suyo» pasan; ninguna ruta devuelve datos de otro cliente o de otro rol |
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

1. Se niega si hay cambios sin commit, y pasa los tests y la compilación en local.
2. Hace copia de los datos compartidos (la base de datos con `sqlite3 .backup` si es SQLite) antes de tocar nada.
3. Sube la versión a su propia carpeta (`versiones/<fecha>-<commit>`). Las exclusiones de `rsync` van ancladas: `/data`, no `data`, que también borraría carpetas `data` dentro de `node_modules`.
4. Instala dependencias exactas y aplica las migraciones. Si algo falla aquí, para sin tocar la versión activa.
5. Cambia el enlace `actual` a la versión nueva, reinicia y comprueba la salud (una URL o un comando).
6. Si la salud falla, vuelve solo a la versión anterior, restaura la copia de datos y guarda la versión fallida aparte para revisarla.
7. `--atras` vuelve a la versión anterior a mano y `--simular` enseña lo que haría.

Para el primer despliegue: crea en el servidor `RUTA/compartido/` con el `.env` de producción y la carpeta de datos, rellena `deploy/desplegar.env` (sin secretos), copia también `comprobar-texto-demo.sh` a `deploy/` para que el script lo pase con `PRODUCCION=1`, y prueba antes con `--simular`.

Además:

- Variables de entorno y secretos fuera del repo, en el servidor.
- HTTPS con renovación automática del certificado.
- Copias de seguridad cada noche, guardando al menos las dos últimas semanas, y una restauración de prueba antes de dar la fase por cerrada.
- Un aviso si la app deja de responder y registros de errores que se puedan consultar.

Desplegar en el servidor del cliente o en el nuestro, con qué dominio y con qué proveedor son decisiones de la persona: pregúntalas con el menú.

## 5. Entrega

1. Alta de los usuarios reales con invitación (cada uno elige su contraseña).
2. Una guía de uso corta por rol, en PDF con el estilo de `estilo-documentos.md`, con capturas de la app real.
3. `docs/soporte.md` con qué cubre el soporte y cómo se pide un cambio.
4. Etiqueta de versión en `main` (`v1.0`).

## Se cierra cuando

La app funciona en producción, las copias se hacen y se ha probado una restauración. Actualiza la tabla «Estado» y pasa a la fase 10.
