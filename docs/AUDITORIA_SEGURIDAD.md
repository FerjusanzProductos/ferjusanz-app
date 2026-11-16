# Auditoría de seguridad de la app (16/11/2026)

Hecha por Claude con la skill `security-audit`, en modo «rápido» (una pasada, con revisión independiente de cada fallo). Solo se leyó el código y la configuración. La única prueba se hizo en la base de **PRUEBAS** y se deshizo al momento: no queda nada guardado. No se tocó la base real.

## Resumen
La base está bien hecha: cada tabla tiene sus permisos por rol, nadie puede darse de alta solo, los enlaces de clientes son imposibles de adivinar, la app no deja ejecutar textos de clientes o proveedores, y WhatsApp, facturas por correo y copias van con clave o firma.
Había **4 cosas que arreglar**. **Arregladas el 16/11/2026** con el «sí» de Fernando (app normal v350 y funciones `albaranes-correo` y `web-contacto` en las dos bases):

| Prioridad | Qué pasa | Arreglo |
|---|---|---|
| 🟡 Media | Quien tenga **un** enlace o QR de un albarán puede dejar su correo y recibir, sin que nadie lo revise, todos los albaranes siguientes de ese cliente y el enlace a su página con todos sus albaranes (hoy 170 de 173 clientes no tienen correo en la ficha). | ✅ Ahora solo se manda al correo de la ficha o al que la oficina ha aceptado. |
| 🟡 Media | El visor de PDF de facturas usa una versión antigua (pdf.js 3.11.174) con un fallo conocido (CVE-2024-4367): un PDF preparado por un proveedor malintencionado podría ejecutar órdenes con la sesión de quien lo abre. | ✅ `isEvalSupported: false` en el visor (pdf.js sigue en 3.11.174; actualizarlo cuando se toque el visor). |
| ⚪ Baja | La función del correo de albaranes deja a cualquiera probar el acceso al Gmail sin entrar en la app. | ✅ Ahora pide sesión, y la prueba de Gmail solo la puede hacer un admin. |
| ⚪ Baja | Desde el formulario de la web, alguien que sepa el teléfono de un contacto puede borrar sus notas antiguas mandando dos mensajes largos. | ✅ Ya no se borra nada; como mucho 3 mensajes por contacto al día y 30 contactos nuevos al día. |

## Otras mejoras (no son fallos)
- Inicio de sesión: activar la comprobación de contraseñas filtradas y pedir más de 6 caracteres; cambiar la «Site URL» de Supabase (sigue en `localhost`).
- Cuatro funciones publicadas en Supabase no tienen su código en el repositorio (`recibir-factura`, `copia-archivo`, `whatsapp`, `harvey-v2-pruebas`).
- La copia de seguridad depende solo de que su clave sea larga y secreta.
- Cualquier rol (también preparador) puede cambiar tarifas, clientes y productos. Parece querido; si no, se restringe.
- Los importes cobrados/pendientes por pedido los ven todos los roles en una vista, aunque la tabla de cobros es solo de oficina.

El informe técnico completo (con las pruebas) quedó en la sesión de Claude del 16/11/2026.
