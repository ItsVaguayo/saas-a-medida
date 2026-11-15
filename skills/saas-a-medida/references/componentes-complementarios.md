# Los componentes complementarios

En `${CLAUDE_SKILL_DIR}/assets/componentes/` hay otros 31 componentes de React, hechos con las mismas convenciones que el kit: nombres y propiedades en español (`valor`, `alCambiar`, `textos`, `formato`), los mismos tokens en `tema.css` (`--tono`, `--acento`, `--tinta`, `--linea`, `--e-N`, `--radio`) y tema oscuro con `data-tema="oscuro"`. Cambia el prefijo de clase: aquí es `c-` y en el kit es `k-`, así que los dos pueden estar en el mismo proyecto sin pisarse.

Complementan al kit de `references/kit-componentes.md`. El kit trae las piezas base de cualquier app de gestión (tabla, diálogo, avisos, paleta); estos cubren estructura, datos y gráficos, formularios y bloques de producto.

## Cuándo se usan

Igual que el kit: antes de escribir un componente de interfaz, mira en las dos carpetas. Si la pieza está en las dos, elige una para todo el proyecto:

| Tema | En el kit | Aquí |
|---|---|---|
| Armazón y navegación | `Marco` | `BarraLateral`, `BarraCristal`, `CabeceraPagina`, `SelectorEspacio` |
| Cifras y gráficos | `Cifras`, `Grafico` | `TarjetaMetrica`, `GraficoBarras`, `GraficoArea`, `Anillo`, `Minigrafico`, `MedidorUso`, `MapaCalor` |
| Actividad | `Actividad` | `LineaTiempo`, `CentroNotificaciones` |
| Vacío y errores | `Estados` | `EstadoVacio`, `Banner` |
| Primeros pasos | `PrimerosPasos` | `GuiaInicio` |

`BarraCristal` es la excepción a la regla del fondo: lleva siempre texto claro y necesita una foto o un fondo oscuro detrás. Sobre blanco no se lee.

## Verlos

```bash
cp -r "${CLAUDE_SKILL_DIR}/assets/componentes" /tmp/componentes && cd /tmp/componentes
npm install
npm run dev      # catálogo en http://localhost:5191
npm test         # 61 pruebas
```

El puerto es distinto del del kit (5190), así que los dos catálogos pueden estar abiertos a la vez.

## Qué hay

Todo está en `assets/componentes/src/componentes/` y se exporta desde `index.js`.

| | Componente | Para qué |
|---|---|---|
| **Estructura** | | |
| 01 | `BarraLateral` | Navegación con grupos, contadores y plegado |
| 02 | `CabeceraPagina` · `Migas` | Ruta, título con estado y acciones |
| 03 | `SelectorEspacio` | Cambiar de empresa, sede o cuenta |
| 04 | `BarraAcciones` | Acciones sobre varias filas marcadas |
| 05 | `PanelesDivididos` | Lista y detalle con raya arrastrable |
| 06 | `Arbol` | Carpetas y categorías anidadas |
| 31 | `BarraCristal` | Navegación translúcida sobre una foto o un fondo oscuro, con buscador y ramas |
| **Datos** | | |
| 07 | `TarjetaMetrica` · `Metricas` | Cifra, variación y tendencia |
| 08 | `Minigrafico` | Tendencia sin ejes |
| 09 | `GraficoBarras` | Comparar periodos, con series apiladas |
| 10 | `GraficoArea` | Evolución en el tiempo |
| 11 | `Anillo` | Reparto de un total |
| 12 | `MedidorUso` · `Medidores` | Consumo frente al límite del plan |
| 13 | `MapaCalor` | Actividad día a día |
| 14 | `ListaClasificada` | Los que más, con su peso |
| 15 | `LineaTiempo` | Historial de un registro |
| **Contenido** | | |
| 16 | `ListaDescriptiva` | Ficha de un registro, con copiar |
| 17 | `EstadoVacio` | Lista sin nada: motivo y salida |
| 18 | `GrupoAvatares` | Quién participa |
| 19 | `Banner` | Aviso que se queda en la página |
| **Formularios** | | |
| 20 | `CodigoVerificacion` | Código de SMS o correo |
| 21 | `CampoClave` | Contraseña con medidor |
| 22 | `Deslizador` | Una cantidad o un tramo |
| 23 | `CampoNumero` | Cantidades de uno en uno |
| 24 | `TarjetasOpcion` | Elegir entre opciones con explicación |
| 25 | `CampoSecreto` | Claves de API: ver, copiar, regenerar |
| 26 | `MatrizPermisos` | Permisos por rol |
| **Producto** | | |
| 27 | `GuiaInicio` | Primeros pasos de una cuenta |
| 28 | `CentroNotificaciones` | Campana y lista de lo no leído |
| 29 | `TablaPrecios` | Planes con pago mensual o anual |
| 30 | `ZonaPeligro` · `ZonasPeligro` | Acciones sin vuelta atrás |

Cada fichero de `src/componentes/` abre con un comentario que dice para qué sirve, en qué productos
se basa y qué recibe cada propiedad. El catálogo enseña el código de uso de cada uno.

## Llevar uno al proyecto

1. Copia su `.jsx` y su `.css` de `src/componentes/`. Los gráficos comparten `Graficos.css`.
2. Copia también `interno.js`, `formato.js` y `base.jsx` con `src/base.css`; los gráficos piden además `graficos.js`. Si el proyecto ya tiene `Boton`, `Avatar` o `Etiqueta` del kit, no los dupliques: apunta los imports de `base.jsx` a los del proyecto y adapta el prefijo.
3. Une las variables igual que con el kit: `tema.css` de aquí añade `--serie-1` a `--serie-6`, `--info` e `--info-suave`, que el kit no trae.
4. Añade el componente al `/catalogo` del proyecto con sus estados y copia sus pruebas de `test/componentes.test.jsx`.
5. Comprueba la pantalla en el navegador como dice `desarrollo-frontend.md`.

## Qué está comprobado y qué no

Comprobado: las 61 pruebas, la compilación de producción y los 31 en Chrome a 1280 y 390 px, en claro y oscuro, sin errores de consola ni desplazamiento lateral.

Sin comprobar, y hay que decírselo a la persona si el proyecto depende de ello: Safari y Firefox (el desenfoque de `BarraCristal` es lo que más puede variar), lector de pantalla real y arrastre táctil en un móvil físico.
