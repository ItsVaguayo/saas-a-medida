// Demos de los componentes interactivos (16–34).
import {
  Archive, Bold, CreditCard, Download, Italic, LayoutGrid, Link, List, Mail, Pencil, Phone, Printer, Receipt, Send, Settings, Trash2, UserPlus, Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Avatar, Boton, Cajon, Calendario, Campo, CampoEtiquetas, Combo, Dialogo, EdicionEnLinea, ErrorCarga, Etiqueta, Filtros, Interruptor, ListaOpciones, Menu,
  Paginacion, Paleta, Pasos, Pestanas, Pista, Segmentado, SelectorFecha, SinResultados, SubirArchivos, Tabla, Tablero, Teclas, Vacio,
  avisar, fechaCercana, hoyTexto, moneda, moverTarjeta, plural, sumarDias, useAtajo, useConfirmar,
} from '../kit/index.js';
import { CLIENTES, ESTADOS, TARJETAS, esperar } from './datos.js';

export function DemoAvisos() {
  return (
    <div className="demo-fila">
      <Boton onClick={() => avisar('Factura guardada', { tono: 'bien' })}>Guardado</Boton>
      <Boton onClick={() => avisar('Cliente archivado', { accion: { texto: 'Deshacer', alPulsar: () => avisar('Cliente recuperado', { tono: 'bien' }) } })}>Con «Deshacer»</Boton>
      <Boton onClick={() => avisar('Enlace copiado', { detalle: 'Caduca en 7 días' })}>Con detalle</Boton>
      <Boton onClick={() => avisar('No se ha enviado', { tono: 'mal', detalle: 'El servidor de correo no responde', accion: { texto: 'Reintentar' } })}>Error (no se va solo)</Boton>
    </div>
  );
}

export function DemoDialogo() {
  const [abierto, setAbierto] = useState(false);
  const [pedir, confirmacion] = useConfirmar();
  const borrar = async () => {
    const ok = await pedir({ titulo: '¿Eliminar a Laura Gil?', detalle: 'Se borran sus 3 citas futuras y su historial. No se puede deshacer.', accion: 'Eliminar cliente', peligro: true });
    if (ok) avisar('Cliente eliminado');
  };
  return (
    <div className="demo-fila">
      <Boton variante="principal" icono={UserPlus} onClick={() => setAbierto(true)}>Nuevo cliente</Boton>
      <Boton icono={Trash2} onClick={borrar}>Eliminar cliente</Boton>
      <Dialogo
        abierto={abierto}
        alCerrar={() => setAbierto(false)}
        titulo="Nuevo cliente"
        pie={<><Boton onClick={() => setAbierto(false)}>Cancelar</Boton><Boton variante="principal" onClick={() => { setAbierto(false); avisar('Cliente creado', { tono: 'bien' }); }}>Guardar cliente</Boton></>}
      >
        <div className="demo-columna">
          <Campo etiqueta="Nombre" autoComplete="name" />
          <Campo etiqueta="Email" type="email" autoComplete="email" ayuda="Se usa para enviar las facturas" />
          <Campo etiqueta="Notas" multilinea opcional />
        </div>
      </Dialogo>
      {confirmacion}
    </div>
  );
}

export function DemoCajon() {
  const [abierto, setAbierto] = useState(null);
  const c = CLIENTES.find((x) => x.id === abierto) ?? CLIENTES[0];
  return (
    <div className="demo-columna" style={{ maxWidth: 420 }}>
      <div className="demo-caja demo-lista">
        {CLIENTES.slice(0, 4).map((x) => (
          <button key={x.id} type="button" className="demo-persona demo-pulsable" onClick={() => setAbierto(x.id)}>
            <Avatar nombre={x.nombre} /><div><strong>{x.nombre}</strong><span>{x.empresa}</span></div>
          </button>
        ))}
      </div>
      <Cajon
        abierto={abierto !== null}
        alCerrar={() => setAbierto(null)}
        titulo={c.nombre}
        detalle={c.empresa}
        pie={<><Boton onClick={() => setAbierto(null)}>Cerrar</Boton><Boton variante="principal" icono={Receipt}>Nueva factura</Boton></>}
      >
        <div className="demo-columna">
          <dl className="demo-pares">
            <div><dt>Estado</dt><dd><Etiqueta tono={ESTADOS[c.estado].tono} punto>{ESTADOS[c.estado].texto}</Etiqueta></dd></div>
            <div><dt>Facturado</dt><dd>{moneda(c.facturado)}</dd></div>
            <div><dt>Email</dt><dd>{c.email ?? 'Sin email'}</dd></div>
            <div><dt>Última visita</dt><dd>{c.ultima ? fechaCercana(c.ultima) : 'Sin visitas'}</dd></div>
          </dl>
          <Campo etiqueta="Notas" multilinea defaultValue="Prefiere que se le llame por la tarde." />
        </div>
      </Cajon>
    </div>
  );
}

export function DemoPaleta() {
  const [abierta, setAbierta] = useState(false);
  useAtajo('mod+k', () => setAbierta((a) => !a));
  const comandos = useMemo(() => [
    { id: 'nuevo-cliente', titulo: 'Nuevo cliente', grupo: 'Crear', icono: UserPlus, atajo: 'n', claves: 'alta añadir', alElegir: () => avisar('Nuevo cliente') },
    { id: 'nueva-factura', titulo: 'Nueva factura', grupo: 'Crear', icono: Receipt, claves: 'cobrar', alElegir: () => avisar('Nueva factura') },
    { id: 'clientes', titulo: 'Clientes', grupo: 'Ir a', icono: Users, alElegir: () => avisar('Ir a Clientes') },
    { id: 'cobros', titulo: 'Cobros', grupo: 'Ir a', icono: CreditCard, claves: 'pagos recibos', alElegir: () => avisar('Ir a Cobros') },
    { id: 'config', titulo: 'Configuración', grupo: 'Ir a', icono: Settings, claves: 'ajustes preferencias', alElegir: () => avisar('Ir a Configuración') },
    ...CLIENTES.slice(0, 6).map((c) => ({ id: c.id, titulo: c.nombre, grupo: 'Clientes', claves: c.empresa, alElegir: () => avisar(c.nombre) })),
  ], []);
  return (
    <div className="demo-fila">
      <Boton onClick={() => setAbierta(true)}>Buscar o ir a… <Teclas atajo="mod+k" /></Boton>
      <span className="demo-tenue">Prueba «ajustes» o «pagos»: encuentra por sinónimos, sin tildes y en cualquier orden.</span>
      <Paleta abierto={abierta} alCerrar={() => setAbierta(false)} comandos={comandos} />
    </div>
  );
}

export function DemoMenu() {
  const [orden, setOrden] = useState('reciente');
  return (
    <div className="demo-fila">
      <Menu
        etiqueta="Acciones de la factura"
        alinear="inicio"
        elementos={[
          { texto: 'Editar', icono: Pencil, atajo: 'e', alElegir: () => avisar('Editar') },
          { texto: 'Enviar por email', icono: Send, alElegir: () => avisar('Factura enviada', { tono: 'bien' }) },
          { texto: 'Descargar PDF', icono: Download, alElegir: () => avisar('PDF descargado') },
          { texto: 'Imprimir', icono: Printer, deshabilitado: true },
          { separador: true },
          { texto: 'Archivar', icono: Archive, alElegir: () => avisar('Factura archivada', { accion: { texto: 'Deshacer' } }) },
          { texto: 'Eliminar', icono: Trash2, peligro: true, alElegir: () => avisar('Factura eliminada') },
        ]}
      />
      <Menu
        variante="secundario"
        etiqueta="Ordenar por"
        alinear="inicio"
        icono={null}
        elementos={[
          { rotulo: 'Ordenar por' },
          { texto: 'Más recientes', marcado: orden === 'reciente', alElegir: () => setOrden('reciente') },
          { texto: 'Importe', marcado: orden === 'importe', alElegir: () => setOrden('importe') },
          { texto: 'Nombre', marcado: orden === 'nombre', alElegir: () => setOrden('nombre') },
        ]}
      >
        Ordenar
      </Menu>
    </div>
  );
}

export function DemoCombo() {
  const [cliente, setCliente] = useState('c04');
  const [varios, setVarios] = useState(['c01', 'c07']);
  const opciones = CLIENTES.map((c) => ({ valor: c.id, texto: c.nombre, detalle: c.empresa }));
  return (
    <div className="demo-dos" style={{ maxWidth: 640 }}>
      <Combo etiqueta="Cliente" opciones={opciones} valor={cliente} alCambiar={setCliente} ayuda="Escribe para buscar: «ortega», «dental»…" />
      <Combo etiqueta="Destinatarios" multiple opciones={opciones} valor={varios} alCambiar={setVarios} marcador="Elegir destinatarios" />
    </div>
  );
}

export function DemoPestanas() {
  const [activa, setActiva] = useState('datos');
  return (
    <Pestanas
      etiqueta="Ficha del cliente"
      activa={activa}
      alCambiar={setActiva}
      pestanas={[{ id: 'datos', texto: 'Datos', icono: Users }, { id: 'facturas', texto: 'Facturas', icono: Receipt, contador: 14 }, { id: 'cobros', texto: 'Cobros', icono: CreditCard, contador: 2 }, { id: 'notas', texto: 'Notas' }]}
    >
      {(id) => <p className="demo-tenue">Contenido de «{id}». Con el foco en una pestaña, las flechas cambian de una a otra.</p>}
    </Pestanas>
  );
}

export function DemoSegmentado() {
  const [periodo, setPeriodo] = useState('mes');
  const [vista, setVista] = useState('lista');
  return (
    <div className="demo-columna">
      <div className="demo-fila">
        <Segmentado etiqueta="Periodo" valor={periodo} alCambiar={setPeriodo} opciones={[{ valor: 'semana', texto: 'Semana' }, { valor: 'mes', texto: 'Mes' }, { valor: 'trimestre', texto: 'Trimestre' }, { valor: 'ano', texto: 'Año' }]} />
        <Segmentado etiqueta="Vista" valor={vista} alCambiar={setVista} opciones={[{ valor: 'lista', icono: List, etiqueta: 'Lista' }, { valor: 'tablero', icono: LayoutGrid, etiqueta: 'Tablero' }]} />
      </div>
      <Segmentado bloque tamano="chico" etiqueta="Tipo" valor={vista} alCambiar={setVista} opciones={[{ valor: 'lista', texto: 'Particular' }, { valor: 'tablero', texto: 'Empresa' }]} className="demo-estrecho" />
    </div>
  );
}

export function DemoInterruptor() {
  const [o, setO] = useState({ citas: true, impagos: true, resumen: false });
  const poner = (k) => (v) => { setO((x) => ({ ...x, [k]: v })); avisar(v ? 'Aviso activado' : 'Aviso desactivado'); };
  return (
    <ListaOpciones className="demo-ancho">
      <Interruptor etiqueta="Recordatorios de cita" detalle={o.citas ? '24 h antes, por email' : 'No se envían'} marcado={o.citas} alCambiar={poner('citas')} />
      <Interruptor etiqueta="Aviso de impago" detalle={o.impagos ? 'A los 3 días del vencimiento' : 'No se envía'} marcado={o.impagos} alCambiar={poner('impagos')} />
      <Interruptor etiqueta="Resumen semanal" detalle={o.resumen ? 'Los lunes a las 8:00' : 'No se envía'} marcado={o.resumen} alCambiar={poner('resumen')} />
      <Interruptor etiqueta="Firma electrónica" detalle="No incluida en este plan" marcado={false} alCambiar={() => {}} deshabilitado />
    </ListaOpciones>
  );
}

export function DemoPista() {
  return (
    <div className="demo-columna">
      <div className="demo-fila" style={{ gap: 2 }}>
        <Pista texto="Negrita" atajo="mod+b"><Boton variante="discreto" icono={Bold} aria-label="Negrita" /></Pista>
        <Pista texto="Cursiva" atajo="mod+i"><Boton variante="discreto" icono={Italic} aria-label="Cursiva" /></Pista>
        <Pista texto="Enlace" atajo="mod+k"><Boton variante="discreto" icono={Link} aria-label="Enlace" /></Pista>
        <Pista texto="Enviar por email" lado="abajo"><Boton variante="discreto" icono={Mail} aria-label="Enviar por email" /></Pista>
        <Pista texto="Llamar" lado="abajo"><Boton variante="discreto" icono={Phone} aria-label="Llamar" /></Pista>
      </div>
      <p className="demo-tenue">La primera tarda en salir. Recorre el resto sin parar: salen al instante.</p>
    </div>
  );
}

const COLUMNAS = [
  { clave: 'nombre', titulo: 'Cliente', ordenable: true, pintar: (c) => <span className="demo-celda-persona"><Avatar nombre={c.nombre} lado={28} /><strong title={c.nombre}>{c.nombre}</strong></span> },
  { clave: 'empresa', titulo: 'Empresa', ordenable: true },
  { clave: 'estado', titulo: 'Estado', ordenable: true, pintar: (c) => <Etiqueta tono={ESTADOS[c.estado].tono} punto>{ESTADOS[c.estado].texto}</Etiqueta> },
  { clave: 'ultima', titulo: 'Última visita', ordenable: true, pintar: (c) => c.ultima && fechaCercana(c.ultima) },
  { clave: 'facturado', titulo: 'Facturado', ordenable: true, alinear: 'derecha', pintar: (c) => moneda(c.facturado) },
];

export function DemoTabla() {
  const [estado, setEstado] = useState('listo');
  const [abierto, setAbierto] = useState(null);
  const filas = estado === 'vacio' ? [] : CLIENTES.slice(0, 8);
  return (
    <div className="demo-columna">
      <Segmentado tamano="chico" etiqueta="Estado de la tabla" valor={estado} alCambiar={setEstado} opciones={[{ valor: 'listo', texto: 'Con datos' }, { valor: 'cargando', texto: 'Cargando' }, { valor: 'vacio', texto: 'Vacía' }, { valor: 'error', texto: 'Error' }]} />
      <Tabla
        titulo="Clientes"
        columnas={COLUMNAS}
        filas={filas}
        estado={estado === 'vacio' ? 'listo' : estado}
        seleccionable
        alAbrir={(c) => setAbierto(c.nombre)}
        vacio={<Vacio titulo="Aún no hay clientes" detalle="Aquí aparecen al darlos de alta o al importarlos desde Excel" accion="Añadir cliente" alPulsar={() => setEstado('listo')} />}
        error={<ErrorCarga alReintentar={async () => { await esperar(900); setEstado('listo'); }} />}
        acciones={(ids, limpiar) => (
          <>
            <Boton tamano="chico" icono={Mail} onClick={() => { avisar(`Email a ${plural(ids.length, 'cliente', 'clientes')}`); limpiar(); }}>Enviar email</Boton>
            <Boton tamano="chico" icono={Archive} onClick={() => { avisar(`${plural(ids.length, 'cliente archivado', 'clientes archivados')}`, { accion: { texto: 'Deshacer' } }); limpiar(); }}>Archivar</Boton>
          </>
        )}
        menuFila={(c) => (
          <Menu tamano="chico" etiqueta={`Acciones de ${c.nombre}`} elementos={[{ texto: 'Editar', icono: Pencil }, { texto: 'Nueva factura', icono: Receipt }, { separador: true }, { texto: 'Eliminar', icono: Trash2, peligro: true }]} />
        )}
      />
      <p className="demo-tenue">{abierto ? `Abierto: ${abierto}. ` : ''}La quinta fila lleva un nombre larguísimo y un importe de siete cifras; la sexta no tiene email; la octava, ni visitas.</p>
    </div>
  );
}

const FILTROS = [
  { clave: 'estado', texto: 'Estado', opciones: [{ valor: 'activo', texto: 'Activo' }, { valor: 'pendiente', texto: 'Pendiente' }, { valor: 'baja', texto: 'Baja' }] },
  { clave: 'importe', texto: 'Facturado', opciones: [{ valor: 'menos', texto: 'Menos de 5.000 €' }, { valor: 'mas', texto: '5.000 € o más' }] },
  { clave: 'email', texto: 'Email', opciones: [{ valor: 'con', texto: 'Con email' }, { valor: 'sin', texto: 'Sin email' }] },
];
export function DemoFiltros() {
  const [valor, setValor] = useState({ estado: 'activo' });
  const filas = CLIENTES.filter((c) => (
    (!valor.estado || c.estado === valor.estado)
    && (!valor.importe || (valor.importe === 'mas') === (c.facturado >= 5000))
    && (!valor.email || (valor.email === 'con') === Boolean(c.email))
  ));
  return (
    <div className="demo-columna">
      <Filtros filtros={FILTROS} valor={valor} alCambiar={setValor} />
      <div className="demo-caja demo-lista" style={{ minHeight: 120 }}>
        {filas.length === 0 && <SinResultados que="cliente" compacto alQuitar={() => setValor({})} />}
        {filas.slice(0, 5).map((c) => <div key={c.id} className="demo-fila-tabla"><span>{c.nombre}</span><Etiqueta tono={ESTADOS[c.estado].tono} punto>{ESTADOS[c.estado].texto}</Etiqueta><span>{moneda(c.facturado)}</span></div>)}
        {filas.length > 5 && <p className="demo-tenue" style={{ padding: '8px 12px' }}>y {filas.length - 5} más</p>}
      </div>
    </div>
  );
}

export function DemoPaginacion() {
  const [pagina, setPagina] = useState(6);
  const [porPagina, setPorPagina] = useState(25);
  return <Paginacion pagina={pagina} porPagina={porPagina} total={1284} alCambiar={setPagina} alCambiarTamano={(t) => { setPorPagina(t); setPagina(1); }} />;
}

export function DemoSubirArchivos() {
  const [fallar, setFallar] = useState(false);
  const subir = async (archivo, alProgreso, { signal }) => {
    for (let p = 0; p <= 1; p += 0.04 + Math.random() * 0.1) {
      await esperar(120, signal);
      alProgreso(Math.min(1, p));
      if (fallar && p > 0.6) throw new Error('Se ha cortado la conexión');
    }
  };
  return (
    <div className="demo-columna" style={{ maxWidth: 520 }}>
      <Interruptor etiqueta="Simular un corte a mitad de subida" marcado={fallar} alCambiar={setFallar} />
      <SubirArchivos subir={subir} aceptar=".pdf,image/*" textoTipos="PDF o imagen" maximo={5 * 1024 * 1024} alTerminar={(a) => avisar('Archivo subido', { tono: 'bien', detalle: a.name })} />
    </div>
  );
}

export function DemoSelectorFecha() {
  const hoy = hoyTexto();
  const [fecha, setFecha] = useState(sumarDias(hoy, 3));
  const [cita, setCita] = useState(null);
  return (
    <div className="demo-dos" style={{ maxWidth: 640, alignItems: 'start' }}>
      <div className="demo-columna">
        <SelectorFecha etiqueta="Vencimiento" valor={fecha} alCambiar={setFecha} />
        <SelectorFecha etiqueta="Próxima cita" valor={cita} alCambiar={setCita} min={hoy} deshabilitado={(d) => new Date(`${d}T00:00:00Z`).getUTCDay() === 0} ayuda="Desde hoy; los domingos no hay citas" />
      </div>
      <div className="k-tarjeta" style={{ padding: 12, justifySelf: 'start' }}>
        <Calendario valor={fecha} alCambiar={setFecha} />
      </div>
    </div>
  );
}

const COLUMNAS_TABLERO = [{ id: 'nuevo', titulo: 'Nuevo' }, { id: 'presupuesto', titulo: 'Presupuesto enviado' }, { id: 'ganado', titulo: 'Ganado' }];
export function DemoTablero() {
  const [tarjetas, setTarjetas] = useState(TARJETAS);
  return (
    <div className="demo-columna">
      <Tablero
        columnas={COLUMNAS_TABLERO}
        tarjetas={tarjetas}
        alMover={(id, columna, indice) => setTarjetas((t) => moverTarjeta(t, id, columna, indice))}
        pie={(col, propias) => moneda(propias.reduce((s, t) => s + t.importe, 0), { decimales: 0 })}
      >
        {(t) => (
          <div className="demo-oportunidad">
            <strong>{t.titulo}</strong>
            <span>{t.cliente}</span>
            <span className="demo-importe">{moneda(t.importe, { decimales: 0 })}</span>
          </div>
        )}
      </Tablero>
      <p className="demo-tenue">Con teclado: foco en una tarjeta y <Teclas atajo="alt+arrowup" /> <Teclas atajo="alt+arrowdown" /> o Alt con ← →.</p>
    </div>
  );
}

export function DemoEdicionEnLinea() {
  const [d, setD] = useState({ nombre: 'Marta Ruiz Gil', telefono: '', email: 'marta@talleresruiz.es' });
  const guardar = (campo) => async (nuevo) => {
    await esperar(700);
    if (nuevo.toLowerCase().includes('error')) throw new Error('El servidor no ha guardado el cambio');
    setD((x) => ({ ...x, [campo]: nuevo }));
  };
  return (
    <div className="demo-columna">
      <dl className="demo-pares demo-pares--edicion">
        <div><dt>Nombre</dt><dd><EdicionEnLinea etiqueta="Nombre" valor={d.nombre} alGuardar={guardar('nombre')} validar={(v) => (v ? null : 'Escribe el nombre del cliente')} /></dd></div>
        <div><dt>Teléfono</dt><dd><EdicionEnLinea etiqueta="Teléfono" type="tel" valor={d.telefono} vacio="Sin teléfono" alGuardar={guardar('telefono')} /></dd></div>
        <div><dt>Email</dt><dd><EdicionEnLinea etiqueta="Email" type="email" valor={d.email} alGuardar={guardar('email')} validar={(v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Falta la arroba o el dominio')} /></dd></div>
      </dl>
      <p className="demo-tenue">Intro guarda, Escape cancela. Escribe «error» para ver qué pasa cuando el servidor falla.</p>
    </div>
  );
}

export function DemoCampoEtiquetas() {
  const [etiquetas, setEtiquetas] = useState(['Mayorista', 'Paga a 30 días']);
  const [correos, setCorreos] = useState(['marta@talleresruiz.es']);
  return (
    <div className="demo-columna" style={{ maxWidth: 520 }}>
      <CampoEtiquetas etiqueta="Etiquetas" valor={etiquetas} alCambiar={setEtiquetas} sugerencias={['Mayorista', 'Minorista', 'Preferente', 'Moroso', 'Paga a 30 días']} ayuda="Intro o coma para añadir" maximo={5} />
      <CampoEtiquetas etiqueta="Enviar copia a" valor={correos} alCambiar={setCorreos} marcador="email@empresa.es" validar={(v) => (/^\S+@\S+\.\S+$/.test(v) ? null : `«${v}» no es un email: falta la arroba o el dominio`)} ayuda="Se puede pegar una lista separada por comas" />
    </div>
  );
}

export function DemoPasos() {
  const [d, setD] = useState({ nombre: '', nif: '', email: '', plan: 'mensual' });
  const [errores, setErrores] = useState({});
  const [hecho, setHecho] = useState(false);
  const campo = (k) => ({ value: d[k], error: errores[k], onChange: (e) => { setD((x) => ({ ...x, [k]: e.target.value })); setErrores((x) => ({ ...x, [k]: null })); } });
  const exigir = (reglas) => () => {
    const fallos = Object.fromEntries(Object.entries(reglas).filter(([k, regla]) => !regla.test(d[k])).map(([k, regla]) => [k, regla.mensaje]));
    setErrores(fallos);
    return Object.keys(fallos).length === 0;
  };
  const regla = (patron, mensaje) => ({ test: (v) => patron.test(v), mensaje });

  if (hecho) return <div className="demo-columna"><p><strong>{d.nombre}</strong> ya es cliente.</p><Boton onClick={() => { setHecho(false); setD({ nombre: '', nif: '', email: '', plan: 'mensual' }); }} style={{ justifySelf: 'start' }}>Dar de alta a otro</Boton></div>;

  return (
    <Pasos
      className="demo-ancho"
      textoFinal="Crear cliente"
      alTerminar={async () => { await esperar(1000); avisar('Cliente creado', { tono: 'bien' }); setHecho(true); }}
      pasos={[
        { id: 'datos', titulo: 'Datos', validar: exigir({ nombre: regla(/\S/, 'Escribe el nombre o la razón social'), nif: regla(/^[A-Za-z0-9]{9}$/, 'El NIF tiene 9 caracteres') }), contenido: (
          <div className="demo-columna"><Campo etiqueta="Nombre o razón social" autoComplete="organization" {...campo('nombre')} /><Campo etiqueta="NIF" ayuda="9 caracteres, sin espacios ni guiones" {...campo('nif')} /></div>
        ) },
        { id: 'contacto', titulo: 'Contacto', validar: exigir({ email: regla(/^\S+@\S+\.\S+$/, 'Escribe un email con arroba y dominio') }), contenido: (
          <div className="demo-columna"><Campo etiqueta="Email de facturación" type="email" autoComplete="email" {...campo('email')} /></div>
        ) },
        { id: 'plan', titulo: 'Plan', contenido: (
          <div className="demo-columna">
            <Segmentado bloque etiqueta="Plan" valor={d.plan} alCambiar={(plan) => setD((x) => ({ ...x, plan }))} opciones={[{ valor: 'mensual', texto: 'Mensual · 49 €' }, { valor: 'anual', texto: 'Anual · 490 €' }]} />
            <p className="demo-tenue">{d.nombre} · {d.nif.toUpperCase()} · {d.email}</p>
          </div>
        ) },
      ]}
    />
  );
}
