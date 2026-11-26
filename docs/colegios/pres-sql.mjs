// Presentaciones «Volvamos a cuidar su comedor» (Tito, 26/11/2026) + lista «Precios para colegios» con la regla de ofertas − 0,20.
import fs from 'fs';
const L = s => "'" + String(s).replace(/'/g, "''") + "'";
const J = o => L(JSON.stringify(o)) + '::jsonb';
const precios = JSON.parse(fs.readFileSync('precios.json'));
const LISTA = 'Precios para colegios · noviembre 2026';
const contacto = { t: 'contacto', titulo: 'Fernando Sanz, su contacto directo', lineas: ['Móvil: 609 567 354', 'Visita, reunión o muestras sin compromiso', 'WhatsApp pedidos: 609 100 690 · Tel. 91 763 21 86', 'Sin pedido mínimo · reparto refrigerado', 'Carare, 2 – 28033 Madrid · ferjusanz@hotmail.com'] };
const riesgo = { t: 'texto', titulo: 'El riesgo del catering', texto: 'La OCU concluye que cocinar en el centro da mejor resultado. La línea fría llega hecha, se enfría y se recalienta en el colegio.', cifras: [['7 de 10', 'usan línea fría (OCU)'], ['1 de 3', 'alumnos: comida mala'], ['+20', 'colegios en huelga (2026)'], ['Gusanos', 'en el arroz (2026)']] };
const ley = { t: 'texto', titulo: 'Lo que ya exige la ley', texto: 'Real Decreto 315/2025 de comedores escolares: más fruta fresca y más temporada, sin subir el menú.', cifras: [['4-5', 'días de fruta fresca'], ['45 %', 'de temporada'], ['0 €', 'de subida del menú'], ['16/04/2027', 'obligatorio en privados']] };
const cuidado = { t: 'lista', titulo: 'Con nosotros, su comedor está cuidado', puntos: ['Género elegido cada mañana en Mercamadrid', 'Fruta en calibre pequeño para los niños', 'Verdura para cremas, purés y legumbres', 'Patata pelada y cortada a su medida', 'Reparto refrigerado, sin pedido mínimo', 'Trato de casa: como si fueran nosotros'] };
const quienes = { t: 'texto', titulo: 'Quiénes somos', texto: 'Empresa familiar de Mercamadrid, con agricultores de confianza.', cifras: [['3ª', 'generación familiar'], ['+60', 'años en el sector'], ['+200', 'productos frescos'], ['Diario', 'elegido cada mañana']] };
const productos = { t: 'productos', titulo: 'Todo lo que necesita su cocina', items: ['Fruta de temporada', 'Verduras y hortalizas', 'Patatas y patata pelada', 'Cebollas, ajos y puerros', 'Legumbres', 'Huevos', 'Setas y champiñones', 'Hierbas aromáticas'], fotos: {} };
const ofertas = { t: 'ofertas', titulo: 'Ofertas de esta semana', texto: 'Pregunte por las ofertas de esta semana.' };
const tarifa = { t: 'precios', titulo: 'Precios para colegios', lista_id: '__LISTA__', soloEnvio: true, nota: 'Ofertas ★ hasta el 30/11/2026; el resto, según mercado. Precios sin IVA.', _tipo: 'colectivos' };
const portada = sub => ({ t: 'portada', titulo: 'Volvamos a cuidar juntos su comedor', sub, pie: 'Ferjusanz · Mercamadrid · tercera generación' });

const pres = {
  'Visita · Colegio Ábaco': [portada('Para Mónica y el equipo del Colegio Ábaco'),
    { t: 'lista', titulo: 'Ya trabajamos juntos', puntos: ['Durante años servimos su fruta y verdura', 'Conocemos su cocina y su forma de trabajar', 'Hoy volvemos con más género y mejor precio', 'Y con la misma familia al frente'] },
    { t: 'lista', titulo: 'Lo que dicen las familias', puntos: ['«La alimentación era buena hasta que se cambió el menú»', 'La comida, «comible pero bastante mejorable»', 'El comedor ha subido de precio', 'Opiniones publicadas en internet (resumen)'] },
    { t: 'texto', titulo: 'El comedor, en cifras', texto: 'Precio del comedor publicado en fichas de colegios (por mes).', cifras: [['≈ 140 €', 'opinión de 2020'], ['178 €', 'ficha publicada hoy'], ['+27 %', 'de subida'], ['Fresco', 'sin subir el coste']] },
    riesgo, ley, cuidado, productos, ofertas, contacto, tarifa],
  'Visita · Colegio Arcángel': [portada('Para el equipo de cocina del Colegio Arcángel'),
    { t: 'lista', titulo: 'Ya trabajamos juntos', puntos: ['Durante años servimos su fruta y verdura', 'Hoy tienen cocina y equipo propio', 'Es la mejor baza de un comedor', 'Nosotros llenamos esa cocina de producto fresco'] },
    { t: 'texto', titulo: 'Lo que ya tienen ganado', texto: 'Su web lo dice: «cocina y equipo propio» para menús adaptados a alergias e intolerancias.', cifras: [['Propia', 'cocina y equipo'], ['9', 'menús especiales'], ['≈ 250', 'plazas de comedor'], ['Diario', 'género fresco']] },
    riesgo, ley, cuidado, productos, ofertas, contacto, tarifa],
  'Visita · Colegio Alameda de Osuna': [portada('Para el equipo del comedor del Colegio Alameda de Osuna'),
    { t: 'lista', titulo: 'Ya trabajamos juntos', puntos: ['Durante años servimos su fruta y verdura', 'Conocemos su cocina y su forma de trabajar', 'Hoy volvemos con más género y mejor precio', 'Y con la misma familia al frente'] },
    { t: 'lista', titulo: 'Lo que dicen las familias', puntos: ['Hay quien califica la comida de «terrible» o «pésima»', 'Otros: variedad «aceptable pero mejorable para su precio»', 'El colegio está bien valorado; el comedor, no tanto', 'Opiniones publicadas en internet (resumen)'] },
    { t: 'texto', titulo: 'El colegio, en internet', texto: 'Nota general publicada del colegio; las críticas se centran en el comedor.', cifras: [['4,63', 'buscocolegio (30)'], ['3,6', 'iSchoolAdvisor (5)'], ['≈ 169 €', 'comedor/mes (2018)'], ['Fresco', 'lo que mejoramos']] },
    riesgo, ley, cuidado, productos, ofertas, contacto, tarifa],
  'Visita · Colegios: comedor fresco frente al catering': [portada('Fruta y verdura fresca de Mercamadrid para su comedor'), quienes, riesgo, ley, cuidado, productos, ofertas, contacto, tarifa],
};

const items = precios.map((p, i) => `(${L(p.nombre)},${p.precio},${L(p.unidad)},${i})`).join(',');
const sql = `with l as (insert into listas_precios (nombre, tipo, titulo, subtitulo, incluir_recomendaciones)
  select ${L(LISTA)}, coalesce((select tipo from listas_precios where nombre like 'Colegios, residencias%' limit 1),'otra'), 'Precios para colegios', 'Ofertas ★ hasta el 30/11/2026', false
  where not exists (select 1 from listas_precios where nombre=${L(LISTA)}) returning id),
lid as (select id from l union all select id from listas_precios where nombre=${L(LISTA)}),
it as (insert into listas_precios_items (lista_id, producto_id, nombre, precio, unidad, orden, precio_fijo)
  select (select id from lid limit 1), (select i.producto_id from listas_precios_items i join listas_precios c on c.id=i.lista_id where c.nombre like 'Colegios, residencias%' and i.nombre=v.n limit 1), v.n, v.p, v.u, v.o, true
  from (values ${items}) v(n,p,u,o) where exists (select 1 from l) returning 1)
select (select id from lid limit 1) lista, (select count(*) from it) items;`;
fs.writeFileSync('sql-lista.json', JSON.stringify({ query: sql }));
const pres2 = lista => Object.entries(pres).map(([t, d]) => `delete from presentaciones where titulo=${L(t)}; insert into presentaciones (titulo, diapositivas) select ${L(t)}, ${J(JSON.parse(JSON.stringify(d).replaceAll('__LISTA__', lista)))};`).join('\n');
fs.writeFileSync('pres2.mjs.out', '');
export { pres2 };
if (process.argv[2]) fs.writeFileSync('sql-pres.json', JSON.stringify({ query: pres2(process.argv[2]) + ' select titulo, jsonb_array_length(diapositivas) from presentaciones where titulo like $$Visita · %$$;' }));
