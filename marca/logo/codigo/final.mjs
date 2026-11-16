// Archivos finales de la marca: SVG, PNG grande y PDF (vectorial, con la letra incrustada, para la imprenta).
import fs from 'node:fs'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const [D, OUT] = process.argv.slice(2); const O = D + '/salida/'; fs.mkdirSync(OUT, { recursive: true });
const leer = n => { const s = fs.readFileSync(O + n + '.svg', 'utf8'); return n.startsWith('5-') ? s.replace('viewBox="0 0 760 240" width="760"', 'viewBox="0 0 718 240" width="718"') : s; };
const base = leer('5-amanecer');
const negro = base.replace(/url\(#sol\)/g, '#161210').replace(/#2f7d32|#6b1216/g, '#161210');
const perfil = leer('a-negro').replace('<circle cx="120" cy="120" r="120" fill="#161210"/>', '<rect width="240" height="240" fill="#161210"/>');
const A = { 'logo-principal': [base, 4], 'logo-principal-fondo-oscuro': [leer('5-amanecer-osc'), 4], 'logo-principal-una-tinta': [negro, 4], 'etiqueta': [leer('4b-etiqueta-sol'), 4], 'perfil-whatsapp-google': [perfil, 4.5] };
const b = await chromium.launch();
for (const [n, [svg, esc]] of Object.entries(A)) {
  fs.writeFileSync(`${OUT}/${n}.svg`, svg);
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const p = await b.newPage({ deviceScaleFactor: esc, viewport: { width: w, height: h } });
  await p.setContent(`<style>html,body{margin:0}</style>${svg}`); await p.evaluate(() => document.fonts.ready);
  await p.locator('svg').screenshot({ path: `${OUT}/${n}.png`, omitBackground: true });
  if (n !== 'perfil-whatsapp-google') await p.pdf({ path: `${OUT}/${n}.pdf`, width: w + 'px', height: h + 'px', printBackground: true, pageRanges: '1' });
  await p.close();
}
await b.close(); console.log('ok');
