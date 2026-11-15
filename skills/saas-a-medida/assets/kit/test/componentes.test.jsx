// Cada demo del catálogo se monta sin errores ni avisos de React, y los comportamientos que más duele romper
// (selección por tramo, orden, envío doble, avisos, búsqueda) se comprueban de verdad.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MODULOS } from '../src/catalogo/modulos.js';
import { BotonEstado, Tabla, ZonaAvisos, avisar, useBusqueda, useSeleccion } from '../src/kit/index.js';

afterEach(cleanup);

describe('catálogo', () => {
  it('tiene 40 módulos con id único, uso y demo', () => {
    expect(MODULOS).toHaveLength(40);
    expect(new Set(MODULOS.map((m) => m.id)).size).toBe(40);
    for (const m of MODULOS) {
      expect(m.uso.length, m.id).toBeGreaterThan(10);
      expect(typeof m.Demo, m.id).toBe('function');
    }
  });

  it.each(MODULOS.map((m) => [m.n, m.nombre, m]))('%s · %s se monta limpio', (_n, _nombre, m) => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<m.Demo />);
    expect(container.firstChild).not.toBeNull();
    expect(error.mock.calls.map((c) => String(c[0]))).toEqual([]);
    error.mockRestore();
  });
});

describe('useSeleccion', () => {
  function Lista() {
    const ids = ['a', 'b', 'c', 'd', 'e'];
    const sel = useSeleccion(ids);
    return (
      <>
        {ids.map((id) => <button key={id} onClick={(e) => sel.alternar(id, e)}>{id}</button>)}
        <output>{[...sel.seleccion].join('')}|{sel.estado}</output>
      </>
    );
  }
  it('con Mayús marca el tramo entero y lo desmarca igual', () => {
    render(<Lista />);
    const salida = () => document.querySelector('output').textContent;
    fireEvent.click(screen.getByText('b'));
    fireEvent.click(screen.getByText('d'), { shiftKey: true });
    expect(salida()).toBe('bcd|algunos');
    fireEvent.click(screen.getByText('a'));
    fireEvent.click(screen.getByText('e'));
    expect(salida()).toBe('abcde|todos');
    fireEvent.click(screen.getByText('b'), { shiftKey: true });
    expect(salida()).toBe('a|algunos');
  });
});

describe('Tabla', () => {
  const columnas = [{ clave: 'nombre', titulo: 'Nombre', ordenable: true }, { clave: 'tel', titulo: 'Teléfono' }];
  const filas = [{ id: 1, nombre: 'Zoe', tel: '600' }, { id: 2, nombre: 'Ana', tel: null }];
  const nombres = () => [...document.querySelectorAll('tbody tr')].map((tr) => tr.cells[0].textContent);

  it('ordena en tres pulsaciones y pinta una raya donde falta el dato', () => {
    render(<Tabla columnas={columnas} filas={filas} />);
    expect(nombres()).toEqual(['Zoe', 'Ana']);
    const boton = screen.getByRole('button', { name: 'Nombre' });
    fireEvent.click(boton);
    expect(nombres()).toEqual(['Ana', 'Zoe']);
    expect(boton.closest('th').getAttribute('aria-sort')).toBe('ascending');
    fireEvent.click(boton);
    expect(nombres()).toEqual(['Zoe', 'Ana']);
    fireEvent.click(boton);
    expect(boton.closest('th').hasAttribute('aria-sort')).toBe(false);
    expect(document.querySelector('tbody tr:last-child td:last-child').textContent).toBe('—');
  });

  it('enseña la barra de acciones solo con algo seleccionado', () => {
    render(<Tabla columnas={columnas} filas={filas} seleccionable acciones={(ids) => <span>van {ids.length}</span>} />);
    expect(screen.queryByRole('toolbar')).toBeNull();
    fireEvent.click(screen.getByLabelText('Seleccionar todas'));
    expect(screen.getByRole('toolbar').textContent).toContain('2 seleccionadas');
    expect(screen.getByText('van 2')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Quitar selección'));
    expect(screen.queryByRole('toolbar')).toBeNull();
  });

  it('enseña el vacío cuando no hay filas', () => {
    render(<Tabla columnas={columnas} filas={[]} vacio={<p>Aún no hay clientes</p>} />);
    expect(screen.getByText('Aún no hay clientes')).toBeTruthy();
    expect(document.querySelector('table')).toBeNull();
  });
});

describe('BotonEstado', () => {
  it('no lanza un segundo envío mientras guarda y luego dice que ha guardado', async () => {
    let terminar;
    const guardar = vi.fn(() => new Promise((r) => { terminar = r; }));
    render(<BotonEstado alPulsar={guardar}>Guardar</BotonEstado>);
    const boton = screen.getByRole('button');
    fireEvent.click(boton);
    fireEvent.click(boton);
    fireEvent.click(boton);
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(boton.dataset.estado).toBe('cargando');
    await act(async () => { terminar(); });
    expect(boton.dataset.estado).toBe('hecho');
  });

  it('dice que ha fallado si la promesa se rechaza', async () => {
    render(<BotonEstado alPulsar={() => Promise.reject(new Error('x'))}>Guardar</BotonEstado>);
    await act(async () => { fireEvent.click(screen.getByRole('button')); });
    expect(screen.getByRole('button').dataset.estado).toBe('error');
  });
});

describe('Avisos', () => {
  it('los normales se van solos; los errores se quedan hasta cerrarlos', () => {
    vi.useFakeTimers();
    render(<ZonaAvisos />);
    act(() => { avisar('Factura guardada'); avisar('No se ha enviado', { tono: 'mal' }); });
    expect(screen.getByText('Factura guardada')).toBeTruthy();
    expect(screen.getByRole('alert', { hidden: true }).textContent).toContain('No se ha enviado');
    act(() => { vi.advanceTimersByTime(6000); });
    act(() => { vi.advanceTimersByTime(500); }); // el desvanecido de salida
    expect(screen.queryByText('Factura guardada')).toBeNull();
    expect(screen.getByText('No se ha enviado')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Cerrar aviso'));
    act(() => { vi.advanceTimersByTime(500); });
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.queryByText('No se ha enviado')).toBeNull();
    vi.useRealTimers();
  });
});

describe('useBusqueda', () => {
  it('descarta la respuesta de una búsqueda anterior aunque llegue la última', async () => {
    vi.useFakeTimers();
    const pendientes = {};
    const buscar = (texto) => new Promise((r) => { pendientes[texto] = r; });
    function Buscador() {
      const b = useBusqueda(buscar, { espera: 100, minimo: 1 });
      return <><input value={b.texto} onChange={(e) => b.setTexto(e.target.value)} /><output>{b.estado}:{b.resultados.join(',')}</output></>;
    }
    render(<Buscador />);
    const campo = screen.getByRole('textbox');
    const salida = () => document.querySelector('output').textContent;

    fireEvent.change(campo, { target: { value: 'a' } });
    await act(async () => { vi.advanceTimersByTime(150); });
    fireEvent.change(campo, { target: { value: 'ab' } });
    await act(async () => { vi.advanceTimersByTime(150); });
    expect(Object.keys(pendientes)).toEqual(['a', 'ab']);

    await act(async () => { pendientes.ab(['nueva']); });
    await act(async () => { pendientes.a(['vieja']); });
    expect(salida()).toBe('listo:nueva');
    vi.useRealTimers();
  });
});
