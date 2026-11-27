// Puesto de Ferjusanz en Google Maps para cada término de terms.txt. Uso: cd scripts/seo && node pos.cjs terms.txt
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ locale: 'es-ES', viewport: { width: 1400, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
  const out = [];
  for (const q of fs.readFileSync(process.argv[2], 'utf8').split('\n').filter(Boolean)) {
    try {
      await p.goto('https://www.google.com/maps/search/' + encodeURIComponent(q) + '/@40.4168,-3.7038,11z?hl=es', { timeout: 30000 });
      const btn = p.locator('button:has-text("Aceptar todo")').first(); if (await btn.count()) await btn.click();
      await p.waitForTimeout(5000);
      for (let i = 0; i < 4; i++) { await p.locator('div[role="feed"]').evaluate(e => e.scrollBy(0, 3000)).catch(() => {}); await p.waitForTimeout(1500); }
      const names = await p.$$eval('a.hfpxzc', as => as.map(a => a.getAttribute('aria-label')));
      const i = names.findIndex(n => /ferjusanz/i.test(n || ''));
      out.push({ q, pos: i < 0 ? null : i + 1, total: names.length, top3: names.slice(0, 3) });
      console.log(q, '=>', i < 0 ? `no sale (de ${names.length})` : `puesto ${i + 1} de ${names.length}`, '| 1.º:', names[0]);
    } catch (e) { console.log(q, 'ERROR', e.message.slice(0, 80)); }
  }
  fs.writeFileSync('pos.json', JSON.stringify(out, null, 1));
  await b.close();
})();
