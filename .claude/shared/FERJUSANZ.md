# Reglas de Ferjusanz para las skills de «Small Business» (Anthropic)

Estas 10 skills vienen del plugin oficial «Small Business» de Anthropic
(anthropics/knowledge-work-plugins, licencia Apache 2.0, ver `LICENSE-small-business`).
Están pensadas para EE. UU.; en Ferjusanz mandan estas reglas por encima de lo que diga la skill:

1. **Idioma y moneda**: todo en español, euros, fechas dd/mm/aaaa, IVA español (ver `docs/REGLAS_INTERNAS.md`). Nada de 1099, payroll de EE. UU. ni impuestos de EE. UU.
2. **Datos reales**: solo el historial de Golden Soft (tablas `golden_*`), clientes, productos, contactos (prospectos) y facturas de proveedores. Los pedidos, previstos y cobros de la app son de PRUEBA: no sacar conclusiones ni mensajes a clientes de ellos (CLAUDE.md, regla 5).
3. **Solo leer y preparar**: Claude prepara listas y borradores; **nunca envía** correos, WhatsApp ni mensajes, ni registra pagos, ni cambia datos. Fernando revisa y envía cada mensaje. Nada de conectar cuentas nuevas (QuickBooks, HubSpot, Stripe, Apollo…).
4. **Base de datos**: solo consultas de lectura (SELECT) en Supabase. Cualquier cambio sigue la regla 7 de CLAUDE.md («Autorizo»).
5. **Clientes**: bares, restaurantes, fruterías y tiendas que compran fruta, verdura, patatas y huevos en Mercamadrid. El ritmo normal de compra es diario o semanal, no trimestral.
6. Contratos (`contract-review`): explicación en lenguaje sencillo; no es asesoría legal, recomendar revisarlo con el gestor/abogado.

Las skills mencionan otras del plugin que NO están instaladas (crm-autopilot, review-reputation, build-connector, speed-to-lead…): saltarse esos pasos y seguir con lo que se pueda.
