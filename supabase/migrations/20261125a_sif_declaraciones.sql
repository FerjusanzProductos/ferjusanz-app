-- FASE 8 (Verifactu): DECLARACIÓN RESPONSABLE dentro de la app y BLOQUEO sin ella (SIF 0.5.0). 14/11/2026. Vale para las dos bases.
-- docs/SIF_PRODUCTOR/LEEME.md, punto 7 · pruebas T-DEC-01, T-DEC-02 y T-DEC-04.
--
-- Qué hace, en corto:
--  1. Tabla sif_declaraciones: una fila por cada versión del programa con su declaración FIRMADA (fecha, lugar, quién firma,
--     PDF guardado y su huella SHA-256). No se puede cambiar ni borrar ninguna (se guardan todas las versiones).
--     Desde la app NADIE puede añadir filas: se añade a mano cuando un administrador (Fernando o Julián Sanz Horrillo) firme
--     (nunca Claude firma). La lee cualquier usuario de la app.
--  2. Carpeta privada «sif-declaraciones» para los PDF firmados (la leen los usuarios de la app; nadie la cambia desde la app).
--  3. sif_programa(): lo que se enseña en Más → «ℹ️ Programa de facturación» (nombre, código, versión, productor, declaraciones).
--  4. En la base REAL no se puede emitir NADA si la versión en uso no tiene su declaración firmada (además de lo que ya pedía:
--     facturación encendida y fecha de inicio). En la de PRUEBAS se sigue ensayando (serie PRUEBA, sin valor fiscal).
-- Hoy no hay ninguna declaración: la facturación real sigue bloqueada, como debe.

create table if not exists public.sif_declaraciones (
  version text primary key,                 -- igual que sif_config.version_sif, p. ej. 'SIF 1.0.0'
  fecha_firma date not null,
  lugar_firma text not null,
  firmante text not null,                   -- nombre, DNI y cargo
  pdf_ruta text not null,                   -- en la carpeta sif-declaraciones
  pdf_sha256 text not null check (pdf_sha256 ~ '^[0-9A-F]{64}$'),
  creado_at timestamptz not null default now()
);
drop trigger if exists trg_no_tocar on public.sif_declaraciones;
create trigger trg_no_tocar before update or delete on public.sif_declaraciones for each row execute function public.sif_no_tocar();
drop trigger if exists trg_no_vaciar on public.sif_declaraciones;
create trigger trg_no_vaciar before truncate on public.sif_declaraciones for each statement execute function public.sif_no_tocar();
alter table public.sif_declaraciones enable row level security;
revoke all on public.sif_declaraciones from anon, authenticated;
grant select on public.sif_declaraciones to authenticated;
drop policy if exists leer on public.sif_declaraciones;
create policy leer on public.sif_declaraciones for select to authenticated using (public.rol_actual() is not null);

-- 2. Carpeta privada para los PDF firmados
insert into storage.buckets (id, name, public) values ('sif-declaraciones', 'sif-declaraciones', false) on conflict (id) do nothing;
drop policy if exists sif_declaraciones_leer on storage.objects;
create policy sif_declaraciones_leer on storage.objects for select to authenticated
  using (bucket_id = 'sif-declaraciones' and public.rol_actual() is not null);

-- 3. Datos del programa para la pantalla «ℹ️ Programa de facturación»
create or replace function public.sif_programa() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare k public.sif_config%rowtype; e public.empresa%rowtype; v_ent text;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select * into k from public.sif_config; select * into e from public.empresa limit 1; select nombre into v_ent from public.entorno;
  return jsonb_build_object(
    'nombre', 'FERJUSANZ APP', 'codigo', 'FJ', 'version', k.version_sif, 'entorno', v_ent,
    'productor', jsonb_build_object('razon_social', e.razon_social, 'nif', e.nif, 'direccion', e.direccion, 'codigo_postal', e.codigo_postal, 'localidad', e.localidad),
    'modo', 'No VERI*FACTU (todavía no se envía a Hacienda)',
    'declaracion', (select to_jsonb(d) from public.sif_declaraciones d where d.version = k.version_sif),
    'anteriores', coalesce((select jsonb_agg(to_jsonb(d) order by d.fecha_firma desc, d.creado_at desc) from public.sif_declaraciones d where d.version <> k.version_sif), '[]'),
    'emision_real_activa', k.emision_real_activa, 'fecha_inicio', k.fecha_inicio);
end $$;
revoke all on function public.sif_programa() from public, anon;
grant execute on function public.sif_programa() to authenticated;

-- 4. Serie que toca. En la REAL: bloqueado si no está activada, si aún no es la fecha de inicio o si la versión no tiene declaración firmada.
create or replace function public.sif_serie(p_rect boolean) returns text language plpgsql stable security definer set search_path = public as $$
declare v_ent text; v_activa boolean; v_inicio date; v_ver text;
begin
  select nombre into v_ent from public.entorno;
  if v_ent = 'pruebas' then return case when p_rect then 'PRUEBA-R' else 'PRUEBA' end; end if;
  select emision_real_activa, fecha_inicio, version_sif into v_activa, v_inicio, v_ver from public.sif_config;
  if v_ent is distinct from 'produccion' or not coalesce(v_activa, false) then
    raise exception 'FACTURACION_NO_ACTIVA: en la app normal todavía no se emiten facturas (hace falta la declaración responsable firmada)';
  end if;
  if public.sif__fecha_hoy() < coalesce(v_inicio, date '2027-01-01') then
    raise exception 'FACTURACION_NO_ACTIVA: la app factura desde el %; hasta entonces, en Golden', to_char(coalesce(v_inicio, date '2027-01-01'), 'DD/MM/YYYY');
  end if;
  if not exists (select 1 from public.sif_declaraciones where version = v_ver) then
    raise exception 'SIN_DECLARACION: la versión «%» del programa de facturación no tiene su declaración responsable firmada; no se puede facturar', v_ver;
  end if;
  return case when p_rect then 'R' else 'F' end;
end $$;
revoke all on function public.sif_serie(boolean) from public, anon, authenticated;

update public.sif_config set version_sif = 'SIF 0.5.0 (sin declaración)' where id;
