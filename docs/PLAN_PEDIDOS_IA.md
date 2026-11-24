# Plan: «Bandeja de pedidos» con IA (mejor que Bliko)
_Pedido por Tito el 24/11/2026 tras ver el anuncio de Bliko (bliko.ai) en Instagram: «copiarlo, mejorarlo, integrarlo en la app; luego venderlo a más empresas»._

## Qué hace Bliko (de su web y su Instagram)
- Recibe pedidos por **WhatsApp, correo e integración**, en **texto, audio, PDF, Excel e imagen** (también listas a mano).
- Lo convierte en un **pedido para revisar**: cantidad, unidad, producto con su código del catálogo.
- **Memoria por cliente** («lo de la semana pasada») y **aprende de cada corrección**.
- Lo mete en el programa de gestión (SAP, Sage, Business Central…) por **API** o con un **«Agente Local»** que teclea en el ordenador. Chat IA sobre los datos.
- Fundadores: Joan Jover y socio (empresa del padre: Jover Pons S.L., distribución). No publican precios: «Agenda una demo» / «Empezar gratis».

## Cuánto cobrarían (estimación de Claude, sin confirmar)
No publican tarifas y su web no se abre desde el entorno de Claude. Por lo que cobran herramientas parecidas de entrada de pedidos para distribuidores:
| Tamaño | Puesta en marcha | Cuota |
|---|---|---|
| Mayorista pequeño (≤ 30 pedidos/día) | 0–1.000 € | **150–400 €/mes** |
| Mediano, con conexión al ERP | 1.000–3.000 € | **400–1.000 €/mes** |
| Grande | a medida | 1.000 €/mes o más (o ~0,5–1 € por pedido) |
Para Ferjusanz, lo normal sería **200–400 €/mes** (2.400–4.800 €/año). Para confirmarlo: pedir la demo y preguntar el precio.

## Lo que ya tenemos (24/11/2026)
- Función `whatsapp` (360dialog, silenciosa) + tabla `whatsapp_pedidos` + pantalla «💬 WhatsApp · pedidos» (en PRUEBAS). Lee texto y fotos (Claude) y audios (Gemini). Falta la API key de 360dialog.
- Harvey 2: convierte un WhatsApp pegado en un borrador.
- Historial de Golden (`golden_*`): lo que pide cada cliente y cuándo. **Bliko no tiene esto el primer día; nosotros sí.**

## Cómo lo hacemos mejor
1. **Una sola bandeja** «📥 Pedidos entrantes»: WhatsApp, correo, pegar texto, foto, audio, PDF y Excel.
2. **Pedido propuesto antes de que lo pidan** (con Golden): «Bar X suele pedir hoy esto» y aviso si falta algo habitual («¿hoy no quiere patatas?").
3. **Aprende de las correcciones**: tabla de alias por cliente («las rojas» = PIMIENTO ROJO para el bar X).
4. **Comprobaciones de mayorista**: cajas enteras, kilos raros, productos fuera de temporada, cliente con deuda (reglas de `REGLAS_INTERNAS.md`).
5. **Del móvil**, pensado para Mercamadrid (vocabulario de frutería y hostelería).

## Pasos
| # | Qué | Coste | Quién |
|---|---|---|---|
| 1 ✔ (24/11: bandeja pruebas v561; Excel, audio y foto con IA también en normal v556) | Bandeja única en PRUEBAS: pegar texto, foto, audio, PDF/Excel → propuesta con emparejado al catálogo | 0 € (Gemini gratis / Claude céntimos) | Claude |
| 2 ✔ (24/11: normal v558, pruebas v565) | Memoria por cliente (Golden) + alias que aprende de las correcciones | 0 € | Claude |
| 3 | Correo: `pedidos@ferjusanz-frutas-verduras.es` → Cloudflare Email Routing → bandeja | 0 € | Claude + Tito (activar Email Routing) |
| 4 | WhatsApp automático (609 100 690) | 360dialog 49 €/mes | Tito (API key) + Claude |
| 5 | Pasar a Golden (cuando se decida cómo: exportar o teclear) | por ver | más adelante |
| 6 | Versión para otras empresas: multiempresa, página propia, nombre y SEO | dominio ~10 €/año | cuando la nuestra funcione |

**Gratis del todo**: pasos 1–3 (sin WhatsApp automático: se reenvía o se pega). **Pagando**: + paso 4 (≈ 50–70 €/mes con la IA), frente a los 200–400 €/mes estimados de Bliko.

## Venderlo a otras empresas (fase 2)
- Primero que funcione en Ferjusanz 1–2 meses: es la mejor demo («lo usamos nosotros en Mercamadrid»).
- Nicho para ganar en Google: **mayoristas de fruta y verdura y distribuidores de hostelería en España** (búsquedas tipo «pedidos WhatsApp mayorista fruta»). Bliko va a todo tipo de distribuidor; nosotros, al sector que conocemos.
- No se puede prometer salir el primero en Google; se trabaja con una página propia, artículos y casos reales.
