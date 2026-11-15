import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Anillo, Arbol, Banner, BarraAcciones, BarraCristal, BarraLateral, CabeceraPagina, CampoClave, CampoNumero, CampoSecreto,
  CentroNotificaciones, CodigoVerificacion, Deslizador, EstadoVacio, GraficoArea, GraficoBarras, GrupoAvatares,
  GuiaInicio, LineaTiempo, ListaClasificada, ListaDescriptiva, MapaCalor, MatrizPermisos, MedidorUso, Migas,
  Minigrafico, PanelesDivididos, SelectorEspacio, TablaPrecios, TarjetaMetrica, TarjetasOpcion, ZonaPeligro,
  fuerzaClave, moneda,
} from '../src/componentes/index.js';
import { marcasEje, saltoEtiquetas, trazoSuave } from '../src/componentes/graficos.js';

const tecla = (el, key, extra) => fireEvent.keyDown(el, { key, ...extra });

describe('utilidades de gráficos', () => {
  it('da marcas redondas que cubren el máximo', () => {
    expect(marcasEje(8340)).toEqual([0, 2500, 5000, 7500, 10000]);
    expect(marcasEje(97)).toEqual([0, 25, 50, 75, 100]);
    expect(marcasEje(0.9)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(marcasEje(0)).toEqual([0, 1]);
  });
  it('traza una curva que pasa por todos los puntos', () => {
    const d = trazoSuave([[0, 10], [10, 0], [20, 10]]);
    expect(d.startsWith('M0,10C')).toBe(true);
    expect(d.endsWith('20,10')).toBe(true);
    expect(trazoSuave([])).toBe('');
    expect(trazoSuave([[5, 5]])).toBe('M5,5');
  });
  it('no inventa picos: con datos planos la curva es plana', () => {
    const alturas = trazoSuave([[0, 5], [10, 5], [20, 5]]).split(/[MC ]/).filter(Boolean).map((par) => par.split(',')[1]);
    expect(new Set(alturas)).toEqual(new Set(['5']));
    // Entre un valle y una subida la curva no baja del valle
    const ys = trazoSuave([[0, 0], [10, 0], [20, 50]]).split(/[MC ]/).filter(Boolean).map((par) => Number(par.split(',')[1]));
    expect(Math.min(...ys)).toBe(0);
  });
  it('espacia las etiquetas del eje según el ancho', () => {
    expect(saltoEtiquetas(30, 600, 60)).toBe(3);
    expect(saltoEtiquetas(5, 600, 60)).toBe(1);
  });
});

describe('01 BarraLateral', () => {
  const grupos = [{ titulo: 'Gestión', elementos: [{ id: 'a', texto: 'Clientes' }, { id: 'b', texto: 'Facturas', contador: 120 }] }];
  it('marca el apartado abierto y avisa al elegir otro', () => {
    const alElegir = vi.fn();
    render(<BarraLateral grupos={grupos} activo="a" alElegir={alElegir} />);
    expect(screen.getByRole('button', { name: 'Clientes' }).getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: /Facturas/ }));
    expect(alElegir).toHaveBeenCalledWith('b', expect.objectContaining({ texto: 'Facturas' }));
    expect(screen.getByText('99+')).toBeTruthy();
  });
  it('se pliega, lo dice y avisa para guardar la preferencia', () => {
    const alPlegar = vi.fn();
    const { container } = render(<BarraLateral grupos={grupos} activo="a" alPlegar={alPlegar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plegar menú' }));
    expect(alPlegar).toHaveBeenCalledWith(true);
    expect(container.querySelector('.c-lateral').hasAttribute('data-plegada')).toBe(true);
    expect(screen.getByRole('button', { name: 'Desplegar menú' }).getAttribute('aria-expanded')).toBe('false');
    // Plegada, el nombre sale como pista al pasar el ratón
    expect(screen.getByRole('button', { name: 'Clientes' }).getAttribute('title')).toBe('Clientes');
  });
});

describe('02 CabeceraPagina y Migas', () => {
  const ruta = ['Inicio', 'Facturación', 'Facturas', '2026', 'Noviembre', 'F-0142'].map((texto) => ({ texto }));
  it('pliega las migas del medio y las enseña al pulsar los puntos', () => {
    render(<Migas elementos={ruta} maximo={4} />);
    expect(screen.queryByText('Facturación')).toBeNull();
    expect(screen.getByText('F-0142').getAttribute('aria-current')).toBe('page');
    fireEvent.click(screen.getByRole('button', { name: 'Ver la ruta completa' }));
    expect(screen.getByText('Facturación')).toBeTruthy();
  });
  it('pinta título, recuento y acciones', () => {
    render(<CabeceraPagina titulo="Clientes" recuento={128} acciones={<button type="button">Nuevo cliente</button>} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Clientes' })).toBeTruthy();
    expect(screen.getByText('128')).toBeTruthy();
  });
});

describe('03 SelectorEspacio', () => {
  const espacios = ['Clínica Norte', 'Clínica Sur', 'Óptica Faro', 'Río Fisio', 'Sierra Salud', 'Costa Dental', 'Laboratorio'].map((nombre, i) => ({ id: `e${i}`, nombre }));
  it('cambia de espacio y cierra', () => {
    const alCambiar = vi.fn();
    render(<SelectorEspacio espacios={espacios} valor="e0" alCambiar={alCambiar} />);
    fireEvent.click(screen.getByRole('button', { name: /Cambiar de espacio: Clínica Norte/ }));
    fireEvent.click(screen.getByRole('option', { name: /Clínica Sur/ }));
    expect(alCambiar).toHaveBeenCalledWith('e1', expect.objectContaining({ nombre: 'Clínica Sur' }));
    expect(screen.queryByRole('listbox')).toBeNull();
  });
  it('busca sin tildes y cierra con Escape', () => {
    render(<SelectorEspacio espacios={espacios} valor="e0" />);
    fireEvent.click(screen.getByRole('button', { name: /Cambiar de espacio/ }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'optica' } });
    expect(screen.getAllByRole('option')).toHaveLength(1);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.getByText('Ningún espacio coincide')).toBeTruthy();
    tecla(document, 'Escape');
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});

describe('04 BarraAcciones', () => {
  it('solo existe con algo marcado y concuerda el número', () => {
    const archivar = vi.fn();
    const acciones = [{ texto: 'Archivar', alPulsar: archivar }];
    const { rerender } = render(<BarraAcciones cantidad={0} acciones={acciones} />);
    expect(screen.queryByRole('toolbar')).toBeNull();
    rerender(<BarraAcciones cantidad={1} acciones={acciones} />);
    expect(screen.getByRole('status').textContent).toBe('1 seleccionado');
    rerender(<BarraAcciones cantidad={3} acciones={acciones} />);
    expect(screen.getByRole('status').textContent).toBe('3 seleccionados');
    fireEvent.click(screen.getByRole('button', { name: 'Archivar' }));
    expect(archivar).toHaveBeenCalled();
    rerender(<BarraAcciones cantidad={0} acciones={acciones} />);
    expect(screen.queryByRole('toolbar')).toBeNull();
  });
});

describe('05 PanelesDivididos', () => {
  it('la raya se mueve con el teclado y respeta los topes', () => {
    const alCambiar = vi.fn();
    render(<PanelesDivididos primero="A" segundo="B" tamanoInicial={50} minimo={30} maximo={60} alCambiar={alCambiar} />);
    const raya = screen.getByRole('separator');
    tecla(raya, 'ArrowRight');
    expect(raya.getAttribute('aria-valuenow')).toBe('52');
    tecla(raya, 'ArrowRight', { shiftKey: true });
    expect(raya.getAttribute('aria-valuenow')).toBe('60');
    tecla(raya, 'Home');
    expect(raya.getAttribute('aria-valuenow')).toBe('30');
    fireEvent.doubleClick(raya);
    expect(alCambiar).toHaveBeenLastCalledWith(50);
  });
});

describe('06 Arbol', () => {
  const nodos = [{ id: 'a', texto: 'Clientes', hijos: [{ id: 'a1', texto: 'Activos' }, { id: 'a2', texto: 'De baja' }] }, { id: 'b', texto: 'Plantillas' }];
  it('se recorre y se abre con las flechas', () => {
    const alElegir = vi.fn();
    render(<Arbol nodos={nodos} etiqueta="Carpetas" alElegir={alElegir} />);
    const arbol = screen.getByRole('tree');
    const clientes = screen.getByRole('treeitem', { name: /Clientes/ });
    expect(clientes.getAttribute('aria-expanded')).toBe('false');
    clientes.focus();
    tecla(arbol, 'ArrowRight');
    expect(clientes.getAttribute('aria-expanded')).toBe('true');
    tecla(arbol, 'ArrowRight');
    expect(document.activeElement.textContent).toBe('Activos');
    tecla(arbol, 'ArrowDown');
    tecla(arbol, 'Enter');
    expect(alElegir).toHaveBeenCalledWith('a2', expect.anything());
    tecla(arbol, 'ArrowLeft');
    expect(document.activeElement).toBe(clientes);
    tecla(arbol, 'ArrowLeft');
    expect(clientes.getAttribute('aria-expanded')).toBe('false');
  });
  it('solo una fila entra en el orden del tabulador', () => {
    render(<Arbol nodos={nodos} abiertosIniciales={['a']} seleccionadoInicial="a2" />);
    const conTab = screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
    expect(conTab).toHaveLength(1);
    expect(conTab[0].getAttribute('aria-selected')).toBe('true');
  });
});

describe('07 TarjetaMetrica y 08 Minigrafico', () => {
  it('pinta la cifra con su formato y la variación con su signo', () => {
    const { container } = render(<TarjetaMetrica titulo="Ingresos" valor={42800} formato={(n) => moneda(n, { decimales: 0 })} variacion={0.124} periodo="frente a octubre" serie={[1, 2, 3]} />);
    expect(screen.getAllByText(/42\.800\s€/).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+12,4\s%/)).toBeTruthy();
    expect(container.firstChild.getAttribute('data-tono')).toBe('bien');
    expect(screen.getByRole('img', { name: 'Evolución de Ingresos' })).toBeTruthy();
  });
  it('cuando bajar es bueno, una subida es mala', () => {
    const { container } = render(<TarjetaMetrica titulo="Bajas" valor={12} variacion={0.3} invertida />);
    expect(container.firstChild.getAttribute('data-tono')).toBe('mal');
  });
  it('mientras carga no enseña cifras', () => {
    const { container } = render(<TarjetaMetrica titulo="Ingresos" valor={10} variacion={0.1} cargando />);
    expect(container.querySelector('.c-metrica__hueco')).toBeTruthy();
    expect(screen.queryByText(/%/)).toBeNull();
  });
  it('el minigráfico se describe solo', () => {
    render(<Minigrafico datos={[120, 90, 180]} />);
    expect(screen.getByRole('img', { name: 'De 120 a 180' })).toBeTruthy();
  });
});

describe('09 GraficoBarras y 10 GraficoArea', () => {
  const datos = [{ etiqueta: 'Ene', a: 10, b: 5 }, { etiqueta: 'Feb', a: 20, b: 8 }, { etiqueta: 'Mar', a: 30, b: 2 }];
  const series = [{ clave: 'a', nombre: 'Altas' }, { clave: 'b', nombre: 'Bajas' }];
  it.each([['barras', GraficoBarras], ['área', GraficoArea]])('%s: los datos están en una tabla y se recorren con las flechas', (_, Grafico) => {
    render(<Grafico titulo="Movimientos" datos={datos} series={series} />);
    const tabla = screen.getByRole('table', { name: 'Movimientos' });
    expect(within(tabla).getAllByRole('row')).toHaveLength(4);
    const zona = screen.getByRole('group', { name: /Movimientos/ });
    tecla(zona, 'ArrowRight');
    expect(screen.getByRole('status').textContent).toBe('Ene: Altas 10, Bajas 5');
    tecla(zona, 'End');
    expect(screen.getByRole('status').textContent).toBe('Mar: Altas 30, Bajas 2');
    tecla(zona, 'ArrowRight');
    expect(screen.getByRole('status').textContent).toMatch(/^Mar/);
    tecla(zona, 'Escape');
    expect(screen.getByRole('status').textContent).toBe('');
  });
  it('barras: el globo suma las series', () => {
    const { container } = render(<GraficoBarras datos={datos} series={series} />);
    fireEvent.pointerEnter(container.querySelectorAll('.c-barras__columna')[1]);
    expect(container.querySelector('.c-globo__total').textContent).toBe('Total28');
  });
});

describe('11 Anillo y 12 MedidorUso', () => {
  it('reparte el total y enseña la parte señalada', () => {
    const { container } = render(<Anillo datos={[{ nombre: 'A', valor: 75 }, { nombre: 'B', valor: 25 }]} titulo="Ingresos" />);
    expect(container.querySelector('.c-anillo__cifra').textContent).toBe('100');
    const filas = screen.getAllByRole('listitem');
    expect(filas[0].textContent).toMatch(/A75\s?75\s%/);
    fireEvent.focus(filas[1]);
    expect([...container.querySelectorAll('.c-anillo__rotulo')].map((r) => r.textContent).join(' ')).toMatch(/B 25\s%/);
  });
  it('avisa al acercarse al límite y al alcanzarlo', () => {
    const { rerender, container } = render(<MedidorUso titulo="Usuarios" usado={5} limite={10} />);
    expect(container.firstChild.getAttribute('data-estado')).toBe('normal');
    expect(screen.getByRole('meter', { name: 'Usuarios' }).getAttribute('aria-valuetext')).toBe('5 de 10');
    rerender(<MedidorUso titulo="Usuarios" usado={9} limite={10} />);
    expect(screen.getByText(/Queda el 10\s%/)).toBeTruthy();
    rerender(<MedidorUso titulo="Usuarios" usado={12} limite={10} />);
    expect(screen.getByText('Límite alcanzado')).toBeTruthy();
  });
});

describe('13 MapaCalor', () => {
  const hasta = new Date(2026, 10, 15, 12); // domingo 15 nov 2026
  it('pinta una celda por día hasta la fecha y lee cada una', () => {
    const alElegir = vi.fn();
    render(<MapaCalor datos={{ '2026-11-13': 4, '2026-11-12': 1 }} semanas={4} hasta={hasta} unidad={['cita', 'citas']} alElegir={alElegir} />);
    expect(screen.getAllByRole('gridcell')).toHaveLength(28);
    const viernes = screen.getByRole('gridcell', { name: '4 citas · viernes 13 nov' });
    expect(viernes.getAttribute('data-nivel')).toBe('4');
    expect(screen.getByRole('gridcell', { name: '1 cita · jueves 12 nov' }).getAttribute('data-nivel')).toBe('1');
    fireEvent.click(viernes);
    expect(alElegir).toHaveBeenCalledWith('2026-11-13', 4);
    expect(screen.getByText('5', { selector: 'b' })).toBeTruthy();
  });
  it('se recorre con las flechas: un día arriba y abajo, una semana a los lados', () => {
    render(<MapaCalor datos={{}} semanas={4} hasta={hasta} />);
    const viernes = screen.getByRole('gridcell', { name: /viernes 13 nov/ });
    viernes.focus();
    tecla(viernes, 'ArrowUp');
    expect(document.activeElement.getAttribute('aria-label')).toMatch(/jueves 12 nov/);
    tecla(document.activeElement, 'ArrowLeft');
    expect(document.activeElement.getAttribute('aria-label')).toMatch(/jueves 5 nov/);
  });
  it('no pinta días que aún no han llegado', () => {
    render(<MapaCalor datos={{}} semanas={2} hasta={new Date(2026, 10, 11, 12)} />); // miércoles
    expect(screen.getAllByRole('gridcell').filter((c) => c.tagName === 'BUTTON')).toHaveLength(10);
  });
});

describe('14 ListaClasificada y 15 LineaTiempo', () => {
  it('ordena de mayor a menor y guarda el resto detrás de «Ver los N»', () => {
    const datos = [{ nombre: 'C', valor: 1 }, { nombre: 'A', valor: 30 }, { nombre: 'B', valor: 20 }];
    const { container } = render(<ListaClasificada datos={datos} maximo={2} />);
    expect([...container.querySelectorAll('.c-clasificada__nombre')].map((n) => n.textContent)).toEqual(['A', 'B', 'C']);
    const mas = screen.getByRole('button', { name: 'Ver los 3' });
    expect(container.querySelector('.c-clasificada__resto ol').hasAttribute('inert')).toBe(true);
    fireEvent.click(mas);
    expect(container.querySelector('.c-clasificada__resto ol').hasAttribute('inert')).toBe(false);
    expect(screen.getByRole('button', { name: 'Ver menos' })).toBeTruthy();
  });
  it('agrupa los eventos por día', () => {
    const ahora = new Date(2026, 10, 15, 18);
    const eventos = [
      { id: 3, titulo: 'Cobro registrado', fecha: new Date(2026, 10, 15, 14, 30) },
      { id: 2, titulo: 'Factura enviada', fecha: new Date(2026, 10, 15, 9, 5) },
      { id: 1, autor: 'Marta Ruiz', titulo: 'dio de alta al cliente', fecha: new Date(2026, 10, 14, 11) },
    ];
    render(<LineaTiempo eventos={eventos} ahora={ahora} />);
    expect(screen.getAllByRole('heading').map((h) => h.textContent)).toEqual(['Hoy', 'Ayer']);
    expect(screen.getByText('14:30')).toBeTruthy();
    expect(screen.getByText('Marta Ruiz')).toBeTruthy();
  });
});

describe('16 a 19 · contenido', () => {
  it('ListaDescriptiva copia el dato y pinta una raya donde falta', async () => {
    const writeText = vi.fn().mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<ListaDescriptiva elementos={[{ termino: 'IBAN', valor: 'ES91 2100', copiar: 'ES912100' }, { termino: 'Pedido', valor: null }]} />);
    expect(screen.getByText('—')).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Copiar IBAN' })); });
    expect(writeText).toHaveBeenCalledWith('ES912100');
    expect(screen.getByRole('status').textContent).toBe('Copiado');
  });
  it('EstadoVacio da el motivo y la salida', () => {
    render(<EstadoVacio titulo="Aún no hay clientes" accion={<button type="button">Añadir cliente</button>} />);
    expect(screen.getByRole('heading', { name: 'Aún no hay clientes' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Añadir cliente' })).toBeTruthy();
  });
  it('GrupoAvatares resume los que no caben', () => {
    const personas = ['Ana Gil', 'Luis Mena', 'Eva Cano', 'Raúl Soto', 'Inés Vidal'].map((nombre) => ({ nombre }));
    render(<GrupoAvatares personas={personas} maximo={3} />);
    expect(screen.getByRole('group', { name: '5 personas' })).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
    expect(screen.getByText('y 2 más: Raúl Soto, Inés Vidal')).toBeTruthy();
  });
  it('Banner: los errores interrumpen, el resto no, y se cierra', () => {
    const alCerrar = vi.fn();
    const { rerender } = render(<Banner tono="mal" titulo="El último pago ha fallado" />);
    expect(screen.getByRole('alert')).toBeTruthy();
    rerender(<Banner tono="info" titulo="La prueba termina en 5 días" alCerrar={alCerrar} />);
    expect(screen.getByRole('status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(alCerrar).toHaveBeenCalled();
    expect(screen.queryByText('La prueba termina en 5 días')).toBeNull();
  });
});

describe('20 CodigoVerificacion', () => {
  it('limpia lo pegado y avisa al completar', () => {
    const alCompletar = vi.fn();
    const alCambiar = vi.fn();
    render(<CodigoVerificacion alCompletar={alCompletar} alCambiar={alCambiar} />);
    const campo = screen.getByRole('textbox', { name: 'Código de verificación' });
    expect(campo.getAttribute('autocomplete')).toBe('one-time-code');
    fireEvent.change(campo, { target: { value: '48 29-13 77' } });
    expect(alCambiar).toHaveBeenLastCalledWith('482913');
    expect(alCompletar).toHaveBeenCalledWith('482913');
    expect(campo.value).toBe('482913');
  });
  it('enseña el error junto al campo', () => {
    render(<CodigoVerificacion valor="111111" error="El código no coincide" />);
    expect(screen.getByRole('alert').textContent).toBe('El código no coincide');
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
  });
  it('en alfanumérico pasa a mayúsculas', () => {
    render(<CodigoVerificacion tipo="alfanumerico" largo={4} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a-b1c9' } });
    expect(screen.getByRole('textbox').value).toBe('AB1C');
  });
});

describe('21 CampoClave', () => {
  it('mide la fuerza regla a regla', () => {
    expect(fuerzaClave('abc').nivel).toBe(0);
    expect(fuerzaClave('abcdefgh').cumplidas).toEqual(['largo']);
    expect(fuerzaClave('Abcdefg1!').valida).toBe(true);
  });
  it('dice qué falta mientras se escribe y deja ver la contraseña', () => {
    render(<CampoClave />);
    const campo = screen.getByLabelText('Contraseña');
    fireEvent.change(campo, { target: { value: 'Abcdefgh' } });
    expect(screen.getByText('8 caracteres o más').closest('li').hasAttribute('data-cumple')).toBe(true);
    expect(screen.getByText('Un número').closest('li').hasAttribute('data-cumple')).toBe(false);
    expect(screen.getByText('Aceptable')).toBeTruthy();
    expect(campo.type).toBe('password');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(campo.type).toBe('text');
  });
  it('sin reglas es un campo de contraseña a secas', () => {
    const { container } = render(<CampoClave reglas={false} />);
    expect(container.querySelector('.c-clave__fuerza')).toBeNull();
  });
});

describe('22 Deslizador', () => {
  it('se mueve con el teclado dentro de sus topes', () => {
    const alCambiar = vi.fn();
    render(<Deslizador etiqueta="Usuarios" valorInicial={50} min={0} max={100} paso={5} alCambiar={alCambiar} />);
    const mando = screen.getByRole('slider', { name: 'Usuarios' });
    tecla(mando, 'ArrowRight');
    expect(mando.getAttribute('aria-valuenow')).toBe('55');
    tecla(mando, 'PageUp');
    expect(mando.getAttribute('aria-valuenow')).toBe('65');
    tecla(mando, 'End');
    tecla(mando, 'ArrowRight');
    expect(mando.getAttribute('aria-valuenow')).toBe('100');
    expect(alCambiar).toHaveBeenLastCalledWith(100);
  });
  it('en un tramo, un mando no pasa por encima del otro', () => {
    function Tramo() {
      const [v, setV] = useState([20, 30]);
      return <Deslizador etiqueta="Importe" valor={v} alCambiar={setV} paso={10} formato={(n) => `${n} €`} />;
    }
    render(<Tramo />);
    const [desde, hasta] = screen.getAllByRole('slider');
    expect(desde.getAttribute('aria-label')).toBe('Importe: Desde');
    tecla(desde, 'ArrowRight');
    tecla(desde, 'ArrowRight');
    expect(desde.getAttribute('aria-valuenow')).toBe('30');
    expect(hasta.getAttribute('aria-valuenow')).toBe('30');
    expect(hasta.getAttribute('aria-valuetext')).toBe('30 €');
  });
  it('respeta los decimales del paso', () => {
    render(<Deslizador etiqueta="Margen" valorInicial={0.1} min={0} max={1} paso={0.1} />);
    const mando = screen.getByRole('slider');
    tecla(mando, 'ArrowRight');
    tecla(mando, 'ArrowRight');
    expect(mando.getAttribute('aria-valuenow')).toBe('0.3');
  });
});

describe('23 CampoNumero', () => {
  it('suma y resta con las flechas sin salirse de los topes', () => {
    const alCambiar = vi.fn();
    render(<CampoNumero etiqueta="Licencias" valorInicial={9} min={1} max={10} alCambiar={alCambiar} sufijo="usuarios" />);
    const campo = screen.getByRole('spinbutton', { name: 'Licencias' });
    tecla(campo, 'ArrowUp');
    tecla(campo, 'ArrowUp');
    expect(campo.value).toBe('10');
    expect(alCambiar).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Sumar' }).disabled).toBe(true);
    expect(campo.getAttribute('aria-valuetext')).toBe('10 usuarios');
  });
  it('acepta lo escrito con coma decimal al salir del campo', () => {
    const alCambiar = vi.fn();
    render(<CampoNumero etiqueta="Descuento" valorInicial={5} min={0} max={100} paso={0.5} alCambiar={alCambiar} />);
    const campo = screen.getByRole('spinbutton');
    fireEvent.change(campo, { target: { value: '12,5' } });
    fireEvent.blur(campo);
    expect(alCambiar).toHaveBeenLastCalledWith(12.5);
    fireEvent.change(campo, { target: { value: 'abc' } });
    fireEvent.blur(campo);
    expect(campo.value).toBe('12,5');
  });
});

describe('24 TarjetasOpcion', () => {
  const opciones = [{ valor: 'a', titulo: 'Autónomo' }, { valor: 'b', titulo: 'Empresa' }, { valor: 'c', titulo: 'Gestoría', deshabilitada: true }];
  it('elige una, como un grupo de radios', () => {
    const alCambiar = vi.fn();
    render(<TarjetasOpcion etiqueta="Tipo de cuenta" opciones={opciones} valorInicial="a" alCambiar={alCambiar} />);
    expect(screen.getByRole('group', { name: 'Tipo de cuenta' })).toBeTruthy();
    fireEvent.click(screen.getByRole('radio', { name: /Empresa/ }));
    expect(alCambiar).toHaveBeenCalledWith('b');
    expect(screen.getByRole('radio', { name: /Gestoría/ }).disabled).toBe(true);
  });
  it('con `multiple` marca varias', () => {
    const alCambiar = vi.fn();
    render(<TarjetasOpcion opciones={opciones} multiple alCambiar={alCambiar} />);
    fireEvent.click(screen.getByRole('checkbox', { name: /Autónomo/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Empresa/ }));
    expect(alCambiar).toHaveBeenLastCalledWith(['a', 'b']);
    fireEvent.click(screen.getByRole('checkbox', { name: /Autónomo/ }));
    expect(alCambiar).toHaveBeenLastCalledWith(['b']);
  });
});

describe('25 CampoSecreto', () => {
  it('llega tapado, se destapa y regenera', async () => {
    const alRegenerar = vi.fn().mockResolvedValue();
    const { container } = render(<CampoSecreto etiqueta="Clave secreta" valor="sk_demo_abcdef1234" alRegenerar={alRegenerar} />);
    const valor = container.querySelector('.c-secreto__valor');
    expect(valor.textContent).not.toContain('sk_demo');
    expect(valor.textContent).toContain('1234');
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar Clave secreta' }));
    expect(container.querySelector('.c-secreto__valor').textContent).toBe('sk_demo_abcdef1234');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Regenerar Clave secreta' })); });
    expect(alRegenerar).toHaveBeenCalled();
  });
  it('se vuelve a tapar sola', () => {
    vi.useFakeTimers();
    const { container } = render(<CampoSecreto etiqueta="Token" valor="abcdefgh12345678" ocultarTras={5000} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar Token' }));
    act(() => { vi.advanceTimersByTime(5000); });
    expect(container.querySelector('.c-secreto__valor').textContent).not.toContain('abcdefgh');
    vi.useRealTimers();
  });
});

describe('26 MatrizPermisos', () => {
  const roles = [{ id: 'jefe', nombre: 'Propietario' }, { id: 'caja', nombre: 'Recepción' }];
  const grupos = [{ titulo: 'Clientes', permisos: [{ id: 'ver', nombre: 'Ver clientes' }, { id: 'editar', nombre: 'Editar' }] }];
  it('concede un permiso, o el grupo entero', () => {
    const alCambiar = vi.fn();
    render(<MatrizPermisos roles={roles} grupos={grupos} valor={{ jefe: ['ver', 'editar'], caja: ['ver'] }} alCambiar={alCambiar} bloqueados={{ jefe: true }} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Editar: Recepción' }));
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ caja: ['ver', 'editar'] }), { rol: 'caja', permisos: ['editar'], concedido: true });
    const grupo = screen.getByRole('checkbox', { name: 'Todo Clientes: Recepción' });
    expect(grupo.indeterminate).toBe(true);
    fireEvent.click(grupo);
    expect(alCambiar).toHaveBeenLastCalledWith(expect.objectContaining({ caja: ['ver', 'editar'] }), expect.objectContaining({ concedido: true }));
    expect(screen.getByText('1 de 2')).toBeTruthy();
  });
  it('lo bloqueado no se puede tocar', () => {
    const alCambiar = vi.fn();
    render(<MatrizPermisos roles={roles} grupos={grupos} valor={{ jefe: ['ver', 'editar'], caja: [] }} alCambiar={alCambiar} bloqueados={{ jefe: true }} />);
    expect(screen.queryByRole('checkbox', { name: 'Editar: Propietario' })).toBeNull();
    expect(screen.getByRole('checkbox', { name: 'Todo Clientes: Propietario' }).disabled).toBe(true);
    expect(screen.getAllByText(/No se puede cambiar/)).toHaveLength(2);
  });
  it('pliega un grupo', () => {
    render(<MatrizPermisos roles={roles} grupos={grupos} valor={{}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Clientes' }));
    expect(screen.queryByText('Ver clientes')).toBeNull();
  });
});

describe('27 GuiaInicio', () => {
  const pasos = (hechos) => ['Datos del negocio', 'Primer cliente', 'Primera factura'].map((titulo, i) => ({
    id: `p${i}`, titulo, detalle: `Detalle ${i}`, hecho: i < hechos, accion: { texto: `Hacer ${i}`, alPulsar: () => {} },
  }));
  it('lleva la cuenta y abre el primer paso que falta', () => {
    const { rerender } = render(<GuiaInicio pasos={pasos(1)} />);
    expect(screen.getByRole('status').textContent).toBe('1 de 3');
    expect(screen.getByRole('button', { name: /Primer cliente/ }).getAttribute('aria-expanded')).toBe('true');
    rerender(<GuiaInicio pasos={pasos(2)} />);
    expect(screen.getByRole('button', { name: /Primera factura/ }).getAttribute('aria-expanded')).toBe('true');
    rerender(<GuiaInicio pasos={pasos(3)} />);
    expect(screen.getByRole('status').textContent).toBe('Todo listo');
  });
  it('se puede ocultar', () => {
    const alOcultar = vi.fn();
    render(<GuiaInicio pasos={pasos(0)} alOcultar={alOcultar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar' }));
    expect(alOcultar).toHaveBeenCalled();
  });
});

describe('28 CentroNotificaciones', () => {
  const ahora = new Date(2026, 10, 15, 12);
  const lista = [
    { id: 1, autor: 'Marta Ruiz', titulo: 'te asignó una factura', fecha: new Date(2026, 10, 15, 11, 55), leida: false },
    { id: 2, titulo: 'Copia diaria completada', fecha: new Date(2026, 10, 14, 12), leida: true },
  ];
  it('cuenta lo no leído, lo filtra y lo marca al abrirlo', () => {
    const alLeer = vi.fn();
    const alAbrir = vi.fn();
    render(<CentroNotificaciones notificaciones={lista} alLeer={alLeer} alAbrir={alAbrir} alLeerTodas={() => {}} ahora={ahora} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones: 1 sin leer' }));
    const panel = screen.getByRole('dialog', { name: 'Notificaciones' });
    expect(within(panel).getByText('hace 5 minutos')).toBeTruthy();
    expect(within(panel).getByText('ayer')).toBeTruthy();
    fireEvent.click(within(panel).getByRole('button', { name: /No leídas/ }));
    expect(within(panel).queryByText('Copia diaria completada')).toBeNull();
    fireEvent.click(within(panel).getByRole('button', { name: /te asignó una factura/ }));
    expect(alLeer).toHaveBeenCalledWith(1);
    expect(alAbrir).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
  it('sin pendientes lo dice', () => {
    render(<CentroNotificaciones notificaciones={[lista[1]]} ahora={ahora} />);
    fireEvent.click(screen.getByRole('button', { name: 'Notificaciones' }));
    fireEvent.click(screen.getByRole('button', { name: 'No leídas' }));
    expect(screen.getByText('Todo leído')).toBeTruthy();
  });
});

describe('29 TablaPrecios', () => {
  const planes = [
    { id: 'a', nombre: 'Inicial', precio: { mes: 0, ano: 0 }, incluye: ['1 usuario', { texto: 'Informes', incluido: false }] },
    { id: 'b', nombre: 'Equipo', precio: { mes: 49, ano: 490 }, destacado: true, incluye: ['10 usuarios'] },
    { id: 'c', nombre: 'Empresa', precio: null, incluye: ['Sin límite'], accion: 'Hablar con ventas' },
  ];
  it('cambia a pago anual y enseña el equivalente al mes', () => {
    const alElegir = vi.fn();
    render(<TablaPrecios planes={planes} actual="a" alElegir={alElegir} />);
    expect(screen.getAllByText(/^49\s€$/).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('radio', { name: /Anual/ }));
    expect(screen.getAllByText(/^41\s€$/).length).toBeGreaterThan(0);
    expect(screen.getByText(/490\s€ al año/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Elegir Equipo' }));
    expect(alElegir).toHaveBeenCalledWith('b', 'ano');
    expect(screen.getByRole('button', { name: 'Plan actual' }).disabled).toBe(true);
    expect(screen.getByText('A medida')).toBeTruthy();
    expect(screen.getByText('(no incluido)')).toBeTruthy();
  });
});

describe('30 ZonaPeligro', () => {
  it('no deja confirmar hasta escribir el nombre', async () => {
    const alConfirmar = vi.fn().mockResolvedValue();
    render(<ZonaPeligro titulo="Eliminar el espacio" accion="Eliminar espacio" pregunta="¿Eliminar Clínica Norte?" frase="Clínica Norte" alConfirmar={alConfirmar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar espacio' }));
    const dialogo = screen.getByRole('dialog', { name: '¿Eliminar Clínica Norte?' });
    const confirmar = within(dialogo).getByRole('button', { name: 'Eliminar espacio' });
    expect(confirmar.disabled).toBe(true);
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'clinica norte' } });
    expect(confirmar.disabled).toBe(true);
    fireEvent.change(within(dialogo).getByRole('textbox'), { target: { value: 'Clínica Norte ' } });
    expect(confirmar.disabled).toBe(false);
    await act(async () => { fireEvent.submit(dialogo.querySelector('form')); });
    expect(alConfirmar).toHaveBeenCalledTimes(1);
  });
  it('si falla, lo dice y se queda abierto', async () => {
    const alConfirmar = vi.fn().mockRejectedValue(new Error('El espacio tiene facturas sin cerrar'));
    render(<ZonaPeligro titulo="Archivar" accion="Archivar espacio" alConfirmar={alConfirmar} />);
    fireEvent.click(screen.getByRole('button', { name: 'Archivar espacio' }));
    const dialogo = screen.getByRole('dialog');
    await act(async () => { fireEvent.submit(dialogo.querySelector('form')); });
    expect(within(dialogo).getByRole('alert').textContent).toBe('El espacio tiene facturas sin cerrar');
  });
});

describe('31 BarraCristal', () => {
  const grupos = [
    { titulo: 'Principal', elementos: [
      { id: 'panel', texto: 'Panel' },
      { id: 'actividad', texto: 'Actividad', contador: 12 },
      { id: 'agenda', texto: 'Agenda', aviso: true },
    ] },
    { titulo: 'Espacio', elementos: [
      { id: 'mensajes', texto: 'Mensajes', contador: 3, urgente: true },
      { id: 'proyectos', texto: 'Proyectos', hijos: [{ id: 'web', texto: 'Rediseño de la web' }, { id: 'marca', texto: 'Manual de marca' }] },
    ] },
  ];
  it('marca el apartado abierto, avisa al elegir y se pliega', () => {
    const alElegir = vi.fn();
    const alPlegar = vi.fn();
    render(<BarraCristal grupos={grupos} activo="panel" alElegir={alElegir} alPlegar={alPlegar} nombre="Vertix" />);
    expect(screen.getByRole('button', { name: 'Panel' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: /Mensajes/ }).querySelector('[data-urgente]').textContent).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: /Actividad/ }));
    expect(alElegir).toHaveBeenCalledWith('actividad', expect.objectContaining({ texto: 'Actividad' }));
    fireEvent.click(screen.getByRole('button', { name: 'Plegar menú' }));
    expect(alPlegar).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Desplegar menú' }).getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByRole('complementary').hasAttribute('data-plegada')).toBe(true);
  });
  it('abre la rama, elige un hijo y deja marcado al padre cuando la rama se cierra', () => {
    const alElegir = vi.fn();
    const { rerender } = render(<BarraCristal grupos={grupos} activo="panel" alElegir={alElegir} />);
    const rama = screen.getByRole('button', { name: 'Proyectos' });
    expect(rama.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(rama);
    expect(rama.getAttribute('aria-expanded')).toBe('true');
    expect(alElegir).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText('Rediseño de la web'));
    expect(alElegir).toHaveBeenCalledWith('web', expect.objectContaining({ texto: 'Rediseño de la web' }));
    rerender(<BarraCristal grupos={grupos} activo="web" alElegir={alElegir} />);
    expect(screen.getByText('Rediseño de la web').closest('button').getAttribute('aria-current')).toBe('page');
    fireEvent.click(rama);
    expect(rama.hasAttribute('data-marcado')).toBe(true);
  });
  it('filtra al buscar, abre las ramas con coincidencias y Escape limpia', () => {
    render(<BarraCristal grupos={grupos} activo="panel" />);
    const campo = screen.getByRole('textbox', { name: 'Buscar' });
    fireEvent.change(campo, { target: { value: 'márca' } });
    expect(screen.queryByText('Panel')).toBeNull();
    expect(screen.getByRole('button', { name: 'Proyectos' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Manual de marca')).toBeTruthy();
    expect(screen.queryByText('Rediseño de la web')).toBeNull();
    fireEvent.change(campo, { target: { value: 'zzz' } });
    expect(screen.getByRole('status').textContent).toBe('Sin resultados');
    tecla(campo, 'Escape');
    expect(campo.value).toBe('');
    expect(screen.getByText('Panel')).toBeTruthy();
  });
  it('atiende a los atajos y a los interruptores del pie', () => {
    const alPlegar = vi.fn();
    const alCambiar = vi.fn();
    render(
      <BarraCristal
        grupos={grupos} plegadaInicial alPlegar={alPlegar}
        ajustes={[{ id: 'noche', texto: 'Modo noche', activo: false, alCambiar }]}
        usuario={{ nombre: 'Álex Morgan', detalle: 'alex@vertix.io' }}
      />,
    );
    tecla(document.body, 'k', { ctrlKey: true });
    expect(alPlegar).toHaveBeenLastCalledWith(false);
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Buscar' }));
    document.activeElement.blur();
    tecla(document.body, '[');
    expect(alPlegar).toHaveBeenLastCalledWith(true);
    fireEvent.click(screen.getByRole('switch', { name: 'Modo noche' }));
    expect(alCambiar).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: /Álex Morgan/ })).toBeTruthy();
  });
});
