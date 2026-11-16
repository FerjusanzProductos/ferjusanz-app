# Auditoría de seguridad de la app (16/11/2026)

Hecha por Claude con la skill `security-audit`, en modo «rápido» (una pasada, con revisión independiente de cada fallo). Solo se leyó el código y la configuración. La única prueba se hizo en la base de **PRUEBAS** y se deshizo al momento: no queda nada guardado. No se tocó la base real.

## Resumen
La base está bien hecha: cada tabla tiene sus permisos por rol, nadie puede darse de alta solo, los enlaces de clientes son imposibles de adivinar, la app no deja ejecutar textos de clientes o proveedores, y WhatsApp, facturas por correo y copias van con clave o firma.
Hay **4 cosas que arreglar**, ninguna urgente mientras la app no se use de verdad:

| Prioridad | Qué pasa | Arreglo |
|---|---|---|
| 🟡 Media | Quien tenga **un** enlace o QR de un albarán puede dejar su correo y recibir, sin que nadie lo revise, todos los albaranes siguientes de ese cliente y el enlace a su página con todos sus albaranes (hoy 170 de 173 clientes no tienen correo en la ficha). | Mandar solo al correo que la oficina ha aceptado (**decide Fernando**: hoy la regla dice que se manda también al que deja el cliente con el QR). |
| 🟡 Media | El visor de PDF de facturas usa una versión antigua (pdf.js 3.11.174) con un fallo conocido (CVE-2024-4367): un PDF preparado por un proveedor malintencionado podría ejecutar órdenes con la sesión de quien lo abre. | Una línea: `isEvalSupported: false` en el visor, y después actualizar pdf.js. |
| ⚪ Baja | La función del correo de albaranes deja a cualquiera probar el acceso al Gmail sin entrar en la app. | Pedir sesión de admin antes de esa prueba. |
| ⚪ Baja | Desde el formulario de la web, alguien que sepa el teléfono de un contacto puede borrar sus notas antiguas mandando dos mensajes largos. | No recortar las notas que ya había y poner un límite de envíos. |

## Otras mejoras (no son fallos)
- Inicio de sesión: activar la comprobación de contraseñas filtradas y pedir más de 6 caracteres; cambiar la «Site URL» de Supabase (sigue en `localhost`).
- Cuatro funciones publicadas en Supabase no tienen su código en el repositorio (`recibir-factura`, `copia-archivo`, `whatsapp`, `harvey-v2-pruebas`).
- La copia de seguridad depende solo de que su clave sea larga y secreta.
- Cualquier rol (también preparador) puede cambiar tarifas, clientes y productos. Parece querido; si no, se restringe.
- Los importes cobrados/pendientes por pedido los ven todos los roles en una vista, aunque la tabla de cobros es solo de oficina.

El informe técnico completo (con las pruebas) quedó en la sesión de Claude del 16/11/2026.
