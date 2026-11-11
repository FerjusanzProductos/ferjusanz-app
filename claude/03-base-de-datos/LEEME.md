# 03 · Base de datos (Supabase)

## Para qué sirve
Donde se guarda todo: clientes, productos, pedidos, albaranes, cobros, tarifas, facturas de proveedor,
contactos (prospectos), fichajes, el histórico de **Golden** (`golden_*`) y lo de Harvey.
Proyecto Supabase `hvydnjaswdexttogsyen`. La app normal y la de pruebas usan **la misma base**.

**Datos reales hoy**: histórico de Golden, clientes, productos, contactos y facturas de proveedores.
**De prueba**: pedidos, previstos y cobros de la app (el trabajo real sigue en Golden Soft).

## Dónde está
- `supabase/migrations/`: cada cambio de la base, con fecha (p. ej. `20261111b_unidades_libro_ventas.sql`).
- `supabase/contador_a_cero.sql`: «contador a cero» (quita pedidos de prueba y vuelve a F-1).
- Registro de cambios: tabla `historial` (quién cambió qué y cuándo).

## Tareas que hace Claude aquí
- **Consultar** datos para responder preguntas o preparar informes (solo lectura).
- **Preparar cambios**: escribe el SQL, te lo **enseña y explica**, y lo lanza solo cuando dices «**listo**» con la conversación abierta (los avisos caducan al minuto). Si no puedes, te da el SQL para pegarlo en el editor de Supabase.
- «Contador a cero» cuando lo pidas (enseñando antes qué se borra).
- Revisar avisos de seguridad y rendimiento de Supabase.
- **Nunca** borra datos, cambia precios ni toca facturas, cobros o permisos sin tu confirmación.
