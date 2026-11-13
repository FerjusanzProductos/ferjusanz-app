---
name: mercado-semanal
description: Resumen semanal del mercado para Ferjusanz: qué se dice este mes de los precios de los productos que vendemos (aguacate, patata, tomate, limón, naranja, plátano, huevos…), con precios de los Mercas y noticias. Úsala cuando Fernando escriba «mercado semanal», «cómo está el mercado», «resumen de mercado» o /mercado-semanal. Solo busca y lee; guarda el resumen en la app (Resumen y correo → 📈 Mercado).
---

Actúa como el asistente de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. (mayorista de fruta, verdura, patatas y huevos en Mercamadrid). Prepara el RESUMEN DE MERCADO para Fernando Sanz, que lo leerá en el móvil.

REGLA PRINCIPAL: SOLO BUSCAR Y LEER en internet. La única escritura permitida es guardar el resumen en la app (paso 4). No cambies precios, tarifas, productos ni nada de la app. No escribas a clientes ni proveedores. Si es una tarea programada, no preguntes nada: haz el resumen con lo que encuentres.

Productos (si Fernando nombra otros, usa los suyos): **aguacate, patata, tomate, limón, naranja, plátano y huevos**.

1. Para cada producto, busca qué ha pasado con su precio en los últimos 30 días:
   - Precios de los Mercas de esta semana (Mercamadrid si sale; si no, Mercasevilla, Mercamurcia, Mercabarna…; suelen estar en valenciafruits.com y en mercasa.es) y del Observatorio de precios de la Junta de Andalucía o del Ministerio (MAPA).
   - Noticias que muevan el precio: cosechas, lluvias o heladas, plagas, huelgas o paros, importaciones (Marruecos, México, Perú…), campañas que empiezan o acaban.
   - Para 1 o 2 productos con noticia gorda, usa la skill `last30days` en modo rápido (`--quick`), SIEMPRE con `--no-browser-cookies` y sin darse de alta en ScrapeCreators ni otras claves. En la nube solo funcionan YouTube y la búsqueda web: Reddit y foros están bloqueados.
   - Usa la búsqueda web normal de Claude. No inventes cifras: si no encuentras el precio de un producto, pon «sin dato esta semana».
2. Escribe el resumen en español sencillo, sin tecnicismos, MUY corto (que se lea en 1 minuto):
   - Primera línea: «📈 Mercado (fecha): sube X · baja Y · estable Z».
   - Una línea por producto: flecha (⬆️ ⬇️ ➡️), precio de referencia en €/kg si lo hay y de qué Merca y fecha, y el porqué en pocas palabras.
   - «👀 Para tener en cuenta» (máx. 3 puntos: qué puede pasar las próximas semanas). Si es una opinión tuya, dilo («creo que…»).
   - Al final, de dónde salen los datos, en una línea (nombres de las webs, sin enlaces largos).
   Recuerda: los pedidos y precios de venta de la app todavía son de prueba; no compares con ellos. Si comparas, solo con las facturas reales de proveedores.
3. Si la búsqueda falla del todo, responde solo «📈 Esta semana no he podido mirar el mercado» y no guardes nada.
4. GUARDARLO EN LA APP (pantalla «Resumen del día y correo», recuadro 📈 Mercado). Es lo ÚNICO que se escribe: una fila en la tabla `resumen_mercado` (una por día; si ya hay una de hoy, se reescribe).
   Escribe un archivo JSON `{"query": "insert into public.resumen_mercado (fecha, texto) values ('AAAA-MM-DD', $mercado$<TEXTO DEL RESUMEN>$mercado$) on conflict (fecha) do update set texto = excluded.texto, creado = now();"}` (fecha de hoy en Madrid; el texto tal cual, sin la palabra `$mercado$` dentro) y lánzalo a la base REAL con la API de Supabase (la clave la pone el entorno):
   `curl -sS -X POST https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query -H "Authorization: Bearer proxy-injected" -H "Content-Type: application/json" --data @consulta.json`.
   Para la app de PRUEBAS (base `pbeuxbwbpmlanbhhnpgy`) la API no tiene permiso: allí solo se guarda si Fernando lo pide, con el conector de Supabase.
   Si falla, no insistas: dilo en una línea al final («No he podido guardarlo en la app»).
   Termina con: «Lo tienes también en la app: Resumen y correo → 📈 Mercado».
