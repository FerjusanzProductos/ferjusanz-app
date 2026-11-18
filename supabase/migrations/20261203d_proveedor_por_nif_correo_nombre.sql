-- Facturas de proveedor: reconocer al proveedor por NIF, correo y nombre legal (Fernando, 18/11/2026:
-- «guíate por el logo, correo, nombre del correo, lo que dice el correo, NIF»).
-- Solo rellena proveedor_id cuando está vacío: lo que la oficina haya puesto manda.
-- Orden: 1) NIF leído de la factura, 2) correo exacto del remitente, 3) nombre legal (razon_social) en el asunto.

update proveedores set razon_social = 'CARMEN MARTINEZ ORTEGA Y DOS MAS C.B.'
 where nif = 'E79125241' and razon_social is null;

create or replace function proveedor_de_factura(p_nif text, p_rem text, p_asunto text)
returns uuid language sql stable set search_path = public as $$
  select coalesce(
    (select min(id::text)::uuid from proveedores where nullif(p_nif,'') is not null
       and upper(regexp_replace(nif,'[^A-Za-z0-9]','','g')) = upper(regexp_replace(p_nif,'[^A-Za-z0-9]','','g'))
     having count(*) = 1),
    (select min(id::text)::uuid from proveedores where nullif(p_rem,'') is not null and lower(email) = lower(trim(p_rem))
     having count(*) = 1),
    (select min(id::text)::uuid from proveedores where nullif(razon_social,'') is not null
       and upper(coalesce(p_asunto,'')) like '%' || upper(regexp_replace(razon_social,'[.,]','','g')) || '%'
     having count(*) = 1));
$$;

create or replace function facturas_recibidas_proveedor() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.proveedor_id is null then
    new.proveedor_id := proveedor_de_factura(new.nif_proveedor, new.remitente, regexp_replace(new.asunto,'[.,]','','g'));
  end if;
  return new;
end $$;

drop trigger if exists trg_proveedor_factura on facturas_recibidas;
create trigger trg_proveedor_factura before insert or update of nif_proveedor, remitente, asunto, proveedor_id
  on facturas_recibidas for each row execute function facturas_recibidas_proveedor();

-- Las que ya estaban sin proveedor
update facturas_recibidas set proveedor_id = proveedor_de_factura(nif_proveedor, remitente, regexp_replace(asunto,'[.,]','','g'))
 where proveedor_id is null;
