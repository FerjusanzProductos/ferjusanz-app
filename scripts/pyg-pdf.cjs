// PDF de la cuenta de resultados (Tito, 26/11/2026: «descargar en PDF, en Excel, que estén los gráficos»). Uso: node scripts/pyg-pdf.cjs → docs/pyg.pdf
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1200 } });
  await p.emulateMedia({ colorScheme: 'light' });
  await p.goto('file://' + path.resolve(__dirname, '../docs/pyg.html')); await p.waitForTimeout(1500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } window.paraImprimir(); });
  await p.pdf({ path: path.resolve(__dirname, '../docs/pyg.pdf'), format: 'A4', printBackground: true, margin: { top: '10mm', bottom: '12mm', left: '8mm', right: '8mm' },
    displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: '<div style="font-size:8px;width:100%;text-align:center;color:#666">Ferjusanz · Cuenta de resultados · página <span class="pageNumber"></span> de <span class="totalPages"></span></div>' });
  await b.close(); console.log('docs/pyg.pdf');
})();
