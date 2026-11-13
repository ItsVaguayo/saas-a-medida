# Plan técnico: {{PROYECTO}}

## Lo común

Qué se monta antes del trabajo en paralelo (sesión, roles y permisos, avisos, ajustes, despliegue básico), quién lo hace y si ya viene en la demo.

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

Paso a paso:

```bash
# Empezar un módulo
git switch develop && git pull
git switch -c modulo/<nombre>

# Subirlo y pedir revisión
git push -u origin modulo/<nombre>
gh pr create --base develop --reviewer <usuario>

# Cuando está aprobado: «Squash and merge» en GitHub y borrar la rama
git switch develop && git pull && git branch -d modulo/<nombre>
```

De `develop` a `main` en cada entrega, con merge commit y etiqueta de versión.

## Revisiones

| Autor | Revisa sus PR |
|---|---|
| | |

## Cuándo está hecho un módulo

1. Pasan los tests de su especificación.
2. Ha pasado las revisiones de la fase 7 y lo encontrado está resuelto.
3. Alguien lo ha probado en el móvil y en el ordenador con la semilla.
4. Su PR está aprobado e integrado en `develop`.
5. `docs/avance.md` está actualizado.
