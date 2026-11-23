// Tarifas automáticas (colectividades: compra + 0,20 €; hostelería: compra + 0,40 €): recalcula y saca en texto lo que Tito tiene que ver en su correo diario.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/tarifa-colectivos.mjs [horas]   (horas de cambios a enseñar; por defecto 24, el lunes 48)
// Lleva precios de compra: solo para el correo de Fernando, NO para resumen_comercial (lo ven más personas).

const sql = async q => {
  const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', {
    method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return r.json();
};
const eur = n => n == null ? '—' : Number(n).toFixed(2).replace('.', ',') + ' €';
const dm = f => f ? f.slice(8, 10) + '/' + f.slice(5, 7) : '—';
const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }));
const horas = Number(process.argv[2]) || (hoy.getDay() === 1 ? 48 : 24);

await sql('select public.recalcular_listas_auto()');
const listas = await sql(`select id, nombre, margen_auto, margen_kg_caja from listas_precios where margen_auto is not null order by nombre`);
if (!listas.length) { console.log('No hay ninguna lista con precio automático.'); process.exit(0); }
const out = [];
for (const lista of listas) {
const cambios = await sql(`select nombre, unidad, antes, despues, compra, compra_fecha::text, compra_origen from listas_precios_cambios
  where lista_id = '${lista.id}' and creado > now() - interval '${horas} hours' order by nombre`);
const items = await sql(`select nombre, unidad, precio, coste, compra_fecha::text, compra_origen, precio_fijo, auto_aviso,
  (select max(peso_estimado_kg) from formatos_producto f where f.producto_id = i.producto_id and f.formato = 'caja') kg_caja
  from listas_precios_items i where lista_id = '${lista.id}' order by nombre`);

if (out.length) out.push('', '');
out.push(`💶 TARIFA ${lista.nombre.toUpperCase()}: última compra + ${eur(lista.margen_auto)}` +
  (lista.margen_kg_caja ? `; las cajas, + ${eur(lista.margen_kg_caja)} por kilo que traen` : ''));
out.push('', `CAMBIOS (últimas ${horas} h)`);
if (!cambios.length) out.push('• Sin cambios: ninguna compra nueva ha movido los precios.');
for (const c of cambios) {
  const salto = c.antes > 0 ? Math.abs(c.despues - c.antes) / c.antes : 0;
  out.push(`• ${c.nombre}: ${eur(c.antes)} → ${eur(c.despues)}/${c.unidad} (compra ${eur(c.compra)} el ${dm(c.compra_fecha)}, ${c.compra_origen})${salto > 0.25 ? ' ⚠️ salto grande: contrástalo' : ''}`);
}
const viejas = items.filter(i => i.precio != null && !i.precio_fijo && i.compra_fecha && (hoy - new Date(i.compra_fecha)) / 864e5 > 30);
const revisar = items.filter(i => i.auto_aviso);
const sinKilos = lista.margen_kg_caja ? items.filter(x => x.unidad === 'caja' && x.precio != null && !x.precio_fijo && !x.kg_caja) : [];
out.push('', 'PARA CONTRASTAR');
if (!viejas.length && !revisar.length && !sinKilos.length) out.push('• Nada.');
for (const i of viejas) out.push(`• ${i.nombre}: la última compra es del ${dm(i.compra_fecha)} (más de un mes). ¿Sigue valiendo ${eur(i.coste)}?`);
for (const i of revisar) out.push(`• ${i.nombre} (${i.unidad}): ${i.auto_aviso}.`);
for (const i of sinKilos) out.push(`• ${i.nombre}: no sé cuántos kilos trae la caja; lleva + ${eur(lista.margen_auto)}. Dime los kilos.`);
out.push('', 'LISTA COMPLETA (precio · compra · fecha · de dónde)');
for (const i of items.filter(x => x.precio != null))
  out.push(`• ${i.nombre}: ${eur(i.precio)}/${i.unidad}` + (i.precio_fijo ? ' (fijo, puesto por ti)' : i.auto_aviso ? ' (precio antiguo: revísalo)' : ` · ${eur(i.coste)} · ${dm(i.compra_fecha)} · ${i.compra_origen}`));
}
console.log(out.join('\n'));
