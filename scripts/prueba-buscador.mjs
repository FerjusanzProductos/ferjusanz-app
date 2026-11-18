// Comprueba el buscador que perdona erratas de public/index.html: node scripts/prueba-buscador.mjs
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const src = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
const ini = src.indexOf('const BUSCA_RELLENO'), fin = src.indexOf('\n', src.indexOf('const filtraBusca'));
const f = new Function(src.slice(src.indexOf('const sinTilde'), src.indexOf('\n', src.indexOf('const sinTilde'))) + '\n' +
  src.slice(src.indexOf('const limpiaBusqueda'), src.indexOf('\n', src.indexOf('const limpiaBusqueda'))) + '\n' +
  src.slice(ini, fin) + '\nreturn filtraBusca;')();
const L = ['LA DEFINITIVA Nadamalu SLU', 'Bar El Conde', 'Tomate pera', 'Patata agria', 'Pimiento de Padrón', 'Pan de pueblo'];
const casos = {
  'definitiva': ['LA DEFINITIVA Nadamalu SLU'], 'la definitiva': ['LA DEFINITIVA Nadamalu SLU'],
  'defintiva': ['LA DEFINITIVA Nadamalu SLU'], 'difinitiba': ['LA DEFINITIVA Nadamalu SLU'],
  'tomte': ['Tomate pera'], 'patatas': ['Patata agria'], 'pimientos padron': ['Pimiento de Padrón'],
  'pan': ['Pan de pueblo'], 'xyz': [],
};
for (const [q, esperado] of Object.entries(casos)) assert.deepEqual(f(L, q, x => x), esperado, q);
console.log('Buscador OK');
