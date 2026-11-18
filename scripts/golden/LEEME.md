# Golden → app (automático)

Golden Soft 4.5.7 (TeamSystem), módulo Facturación .Net, guarda todo en **SQL Server 2019 Express** en el PC `192.168.1.30` (puerto 1434), base **`NET_FJS`** (los años viejos en `NET_FJS11`…`NET_FJS25`). Puesto con acceso: **EQUIPO-2** (192.168.1.34), con la sesión de Windows abierta (entra con su usuario de Windows, sin contraseña de SQL).

## Cómo va
1. **EQUIPO-2**: tarea de Windows «Actualizar Golden para Claude» a las **7:00 y 14:00** (o al encender si estaba apagado) ejecuta `%USERPROFILE%\ClaudeGolden\exportar.ps1` (copia en `scripts/golden/exportar.ps1`). **Solo lee** Golden y deja un CSV (`;`) por tabla en **Mi unidad › Claude Golden › golden_sql** (carpeta de la cuenta personal de Fernando, compartida con `ferjusanzfacturas@gmail.com`, que es la cuenta del conector de Drive). **Desde el 18/11/2026, Drive para ordenador de EQUIPO-2 está solo con la cuenta de facturas** (unidad H:; la personal se quitó para que no se vea en ese ordenador, que es la sesión de Windows de Carmen): la carpeta llega por acceso directo y el programa escribe en `H:\.shortcut-targets-by-id\1xagWKvuh1k8aCcW56Ux2csjBN3OBOq6f\Claude Golden\golden_sql`. Id de la carpeta: `1EJwVW9ANSPokb7O5n39qfkaLoG-d9Hi1`. Tablas grandes en trozos `.parteNN` (el conector no baja más de 10 MB). Lo de los últimos 45 días va aparte: `Reciente Cabecera Facturacion*.csv` y `Reciente Lineas Facturacion*.csv`. `_actualizado.txt` dice la hora de la última salida.
2. **Tarea de Claude «Golden a la app (diaria)»**: baja de esa carpeta los `Reciente …`, `Clientes`, `Direcciones`, `Personas`, `Proveedores`, `DireccionesProv`, `PersonasProv` y ejecuta:
   - `python3 -I scripts/golden/facturas-sql.py <carpeta> <hoy-45 días>` → añade a `golden_facturas`/`golden_lineas` las facturas que falten (nunca cambia ni borra).
   - `python3 -I scripts/golden/fichas-sql.py <carpeta>` → rellena **solo huecos** de NIF, dirección, CP, localidad, teléfono y correo en `clientes` y `proveedores` (por código).
   - **Nuevo (18/11/2026)**: bajar también `Cabecera Facturacion Compras*.csv`, `Lineas Facturacion Compras*.csv` (trozos) y `Tesoreria*.csv` y ejecutar
     `python3 -I scripts/golden/compras-sql.py <carpeta> <hoy-45 días> compras` → añade a `golden_compras`/`golden_compras_lineas` las facturas de compra que falten (Tipo F; nunca cambia ni borra), y
     `python3 -I scripts/golden/compras-sql.py <carpeta> <hoy-45 días> tesoreria` → `golden_tesoreria`: añade vencimientos y pone al día estado (PEN/CO/PA), fecha de cobro/pago e importe por «Contador» (es copia de Golden; los pendientes se mandan siempre, sean de la fecha que sean).
   - `facturas-sql.py` ya lleva el **neto y el coste** (Uds × «Precio costo») de cada línea y el coste de la cabecera («Costos Brutos»); también rellena esos huecos en lo cargado antes (solo la primera copia de cada línea: hay líneas repetidas de cargas viejas).
   Primero en la base de pruebas y luego en la real, con la API de Supabase (ver `CLAUDE.md`). Si la API dice «request entity too large», partir por fechas: los dos scripts aceptan `<desde> <hasta>`.
   Comprobar: `select sum(base), sum(coste) from golden_facturas where fecha >= '2026-01-01'` debe dar lo mismo que el «Listado de beneficios» de Golden (18/11/2026: 804.258,55 € y 488.932,86 €).

## Si deja de llegar
- `_actualizado.txt` con más de 2 días: EQUIPO-2 apagado, dormido (suspensión puesta en «Nunca» el 18/11/2026), sin sesión abierta o Drive para ordenador parado.
- Para reinstalar el programa del PC: pegar en PowerShell el contenido de `exportar.ps1` guardándolo en `%USERPROFILE%\ClaudeGolden\exportar.ps1` y `Start-ScheduledTask "Actualizar Golden para Claude"`.

## Tablas útiles (NET_FJS)
`Cabecera Facturacion`/`Lineas Facturacion` (ventas: Tipo A albarán, F factura; enlace Tipo+Serie+Numero; las líneas llevan `Precio costo`), `Cabecera/Lineas Facturacion Compras`, `Clientes` (+`Direcciones`, `Personas`, `Clientes2`), `Proveedores` (+`DireccionesProv`, `PersonasProv`), `Articulos`, `Stocks`, `Tesoreria` (cobros/pagos), `TarifasProveedor`, `Movimientos Almacen`.
