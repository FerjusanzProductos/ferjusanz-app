# Texto para empezar el chat: separar pruebas y producción

Copiar y pegar en un chat nuevo de Claude Code:

---
Claude, una sola tarea: **diseñar la separación de la app de pruebas (naranja) y la app normal**, que ahora comparten la misma base de datos de Supabase.

Lee primero `docs/ESTADO_ACTUAL.md`, `docs/REGLAS_INTERNAS.md`, `docs/PENDIENTES.md` (apartado «Facturación 2027: lo que falta») y `docs/PLAN_FACTURACION.md`.

Quiero un plan sencillo con:
- Qué se crea (base de datos de pruebas, archivos, contadores, configuración) y qué sigue igual.
- Qué datos se copian a pruebas (clientes, productos, tarifas) y cómo se protegen los datos personales.
- Cómo se evita que una prueba toque pedidos, albaranes, facturas, cobros, clientes o tarifas reales.
- Contadores de prueba aparte, que se puedan poner a cero, y facturas de prueba con la marca «SIN VALOR FISCAL».
- Copias de seguridad y una prueba real de recuperación.
- Coste al mes, riesgos y cómo volver atrás.

**No crees, migres, borres ni publiques nada** hasta que yo lo autorice.
---
