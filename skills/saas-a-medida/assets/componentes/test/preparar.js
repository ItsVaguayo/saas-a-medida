// En las pruebas se pide «menos movimiento»: las cifras y las salidas ocurren de golpe
// y no hay que esperar a ninguna animación.
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

window.matchMedia = (consulta) => ({
  matches: /reduce/.test(consulta), media: consulta,
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
afterEach(cleanup);
