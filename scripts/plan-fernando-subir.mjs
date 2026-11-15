// Sube a la tabla plan_fernando (tarjetas «solo para Fernando» de la app) los textos de docs/plan-fernando/.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/plan-fernando-subir.mjs <ref>   (real hvydnjaswdexttogsyen · pruebas pbeuxbwbpmlanbhhnpgy)
import { readFileSync } from 'node:fs';
const ref = process.argv[2]; if (!ref) { console.error('Falta el ref del proyecto'); process.exit(1); }
const planes = [
  ['jorge', '🧮 Para hablar con Jorge', 'https://claude.ai/artifact/5qQe3mrM3E9wHwrQACgkmG'],
  ['marketing', '📣 Google y redes: plan de fotos, artículos y vídeos', 'https://claude.ai/artifact/VSPKY1BfUkgc5CVJkm53hi'],
];
const q = s => "'" + s.replace(/'/g, "''") + "'";
const sql = planes.map(([c, t, e]) => `insert into public.plan_fernando (clave,titulo,texto,enlace,actualizado) values (${q(c)},${q(t)},${q(readFileSync(new URL(`../docs/plan-fernando/${c}.txt`, import.meta.url), 'utf8'))},${q(e)},now())
 on conflict (clave) do update set titulo=excluded.titulo, texto=excluded.texto, enlace=excluded.enlace, actualizado=now();`).join('\n');
const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, { method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sql }) });
console.log(r.status, await r.text());
