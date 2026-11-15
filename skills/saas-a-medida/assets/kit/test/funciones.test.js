import { describe, expect, it } from 'vitest';
import {
  coincideAtajo, compacto, diasDelMes, fechaCercana, fechaCorta, filtrarComandos, iniciales, moneda, moverTarjeta, numero, ordenarFilas,
  plural, porcentaje, sumarMeses, tamano, techoRedondo, teclasDe, tipoValido, tramoPaginas,
} from '../src/kit/index.js';

const NBSP = ' ';

describe('formato', () => {
  it('escribe los importes como en España, también con cuatro cifras', () => {
    expect(moneda(1250)).toBe(`1.250,00${NBSP}€`);
    expect(moneda(1284500.9)).toBe(`1.284.500,90${NBSP}€`);
    expect(moneda(0)).toBe(`0,00${NBSP}€`);
  });
  it('pinta una raya cuando falta el dato', () => {
    for (const f of [moneda, numero, porcentaje, compacto, fechaCorta, fechaCercana, tamano]) {
      expect(f(null)).toBe('—');
      expect(f(undefined)).toBe('—');
    }
    expect(numero(NaN)).toBe('—');
  });
  it('agrupa miles y da porcentajes', () => {
    expect(numero(1234)).toBe('1.234');
    expect(porcentaje(0.214)).toBe(`21,4${NBSP}%`);
  });
  it('dice las fechas cercanas como se dicen', () => {
    const ahora = new Date(2026, 10, 15, 10, 0);
    expect(fechaCercana(new Date(2026, 10, 15, 23, 0), ahora)).toBe('hoy');
    expect(fechaCercana(new Date(2026, 10, 14, 1, 0), ahora)).toBe('ayer');
    expect(fechaCercana(new Date(2026, 10, 16, 8, 0), ahora)).toBe('mañana');
    expect(fechaCercana(new Date(2026, 10, 18), ahora)).toBe('mié 18');
    expect(fechaCercana(new Date(2026, 8, 3), ahora)).toBe('3 sept');
    expect(fechaCercana(new Date(2025, 2, 3), ahora)).toBe('3 mar 2025');
    expect(fechaCorta('2026-11-13')).toBe('13 nov 2026');
  });
  it('saca iniciales, tamaños y plurales', () => {
    expect(iniciales('Marta Ruiz Gil')).toBe('MR');
    expect(iniciales('  ')).toBe('?');
    expect(iniciales('Óscar')).toBe('Ó');
    expect(tamano(0)).toBe(`0${NBSP}B`);
    expect(tamano(1536000)).toBe(`1,5${NBSP}MB`);
    expect(plural(1, 'cliente', 'clientes')).toBe('1 cliente');
    expect(plural(3, 'cliente', 'clientes')).toBe('3 clientes');
  });
});

describe('atajos', () => {
  const ev = (key, extra = {}) => ({ key, metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, ...extra });
  it('«mod» es Ctrl fuera de Mac y ⌘ en Mac', () => {
    expect(coincideAtajo(ev('k', { ctrlKey: true }), 'mod+k', false)).toBe(true);
    expect(coincideAtajo(ev('k', { metaKey: true }), 'mod+k', true)).toBe(true);
    expect(coincideAtajo(ev('k', { ctrlKey: true }), 'mod+k', true)).toBe(false);
    expect(coincideAtajo(ev('k'), 'mod+k', false)).toBe(false);
  });
  it('una tecla suelta no salta con modificadores', () => {
    expect(coincideAtajo(ev('n'), 'n', false)).toBe(true);
    expect(coincideAtajo(ev('n', { ctrlKey: true }), 'n', false)).toBe(false);
    expect(coincideAtajo(ev('N', { shiftKey: true }), 'n', false)).toBe(false);
    expect(coincideAtajo(ev('?', { shiftKey: true }), '?', false)).toBe(true);
  });
  it('se pinta con las teclas de cada sistema', () => {
    expect(teclasDe('mod+k', true)).toEqual(['⌘', 'K']);
    expect(teclasDe('mod+k', false)).toEqual(['Ctrl', 'K']);
  });
});

describe('tabla', () => {
  const columnas = [{ clave: 'nombre' }, { clave: 'importe' }];
  const filas = [{ nombre: 'Zoe', importe: 10 }, { nombre: 'Álvaro', importe: 200 }, { nombre: 'alonso', importe: null }, { nombre: 'Cliente 10', importe: 9 }, { nombre: 'Cliente 9', importe: 1000 }];
  it('ordena textos como un diccionario español y los números por su valor', () => {
    expect(ordenarFilas(filas, columnas, { clave: 'nombre', sentido: 'asc' }).map((f) => f.nombre)).toEqual(['alonso', 'Álvaro', 'Cliente 9', 'Cliente 10', 'Zoe']);
    expect(ordenarFilas(filas, columnas, { clave: 'importe', sentido: 'desc' }).map((f) => f.importe)).toEqual([1000, 200, 10, 9, null]);
  });
  it('deja lo que falta al final en los dos sentidos y no toca la lista original', () => {
    expect(ordenarFilas(filas, columnas, { clave: 'importe', sentido: 'asc' }).at(-1).importe).toBeNull();
    expect(filas[0].nombre).toBe('Zoe');
    expect(ordenarFilas(filas, columnas, null)).toBe(filas);
  });
});

describe('paginación', () => {
  it('enseña primera, última y vecinas', () => {
    expect(tramoPaginas(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(tramoPaginas(6, 20)).toEqual([1, '…', 5, 6, 7, '…', 20]);
    expect(tramoPaginas(1, 20)).toEqual([1, 2, 3, 4, 5, '…', 20]);
    expect(tramoPaginas(20, 20)).toEqual([1, '…', 16, 17, 18, 19, 20]);
  });
  it('siempre ocupa lo mismo, para que los botones no bailen', () => {
    const largos = Array.from({ length: 30 }, (_, i) => tramoPaginas(i + 1, 30).length);
    expect(new Set(largos).size).toBe(1);
  });
});

describe('paleta', () => {
  const comandos = [{ id: 1, titulo: 'Configuración', claves: 'ajustes' }, { id: 2, titulo: 'Nuevo cliente', grupo: 'Crear' }, { id: 3, titulo: 'Clientes' }];
  it('encuentra sin tildes, por sinónimos y en cualquier orden', () => {
    expect(filtrarComandos(comandos, 'configuracion').map((c) => c.id)).toEqual([1]);
    expect(filtrarComandos(comandos, 'ajustes').map((c) => c.id)).toEqual([1]);
    expect(filtrarComandos(comandos, 'cliente nuevo').map((c) => c.id)).toEqual([2]);
    expect(filtrarComandos(comandos, '  ')).toBe(comandos);
  });
  it('pone delante lo que empieza por lo escrito', () => {
    expect(filtrarComandos(comandos, 'cli').map((c) => c.id)).toEqual([3, 2]);
  });
});

describe('fechas del calendario', () => {
  it('pinta seis semanas que empiezan en lunes', () => {
    const dias = diasDelMes('2026-11-15');
    expect(dias).toHaveLength(42);
    expect(dias[0]).toBe('2026-10-26');
    expect(dias).toContain('2026-11-30');
  });
  it('no se sale del mes al sumar meses', () => {
    expect(sumarMeses('2026-01-31', 1)).toBe('2026-02-28');
    expect(sumarMeses('2024-01-31', 1)).toBe('2024-02-29');
    expect(sumarMeses('2026-12-15', 1)).toBe('2027-01-15');
    expect(sumarMeses('2026-03-31', -1)).toBe('2026-02-28');
  });
});

describe('tablero', () => {
  const t = [{ id: 'a', columna: 'x' }, { id: 'b', columna: 'x' }, { id: 'c', columna: 'y' }, { id: 'd', columna: 'y' }];
  const de = (lista, col) => lista.filter((x) => x.columna === col).map((x) => x.id);
  it('mueve entre columnas a la posición pedida', () => {
    const r = moverTarjeta(t, 'a', 'y', 1);
    expect(de(r, 'x')).toEqual(['b']);
    expect(de(r, 'y')).toEqual(['c', 'a', 'd']);
  });
  it('reordena dentro de la misma columna y admite el final', () => {
    expect(de(moverTarjeta(t, 'a', 'x', 1), 'x')).toEqual(['b', 'a']);
    expect(de(moverTarjeta(t, 'a', 'y', 99), 'y')).toEqual(['c', 'd', 'a']);
    expect(moverTarjeta(t, 'zz', 'y', 0)).toBe(t);
  });
});

describe('varios', () => {
  it('redondea el techo del gráfico', () => {
    expect(techoRedondo(31450)).toBe(50000);
    expect(techoRedondo(487)).toBe(500);
    expect(techoRedondo(100)).toBe(100);
    expect(techoRedondo(0)).toBe(1);
    expect(techoRedondo(0.94)).toBe(1);
  });
  it('valida tipos de archivo como el accept de un input', () => {
    const pdf = { name: 'Factura.PDF', type: 'application/pdf' };
    const foto = { name: 'foto.jpg', type: 'image/jpeg' };
    expect(tipoValido(pdf, '.pdf,image/*')).toBe(true);
    expect(tipoValido(foto, '.pdf,image/*')).toBe(true);
    expect(tipoValido({ name: 'a.exe', type: 'application/x-msdownload' }, '.pdf,image/*')).toBe(false);
    expect(tipoValido(foto, undefined)).toBe(true);
  });
});
