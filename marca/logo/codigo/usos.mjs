// Saca del logo los archivos que usan la app y la web (iconos, cabeceras, documentos).
// Uso: node marca/logo/codigo/usos.mjs   (desde la raíz del proyecto)
import fs from 'node:fs'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const L = n => fs.readFileSync('marca/logo/' + n + '.svg', 'utf8');
const ajustado = s => s.replace(/viewBox="0 0 718 240" width="718" height="240"/, 'viewBox="18 56 670 150" width="670" height="150"'); // sin el margen blanco
const perfil = L('perfil-whatsapp-google').replace(/<text[^]*?<\/text>/, '');
const icono = perfil.replace('translate(-20 -6)', 'translate(-20 5)');
const iconoPruebas = perfil.replace('translate(-20 -6)', 'translate(-20 -16)').replace('</svg>', '<rect y="190" width="240" height="50" fill="#ea580c"/><text x="120" y="224" class="t" font-size="26" letter-spacing="3" fill="#fff" text-anchor="middle">PRUEBAS</text></svg>');
// [svg, ancho en px, salida, fondo (null = transparente), tipo]
const A = [
  [icono, 192, 'public/icon-192.png'], [icono, 512, 'public/icon-512.png'],
  [iconoPruebas, 192, 'public/icon-pruebas-192.png'], [iconoPruebas, 512, 'public/icon-pruebas-512.png'],
  [ajustado(L('logo-principal')), 900, 'public/pres/logo.png'],
  [ajustado(L('logo-principal')), 900, 'public/pres/logo.jpg', '#fff', 'jpeg'],
  [ajustado(L('logo-principal-fondo-oscuro')), 900, 'public/pres/logo-oscuro.png'],
  [L('etiqueta'), 760, 'public/pres/etiqueta.jpg', '#4a0b0e', 'jpeg'],
  [ajustado(L('logo-principal-fondo-oscuro')), 600, 'web/public/marca/logo-oscuro.png'],
  [ajustado(L('logo-principal')), 900, 'web/public/marca/logo.png'],
  [L('etiqueta'), 760, 'web/public/marca/etiqueta.png'],
  [icono, 32, 'web/public/marca/icono-32.png'], [icono, 180, 'web/public/marca/icono-180.png'], [icono, 512, 'web/public/marca/icono-512.png'],
];
const b = await chromium.launch();
for (const [svg, ancho, out, fondo, tipo] of A) {
  const [, , , w, h] = svg.match(/viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"/).map(Number);
  const p = await b.newPage({ deviceScaleFactor: ancho / w, viewport: { width: w, height: h } });
  await p.setContent(`<style>html,body{margin:0;background:${fondo || 'transparent'}}svg{display:block}</style>${svg}`); await p.evaluate(() => document.fonts.ready);
  fs.mkdirSync(out.replace(/\/[^/]+$/, ''), { recursive: true });
  await p.screenshot({ path: out, omitBackground: !fondo, type: tipo || 'png', ...(tipo ? { quality: 88 } : {}), clip: { x: 0, y: 0, width: w, height: h } });
  await p.close();
}
await b.close(); console.log('ok');
