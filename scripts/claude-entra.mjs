// Claude entra solo en la app de PRUEBAS (naranja) y hace una captura.
// No crea usuarios ni cambia contraseñas: pide a Supabase un enlace de entrada de un solo uso.
// Necesita la llave de api.supabase.com del entorno de Claude (la pone el proxy).
// Uso: node scripts/claude-entra.mjs [usuario] [captura.png]
//   usuario por defecto: fernando@pruebas.invalid (admin). Otros: oficina@, compras@, preparador@, repartidor@ …@pruebas.invalid
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright'); // el playwright ya instalado en el entorno

const REF = 'pbeuxbwbpmlanbhhnpgy'; // solo la base de PRUEBAS, nunca la real
const APP = 'https://ferjusanz-pruebas.fernandosanzalba.workers.dev';
const email = process.argv[2] || 'fernando@pruebas.invalid';
const captura = process.argv[3] || 'entrada.png';
if (!email.endsWith('@pruebas.invalid')) throw new Error('Solo usuarios @pruebas.invalid');

const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys?reveal=true`,
  { headers: { Authorization: 'Bearer proxy-injected' } })).json();
const k = n => keys.find(x => x.name === n)?.api_key;
const service = k('service_role'), anon = k('anon');
if (!service || !anon) throw new Error('No se pudieron leer las claves de pruebas: ' + JSON.stringify(keys).slice(0, 200));

const base = `https://${REF}.supabase.co/auth/v1`;
const link = await (await fetch(`${base}/admin/generate_link`, {
  method: 'POST', headers: { apikey: service, Authorization: `Bearer ${service}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'magiclink', email }) })).json();
const hash = link.hashed_token || link.properties?.hashed_token;
if (!hash) throw new Error('Sin enlace de entrada: ' + JSON.stringify(link).slice(0, 200));
const sesion = await (await fetch(`${base}/verify`, {
  method: 'POST', headers: { apikey: anon, 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'magiclink', token_hash: hash }) })).json();
if (!sesion.access_token) throw new Error('No se pudo entrar: ' + JSON.stringify(sesion).slice(0, 200));
sesion.expires_at ??= Math.floor(Date.now() / 1000) + sesion.expires_in;

const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage();
await page.goto(APP);
await page.evaluate(([key, val]) => localStorage.setItem(key, val), [`sb-${REF}-auth-token`, JSON.stringify(sesion)]);
await page.reload({ waitUntil: 'networkidle' });
await page.screenshot({ path: captura });
console.log('Dentro como', email, '· versión', await page.evaluate(async () => (await (await fetch('/sw.js')).text()).match(/ferjusanz-v\d+/)?.[0]), '· captura:', captura);
await browser.close();
