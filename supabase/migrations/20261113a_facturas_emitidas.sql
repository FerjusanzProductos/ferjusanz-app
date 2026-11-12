-- FACTURAS EMITIDAS desde la app (fase 2 del plan de facturación, docs/PLAN_FACTURACION.md).
-- Módulo de facturación propio (SIF): tablas y funciones con prefijo sif_ (docs/SIF_PRODUCTOR/LEEME.md, punto 8).
--
-- Qué hace, en corto:
--  1. Facturas desde albaranes ENTREGADOS del mismo cliente (una factura puede juntar varios, del mismo mes).
--  2. Numeración seguida y sin huecos por serie y año: 2027-0001… · rectificativas R2027-0001…
--     En la base de PRUEBAS las series son otras: PRUEBA-2026-0001 y PRUEBA-R2026-0001 («SIN VALOR FISCAL»).
--  3. Una factura emitida NO se puede cambiar ni borrar (ni desde la app ni desde la base): se corrige con una rectificativa.
--  4. Cada factura guarda una FOTO de los datos de la empresa y del cliente del momento, el desglose por producto y por tipo de IVA.
--  5. Forma de pago obligatoria. EFECTIVO prohibido si la factura (o la que se rectifica) llega a 1.000 € (Ley 7/2012, art. 7).
--  6. En la base REAL no se puede emitir nada hasta que se active a propósito (sif_config.emision_real_activa),
--     que solo se hará con la declaración responsable firmada (docs/SIF_PRODUCTOR).
--
-- Solo oficina y admin pueden ver y emitir facturas. Nadie puede escribir en las tablas directamente: solo con las funciones.

-- ===== Configuración (una fila) =====
create table if not exists public.sif_config (
  id boolean primary key default true check (id),
  version_sif text not null default 'SIF 0.1.0 (en pruebas)',
  emision_real_activa boolean not null default false   -- en la base real se queda en false hasta la declaración firmada
);
insert into public.sif_config (id) values (true) on conflict (id) do nothing;

-- ===== Contador por serie y año (sin huecos: va en la misma operación que la factura) =====
create table if not exists public.sif_contadores (
  serie text not null,
  anio integer not null,
  ultimo integer not null default 0 check (ultimo >= 0),
  primary key (serie, anio)
);

-- ===== Facturas =====
create table if not exists public.sif_facturas (
  id uuid primary key default gen_random_uuid(),
  serie text not null check (serie in ('F', 'R', 'PRUEBA', 'PRUEBA-R')),
  anio integer not null,
  numero integer not null check (numero > 0),
  codigo text not null unique,                       -- lo que se ve: 2027-0001, R2027-0001, PRUEBA-2026-0001…
  tipo text not null check (tipo in ('ordinaria', 'rectificativa')),
  fecha date not null,                               -- fecha de emisión (la pone la base, hora de Madrid)
  emitida_at timestamptz not null default now(),
  emitida_por uuid default auth.uid(),
  cliente_id uuid not null references public.clientes(id),
  cliente jsonb not null,                            -- foto de los datos del cliente al emitir
  emisor jsonb not null,                             -- foto de los datos de la empresa al emitir
  concepto text not null,
  forma_pago text not null check (forma_pago in ('transferencia', 'efectivo', 'tarjeta', 'bizum', 'domiciliacion', 'pagare', 'compensacion')),
  vencimiento date,                                  -- = fecha si es al contado
  recargo_equivalencia boolean not null default false,
  base numeric(12,2) not null,
  cuota_iva numeric(12,2) not null,
  cuota_re numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  rectifica_id uuid references public.sif_facturas(id),   -- solo rectificativas
  rectifica_codigo text,
  motivo text,                                       -- por qué se rectifica
  anula boolean not null default false,              -- rectificativa que deja la factura a cero
  prueba boolean not null,                           -- true = hecha en la base de pruebas, SIN VALOR FISCAL
  version_sif text not null,
  notas text,
  unique (serie, anio, numero),
  check ((tipo = 'rectificativa') = (rectifica_id is not null)),
  check (tipo = 'ordinaria' or length(btrim(coalesce(motivo, ''))) >= 5)
);
create index if not exists sif_facturas_cliente_idx on public.sif_facturas (cliente_id, fecha desc);

create table if not exists public.sif_factura_lineas (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.sif_facturas(id),
  orden integer not null,
  albaran_id uuid references public.albaranes(id),
  albaran text,                                      -- «F 0006001 · 12/11/2026»
  linea_pedido_id uuid references public.lineas_pedido(id),
  linea_origen_id uuid references public.sif_factura_lineas(id),   -- en rectificativas: la línea que corrige
  producto_id uuid references public.productos(id),
  codigo text,
  descripcion text not null,
  familia text,                                      -- fruta / verdura / patata / huevos (para el concepto)
  cantidad numeric(12,3) not null,
  unidad text,
  precio numeric(12,4) not null,
  base numeric(12,2) not null,                       -- en rectificativas: la DIFERENCIA
  tipo_iva numeric(4,1) not null,
  cuota_iva numeric(12,2) not null,
  tipo_re numeric(4,1) not null default 0,
  cuota_re numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  unique (factura_id, orden)
);
create index if not exists sif_factura_lineas_origen_idx on public.sif_factura_lineas (linea_origen_id);

create table if not exists public.sif_factura_iva (
  factura_id uuid not null references public.sif_facturas(id),
  tipo_iva numeric(4,1) not null,
  base numeric(12,2) not null,
  cuota_iva numeric(12,2) not null,
  tipo_re numeric(4,1) not null default 0,
  cuota_re numeric(12,2) not null default 0,
  total numeric(12,2) not null,
  primary key (factura_id, tipo_iva)
);

create table if not exists public.sif_factura_albaranes (
  factura_id uuid not null references public.sif_facturas(id),
  albaran_id uuid not null references public.albaranes(id),
  pedido_id uuid not null references public.pedidos(id),
  primary key (factura_id, albaran_id)
);
create index if not exists sif_factura_albaranes_alb_idx on public.sif_factura_albaranes (albaran_id);

-- ===== Nada se cambia ni se borra =====
create or replace function public.sif_no_tocar() returns trigger language plpgsql as $$
begin
  if tg_table_name = 'sif_contadores' and tg_op = 'UPDATE' then
    if new.serie = old.serie and new.anio = old.anio and new.ultimo = old.ultimo + 1 then
      return new;   -- el contador solo puede subir de uno en uno
    end if;
  end if;
  raise exception 'FACTURA_INALTERABLE: una factura emitida no se cambia ni se borra; se corrige con una rectificativa';
end $$;
do $$ declare t text; begin
  foreach t in array array['sif_facturas', 'sif_factura_lineas', 'sif_factura_iva', 'sif_factura_albaranes', 'sif_contadores'] loop
    execute format('drop trigger if exists trg_no_tocar on public.%I', t);
    execute format('create trigger trg_no_tocar before update or delete on public.%I for each row execute function public.sif_no_tocar()', t);
    execute format('drop trigger if exists trg_no_vaciar on public.%I', t);
    execute format('create trigger trg_no_vaciar before truncate on public.%I for each statement execute function public.sif_no_tocar()', t);
  end loop; end $$;
drop trigger if exists trg_auditar on public.sif_facturas;
create trigger trg_auditar after insert on public.sif_facturas for each row execute function auditar();

-- ===== Permisos: solo LEER (oficina y admin). Escribir, solo con las funciones de abajo =====
do $$ declare t text; begin
  foreach t in array array['sif_config', 'sif_contadores', 'sif_facturas', 'sif_factura_lineas', 'sif_factura_iva', 'sif_factura_albaranes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('drop policy if exists leer on public.%I', t);
    execute format('create policy leer on public.%I for select to authenticated using (rol_actual() in (''oficina'', ''admin''))', t);
  end loop; end $$;

-- ===== Ayudas =====
-- NIF limpio para la factura: sin espacios, puntos ni guiones, y el DNI siempre con 8 cifras («5376981-H» → «05376981H»)
create or replace function public.sif_nif_normal(v text) returns text language plpgsql immutable as $$
declare s text := regexp_replace(upper(regexp_replace(coalesce(v, ''), '[\s.\-/]', '', 'g')), '^0+(?=[A-Z])', '');
begin
  if s ~ '^\d{1,9}[A-Z]$' then
    s := regexp_replace(substr(s, 1, length(s) - 1), '^0+(?=\d{8})', '') || right(s, 1);
    if length(s) <= 9 then s := lpad(s, 9, '0'); end if;
  end if;
  return s;
end $$;

-- NIF español (DNI, NIE o CIF) con su letra o dígito de control (igual que nifValido de la app, v257)
create or replace function public.sif_nif_valido(v text) returns boolean language plpgsql immutable as $$
declare s text := public.sif_nif_normal(v); L text := 'TRWAGMYFPDXBNJZSQVHLCKE'; a int := 0; b int := 0; d int; x int; ctl int;
begin
  if s ~ '^\d{8}[A-Z]$' then return substr(L, (substr(s, 1, 8)::bigint % 23)::int + 1, 1) = substr(s, 9, 1); end if;
  if s ~ '^[XYZ]\d{7}[A-Z]$' then return substr(L, (((position(substr(s, 1, 1) in 'XYZ') - 1)::text || substr(s, 2, 7))::bigint % 23)::int + 1, 1) = substr(s, 9, 1); end if;
  if s ~ '^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$' then
    for i in 1..7 loop d := substr(s, i + 1, 1)::int; if i % 2 = 0 then a := a + d; else x := d * 2; b := b + x / 10 + x % 10; end if; end loop;
    ctl := (10 - ((a + b) % 10)) % 10;
    return substr(s, 9, 1) = ctl::text or substr(s, 9, 1) = substr('JABCDEFGHI', ctl + 1, 1);
  end if;
  return false;
end $$;

-- Familia del producto para el concepto («Venta de fruta, verdura y patata»)
create or replace function public.sif_familia(n text) returns text language sql immutable as $$
  select case
    when t ~ 'huevo' then 'huevos'
    when t ~ 'patat' then 'patata'
    when t ~ 'tomate|pimient|cebolla|ajo|lechuga|zanahoria|calabac|berenjena|pepino|judia|brocoli|coliflor|col\M|repollo|espinaca|acelga|puerro|apio|perejil|cilantro|seta|champi|esparrago|alcachofa|calabaza|boniato|nabo|rabano|remolacha|cebollino|cebolleta|chalota|guindilla|piparra|mezclum|ensalada|brote|rucula|canonigo|endibia|escarola|cogollo|maiz|haba|guisante|garbanzo|lenteja|jengibre|hierbabuena|albahaca|menta' then 'verdura'
    when t ~ 'manzana|\mperas?\M|platano|banana|naranja|limon|\mlimas?\M|mandarin|clementin|kiwi|melon|sandia|fresa|freson|\muvas?\M|aguacate|\mpinas?\M|mango|frambues|arandano|\mmoras?\M|cereza|picota|melocoton|nectarin|albaricoq|ciruela|caqui|kaki|granada|\mhigos?\M|breva|pomelo|papaya|\mcocos?\M|chirimoya|nuez|nueces|fruto|membrillo|castana|datil|paraguayo|maracuya|lichi|grosella|fruta|almendra|avellana|pistacho|platano' then 'fruta'
    else 'verdura' end
  from (select translate(lower(coalesce(n, '')), 'áéíóúüñ', 'aeiouun') as t) s
$$;

-- Recargo de equivalencia por tipo de IVA
create or replace function public.sif_tipo_re(t numeric) returns numeric language sql immutable as $$
  select case t when 4 then 0.5 when 10 then 1.4 when 21 then 5.2 else 0 end::numeric
$$;

-- Serie que toca según la base (pruebas / real) y tipo. En la real, bloqueado hasta que se active.
create or replace function public.sif_serie(p_rect boolean) returns text language plpgsql stable security definer set search_path = public as $$
declare v_ent text; v_activa boolean;
begin
  select nombre into v_ent from public.entorno;
  if v_ent = 'pruebas' then return case when p_rect then 'PRUEBA-R' else 'PRUEBA' end; end if;
  select emision_real_activa into v_activa from public.sif_config;
  if v_ent is distinct from 'produccion' or not coalesce(v_activa, false) then
    raise exception 'FACTURACION_NO_ACTIVA: en la app normal todavía no se emiten facturas (hace falta la declaración responsable firmada)';
  end if;
  return case when p_rect then 'R' else 'F' end;
end $$;

-- Siguiente número sin huecos (bloquea la fila del contador hasta que termina la operación)
create or replace function public.sif__siguiente(p_serie text, p_anio int) returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  insert into public.sif_contadores (serie, anio, ultimo) values (p_serie, p_anio, 0) on conflict (serie, anio) do nothing;
  update public.sif_contadores set ultimo = ultimo + 1 where serie = p_serie and anio = p_anio returning ultimo into n;
  return n;
end $$;

create or replace function public.sif__codigo(p_serie text, p_anio int, p_num int) returns text language sql immutable as $$
  select case p_serie when 'F' then '' when 'R' then 'R' when 'PRUEBA' then 'PRUEBA-' when 'PRUEBA-R' then 'PRUEBA-R' end || p_anio || '-' || lpad(p_num::text, 4, '0')
$$;

-- Número en español para textos: sif__n(10.350, 3) = '10,35' · sif__n(1.8, 2) = '1,80'
create or replace function public.sif__n(v numeric, d int) returns text language sql immutable as $$
  select replace(case when d >= 3 then rtrim(rtrim(to_char(v, 'FM9999999990.000'), '0'), '.')
                      else regexp_replace(to_char(v, 'FM9999999990.0009'), '(\.\d\d\d?)0$', '\1') end, '.', ',')
$$;

create or replace function public.sif__fecha_hoy() returns date language sql stable as $$ select (now() at time zone 'Europe/Madrid')::date $$;

-- Foto de la empresa (emisor). Falla si falta algo obligatorio.
create or replace function public.sif__emisor() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare e public.empresa%rowtype;
begin
  select * into e from public.empresa limit 1;
  if e.id is null or btrim(coalesce(e.razon_social, '')) = '' or btrim(coalesce(e.nif, '')) = '' or btrim(coalesce(e.direccion, '')) = '' or coalesce(e.codigo_postal, '') !~ '^\d{5}$' then
    raise exception 'FALTAN_DATOS_EMPRESA: completa «Datos de la empresa»';
  end if;
  return to_jsonb(e) - 'id' - 'unica' - 'updated_at';
end $$;

-- ===== Cálculo de una factura desde albaranes (sin guardar nada) =====
-- Devuelve cliente, líneas, resumen por IVA, totales, ERRORES (impiden emitir) y AVISOS (solo informan).
create or replace function public.sif_vista_previa(p_pedidos uuid[]) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_cli uuid; c public.clientes%rowtype; errores text[] := '{}'; avisos text[] := '{}';
  lineas jsonb := '[]'; iva jsonb := '[]'; r record; n int := 0; v_meses int; v_mes date;
  v_base numeric := 0; v_iva numeric := 0; v_re numeric := 0; v_efectivo numeric := 0; fams text[];
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  if p_pedidos is null or coalesce(array_length(p_pedidos, 1), 0) = 0 then raise exception 'DATOS_NO_VALIDOS: elige algún albarán'; end if;
  if (select count(distinct cliente_id) from public.pedidos where id = any(p_pedidos)) <> 1 then
    errores := array_append(errores, 'Los albaranes tienen que ser todos del MISMO cliente.');
  end if;
  select cliente_id into v_cli from public.pedidos where id = any(p_pedidos) limit 1;
  select * into c from public.clientes where id = v_cli;

  -- Cada albarán: que exista, no anulado, ENTREGADO y sin facturar
  for r in select x as pid, p.id, p.estado, al.id as alb, al.serie, al.numero, al.fecha, al.estado as alb_estado,
                  exists (select 1 from public.entregas e where e.pedido_id = x) as entregado,
                  (select f.codigo from public.sif_factura_albaranes fa join public.sif_facturas f on f.id = fa.factura_id
                    where fa.albaran_id = al.id and not exists (select 1 from public.sif_facturas q where q.rectifica_id = f.id and q.anula) limit 1) as factura,
                  (select af.numero_factura from public.albaranes_facturados af where af.pedido_id = x) as golden
           from unnest(p_pedidos) x left join public.pedidos p on p.id = x left join public.albaranes al on al.pedido_id = x loop
    if r.id is null or r.alb is null then errores := errores || ('Un pedido elegido no tiene albarán.');
    elsif r.alb_estado = 'anulado' or r.estado = 'anulado' then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' está ANULADO.');
    elsif not r.entregado then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' no está marcado como ENTREGADO.');
    elsif r.factura is not null then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' ya está en la factura ' || r.factura || '.');
    elsif r.golden is not null then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' ya está marcado como facturado (' || r.golden || ').');
    end if;
  end loop;

  -- Mismo mes (factura recapitulativa: operaciones de un mismo mes natural, art. 13 RD 1619/2012)
  select count(distinct date_trunc('month', al.fecha)), min(al.fecha) into v_meses, v_mes from public.albaranes al where al.pedido_id = any(p_pedidos);
  if v_meses > 1 then errores := array_append(errores, 'Una factura solo puede juntar albaranes del MISMO MES. Haz una factura por cada mes.'); end if;
  if v_mes is not null and public.sif__fecha_hoy() > (date_trunc('month', v_mes) + interval '1 month' + interval '15 days')::date then
    avisos := avisos || ('Fuera de plazo: los albaranes de ' || to_char(v_mes, 'MM/YYYY') || ' se tenían que facturar antes del día 16 del mes siguiente. Avisa a Jorge.');
  end if;

  -- Datos del cliente obligatorios
  if c.id is not null then
    if btrim(coalesce(c.nombre, '')) = '' then errores := array_append(errores, 'Al cliente le falta el NOMBRE.'); end if;
    if btrim(coalesce(c.nif, '')) = '' then errores := array_append(errores, 'Al cliente le falta el NIF.');
    elsif not public.sif_nif_valido(c.nif) then errores := array_append(errores, ('El NIF del cliente («' || c.nif || '») está mal escrito.')); end if;
    if btrim(coalesce(c.direccion, '')) = '' then errores := array_append(errores, 'Al cliente le falta la DIRECCIÓN.'); end if;
    if coalesce(btrim(c.codigo_postal), '') !~ '^\d{5}$' then errores := array_append(errores, 'Al cliente le falta el CÓDIGO POSTAL (5 cifras).'); end if;
    if btrim(coalesce(c.localidad, '')) = '' then errores := array_append(errores, 'Al cliente le falta la LOCALIDAD.'); end if;
  end if;

  -- Líneas: lo servido de cada albarán, en orden de albarán
  for r in select al.id as alb, al.serie || ' ' || lpad(al.numero::text, 7, '0') || ' · ' || to_char(al.fecha, 'DD/MM/YYYY') as alb_txt, al.numero, al.fecha,
                  l.id as lid, l.estado, l.peso_real, l.precio, l.unidad_precio, l.unidad_pedida, coalesce(l.iva, pr.iva, 4) as tipo,
                  pr.id as prid, pr.codigo, coalesce(nullif(btrim(pr.nombre_albaran), ''), pr.nombre) as descr, pr.nombre
           from public.albaranes al join public.lineas_pedido l on l.pedido_id = al.pedido_id join public.productos pr on pr.id = l.producto_id
           where al.pedido_id = any(p_pedidos)
           order by al.fecha, al.numero, l.created_at, l.id loop
    if r.estado = 'no_disponible' or r.peso_real = 0 then continue; end if;   -- «No servido»: ni se cobra ni se factura
    if r.precio is null or r.peso_real is null then
      errores := errores || ('Albarán ' || r.alb_txt || ': «' || r.descr || '» sin ' || case when r.precio is null then 'PRECIO' else 'PESO' end || '.');
      continue;
    end if;
    n := n + 1;
    lineas := lineas || jsonb_build_object('orden', n, 'albaran_id', r.alb, 'albaran', r.alb_txt, 'linea_pedido_id', r.lid, 'producto_id', r.prid, 'codigo', r.codigo,
      'descripcion', r.descr, 'familia', public.sif_familia(r.nombre), 'cantidad', r.peso_real,
      'unidad', case when r.unidad_precio = 'kg' then 'kg' when r.unidad_pedida = 'docena' then 'docenas' else 'ud' end,
      'precio', r.precio, 'base', round(r.peso_real * r.precio, 2), 'tipo_iva', r.tipo);
  end loop;

  -- Descuento de cada albarán (p. ej. «Descuento por productos»), como línea en negativo
  for r in select al.id as alb, al.serie || ' ' || lpad(al.numero::text, 7, '0') || ' · ' || to_char(al.fecha, 'DD/MM/YYYY') as alb_txt,
                  p.descuento_base, p.descuento_iva, coalesce(nullif(btrim(p.descuento_motivo), ''), 'Descuento') as motivo
           from public.pedidos p join public.albaranes al on al.pedido_id = p.id
           where p.id = any(p_pedidos) and p.descuento_base > 0
             and exists (select 1 from public.lineas_pedido l where l.pedido_id = p.id and l.peso_real is not null and l.precio is not null and l.peso_real <> 0 and l.estado <> 'no_disponible')
           order by al.fecha, al.numero loop
    n := n + 1;
    lineas := lineas || jsonb_build_object('orden', n, 'albaran_id', r.alb, 'albaran', r.alb_txt, 'descripcion', r.motivo, 'familia', null,
      'cantidad', 1, 'unidad', null, 'precio', -r.descuento_base, 'base', -r.descuento_base, 'tipo_iva', r.descuento_iva);
  end loop;

  if n = 0 and coalesce(array_length(errores, 1), 0) = 0 then errores := array_append(errores, 'No hay nada que facturar en esos albaranes.'); end if;

  -- IVA y recargo por línea (informativo) y resumen por tipo (el que vale)
  select coalesce(jsonb_agg(x || jsonb_build_object('cuota_iva', round((x->>'base')::numeric * (x->>'tipo_iva')::numeric / 100, 2),
            'tipo_re', case when c.recargo_equivalencia then public.sif_tipo_re((x->>'tipo_iva')::numeric) else 0 end,
            'cuota_re', case when c.recargo_equivalencia then round((x->>'base')::numeric * public.sif_tipo_re((x->>'tipo_iva')::numeric) / 100, 2) else 0 end)
          || jsonb_build_object('total', (x->>'base')::numeric + round((x->>'base')::numeric * (x->>'tipo_iva')::numeric / 100, 2)
            + case when c.recargo_equivalencia then round((x->>'base')::numeric * public.sif_tipo_re((x->>'tipo_iva')::numeric) / 100, 2) else 0 end)
          order by (x->>'orden')::int), '[]')
    into lineas from jsonb_array_elements(lineas) x;

  select coalesce(jsonb_agg(jsonb_build_object('tipo_iva', t, 'base', b, 'cuota_iva', round(b * t / 100, 2), 'tipo_re', tr, 'cuota_re', round(b * tr / 100, 2),
            'total', b + round(b * t / 100, 2) + round(b * tr / 100, 2)) order by t), '[]')
    into iva from (select (x->>'tipo_iva')::numeric t, sum((x->>'base')::numeric) b,
                          case when c.recargo_equivalencia then public.sif_tipo_re((x->>'tipo_iva')::numeric) else 0 end tr
                   from jsonb_array_elements(lineas) x group by 1, 3) s;
  select coalesce(sum((x->>'base')::numeric), 0), coalesce(sum((x->>'cuota_iva')::numeric), 0), coalesce(sum((x->>'cuota_re')::numeric), 0)
    into v_base, v_iva, v_re from jsonb_array_elements(iva) x;

  -- Efectivo ya cobrado en esos albaranes (si la factura llega a 1.000 €, no se podía)
  select coalesce(sum(importe), 0) into v_efectivo from public.cobros where pedido_id = any(p_pedidos) and forma = 'efectivo';
  if v_base + v_iva + v_re >= 1000 and v_efectivo > 0 then
    avisos := avisos || ('⚠️ En estos albaranes se cobraron ' || public.sif__n(v_efectivo, 2) || ' € en EFECTIVO y la factura llega a 1.000 €: entre empresas eso no está permitido (Ley 7/2012). Habla con Jorge.');
  end if;
  if v_base < 0 then errores := array_append(errores, 'El total sale en negativo: revisa los descuentos.'); end if;

  select array_agg(f order by array_position(array['fruta', 'verdura', 'patata', 'huevos'], f)) into fams
    from (select distinct x->>'familia' f from jsonb_array_elements(lineas) x where x->>'familia' is not null) s;

  return jsonb_build_object(
    'cliente_id', v_cli,
    'cliente', jsonb_build_object('codigo', c.codigo, 'nombre', c.nombre, 'nombre_comercial', c.nombre_comercial, 'nif', public.sif_nif_normal(c.nif),
                                  'direccion', c.direccion, 'codigo_postal', c.codigo_postal, 'localidad', c.localidad, 'telefono', c.telefono, 'email', c.email),
    'recargo_equivalencia', coalesce(c.recargo_equivalencia, false),
    'dias_pago', c.dias_pago, 'forma_pago_cliente', c.forma_pago,
    'concepto', 'Venta de ' || coalesce(case when array_length(fams, 1) > 1 then array_to_string(fams[1:array_length(fams, 1) - 1], ', ') || ' y ' || fams[array_length(fams, 1)] else fams[1] end, 'productos'),
    'lineas', lineas, 'iva', iva,
    'base', v_base, 'cuota_iva', v_iva, 'cuota_re', v_re, 'total', v_base + v_iva + v_re,
    'efectivo_cobrado', v_efectivo, 'efectivo_permitido', (v_base + v_iva + v_re) < 1000,
    'errores', to_jsonb(errores), 'avisos', to_jsonb(avisos),
    'serie', case when (select nombre from public.entorno) = 'pruebas' then 'PRUEBA' else 'F' end);
end $$;

-- ===== EMITIR una factura (todo o nada: si algo falla, no se gasta número) =====
create or replace function public.sif_emitir_factura(p_pedidos uuid[], p_forma_pago text, p_vencimiento date default null, p_notas text default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v jsonb; v_serie text; v_anio int; v_num int; v_cod text; v_id uuid; v_fecha date := public.sif__fecha_hoy(); xl jsonb; v_prueba boolean;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  v_serie := public.sif_serie(false);   -- en la real: bloqueado hasta activar
  v_prueba := v_serie like 'PRUEBA%';
  -- que nadie facture los mismos albaranes a la vez
  perform 1 from public.albaranes where pedido_id = any(p_pedidos) for update;
  v := public.sif_vista_previa(p_pedidos);
  if jsonb_array_length(v->'errores') > 0 then raise exception 'NO_SE_PUEDE_FACTURAR: %', (select string_agg(e, ' · ') from jsonb_array_elements_text(v->'errores') e); end if;
  if p_forma_pago is null or p_forma_pago not in ('transferencia', 'efectivo', 'tarjeta', 'bizum', 'domiciliacion', 'pagare') then raise exception 'FALTA_FORMA_PAGO'; end if;
  if p_forma_pago = 'efectivo' and (v->>'total')::numeric >= 1000 then
    raise exception 'EFECTIVO_NO_PERMITIDO: la factura llega a 1.000 € y entre empresas no se puede pagar nada en efectivo (Ley 7/2012, art. 7)';
  end if;
  if p_vencimiento is not null and p_vencimiento < v_fecha then raise exception 'VENCIMIENTO_NO_VALIDO'; end if;

  v_anio := extract(year from v_fecha)::int;
  v_num := public.sif__siguiente(v_serie, v_anio);
  v_cod := public.sif__codigo(v_serie, v_anio, v_num);
  insert into public.sif_facturas (serie, anio, numero, codigo, tipo, fecha, cliente_id, cliente, emisor, concepto, forma_pago, vencimiento, recargo_equivalencia,
                                   base, cuota_iva, cuota_re, total, prueba, version_sif, notas)
  values (v_serie, v_anio, v_num, v_cod, 'ordinaria', v_fecha, (v->>'cliente_id')::uuid, v->'cliente', public.sif__emisor(), v->>'concepto', p_forma_pago,
          coalesce(p_vencimiento, v_fecha), (v->>'recargo_equivalencia')::boolean,
          (v->>'base')::numeric, (v->>'cuota_iva')::numeric, (v->>'cuota_re')::numeric, (v->>'total')::numeric, v_prueba,
          (select version_sif from public.sif_config), nullif(btrim(coalesce(p_notas, '')), ''))
  returning id into v_id;
  for xl in select * from jsonb_array_elements(v->'lineas') loop
    insert into public.sif_factura_lineas (factura_id, orden, albaran_id, albaran, linea_pedido_id, producto_id, codigo, descripcion, familia, cantidad, unidad, precio,
                                           base, tipo_iva, cuota_iva, tipo_re, cuota_re, total)
    values (v_id, (xl->>'orden')::int, (xl->>'albaran_id')::uuid, xl->>'albaran', (xl->>'linea_pedido_id')::uuid, (xl->>'producto_id')::uuid, xl->>'codigo', xl->>'descripcion', xl->>'familia',
            (xl->>'cantidad')::numeric, xl->>'unidad', (xl->>'precio')::numeric, (xl->>'base')::numeric, (xl->>'tipo_iva')::numeric, (xl->>'cuota_iva')::numeric,
            (xl->>'tipo_re')::numeric, (xl->>'cuota_re')::numeric, (xl->>'total')::numeric);
  end loop;
  insert into public.sif_factura_iva (factura_id, tipo_iva, base, cuota_iva, tipo_re, cuota_re, total)
    select v_id, (x->>'tipo_iva')::numeric, (x->>'base')::numeric, (x->>'cuota_iva')::numeric, (x->>'tipo_re')::numeric, (x->>'cuota_re')::numeric, (x->>'total')::numeric
    from jsonb_array_elements(v->'iva') x;
  insert into public.sif_factura_albaranes (factura_id, albaran_id, pedido_id)
    select v_id, al.id, al.pedido_id from public.albaranes al where al.pedido_id = any(p_pedidos);
  -- Para que el resto de la app lo vea facturado (Camino de los pedidos, Facturas para Golden) y se pueda seguir el cobro
  insert into public.albaranes_facturados (pedido_id, numero_factura, fecha_factura, marcado_por)
    select x, v_cod, v_fecha, auth.uid() from unnest(p_pedidos) x
    on conflict (pedido_id) do update set numero_factura = excluded.numero_factura, fecha_factura = excluded.fecha_factura, marcado_por = excluded.marcado_por, marcado_en = now();
  insert into public.facturas_clientes (cliente_id, numero, fecha, importe, nota, pagada)
    values ((v->>'cliente_id')::uuid, v_cod, v_fecha, greatest((v->>'total')::numeric, 0), 'Emitida desde la app' || case when v_prueba then ' (PRUEBA, sin valor fiscal)' else '' end, false)
    on conflict (cliente_id, numero) do nothing;
  return jsonb_build_object('id', v_id, 'codigo', v_cod, 'total', (v->>'total')::numeric);
end $$;

-- ===== RECTIFICATIVA (por diferencias) =====
-- p_lineas: [{ "linea_id": <línea de la factura original>, "cantidad": nueva, "precio": nuevo }, …] solo las que cambian.
-- p_anular = true: deja la factura entera a cero (todas las líneas a 0) y sus albaranes se pueden volver a facturar.
create or replace function public.sif_emitir_rectificativa(p_factura uuid, p_motivo text, p_lineas jsonb default '[]', p_anular boolean default false, p_forma_pago text default 'compensacion')
returns jsonb language plpgsql security definer set search_path = public as $$
declare o public.sif_facturas%rowtype; v_serie text; v_anio int; v_num int; v_cod text; v_id uuid; v_fecha date := public.sif__fecha_hoy();
        r record; n int := 0; cambio jsonb; v_cant numeric; v_prec numeric; v_base_nueva numeric; v_dif numeric; tre numeric;
        v_base numeric; v_iva numeric; v_re numeric; v_prueba boolean; lineas jsonb := '[]'; iva jsonb; xl jsonb;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then raise exception 'FALTA_MOTIVO: escribe por qué se rectifica'; end if;
  select * into o from public.sif_facturas where id = p_factura for update;
  if o.id is null then raise exception 'FACTURA_NO_EXISTE'; end if;
  if o.tipo <> 'ordinaria' then raise exception 'SOLO_ORDINARIAS: para corregir una rectificativa, rectifica otra vez la factura original'; end if;
  if exists (select 1 from public.sif_facturas where rectifica_id = o.id and anula) then raise exception 'YA_ANULADA: esta factura ya se dejó a cero con una rectificativa'; end if;
  if p_forma_pago is null or p_forma_pago not in ('transferencia', 'efectivo', 'tarjeta', 'bizum', 'domiciliacion', 'pagare', 'compensacion') then raise exception 'FALTA_FORMA_PAGO'; end if;
  v_serie := public.sif_serie(true);
  v_prueba := v_serie like 'PRUEBA%';
  if v_prueba <> o.prueba then raise exception 'SERIE_EQUIVOCADA'; end if;
  v_id := gen_random_uuid();
  -- Cada línea original con su valor VIGENTE (el de la última rectificativa que la tocó, o el original)
  for r in select l.*, coalesce(u.cantidad, l.cantidad) as cant_v, coalesce(u.precio, l.precio) as prec_v,
                  l.base + coalesce((select sum(z.base) from public.sif_factura_lineas z where z.linea_origen_id = l.id), 0) as base_v
           from public.sif_factura_lineas l
           left join lateral (select z.cantidad, z.precio from public.sif_factura_lineas z join public.sif_facturas f on f.id = z.factura_id
                              where z.linea_origen_id = l.id order by f.emitida_at desc, f.numero desc limit 1) u on true
           where l.factura_id = o.id order by l.orden loop
    if p_anular then v_cant := 0; v_prec := r.prec_v;
    else
      cambio := null;
      select e into cambio from jsonb_array_elements(coalesce(p_lineas, '[]')) e where (e->>'linea_id')::uuid = r.id limit 1;
      if cambio is null then continue; end if;
      v_cant := coalesce((cambio->>'cantidad')::numeric, r.cant_v);
      v_prec := coalesce((cambio->>'precio')::numeric, r.prec_v);
      if v_cant < 0 or (r.producto_id is not null and v_prec < 0) then raise exception 'DATOS_NO_VALIDOS: cantidad y precio no pueden ser negativos'; end if;
    end if;
    v_base_nueva := round(v_cant * v_prec, 2);
    v_dif := v_base_nueva - r.base_v;
    if v_dif = 0 then continue; end if;
    n := n + 1;
    tre := case when o.recargo_equivalencia then public.sif_tipo_re(r.tipo_iva) else 0 end;
    lineas := lineas || jsonb_build_object('orden', n, 'albaran_id', r.albaran_id, 'albaran', r.albaran, 'linea_origen_id', r.id, 'producto_id', r.producto_id, 'codigo', r.codigo,
      'descripcion', r.descripcion || ' — antes ' || public.sif__n(r.cant_v, 3) || coalesce(' ' || r.unidad, '') || ' × ' || public.sif__n(r.prec_v, 2)
              || ' € · ahora ' || public.sif__n(v_cant, 3) || coalesce(' ' || r.unidad, '') || ' × ' || public.sif__n(v_prec, 2) || ' €',
      'familia', r.familia, 'cantidad', v_cant, 'unidad', r.unidad, 'precio', v_prec, 'base', v_dif, 'tipo_iva', r.tipo_iva,
      'cuota_iva', round(v_dif * r.tipo_iva / 100, 2), 'tipo_re', tre, 'cuota_re', round(v_dif * tre / 100, 2),
      'total', v_dif + round(v_dif * r.tipo_iva / 100, 2) + round(v_dif * tre / 100, 2));
  end loop;
  if n = 0 then raise exception 'SIN_CAMBIOS: no has cambiado nada'; end if;

  -- Resumen por tipo de IVA: la cuota se calcula sobre la base que queda y se le resta lo ya facturado de ese tipo
  -- (así la factura y todas sus rectificativas suman exactamente lo correcto, sin céntimos de más o de menos)
  select coalesce(jsonb_agg(jsonb_build_object('tipo_iva', t, 'base', b,
            'cuota_iva', round((bv + b) * t / 100, 2) - cv, 'tipo_re', tr, 'cuota_re', round((bv + b) * tr / 100, 2) - rv,
            'total', b + round((bv + b) * t / 100, 2) - cv + round((bv + b) * tr / 100, 2) - rv) order by t), '[]')
    into iva from (
      select d.t, d.b, d.tr,
             coalesce((select sum(i.base) from public.sif_factura_iva i join public.sif_facturas f on f.id = i.factura_id where (f.id = o.id or f.rectifica_id = o.id) and i.tipo_iva = d.t), 0) bv,
             coalesce((select sum(i.cuota_iva) from public.sif_factura_iva i join public.sif_facturas f on f.id = i.factura_id where (f.id = o.id or f.rectifica_id = o.id) and i.tipo_iva = d.t), 0) cv,
             coalesce((select sum(i.cuota_re) from public.sif_factura_iva i join public.sif_facturas f on f.id = i.factura_id where (f.id = o.id or f.rectifica_id = o.id) and i.tipo_iva = d.t), 0) rv
      from (select (x->>'tipo_iva')::numeric t, sum((x->>'base')::numeric) b, max((x->>'tipo_re')::numeric) tr from jsonb_array_elements(lineas) x group by 1) d) s;
  select sum((x->>'base')::numeric), sum((x->>'cuota_iva')::numeric), sum((x->>'cuota_re')::numeric) into v_base, v_iva, v_re from jsonb_array_elements(iva) x;
  if p_forma_pago = 'efectivo' and (o.total >= 1000 or abs(v_base + v_iva + v_re) >= 1000) then
    raise exception 'EFECTIVO_NO_PERMITIDO: la operación llega a 1.000 € y entre empresas no se puede pagar nada en efectivo (Ley 7/2012, art. 7)';
  end if;

  v_anio := extract(year from v_fecha)::int;
  v_num := public.sif__siguiente(v_serie, v_anio);
  v_cod := public.sif__codigo(v_serie, v_anio, v_num);
  insert into public.sif_facturas (id, serie, anio, numero, codigo, tipo, fecha, cliente_id, cliente, emisor, concepto, forma_pago, vencimiento, recargo_equivalencia,
                                   base, cuota_iva, cuota_re, total, rectifica_id, rectifica_codigo, motivo, anula, prueba, version_sif)
  values (v_id, v_serie, v_anio, v_num, v_cod, 'rectificativa', v_fecha, o.cliente_id, o.cliente, public.sif__emisor(),
          'Rectificación de la factura ' || o.codigo || ' (' || to_char(o.fecha, 'DD/MM/YYYY') || ')', p_forma_pago, v_fecha, o.recargo_equivalencia,
          v_base, v_iva, v_re, v_base + v_iva + v_re, o.id, o.codigo, btrim(p_motivo), p_anular, v_prueba, (select version_sif from public.sif_config));
  for xl in select * from jsonb_array_elements(lineas) loop
    insert into public.sif_factura_lineas (factura_id, orden, albaran_id, albaran, linea_origen_id, producto_id, codigo, descripcion, familia, cantidad, unidad, precio,
                                           base, tipo_iva, cuota_iva, tipo_re, cuota_re, total)
    values (v_id, (xl->>'orden')::int, (xl->>'albaran_id')::uuid, xl->>'albaran', (xl->>'linea_origen_id')::uuid, (xl->>'producto_id')::uuid, xl->>'codigo', xl->>'descripcion', xl->>'familia',
            (xl->>'cantidad')::numeric, xl->>'unidad', (xl->>'precio')::numeric, (xl->>'base')::numeric, (xl->>'tipo_iva')::numeric, (xl->>'cuota_iva')::numeric,
            (xl->>'tipo_re')::numeric, (xl->>'cuota_re')::numeric, (xl->>'total')::numeric);
  end loop;
  insert into public.sif_factura_iva (factura_id, tipo_iva, base, cuota_iva, tipo_re, cuota_re, total)
    select v_id, (x->>'tipo_iva')::numeric, (x->>'base')::numeric, (x->>'cuota_iva')::numeric, (x->>'tipo_re')::numeric, (x->>'cuota_re')::numeric, (x->>'total')::numeric
    from jsonb_array_elements(iva) x;

  if p_anular then   -- sus albaranes vuelven a estar «sin facturar»
    delete from public.albaranes_facturados af using public.sif_factura_albaranes fa
      where fa.factura_id = o.id and af.pedido_id = fa.pedido_id and af.numero_factura = o.codigo;
  end if;
  return jsonb_build_object('id', v_id, 'codigo', v_cod, 'total', v_base + v_iva + v_re);
end $$;

-- Valores VIGENTES de cada línea de una factura (original + rectificativas), para la pantalla de rectificar
create or replace function public.sif_lineas_vigentes(p_factura uuid) returns table (linea_id uuid, orden int, albaran text, descripcion text, unidad text, tipo_iva numeric,
  cantidad numeric, precio numeric, base numeric, es_descuento boolean) language sql stable security definer set search_path = public as $$
  select l.id, l.orden, l.albaran, l.descripcion, l.unidad, l.tipo_iva, coalesce(u.cantidad, l.cantidad), coalesce(u.precio, l.precio),
         l.base + coalesce((select sum(z.base) from public.sif_factura_lineas z where z.linea_origen_id = l.id), 0), l.producto_id is null
  from public.sif_factura_lineas l
  left join lateral (select z.cantidad, z.precio from public.sif_factura_lineas z join public.sif_facturas f on f.id = z.factura_id
                     where z.linea_origen_id = l.id order by f.emitida_at desc, f.numero desc limit 1) u on true
  where l.factura_id = p_factura and public.rol_actual() in ('oficina', 'admin')
  order by l.orden
$$;

revoke all on function public.sif_vista_previa(uuid[]) from public, anon;
revoke all on function public.sif_emitir_factura(uuid[], text, date, text) from public, anon;
revoke all on function public.sif_emitir_rectificativa(uuid, text, jsonb, boolean, text) from public, anon;
revoke all on function public.sif_lineas_vigentes(uuid) from public, anon;
revoke all on function public.sif__siguiente(text, int) from public, anon, authenticated;
revoke all on function public.sif_serie(boolean) from public, anon, authenticated;
revoke all on function public.sif__emisor() from public, anon, authenticated;
grant execute on function public.sif_vista_previa(uuid[]) to authenticated;
grant execute on function public.sif_emitir_factura(uuid[], text, date, text) to authenticated;
grant execute on function public.sif_emitir_rectificativa(uuid, text, jsonb, boolean, text) to authenticated;
grant execute on function public.sif_lineas_vigentes(uuid) to authenticated;
