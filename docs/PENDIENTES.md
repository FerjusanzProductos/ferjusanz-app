# Pendientes de FERJUSANZ
_Mantener al día: al terminar una tarea, marcarla ✔️ y pasarla a HISTORIAL.md. Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda._

## Por publicar o decidir
- ✔️ 11/11/2026: **Arreglos de «Pasar a otro día» + «⚠️ Raros»** publicados en la normal (v202) con «Autorizo publicar».
- ✔️ 11/11/2026: **Pasar previstos a otro día** publicado en la normal (v199). Ojo: la app de pruebas (v198) ya no lleva el «Seguimiento comercial» (rama `seguimiento-app`, en espera).
- ✔️ 11/11/2026: TODO lo de pruebas publicado en la normal (v194): Informes para Jorge, ayuda guiada 🆘, Harvey con WhatsApp natural, Precios / facturas y «lo de siempre» con Golden.
- 🟡 Desde ahora la app de pruebas sale de `main` (+ el cambio que se esté probando). No volver a dejar cosas solo en pruebas.
- 🟡 Juntar la rama `memoria-permanente` (estos documentos) con main y borrar las ramas ya incluidas.
- ⚪ Borrar el Worker antiguo `ferjusanz` en Cloudflare.

## Pedido por Fernando el 10/11/2026 (pantalla Precios / facturas de proveedor) — ✔️ publicado (v190)
- ✔️ Publicado en la app normal (v190) el 11/11/2026 con «Autorizo publicar».
- 🟡 **Fernando decide**: corregir en la ficha de los productos la unidad de venta (ahora todos salen «kg»): Arándano (513) y Frambuesa (310) → bandeja; Ensalada Campestre (137-P) → bolsa. Mora del bosque (257) → bandeja (confirmado 11/11). Mientras tanto la app ya usa la unidad buena al leer facturas y al apuntar precios.

## Revisado el 11/11/2026 (para cuando se empiece de verdad)
- ✔️ **Unidades de TODOS los productos**: aplicado el 11/11/2026 (Fernando lo pegó en el editor SQL de Supabase). 37 productos por caja, bandeja, bolsa, pieza, manojo o docena, cobrados por unidad; pedidos fijos y previstos también. Los previstos nuevos ya salen bien.
- ✔️ **«Lo de siempre» con Golden**: publicado (v194) y función `memoria_golden` creada en Supabase el 11/11/2026: lo ve todo el equipo (sin precios).
- 🟢 **Trazabilidad**: hecha y lista (lote más antiguo, reparto, confirmar todo). Empieza a funcionar sola en cuanto se registren compras con lotes.

## En marcha (11/11/2026)
- ⏸ **Seguimiento comercial dentro de la app**: hecho en PRUEBAS (v197, rama `seguimiento-app`). **En espera hasta que se empiece a usar la app de verdad** (Fernando, 11/11: hasta entonces los previstos son de prueba y no hay cobros). La tarea programada de Claude (`trig_016V26ajMMcPLQ3Zvg1C2dw2`) está PAUSADA por lo mismo. Falta crear en Supabase la tabla, la función y el programador (`supabase/migrations/20261111c_seguimiento_diario.sql`) con Fernando delante («listo») o pegándolo él en el editor SQL. Luego probar, «Autorizo publicar» y **quitar la tarea programada de Claude** (`trig_016V26ajMMcPLQ3Zvg1C2dw2`) para no duplicar.
- 🟡 **Web `www.ferjusanz-frutas-verduras.es`** (revisada el 11/11/2026, sin tocar nada): WordPress con plantilla Divi, hecha por **Creativate.es** («Hecho con ♥ por Creativate.es»). Web, DNS y correo del dominio en el mismo alojamiento (servidores `controldeservidor.com`, IP 217.61.210.26). La web enseña `ferjusanz@hotmail.com`, 91 763 21 86 y 609 100 690; tiene Google Tag Manager y botón de WhatsApp. Página antigua de COVID todavía publicada.
  - 🟡 **Quitar la página de COVID** (pedido por Fernando el 11/11/2026): es «Entrega a domicilio» del menú principal (`/servicios-de-distribucion-y-exportacion/entrega-a-domicilio-frutas-y-verduras-por-covid19/`). Claude no tiene acceso a WordPress: se lo pide Fernando a Creativate (quitarla del menú, despublicarla y redirigir esa dirección a la portada). Si algún día tenemos los accesos, lo hace Claude.
  **Plan completo, preguntas, riesgos y costes: `docs/PLAN_WEB.md`** (11/11/2026). Siguiente paso: Fernando mira contrato/facturas de Creativate y les envía las preguntas.
  Plan: dejar a Creativate, pedirles código de transferencia del dominio (y confirmar que el titular es FERJUSANZ), accesos de WordPress y del alojamiento, copia completa, buzones de correo del dominio (si los hay) y acceso a Google Tag Manager/Analytics. Que NO borren nada hasta el traslado. Luego la llevamos nosotros con Claude.
- 🟡 **Llamada con Jorge (contable)**: preguntas preparadas en la sesión del 11/11.

## Esperando a Fernando
- 🟡 Confirmar la **lista completa de clientes sin IVA (azul)** y si «Bar Delfín» es la misma ficha que «Bar Delfines» (DEFINES).
- 🟡 **Numeración real de albaranes**: al empezar de verdad, decir el último número de Golden (serie F).
- ⚪ **Cambio de temporada de patata** (09-F → 01-F) cuando lo diga («cambio de temporada patata»).
- ⚪ **WhatsApp automático** desde el 609 567 354 (API de Meta): aparcado hasta que lo diga.
- 🟡 Poner las claves de los conectores de Claude: `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY` y `POSTHOG_API_KEY`.
- 🟡 En GitLab, activar la copia automática a GitHub (Settings → Repository → Mirroring repositories). Mientras tanto, Claude copia a mano después de cada cambio.

## Mejoras pedidas (de `claude/08-textos-para-empezar-chats/PROMPTS.md`; recomendado empezar por la 3 y la 6)
1. 🟡 Revisión de diseño y usabilidad en el móvil (lista priorizada, sin cambiar nada hasta elegir).
2. ⚪ Agente buscador de clientes nuevos con cocina propia (Madrid norte y noroeste, Segovia), sin duplicados.
3. ⏸ **Agente de seguimiento diario**: preparado (tarea de Claude pausada y versión dentro de la app en pruebas). Se activa el día que se empiece con la app.
4. ⚪ Agente de ofertas semanales por tipo de cliente.
5. 🟡 Agente de cobros: deudas por urgencia y recordatorios.
6. 🔴 **Agente de compras y facturas**:
   - ✔️ **Precios raros**: publicado (v202), pestaña «⚠️ Raros» en Precios de compra.
   - ⚪ Productos mal apuntados según las reglas internas (fcRegla*).
   - ✔️ **Margen / subidas («📈 Suben»)**: publicado (v204). Sin % fijo: compara con la media de los 14 días anteriores de cada producto (decisión de Fernando).
   - ⚪ Comprobador Golden ↔ albaranes: **esperando el archivo de ejemplo** de Golden.
7. 🟡 Harvey orquestador v2: apuntar contactos, confirmar previstos, pedidos desde WhatsApp y recordatorios de cobro (siempre con confirmación).
8. 🔴 **Copia de seguridad de fotos, PDF y audios** de Supabase Storage (ahora no se copian).

## Comprobaciones técnicas
- ⚪ Poner al día `claude/08-textos-para-empezar-chats/PROMPT_FERNANDO_NUEVO_CHAT.md` (tiene ramas antiguas y dice que GitHub está suspendido).
- 🟡 Comprobar que la copia nocturna de GitLab se está ejecutando y que se puede restaurar.
- ⚪ Auditoría de seguridad de la app y de Supabase (skill `security-audit`).
- ⚪ Hacer más pequeño `public/index.html` (más de 1 MB) para que cargue más rápido.
