// Comprueba ultimosPreciosCalc (pantalla «Precios de compra del día»): saca la función de public/index.html y la prueba.
// Uso: node pruebas/precios/ultimos.mjs [lineas.json]  (sin archivo, solo los casos inventados)
import { readFileSync } from 'fs';
import assert from 'assert/strict';
const src = readFileSync(new URL('../../public/index.html', import.meta.url), 'utf8');
const trozo = (inicio, fin) => { const i = src.indexOf(inicio); assert.ok(i >= 0, inicio); return src.slice(i, src.indexOf(fin, i) + fin.length); };
const codigo = [src.match(/^const uno = .*$/m)[0], src.match(/^const fcNorm = .*$/m)[0], 'const fcClave = t => fcNorm(t);',
  trozo('function fcEsBasura(t) {', '\n}'), trozo('function ultimosPreciosCalc(lineas, hasta) {', '\n}')].join('\n');
const ultimosPreciosCalc = new Function(codigo + '\nreturn ultimosPreciosCalc;')();

// Casos inventados
const L = [
  { producto_id: 'p1', proveedor_id: 'A', unidad: 'kg', precio: 2.75, fecha: '2026-11-13', productos: { nombre: 'Pimiento rojo' }, proveedores: { nombre: 'Prov A' } },
  { producto_id: 'p1', proveedor_id: 'A', unidad: 'kg', precio: 1.5, fecha: '2026-11-10' },
  { producto_id: 'p1', proveedor_id: 'A', unidad: 'kg', precio: 9, fecha: '2026-11-01' },          // más antiguo: no cuenta
  { producto_id: 'p1', proveedor_id: 'B', unidad: 'kg', precio: 1, fecha: '2026-11-12' },          // otro proveedor: aparte
  { producto_id: 'p1', proveedor_id: 'A', unidad: 'caja', precio: 20, fecha: '2026-11-11' },       // otra unidad: aparte
  { producto_id: 'p1', proveedor_id: 'A', unidad: 'kg', precio: 3, fecha: '2026-11-15' },          // después de «hasta»: fuera
  { producto_id: null, proveedor_id: 'A', unidad: null, texto: 'Tomate asurcado', precio: 1.7, fecha: '2026-11-13' },
  { producto_id: null, proveedor_id: 'A', unidad: null, texto: 'TOMATE  asurcado', precio: 1, fecha: '2026-11-06' }, // sin producto: agrupa por texto
  { producto_id: null, proveedor_id: 'A', texto: 'Total base imponible', precio: 300, fecha: '2026-11-13' },        // basura: fuera
  { producto_id: 'p2', proveedor_id: 'A', unidad: 'kg', precio: 0, fecha: '2026-11-13' },          // sin precio: fuera
];
const r = ultimosPreciosCalc(L, '2026-11-14');
assert.equal(r.length, 4);
const p1 = r.find(x => x.pid === 'p1' && x.unidad === 'kg' && x.precio === 2.75);
assert.equal(p1.precioAnt, 1.5); assert.equal(p1.fechaAnt, '2026-11-10'); assert.equal(Math.round(p1.pct), 83); assert.equal(p1.nombre, 'Pimiento rojo');
assert.equal(r.find(x => x.pid === 'p1' && x.precio === 1).precioAnt, null);
assert.equal(r.find(x => x.unidad === 'caja').precioAnt, null);
const t = r.find(x => !x.pid); assert.equal(t.precioAnt, 1); assert.equal(Math.round(t.pct), 70);
assert.equal(ultimosPreciosCalc(L, '2026-11-12').find(x => x.pid === 'p1' && x.unidad === 'kg' && x.fecha === '2026-11-10').precioAnt, 9);
console.log('Casos inventados: bien');

if (process.argv[2]) {
  const real = JSON.parse(readFileSync(process.argv[2], 'utf8')), hoy = process.argv[3] || '2026-11-15';
  const u = ultimosPreciosCalc(real, hoy), c = u.filter(x => x.precioAnt != null);
  console.log(`Hasta ${hoy}: ${u.length} productos con precio · ${c.length} con precio anterior · ${c.filter(x => x.pct > 0).length} suben · ${c.filter(x => x.pct < 0).length} bajan · lo más reciente ${u.reduce((m, x) => x.fecha > m ? x.fecha : m, '')}`);
  c.filter(x => x.pct > 50).sort((a, b) => b.pct - a.pct).forEach(x => console.log(`  🟠 +${Math.round(x.pct)} % ${x.nombre} · ${x.prov} · ${x.precioAnt} → ${x.precio} ${x.unidad} (${x.fechaAnt} → ${x.fecha})`));
}
