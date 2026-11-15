// Kit SaaS · 41 módulos. Cada uno vive en su fichero (y su .css al lado) y se puede copiar suelto a un proyecto
// junto con interno.js, base.jsx y los tokens de src/tema.css.

// Base
export { Avatar, Boton, Campo, Etiqueta, Tarjeta } from './base.jsx';

// Funciones (01–07)
export * from './formato.js';
export { coincideAtajo, esMac, teclasDe, useAlmacen, useAtajo, useBusqueda, useCopiar, useEstadoUrl, useRetraso, useSeleccion } from './hooks.js';
export { BotonCopiar } from './Copiar.jsx';

// Animaciones (08–15)
export { Aparecer, Escalonado } from './Aparecer.jsx';
export { CifraAnimada } from './CifraAnimada.jsx';
export { Esqueleto, EsqueletoPersona, EsqueletoTabla, EsqueletoTexto } from './Esqueleto.jsx';
export { Acordeon, Colapsable } from './Colapsable.jsx';
export { ListaAnimada } from './ListaAnimada.jsx';
export { Anillo, Barra } from './Progreso.jsx';
export { BotonEstado } from './BotonEstado.jsx';
export { Fundido, Viajero, useTransicionVista } from './TransicionVista.jsx';

// Interactivos (16–34)
export { ZonaAvisos, avisar, quitarAviso } from './Avisos.jsx';
export { Dialogo, useConfirmar, useModal } from './Dialogo.jsx';
export { Cajon } from './Cajon.jsx';
export { Paleta, Teclas, filtrarComandos } from './Paleta.jsx';
export { Menu } from './Menu.jsx';
export { Combo } from './Combo.jsx';
export { Pestanas } from './Pestanas.jsx';
export { Segmentado } from './Segmentado.jsx';
export { Interruptor, ListaOpciones } from './Interruptor.jsx';
export { Pista } from './Pista.jsx';
export { Tabla, ordenarFilas } from './Tabla.jsx';
export { Filtros } from './Filtros.jsx';
export { Paginacion, tramoPaginas } from './Paginacion.jsx';
export { SubirArchivos, tipoValido } from './SubirArchivos.jsx';
export { Calendario, SelectorFecha, diasDelMes, hoyTexto, sumarDias, sumarMeses } from './SelectorFecha.jsx';
export { Tablero, moverTarjeta } from './Tablero.jsx';
export { EdicionEnLinea } from './EdicionEnLinea.jsx';
export { CampoEtiquetas } from './CampoEtiquetas.jsx';
export { Pasos } from './Pasos.jsx';

// Apartados (35–40)
export { Marco } from './Marco.jsx';
export { BarraCristal } from './BarraCristal.jsx';
export { Cifra, Cifras, Minigrafica } from './Cifras.jsx';
export { GraficoBarras, GraficoLinea, techoRedondo } from './Grafico.jsx';
export { ErrorCarga, Estado, SinConexion, SinPermiso, SinResultados, Vacio, useConexion } from './Estados.jsx';
export { Actividad } from './Actividad.jsx';
export { PrimerosPasos } from './PrimerosPasos.jsx';
