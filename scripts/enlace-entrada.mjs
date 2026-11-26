// uso: node enlace.mjs <ref> <app> <email> [probar]
import { createRequire } from 'module'; const require = createRequire(import.meta.url);
const [REF, APP, email, probar] = process.argv.slice(2);
const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`, { headers: { Authorization: 'Bearer proxy-injected' } })).json();
const service = keys.find(x => x.name === 'service_role')?.api_key;
const r = await (await fetch(`https://${REF}.supabase.co/auth/v1/admin/generate_link`, { method: 'POST',
  headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'magiclink', email, redirect_to: APP + '/' }) })).json();
const link = r.action_link || r.properties?.action_link; if (!link) throw new Error(JSON.stringify(r).slice(0, 300));
if (!probar) { console.log(link); process.exit(0); }
const { chromium } = require('playwright'); const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
await p.goto(link); await p.waitForTimeout(6000);
console.log('URL final:', p.url().split('#')[0]); await p.screenshot({ path: process.env.S + '/prueba.png' });
await p.reload(); await p.waitForTimeout(4000); await p.screenshot({ path: process.env.S + '/prueba2.png' }); await b.close();
