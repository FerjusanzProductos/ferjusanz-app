# Se ejecuta en EQUIPO-2 (oficina) con la tarea de Windows «Actualizar Golden para Claude» (7:00 y 14:00).
# Copia en el PC: %USERPROFILE%\ClaudeGolden\exportar.ps1. Solo LEE Golden (SQL Server 192.168.1.30,1434, base NET_FJS).
# Deja CSV (;) en Mi unidad\Claude Golden\golden_sql (cuenta personal de Fernando, compartida con ferjusanzfacturas).
# Las tablas grandes van en trozos de 4000 filas (el conector de Drive no descarga más de 10 MB por archivo).
$g=(Get-PSDrive -PSProvider FileSystem | ?{ (Test-Path "$($_.Root)Mi unidad") -or (Test-Path "$($_.Root)My Drive") } | select -First 1).Root
$mu= if($g -and (Test-Path "$($g)Mi unidad")){"$($g)Mi unidad"}elseif($g){"$($g)My Drive"}else{$null}
$sc=Get-PSDrive -PSProvider FileSystem | %{"$($_.Root).shortcut-targets-by-id\1xagWKvuh1k8aCcW56Ux2csjBN3OBOq6f\Claude Golden\golden_sql"} | ?{Test-Path $_} | select -First 1  # Drive con la cuenta de facturas: la carpeta compartida va por acceso directo (18/11/2026)
$out= if($sc){$sc}elseif($mu){"$mu\Claude Golden\golden_sql"}else{"$([Environment]::GetFolderPath('Desktop'))\Claude Golden\golden_sql"}
md $out -Force | Out-Null
$c=New-Object System.Data.SqlClient.SqlConnection "Server=192.168.1.30,1434;Database=NET_FJS;Integrated Security=true;Connect Timeout=30"
$c.Open()
function Sacar($sql,$nombre){ $dt=New-Object System.Data.DataTable; (New-Object System.Data.SqlClient.SqlDataAdapter($sql,$c)).Fill($dt)|Out-Null; $rows=$dt.Rows.Count; if($rows -eq 0){return}; $sel=@($dt | select * -ExcludeProperty RowError,RowState,Table,ItemArray,HasErrors); Get-ChildItem "$out\$nombre.parte*.csv" -EA 0 | Remove-Item; if($rows -le 4000){ $sel | Export-Csv "$out\$nombre.csv" -NoTypeInformation -Encoding UTF8 -Delimiter ';' } else { Remove-Item "$out\$nombre.csv" -EA 0; $i=0; for($p=0; $p -lt $rows; $p+=4000){ $i++; $sel[$p..([Math]::Min($p+3999,$rows-1))] | Export-Csv ("{0}\{1}.parte{2:D2}.csv" -f $out,$nombre,$i) -NoTypeInformation -Encoding UTF8 -Delimiter ';' } } }
$rd=(New-Object System.Data.SqlClient.SqlCommand("select name from sys.tables where name not like 'Auditoria%' and name not like 'tmp%'",$c)).ExecuteReader(); $n=@(); while($rd.Read()){$n+=$rd[0]}; $rd.Close()
foreach($t in $n){ Sacar "select * from [$t]" $t }
# Lo reciente (45 días) en archivos pequeños: es lo que importa cada día la tarea de Claude.
Sacar "select * from [Cabecera Facturacion] where Tipo='F' and Fecha>=dateadd(day,-45,getdate())" "Reciente Cabecera Facturacion"
Sacar "select l.* from [Lineas Facturacion] l join [Cabecera Facturacion] h on h.Tipo=l.Tipo and h.Serie=l.Serie and h.Numero=l.Numero where h.Tipo='F' and h.Fecha>=dateadd(day,-45,getdate())" "Reciente Lineas Facturacion"
$c.Close()
"Actualizado: $(Get-Date -Format 'yyyy-MM-dd HH:mm')" | Out-File "$out\_actualizado.txt" -Encoding utf8
