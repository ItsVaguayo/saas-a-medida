# Plan técnico: {{PROYECTO}}

## Lo común

Qué se monta antes del trabajo en paralelo, quién lo hace y si ya viene en la demo.

| Qué | Cómo tiene que estar | Hecho |
|---|---|---|
| Contraseñas | hash lento (scrypt, bcrypt o argon2) | |
| Sesión | cookie `HttpOnly`, `Secure`, `SameSite`; caduca; cierre en todos los dispositivos | |
| Inicio de sesión | límite de intentos y bloqueo temporal | |
| Segundo factor | obligatorio para administradores (TOTP), con códigos de recuperación | |
| Recuperar la contraseña | enlace de un solo uso que caduca, token como hash, misma respuesta exista o no el correo | |
| Permisos | una función común, con el filtro por dueño en la consulta | |
| Aislamiento en la base | RLS por tabla con dueño, si hay Postgres y datos de varias empresas o usuarios | |
| CSRF y CORS | token CSRF o comprobación de `Origin` en lo que cambia datos; CORS solo con los orígenes propios | |
| Auditoría | quién hizo qué y cuándo en lo sensible; solo se añade | |
| Cabeceras | CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, sin iframes | |
| Errores | formato único, sin trazas | |
| CI | tests, lint, compilación, secretos y dependencias en cada PR; Dependabot | |
| Despliegue | `deploy/desplegar.sh` a la instancia de demo, vuelta atrás probada | |

## Reparto

| Persona | Módulos | Tamaño | Espera a |
|---|---|---|---|
| | | pequeño / mediano / grande | |

### Ficheros compartidos y su dueño

| Fichero | Dueño | Cómo se añade algo sin tocarlo |
|---|---|---|
| | | |

### Contratos que van primero

| Contrato | Lo necesita | Quién lo escribe |
|---|---|---|
| | | |

## Ramas

- `main`: producción. Nadie trabaja en ella directamente.
- `develop`: lo integrado y probado.
- `modulo/<nombre>`: una por módulo, sale de `develop` y vuelve con un PR.
- `arreglo/<tema>`: correcciones pequeñas.
- `docs/<tema>`: documentos comunes (decisiones, dudas, estado de las fases). PR pequeño que se integra en el momento.

Paso a paso:

```bash
# Empezar un módulo
git switch develop && git pull
git switch -c modulo/<nombre>

# Subirlo y pedir revisión
git push -u origin modulo/<nombre>
gh pr create --base develop --reviewer <usuario>
gh pr checks --watch        # el CI tiene que acabar en verde

# Cuando está aprobado: «Squash and merge» en GitHub y borrar la rama
git switch develop && git pull && git branch -d modulo/<nombre>
```

De `develop` a `main` en cada entrega, con merge commit y etiqueta de versión.

## Revisiones

| Autor | Revisa sus PR |
|---|---|
| | |

## Cuándo está hecho un módulo

1. Pasan los tests de su especificación y el CI está en verde.
2. Ha pasado las revisiones de la fase 7 y lo encontrado está resuelto.
3. Alguien lo ha probado en el móvil y en el ordenador con la semilla.
4. Alguien lo ha usado entero con la base vacía, sin semilla: alta, edición y baja de sus datos solo con la interfaz.
5. Su PR está aprobado e integrado en `develop`.
6. Su fichero de `docs/avance/` está al día, dentro del mismo PR.
