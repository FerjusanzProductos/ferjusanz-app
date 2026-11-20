// Saca PNG y PDF de los SVG finales de marca/logo (como final.mjs, pero desde los SVG ya hechos).
import fs from 'node:fs'; import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
for (const n of ['logo-principal','logo-principal-fondo-oscuro','logo-principal-una-tinta','etiqueta']) {
  const svg = fs.readFileSync(`marca/logo/${n}.svg`,'utf8'); const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const p = await b.newPage({ deviceScaleFactor: 4, viewport: { width: w, height: h } });
  await p.setContent(`<style>html,body{margin:0}</style>${svg}`); await p.evaluate(() => document.fonts.ready);
  await p.locator('svg').screenshot({ path: `marca/logo/${n}.png`, omitBackground: true });
  await p.pdf({ path: `marca/logo/${n}.pdf`, width: w + 'px', height: h + 'px', printBackground: true, pageRanges: '1' });
  await p.close();
}
await b.close(); console.log('ok');
