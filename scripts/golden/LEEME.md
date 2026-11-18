# Golden → app (automático)

Golden Soft 4.5.7 (TeamSystem), módulo Facturación .Net, guarda todo en **SQL Server 2019 Express** en el PC `192.168.1.30` (puerto 1434), base **`NET_FJS`** (los años viejos en `NET_FJS11`…`NET_FJS25`). Puesto con acceso: **EQUIPO-2** (192.168.1.34), con la sesión de Windows abierta (entra con su usuario de Windows, sin contraseña de SQL).

## Cómo va
1. **EQUIPO-2**: tarea de Windows «Actualizar Golden para Claude» a las **7:00 y 14:00** (o al encender si estaba apagado) ejecuta `%USERPROFILE%\ClaudeGolden\exportar.ps1` (copia en `scripts/golden/exportar.ps1`). **Solo lee** Golden y deja un CSV (`;`) por tabla en **Mi unidad › Claude Golden › golden_sql** (cuenta personal de Fernando; carpeta compartida con `ferjusanzfacturas@gmail.com`, que es la cuenta del conector de Drive). Id de la carpeta: `1EJwVW9ANSPokb7O5n39qfkaLoG-d9Hi1`. Tablas grandes en trozos `.parteNN` (el conector no baja más de 10 MB). Lo de los últimos 45 días va aparte: `Reciente Cabecera Facturacion*.csv` y `Reciente Lineas Facturacion*.csv`. `_actualizado.txt` dice la hora de la última salida.
2. **Tarea de Claude «Golden a la app (diaria)»**: baja de esa carpeta los `Reciente …`, `Clientes`, `Direcciones`, `Personas`, `Proveedores`, `DireccionesProv`, `PersonasProv` y ejecuta:
   - `python3 -I scripts/golden/facturas-sql.py <carpeta> <hoy-45 días>` → añade a `golden_facturas`/`golden_lineas` las facturas que falten (nunca cambia ni borra).
   - `python3 -I scripts/golden/fichas-sql.py <carpeta>` → rellena **solo huecos** de NIF, dirección, CP, localidad, teléfono y correo en `clientes` y `proveedores` (por código).
   Primero en la base de pruebas y luego en la real, con la API de Supabase (ver `CLAUDE.md`).

## Si deja de llegar
- `_actualizado.txt` con más de 2 días: EQUIPO-2 apagado, dormido (suspensión puesta en «Nunca» el 18/11/2026), sin sesión abierta o Drive para ordenador parado.
- Para reinstalar el programa del PC: pegar en PowerShell el contenido de `exportar.ps1` guardándolo en `%USERPROFILE%\ClaudeGolden\exportar.ps1` y `Start-ScheduledTask "Actualizar Golden para Claude"`.

## Tablas útiles (NET_FJS)
`Cabecera Facturacion`/`Lineas Facturacion` (ventas: Tipo A albarán, F factura; enlace Tipo+Serie+Numero; las líneas llevan `Precio costo`), `Cabecera/Lineas Facturacion Compras`, `Clientes` (+`Direcciones`, `Personas`, `Clientes2`), `Proveedores` (+`DireccionesProv`, `PersonasProv`), `Articulos`, `Stocks`, `Tesoreria` (cobros/pagos), `TarifasProveedor`, `Movimientos Almacen`.
