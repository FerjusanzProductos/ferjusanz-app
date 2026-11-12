-- Estructura completa de la base de FERJUSANZ (public + harvey), generada desde producción.
-- No lleva datos. Generada por Claude el 12/11/2026 con scripts/esquema/ddl.py y aplicada en ferjusanz-pruebas sin fallos.
set check_function_bodies = off;
set client_min_messages = warning;
create extension if not exists pg_cron with schema pg_catalog;
create schema if not exists harvey;
create sequence if not exists harvey.notas_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists harvey.proveedor_preferido_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists harvey.registro_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists public.albaran_f_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 6000 cache 1;
create sequence if not exists public.ayudas_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists public.contactos_portal_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists public.historial_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create sequence if not exists public.whatsapp_mensajes_id_seq as bigint increment 1 minvalue 1 maxvalue 9223372036854775807 start 1 cache 1;
create table if not exists "harvey"."borradores" (
  id uuid default gen_random_uuid() not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  usuario uuid,
  cliente_id uuid not null,
  fecha_entrega date,
  texto_original text not null,
  lineas jsonb default '[]'::jsonb not null,
  preguntas jsonb default '[]'::jsonb not null,
  estado text default 'pendiente'::text not null
);
create table if not exists "harvey"."contactos" (
  id uuid default gen_random_uuid() not null,
  cliente_id uuid,
  prospecto_id uuid,
  fecha date not null,
  tipo text not null,
  mensaje text,
  canal text default 'whatsapp_manual'::text not null,
  usuario uuid,
  created_at timestamp with time zone default now() not null
);
create table if not exists "harvey"."listas_auto" (
  lista_id uuid not null,
  margen numeric(6,2) not null,
  margen_min numeric(6,2) not null,
  margen_max numeric(6,2) not null,
  etiqueta text not null
);
create table if not exists "harvey"."listas_borrador" (
  id uuid default gen_random_uuid() not null,
  lista_id uuid not null,
  margen numeric(6,2) not null,
  items jsonb not null,
  estado text default 'pendiente'::text not null,
  automatico boolean default false not null,
  created_at timestamp with time zone default now() not null,
  resuelto_en timestamp with time zone,
  resuelto_por uuid,
  aplicados jsonb
);
create table if not exists "harvey"."notas" (
  id bigint default nextval('harvey.notas_id_seq'::regclass) not null,
  tema text not null,
  texto text not null,
  activa boolean default true not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "harvey"."precios_fijos" (
  lista_id uuid not null,
  producto_id uuid not null,
  precio numeric(10,3) not null,
  nota text
);
create table if not exists "harvey"."preferencias" (
  cliente_id uuid not null,
  whatsapp text,
  no_contactar boolean default false not null,
  acepta_whatsapp boolean default false not null,
  dias smallint[],
  hora time without time zone,
  max_semana smallint default 3 not null,
  pausado_hasta date,
  notas text,
  updated_at timestamp with time zone default now() not null,
  updated_by uuid
);
create table if not exists "harvey"."proveedor_preferido" (
  id bigint default nextval('harvey.proveedor_preferido_id_seq'::regclass) not null,
  patron text not null,
  proveedor_id uuid not null,
  aviso text
);
create table if not exists "harvey"."registro" (
  id bigint default nextval('harvey.registro_id_seq'::regclass) not null,
  created_at timestamp with time zone default now() not null,
  usuario uuid,
  accion text not null,
  cliente_id uuid,
  detalle jsonb
);
create table if not exists "public"."abreviaturas" (
  abrev text not null,
  unidad text not null
);
create table if not exists "public"."albaran_enlaces" (
  pedido_id uuid not null,
  token text not null,
  envios jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."albaran_portal" (
  pedido_id uuid not null,
  publicado_at timestamp with time zone default now() not null,
  publicado_por uuid default auth.uid()
);
create table if not exists "public"."albaranes" (
  id uuid default gen_random_uuid() not null,
  pedido_id uuid not null,
  serie text default 'F'::text not null,
  numero integer default nextval('albaran_f_seq'::regclass) not null,
  fecha date default CURRENT_DATE not null,
  estado text default 'emitido'::text not null,
  motivo_anulacion text,
  created_at timestamp with time zone default now() not null,
  traza_estado text,
  traza_motivo text,
  traza_por uuid,
  traza_at timestamp with time zone,
  firma_png text,
  firma_nombre text,
  firma_at timestamp with time zone
);
create table if not exists "public"."albaranes_facturados" (
  pedido_id uuid not null,
  numero_factura text not null,
  fecha_factura date,
  marcado_por uuid,
  marcado_en timestamp with time zone default now() not null
);
create table if not exists "public"."alias_compra" (
  id uuid default gen_random_uuid() not null,
  proveedor_id uuid not null,
  texto text not null,
  producto_id uuid not null,
  actualizado timestamp with time zone default now() not null
);
create table if not exists "public"."asignaciones_lote" (
  id uuid default gen_random_uuid() not null,
  linea_id uuid not null,
  lote_id uuid not null,
  cantidad numeric(10,3) not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."avisos" (
  id uuid default gen_random_uuid() not null,
  tipo text default 'aviso'::text not null,
  para text default 'equipo'::text not null,
  titulo text not null,
  texto text,
  fijado boolean default false not null,
  caduca date,
  archivado boolean default false not null,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."ayudas" (
  id bigint default nextval('ayudas_id_seq'::regclass) not null,
  usuario_id uuid default auth.uid() not null,
  nombre text,
  nota text,
  vista text,
  titulo text,
  params jsonb,
  errores jsonb,
  info jsonb,
  estado text default 'nueva'::text not null,
  created_at timestamp with time zone default now() not null,
  atendida_por uuid,
  atendida_en timestamp with time zone,
  audio text,
  ia jsonb
);
create table if not exists "public"."carga_lineas" (
  linea_id uuid not null,
  cargado boolean default false not null,
  por uuid default auth.uid(),
  en timestamp with time zone default now() not null
);
create table if not exists "public"."cliente_enlaces" (
  cliente_id uuid not null,
  token text not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."clientes" (
  id uuid default gen_random_uuid() not null,
  codigo text not null,
  nombre text not null,
  nombre_comercial text,
  nif text,
  telefono text,
  direccion text,
  codigo_postal text,
  localidad text,
  ruta text,
  forma_pago text default 'credito'::text not null,
  activo boolean default true not null,
  notas text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  email text,
  recargo_equivalencia boolean default false not null,
  abre time without time zone,
  cierra time without time zone,
  franja_desde time without time zone,
  franja_hasta time without time zone,
  tiempo_parada integer default 10 not null,
  notas_reparto text,
  lat numeric(9,6),
  lng numeric(9,6),
  dias_pago integer,
  alias text[] default '{}'::text[] not null,
  sin_iva boolean default false not null,
  albaran_papel boolean default false not null,
  albaran_por_correo boolean default true not null
);
create table if not exists "public"."cobros" (
  id uuid default gen_random_uuid() not null,
  pedido_id uuid not null,
  cliente_id uuid not null,
  importe numeric(10,2) not null,
  forma text not null,
  nota text,
  clave text,
  cobrado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."compra_ajustes" (
  id uuid default gen_random_uuid() not null,
  fecha date not null,
  producto_id uuid not null,
  unidad text not null,
  cantidad numeric,
  nota text,
  extra boolean default false not null,
  actualizado_por uuid,
  actualizado_en timestamp with time zone default now() not null
);
create table if not exists "public"."compras" (
  id uuid default gen_random_uuid() not null,
  proveedor_id uuid not null,
  fecha date default CURRENT_DATE not null,
  numero_documento text,
  documento_url text,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."contactos_portal" (
  id bigint default nextval('contactos_portal_id_seq'::regclass) not null,
  cliente_id uuid not null,
  movil text,
  email text,
  nombre text,
  origen text,
  created_at timestamp with time zone default now() not null,
  estado text default 'nuevo'::text not null,
  resuelto_por uuid,
  resuelto_en timestamp with time zone
);
create table if not exists "public"."copia_config" (
  id integer default 1 not null,
  clave_hash text not null,
  actualizado timestamp with time zone default now() not null
);
create table if not exists "public"."documentos_compra" (
  id uuid default gen_random_uuid() not null,
  fecha date default CURRENT_DATE not null,
  proveedor_id uuid,
  compra_id uuid,
  tipo text default 'factura'::text not null,
  ruta text not null,
  nombre text,
  importe numeric(12,2),
  nota text,
  archivado boolean default false not null,
  subido_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  pagada boolean default false not null,
  fecha_pago date
);
create table if not exists "public"."entregas" (
  pedido_id uuid not null,
  entregado_por uuid default auth.uid(),
  entregado_at timestamp with time zone default now() not null,
  nota text,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."envios_correo" (
  pedido_id uuid not null,
  email text not null,
  estado text default 'enviando'::text not null,
  error text,
  created_at timestamp with time zone default now() not null,
  enviado_at timestamp with time zone
);
create table if not exists "public"."facturas_clientes" (
  id uuid default gen_random_uuid() not null,
  cliente_id uuid not null,
  numero text not null,
  fecha date default CURRENT_DATE not null,
  importe numeric(12,2) not null,
  pagada boolean default false not null,
  fecha_pago date,
  nota text,
  ruta text,
  nombre text,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."facturas_recibidas" (
  id uuid default gen_random_uuid() not null,
  recibido_en timestamp with time zone default now() not null,
  remitente text,
  asunto text,
  fecha_correo timestamp with time zone,
  ruta text not null,
  nombre text,
  hash text,
  proveedor_id uuid,
  compra_id uuid,
  estado text default 'nueva'::text not null,
  fecha_factura date
);
create table if not exists "public"."fichajes" (
  id uuid default gen_random_uuid() not null,
  usuario_id uuid default auth.uid() not null,
  entrada timestamp with time zone not null,
  salida timestamp with time zone,
  sin_conexion boolean default false not null,
  nota text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists "public"."formatos_cliente" (
  id uuid default gen_random_uuid() not null,
  cliente_id uuid not null,
  producto_id uuid not null,
  formato text not null,
  peso_estimado_kg numeric(10,3),
  peso_variable boolean default false not null,
  usos integer default 1 not null,
  ultima timestamp with time zone default now() not null
);
create table if not exists "public"."formatos_producto" (
  id uuid default gen_random_uuid() not null,
  producto_id uuid not null,
  formato text not null,
  peso_estimado_kg numeric(10,3),
  peso_variable boolean default false not null,
  predeterminado boolean default false not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."fotos_perfil" (
  usuario_id uuid not null,
  foto text not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists "public"."golden_facturas" (
  id uuid default gen_random_uuid() not null,
  numero text not null,
  serie text,
  fecha date not null,
  tipo text,
  cliente_codigo text,
  cliente_nombre text,
  bruto numeric(14,2),
  descuentos numeric(14,2),
  gastos numeric(14,2),
  base numeric(14,2),
  total numeric(14,2),
  borrador boolean default false not null,
  n_lineas integer
);
create table if not exists "public"."golden_lineas" (
  id uuid default gen_random_uuid() not null,
  factura_numero text not null,
  orden integer,
  albaran text,
  producto_codigo text,
  descripcion text,
  cantidad numeric(14,3),
  precio numeric(14,4),
  iva numeric(5,2),
  importe numeric(14,2)
);
create table if not exists "public"."historial" (
  id bigint generated always as identity not null,
  tabla text not null,
  registro_id uuid,
  accion text not null,
  usuario uuid,
  fecha timestamp with time zone default now() not null,
  antes jsonb,
  despues jsonb
);
create table if not exists "public"."incidencias" (
  id uuid default gen_random_uuid() not null,
  tipo text not null,
  pedido_id uuid,
  linea_id uuid,
  lote_id uuid,
  cliente_id uuid,
  cantidad numeric(10,3),
  nota text,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  producto_id uuid,
  proveedor_id uuid,
  resuelta boolean default false not null,
  archivado boolean default false not null,
  foto text,
  con_foto boolean generated always as ((foto IS NOT NULL)) stored
);
create table if not exists "public"."lineas_factura_leida" (
  id uuid default gen_random_uuid() not null,
  factura_id uuid not null,
  proveedor_id uuid,
  fecha date not null,
  texto text not null,
  cantidad numeric,
  unidad text,
  precio numeric,
  importe numeric,
  producto_id uuid,
  dudoso boolean default false not null,
  leido_en timestamp with time zone default now() not null
);
create table if not exists "public"."lineas_habituales" (
  id uuid default gen_random_uuid() not null,
  habitual_id uuid not null,
  producto_id uuid not null,
  cantidad numeric(10,3) not null,
  unidad text not null
);
create table if not exists "public"."lineas_pedido" (
  id uuid default gen_random_uuid() not null,
  pedido_id uuid not null,
  producto_id uuid not null,
  cantidad_pedida numeric(10,3) not null,
  unidad_pedida text not null,
  peso_real numeric(10,3),
  unidad_precio text default 'kg'::text not null,
  precio numeric(10,3),
  estado text default 'pendiente'::text not null,
  preparado_por uuid,
  preparado_en timestamp with time zone,
  notas text,
  version integer default 1 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  iva numeric(4,1),
  formato_peso_kg numeric(10,3),
  peso_estimado numeric(10,3),
  peso_variable boolean default false not null,
  venta_ruta boolean default false not null,
  precio_lista numeric,
  nota_interna text
);
create table if not exists "public"."listas_precios" (
  id uuid default gen_random_uuid() not null,
  nombre text not null,
  tipo text default 'otra'::text not null,
  titulo text,
  subtitulo text,
  pie text,
  incluir_recomendaciones boolean default true not null,
  activa boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  presentacion text
);
create table if not exists "public"."listas_precios_items" (
  id uuid default gen_random_uuid() not null,
  lista_id uuid not null,
  producto_id uuid,
  nombre text not null,
  precio numeric(12,3),
  unidad text default 'kg'::text not null,
  nota text,
  orden integer default 0 not null,
  coste numeric(12,3)
);
create table if not exists "public"."lotes" (
  id uuid default gen_random_uuid() not null,
  compra_id uuid not null,
  producto_id uuid not null,
  origen text,
  codigo_lote text,
  cantidad_recibida numeric(10,3) not null,
  unidad text default 'kg'::text not null,
  created_at timestamp with time zone default now() not null,
  precio_compra numeric(10,4),
  archivado boolean default false not null
);
create table if not exists "public"."mensajes" (
  id uuid default gen_random_uuid() not null,
  autor uuid default auth.uid() not null,
  texto text not null,
  creado timestamp with time zone default now() not null
);
create table if not exists "public"."pedidos" (
  id uuid default gen_random_uuid() not null,
  cliente_id uuid not null,
  fecha_entrega date not null,
  estado text default 'pendiente'::text not null,
  preparador_id uuid,
  notas text,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  archivado boolean default false not null,
  mensaje_origen text,
  origen text,
  hash_origen text,
  hora_limite time without time zone,
  archivos jsonb,
  repartidor_id uuid,
  orden_reparto integer,
  descuento_base numeric(12,2) default 0 not null,
  descuento_iva numeric(5,2) default 4 not null,
  descuento_motivo text
);
create table if not exists "public"."pedidos_habituales" (
  id uuid default gen_random_uuid() not null,
  cliente_id uuid not null,
  nombre text,
  dias_semana integer[] default '{}'::integer[] not null,
  notas text,
  activo boolean default true not null,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  repartidor_id uuid,
  tipo text default 'fijo'::text not null
);
create table if not exists "public"."perfiles" (
  id uuid not null,
  nombre text not null,
  rol text not null,
  activo boolean default true not null,
  created_at timestamp with time zone default now() not null,
  color_reparto text,
  reparte boolean default false not null
);
create table if not exists "public"."portal_ajustes" (
  id integer default 1 not null,
  meses_visibles integer default 6 not null
);
create table if not exists "public"."precios_compra_dia" (
  id uuid default gen_random_uuid() not null,
  fecha date not null,
  producto_id uuid not null,
  unidad text not null,
  precio numeric not null,
  nota text,
  actualizado_por uuid,
  actualizado_en timestamp with time zone default now() not null
);
create table if not exists "public"."presentaciones" (
  id uuid default gen_random_uuid() not null,
  titulo text not null,
  diapositivas jsonb default '[]'::jsonb not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
create table if not exists "public"."productos" (
  id uuid default gen_random_uuid() not null,
  codigo text not null,
  nombre text not null,
  unidad_venta text default 'kg'::text not null,
  unidad_precio text default 'kg'::text not null,
  calidad text,
  calibre text,
  coste_compra numeric(10,3),
  activo boolean default true not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  iva numeric(4,1) default 4 not null,
  alias text[] default '{}'::text[] not null,
  iva_origen text,
  nombre_albaran text,
  unidad_compra text,
  compra_trae numeric
);
create table if not exists "public"."prospectos" (
  id uuid default gen_random_uuid() not null,
  nombre text not null,
  tipo text default 'otro'::text not null,
  direccion text,
  localidad text,
  telefono text,
  email text,
  web text,
  redes text,
  fuente text,
  estado text default 'nuevo'::text not null,
  notas text,
  proximo_contacto date,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."proveedores" (
  id uuid default gen_random_uuid() not null,
  codigo text,
  nombre text not null,
  telefono text,
  activo boolean default true not null,
  created_at timestamp with time zone default now() not null,
  email text
);
create table if not exists "public"."push_suscripciones" (
  id uuid default gen_random_uuid() not null,
  usuario_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  dispositivo text,
  creado_en timestamp with time zone default now() not null
);
create table if not exists "public"."recomendaciones" (
  id uuid default gen_random_uuid() not null,
  producto_id uuid,
  titulo text not null,
  texto text,
  precio numeric(12,3),
  unidad text default 'kg'::text not null,
  desde date,
  hasta date,
  activa boolean default true not null,
  orden integer default 0 not null,
  created_at timestamp with time zone default now() not null
);
create table if not exists "public"."sobrante" (
  id uuid default gen_random_uuid() not null,
  fecha date not null,
  producto_id uuid not null,
  cantidad numeric(10,3) not null,
  unidad text not null,
  nota text,
  creado_por uuid default auth.uid(),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  repartidor_id uuid
);
create table if not exists "public"."tarifas" (
  id uuid default gen_random_uuid() not null,
  producto_id uuid not null,
  cliente_id uuid,
  precio numeric(10,3) not null,
  desde date default CURRENT_DATE not null,
  created_at timestamp with time zone default now() not null,
  origen text
);
create table if not exists "public"."tarifas_compra" (
  id uuid default gen_random_uuid() not null,
  producto_id uuid not null,
  proveedor_id uuid not null,
  precio numeric(10,4) not null,
  fecha date,
  origen text,
  updated_at timestamp with time zone default now() not null,
  unidad text
);
create table if not exists "public"."whatsapp_mensajes" (
  id bigint default nextval('whatsapp_mensajes_id_seq'::regclass) not null,
  created_at timestamp with time zone default now() not null,
  telefono text not null,
  nombre_contacto text,
  cliente_id uuid,
  direccion text not null,
  texto text,
  tipo text default 'text'::text not null,
  wa_id text,
  estado text default 'nuevo'::text not null,
  propuesta text,
  enviado_por uuid,
  error text
);
alter table harvey.borradores add constraint borradores_pkey PRIMARY KEY (id);
alter table harvey.contactos add constraint contactos_pkey PRIMARY KEY (id);
alter table harvey.listas_auto add constraint listas_auto_pkey PRIMARY KEY (lista_id);
alter table harvey.listas_borrador add constraint listas_borrador_pkey PRIMARY KEY (id);
alter table harvey.notas add constraint notas_pkey PRIMARY KEY (id);
alter table harvey.precios_fijos add constraint precios_fijos_pkey PRIMARY KEY (lista_id, producto_id);
alter table harvey.preferencias add constraint preferencias_pkey PRIMARY KEY (cliente_id);
alter table harvey.proveedor_preferido add constraint proveedor_preferido_pkey PRIMARY KEY (id);
alter table harvey.registro add constraint registro_pkey PRIMARY KEY (id);
alter table public.abreviaturas add constraint abreviaturas_pkey PRIMARY KEY (abrev);
alter table public.albaran_enlaces add constraint albaran_enlaces_pkey PRIMARY KEY (pedido_id);
alter table public.albaran_portal add constraint albaran_portal_pkey PRIMARY KEY (pedido_id);
alter table public.albaranes add constraint albaranes_pkey PRIMARY KEY (id);
alter table public.albaranes_facturados add constraint albaranes_facturados_pkey PRIMARY KEY (pedido_id);
alter table public.alias_compra add constraint alias_compra_pkey PRIMARY KEY (id);
alter table public.asignaciones_lote add constraint asignaciones_lote_pkey PRIMARY KEY (id);
alter table public.avisos add constraint avisos_pkey PRIMARY KEY (id);
alter table public.ayudas add constraint ayudas_pkey PRIMARY KEY (id);
alter table public.carga_lineas add constraint carga_lineas_pkey PRIMARY KEY (linea_id);
alter table public.cliente_enlaces add constraint cliente_enlaces_pkey PRIMARY KEY (cliente_id);
alter table public.clientes add constraint clientes_pkey PRIMARY KEY (id);
alter table public.cobros add constraint cobros_pkey PRIMARY KEY (id);
alter table public.compra_ajustes add constraint compra_ajustes_pkey PRIMARY KEY (id);
alter table public.compras add constraint compras_pkey PRIMARY KEY (id);
alter table public.contactos_portal add constraint contactos_portal_pkey PRIMARY KEY (id);
alter table public.copia_config add constraint copia_config_pkey PRIMARY KEY (id);
alter table public.documentos_compra add constraint documentos_compra_pkey PRIMARY KEY (id);
alter table public.entregas add constraint entregas_pkey PRIMARY KEY (pedido_id);
alter table public.envios_correo add constraint envios_correo_pkey PRIMARY KEY (pedido_id);
alter table public.facturas_clientes add constraint facturas_clientes_pkey PRIMARY KEY (id);
alter table public.facturas_recibidas add constraint facturas_recibidas_pkey PRIMARY KEY (id);
alter table public.fichajes add constraint fichajes_pkey PRIMARY KEY (id);
alter table public.formatos_cliente add constraint formatos_cliente_pkey PRIMARY KEY (id);
alter table public.formatos_producto add constraint formatos_producto_pkey PRIMARY KEY (id);
alter table public.fotos_perfil add constraint fotos_perfil_pkey PRIMARY KEY (usuario_id);
alter table public.golden_facturas add constraint golden_facturas_pkey PRIMARY KEY (id);
alter table public.golden_lineas add constraint golden_lineas_pkey PRIMARY KEY (id);
alter table public.historial add constraint historial_pkey PRIMARY KEY (id);
alter table public.incidencias add constraint incidencias_pkey PRIMARY KEY (id);
alter table public.lineas_factura_leida add constraint lineas_factura_leida_pkey PRIMARY KEY (id);
alter table public.lineas_habituales add constraint lineas_habituales_pkey PRIMARY KEY (id);
alter table public.lineas_pedido add constraint lineas_pedido_pkey PRIMARY KEY (id);
alter table public.listas_precios add constraint listas_precios_pkey PRIMARY KEY (id);
alter table public.listas_precios_items add constraint listas_precios_items_pkey PRIMARY KEY (id);
alter table public.lotes add constraint lotes_pkey PRIMARY KEY (id);
alter table public.mensajes add constraint mensajes_pkey PRIMARY KEY (id);
alter table public.pedidos add constraint pedidos_pkey PRIMARY KEY (id);
alter table public.pedidos_habituales add constraint pedidos_habituales_pkey PRIMARY KEY (id);
alter table public.perfiles add constraint perfiles_pkey PRIMARY KEY (id);
alter table public.portal_ajustes add constraint portal_ajustes_pkey PRIMARY KEY (id);
alter table public.precios_compra_dia add constraint precios_compra_dia_pkey PRIMARY KEY (id);
alter table public.presentaciones add constraint presentaciones_pkey PRIMARY KEY (id);
alter table public.productos add constraint productos_pkey PRIMARY KEY (id);
alter table public.prospectos add constraint prospectos_pkey PRIMARY KEY (id);
alter table public.proveedores add constraint proveedores_pkey PRIMARY KEY (id);
alter table public.push_suscripciones add constraint push_suscripciones_pkey PRIMARY KEY (id);
alter table public.recomendaciones add constraint recomendaciones_pkey PRIMARY KEY (id);
alter table public.sobrante add constraint sobrante_pkey PRIMARY KEY (id);
alter table public.tarifas add constraint tarifas_pkey PRIMARY KEY (id);
alter table public.tarifas_compra add constraint tarifas_compra_pkey PRIMARY KEY (id);
alter table public.whatsapp_mensajes add constraint whatsapp_mensajes_pkey PRIMARY KEY (id);
alter table harvey.borradores add constraint borradores_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'pasado'::text, 'descartado'::text])));
alter table harvey.contactos add constraint contactos_check CHECK (((cliente_id IS NOT NULL) OR (prospecto_id IS NOT NULL)));
alter table harvey.listas_borrador add constraint listas_borrador_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'aplicado'::text, 'descartado'::text, 'reemplazado'::text, 'deshecho'::text])));
alter table public.albaran_enlaces add constraint albaran_enlaces_token_key UNIQUE (token);
alter table public.albaranes add constraint albaranes_estado_check CHECK ((estado = ANY (ARRAY['emitido'::text, 'anulado'::text])));
alter table public.albaranes add constraint albaranes_pedido_id_key UNIQUE (pedido_id);
alter table public.albaranes add constraint albaranes_serie_numero_key UNIQUE (serie, numero);
alter table public.albaranes add constraint albaranes_traza_estado_chk CHECK (((traza_estado IS NULL) OR (traza_estado = ANY (ARRAY['confirmada'::text, 'sin_trazabilidad'::text]))));
alter table public.alias_compra add constraint alias_compra_proveedor_id_texto_key UNIQUE (proveedor_id, texto);
alter table public.asignaciones_lote add constraint asignaciones_lote_cantidad_check CHECK ((cantidad >= (0)::numeric));
alter table public.ayudas add constraint ayudas_estado_check CHECK ((estado = ANY (ARRAY['nueva'::text, 'atendida'::text])));
alter table public.cliente_enlaces add constraint cliente_enlaces_token_key UNIQUE (token);
alter table public.clientes add constraint clientes_codigo_key UNIQUE (codigo);
alter table public.clientes add constraint clientes_forma_pago_check CHECK ((forma_pago = ANY (ARRAY['contado'::text, 'credito'::text])));
alter table public.cobros add constraint cobros_clave_key UNIQUE (clave);
alter table public.cobros add constraint cobros_forma_check CHECK ((forma = ANY (ARRAY['efectivo'::text, 'tarjeta'::text, 'bizum'::text, 'transferencia'::text, 'otro'::text])));
alter table public.cobros add constraint cobros_importe_check CHECK ((importe > (0)::numeric));
alter table public.compra_ajustes add constraint compra_ajustes_cantidad_check CHECK (((cantidad IS NULL) OR (cantidad >= (0)::numeric)));
alter table public.compra_ajustes add constraint compra_ajustes_fecha_producto_id_unidad_key UNIQUE (fecha, producto_id, unidad);
alter table public.contactos_portal add constraint contactos_portal_estado_check CHECK ((estado = ANY (ARRAY['nuevo'::text, 'guardado'::text, 'descartado'::text])));
alter table public.copia_config add constraint copia_config_id_check CHECK ((id = 1));
alter table public.envios_correo add constraint envios_correo_estado_check CHECK ((estado = ANY (ARRAY['enviando'::text, 'enviado'::text, 'error'::text])));
alter table public.facturas_clientes add constraint facturas_clientes_cliente_id_numero_key UNIQUE (cliente_id, numero);
alter table public.facturas_clientes add constraint facturas_clientes_importe_check CHECK ((importe >= (0)::numeric));
alter table public.facturas_recibidas add constraint facturas_recibidas_estado_check CHECK ((estado = ANY (ARRAY['nueva'::text, 'enlazada'::text, 'descartada'::text])));
alter table public.facturas_recibidas add constraint facturas_recibidas_hash_key UNIQUE (hash);
alter table public.fichajes add constraint fichajes_check CHECK (((salida IS NULL) OR (salida >= entrada)));
alter table public.formatos_cliente add constraint formatos_cliente_cliente_id_producto_id_formato_key UNIQUE (cliente_id, producto_id, formato);
alter table public.formatos_cliente add constraint formatos_cliente_formato_check CHECK ((formato = ANY (ARRAY['saco'::text, 'caja'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'pieza'::text, 'bote'::text])));
alter table public.formatos_cliente add constraint formatos_cliente_peso_estimado_kg_check CHECK (((peso_estimado_kg IS NULL) OR (peso_estimado_kg > (0)::numeric)));
alter table public.formatos_producto add constraint formatos_producto_formato_check CHECK ((formato = ANY (ARRAY['saco'::text, 'caja'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'pieza'::text, 'bote'::text])));
alter table public.formatos_producto add constraint formatos_producto_peso_estimado_kg_check CHECK (((peso_estimado_kg IS NULL) OR (peso_estimado_kg > (0)::numeric)));
alter table public.fotos_perfil add constraint fotos_perfil_foto_check CHECK ((length(foto) < 120000));
alter table public.golden_facturas add constraint golden_facturas_numero_key UNIQUE (numero);
alter table public.incidencias add constraint incidencias_foto_tam CHECK (((foto IS NULL) OR (length(foto) < 600000)));
alter table public.incidencias add constraint incidencias_tipo_check CHECK ((tipo = ANY (ARRAY['queja'::text, 'calidad'::text, 'devolucion'::text, 'merma'::text, 'falta'::text, 'otra'::text])));
alter table public.lineas_factura_leida add constraint lineas_factura_leida_factura_id_texto_precio_key UNIQUE (factura_id, texto, precio);
alter table public.lineas_habituales add constraint lineas_habituales_cantidad_check CHECK ((cantidad > (0)::numeric));
alter table public.lineas_pedido add constraint lineas_pedido_cantidad_pedida_check CHECK ((cantidad_pedida >= (0)::numeric));
alter table public.lineas_pedido add constraint lineas_pedido_estado_check CHECK ((estado = ANY (ARRAY['pendiente'::text, 'hecha'::text, 'parcial'::text, 'no_disponible'::text])));
alter table public.lineas_pedido add constraint lineas_pedido_peso_real_check CHECK ((peso_real >= (0)::numeric));
alter table public.lineas_pedido add constraint lineas_pedido_unidad_pedida_check CHECK ((unidad_pedida = ANY (ARRAY['kg'::text, 'pieza'::text, 'caja'::text, 'saco'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'docena'::text, 'bote'::text])));
alter table public.lineas_pedido add constraint lineas_pedido_unidad_precio_check CHECK ((unidad_precio = ANY (ARRAY['kg'::text, 'unidad'::text])));
alter table public.lineas_pedido add constraint lineas_precio_lista_ok CHECK (((precio_lista IS NULL) OR (precio_lista >= (0)::numeric)));
alter table public.listas_precios add constraint listas_precios_tipo_check CHECK ((tipo = ANY (ARRAY['hosteleria'::text, 'colectivos'::text, 'nuevos'::text, 'ofertas'::text, 'otra'::text])));
alter table public.listas_precios_items add constraint listas_precios_items_precio_check CHECK ((precio >= (0)::numeric));
alter table public.lotes add constraint lotes_cantidad_recibida_check CHECK ((cantidad_recibida >= (0)::numeric));
alter table public.mensajes add constraint mensajes_texto_check CHECK (((length(TRIM(BOTH FROM texto)) > 0) AND (length(texto) <= 2000)));
alter table public.pedidos add constraint pedidos_descuento_ok CHECK (((descuento_base >= (0)::numeric) AND (descuento_iva = ANY (ARRAY[(0)::numeric, (4)::numeric, (10)::numeric, (21)::numeric]))));
alter table public.pedidos add constraint pedidos_estado_check CHECK ((estado = ANY (ARRAY['previsto'::text, 'pendiente'::text, 'en_preparacion'::text, 'terminado'::text, 'anulado'::text])));
alter table public.pedidos_habituales add constraint pedidos_habituales_tipo_check CHECK ((tipo = ANY (ARRAY['fijo'::text, 'no_siempre'::text, 'si_llama'::text, 'especifico'::text])));
alter table public.perfiles add constraint perfiles_rol_check CHECK ((rol = ANY (ARRAY['preparador'::text, 'compras'::text, 'oficina'::text, 'admin'::text])));
alter table public.portal_ajustes add constraint portal_ajustes_id_check CHECK ((id = 1));
alter table public.portal_ajustes add constraint portal_ajustes_meses_visibles_check CHECK (((meses_visibles >= 0) AND (meses_visibles <= 120)));
alter table public.precios_compra_dia add constraint precios_compra_dia_fecha_producto_id_unidad_key UNIQUE (fecha, producto_id, unidad);
alter table public.precios_compra_dia add constraint precios_compra_dia_precio_check CHECK ((precio >= (0)::numeric));
alter table public.productos add constraint productos_codigo_key UNIQUE (codigo);
alter table public.productos add constraint productos_iva_check CHECK ((iva = ANY (ARRAY[(0)::numeric, (4)::numeric, (10)::numeric, (21)::numeric])));
alter table public.productos add constraint productos_iva_origen_chk CHECK (((iva_origen IS NULL) OR (iva_origen = ANY (ARRAY['golden'::text, 'golden_revisar'::text, 'manual'::text]))));
alter table public.productos add constraint productos_unidad_compra_check CHECK (((unidad_compra IS NULL) OR (unidad_compra = ANY (ARRAY['kg'::text, 'pieza'::text, 'caja'::text, 'saco'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'docena'::text, 'bote'::text]))));
alter table public.productos add constraint productos_unidad_precio_check CHECK ((unidad_precio = ANY (ARRAY['kg'::text, 'unidad'::text])));
alter table public.productos add constraint productos_unidad_venta_check CHECK ((unidad_venta = ANY (ARRAY['kg'::text, 'pieza'::text, 'caja'::text, 'saco'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'docena'::text, 'bote'::text])));
alter table public.prospectos add constraint prospectos_estado_check CHECK ((estado = ANY (ARRAY['nuevo'::text, 'contactado'::text, 'interesado'::text, 'cliente'::text, 'descartado'::text])));
alter table public.prospectos add constraint prospectos_tipo_check CHECK ((tipo = ANY (ARRAY['restaurante'::text, 'bar'::text, 'colegio'::text, 'residencia'::text, 'escuela_infantil'::text, 'catering'::text, 'otro'::text])));
alter table public.proveedores add constraint proveedores_codigo_key UNIQUE (codigo);
alter table public.push_suscripciones add constraint push_suscripciones_endpoint_key UNIQUE (endpoint);
alter table public.recomendaciones add constraint recomendaciones_precio_check CHECK (((precio IS NULL) OR (precio >= (0)::numeric)));
alter table public.sobrante add constraint sobrante_cantidad_check CHECK ((cantidad >= (0)::numeric));
alter table public.sobrante add constraint sobrante_unidad_check CHECK ((unidad = ANY (ARRAY['kg'::text, 'pieza'::text, 'caja'::text, 'saco'::text, 'bolsa'::text, 'bandeja'::text, 'manojo'::text, 'docena'::text, 'bote'::text])));
alter table public.tarifas add constraint tarifas_precio_check CHECK ((precio >= (0)::numeric));
alter table public.tarifas_compra add constraint tarifas_compra_precio_check CHECK ((precio >= (0)::numeric));
alter table public.tarifas_compra add constraint tarifas_compra_producto_id_proveedor_id_key UNIQUE (producto_id, proveedor_id);
alter table public.whatsapp_mensajes add constraint whatsapp_mensajes_direccion_check CHECK ((direccion = ANY (ARRAY['entra'::text, 'sale'::text])));
alter table public.whatsapp_mensajes add constraint whatsapp_mensajes_estado_check CHECK ((estado = ANY (ARRAY['nuevo'::text, 'propuesto'::text, 'contestado'::text, 'descartado'::text, 'enviado'::text, 'error'::text])));
alter table public.whatsapp_mensajes add constraint whatsapp_mensajes_wa_id_key UNIQUE (wa_id);
alter table harvey.borradores add constraint borradores_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
alter table harvey.contactos add constraint contactos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
alter table harvey.contactos add constraint contactos_prospecto_id_fkey FOREIGN KEY (prospecto_id) REFERENCES prospectos(id) ON DELETE CASCADE;
alter table harvey.listas_auto add constraint listas_auto_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES listas_precios(id) ON DELETE CASCADE;
alter table harvey.listas_borrador add constraint listas_borrador_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES listas_precios(id) ON DELETE CASCADE;
alter table harvey.precios_fijos add constraint precios_fijos_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES listas_precios(id) ON DELETE CASCADE;
alter table harvey.precios_fijos add constraint precios_fijos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table harvey.preferencias add constraint preferencias_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
alter table harvey.proveedor_preferido add constraint proveedor_preferido_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
alter table public.albaran_enlaces add constraint albaran_enlaces_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;
alter table public.albaran_portal add constraint albaran_portal_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;
alter table public.albaranes add constraint albaranes_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id);
alter table public.albaranes_facturados add constraint albaranes_facturados_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;
alter table public.alias_compra add constraint alias_compra_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.alias_compra add constraint alias_compra_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE;
alter table public.asignaciones_lote add constraint asignaciones_lote_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES lineas_pedido(id) ON DELETE CASCADE;
alter table public.asignaciones_lote add constraint asignaciones_lote_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES lotes(id);
alter table public.carga_lineas add constraint carga_lineas_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES lineas_pedido(id) ON DELETE CASCADE;
alter table public.cliente_enlaces add constraint cliente_enlaces_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
alter table public.cobros add constraint cobros_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.cobros add constraint cobros_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id);
alter table public.compra_ajustes add constraint compra_ajustes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.compras add constraint compras_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
alter table public.contactos_portal add constraint contactos_portal_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.documentos_compra add constraint documentos_compra_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE SET NULL;
alter table public.documentos_compra add constraint documentos_compra_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
alter table public.entregas add constraint entregas_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;
alter table public.envios_correo add constraint envios_correo_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id);
alter table public.facturas_clientes add constraint facturas_clientes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.facturas_recibidas add constraint facturas_recibidas_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE SET NULL;
alter table public.facturas_recibidas add constraint facturas_recibidas_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
alter table public.fichajes add constraint fichajes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES perfiles(id);
alter table public.formatos_cliente add constraint formatos_cliente_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE;
alter table public.formatos_cliente add constraint formatos_cliente_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.formatos_producto add constraint formatos_producto_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.fotos_perfil add constraint fotos_perfil_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES perfiles(id) ON DELETE CASCADE;
alter table public.incidencias add constraint incidencias_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.incidencias add constraint incidencias_linea_id_fkey FOREIGN KEY (linea_id) REFERENCES lineas_pedido(id);
alter table public.incidencias add constraint incidencias_lote_id_fkey FOREIGN KEY (lote_id) REFERENCES lotes(id);
alter table public.incidencias add constraint incidencias_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id);
alter table public.incidencias add constraint incidencias_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.incidencias add constraint incidencias_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);
alter table public.lineas_factura_leida add constraint lineas_factura_leida_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL;
alter table public.lineas_factura_leida add constraint lineas_factura_leida_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL;
alter table public.lineas_habituales add constraint lineas_habituales_habitual_id_fkey FOREIGN KEY (habitual_id) REFERENCES pedidos_habituales(id) ON DELETE CASCADE;
alter table public.lineas_habituales add constraint lineas_habituales_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.lineas_pedido add constraint lineas_pedido_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;
alter table public.lineas_pedido add constraint lineas_pedido_preparado_por_fkey FOREIGN KEY (preparado_por) REFERENCES auth.users(id);
alter table public.lineas_pedido add constraint lineas_pedido_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.listas_precios_items add constraint listas_precios_items_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES listas_precios(id) ON DELETE CASCADE;
alter table public.listas_precios_items add constraint listas_precios_items_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL;
alter table public.lotes add constraint lotes_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES compras(id);
alter table public.lotes add constraint lotes_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.mensajes add constraint mensajes_autor_fkey FOREIGN KEY (autor) REFERENCES perfiles(id);
alter table public.pedidos add constraint pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.pedidos add constraint pedidos_preparador_id_fkey FOREIGN KEY (preparador_id) REFERENCES auth.users(id);
alter table public.pedidos add constraint pedidos_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES perfiles(id) ON DELETE SET NULL;
alter table public.pedidos_habituales add constraint pedidos_habituales_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.pedidos_habituales add constraint pedidos_habituales_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES perfiles(id);
alter table public.perfiles add constraint perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.precios_compra_dia add constraint precios_compra_dia_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.push_suscripciones add constraint push_suscripciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.recomendaciones add constraint recomendaciones_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL;
alter table public.sobrante add constraint sobrante_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.sobrante add constraint sobrante_repartidor_id_fkey FOREIGN KEY (repartidor_id) REFERENCES perfiles(id);
alter table public.tarifas add constraint tarifas_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id);
alter table public.tarifas add constraint tarifas_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id);
alter table public.tarifas_compra add constraint tarifas_compra_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE;
alter table public.tarifas_compra add constraint tarifas_compra_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE CASCADE;
alter table public.whatsapp_mensajes add constraint whatsapp_mensajes_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL;
alter sequence harvey.registro_id_seq owned by harvey.registro.id;
alter sequence harvey.notas_id_seq owned by harvey.notas.id;
alter sequence harvey.proveedor_preferido_id_seq owned by harvey.proveedor_preferido.id;
alter sequence public.contactos_portal_id_seq owned by public.contactos_portal.id;
alter sequence public.ayudas_id_seq owned by public.ayudas.id;
alter sequence public.whatsapp_mensajes_id_seq owned by public.whatsapp_mensajes.id;
CREATE INDEX asignaciones_lote_linea_id_idx ON public.asignaciones_lote USING btree (linea_id);
CREATE INDEX asignaciones_lote_lote_id_idx ON public.asignaciones_lote USING btree (lote_id);
CREATE INDEX ayudas_estado_idx ON public.ayudas USING btree (estado, created_at DESC);
CREATE INDEX cobros_fecha_idx ON public.cobros USING btree (created_at);
CREATE INDEX cobros_pedido_idx ON public.cobros USING btree (pedido_id);
CREATE INDEX contactos_portal_estado_idx ON public.contactos_portal USING btree (estado, created_at DESC);
CREATE INDEX facturas_clientes_cli_idx ON public.facturas_clientes USING btree (cliente_id, fecha DESC);
CREATE INDEX facturas_recibidas_estado_idx ON public.facturas_recibidas USING btree (estado, recibido_en DESC);
CREATE INDEX facturas_recibidas_fecha_idx ON public.facturas_recibidas USING btree (estado, fecha_factura DESC);
CREATE INDEX fichajes_usuario_idx ON public.fichajes USING btree (usuario_id, entrada DESC);
CREATE INDEX golden_facturas_cli_idx ON public.golden_facturas USING btree (upper(cliente_codigo));
CREATE INDEX golden_facturas_fecha_idx ON public.golden_facturas USING btree (fecha DESC);
CREATE INDEX golden_lineas_desc_idx ON public.golden_lineas USING btree (lower(descripcion));
CREATE INDEX golden_lineas_fac_idx ON public.golden_lineas USING btree (factura_numero, orden);
CREATE INDEX historial_tabla_registro_id_idx ON public.historial USING btree (tabla, registro_id);
CREATE INDEX incidencias_cliente_idx ON public.incidencias USING btree (cliente_id);
CREATE INDEX incidencias_producto_idx ON public.incidencias USING btree (producto_id);
CREATE INDEX lineas_factura_leida_fecha_idx ON public.lineas_factura_leida USING btree (fecha DESC);
CREATE INDEX lineas_factura_leida_producto_idx ON public.lineas_factura_leida USING btree (producto_id, fecha DESC);
CREATE INDEX lineas_pedido_pedido_id_idx ON public.lineas_pedido USING btree (pedido_id);
CREATE INDEX listas_precios_items_lista ON public.listas_precios_items USING btree (lista_id);
CREATE INDEX mensajes_creado_idx ON public.mensajes USING btree (creado DESC);
CREATE INDEX pedidos_fecha_entrega_estado_idx ON public.pedidos USING btree (fecha_entrega, estado);
CREATE INDEX pedidos_reparto_idx ON public.pedidos USING btree (fecha_entrega, repartidor_id);
CREATE INDEX sobrante_fecha_idx ON public.sobrante USING btree (fecha);
CREATE INDEX tarifas_compra_prod_idx ON public.tarifas_compra USING btree (producto_id);
CREATE INDEX whatsapp_mensajes_estado_idx ON public.whatsapp_mensajes USING btree (estado, created_at DESC);
CREATE INDEX whatsapp_mensajes_tel_idx ON public.whatsapp_mensajes USING btree (telefono, created_at DESC);
CREATE UNIQUE INDEX contactos_unico ON harvey.contactos USING btree (COALESCE(cliente_id, prospecto_id), fecha, tipo);
CREATE UNIQUE INDEX fichaje_unico_abierto ON public.fichajes USING btree (usuario_id) WHERE (salida IS NULL);
CREATE UNIQUE INDEX formatos_producto_def ON public.formatos_producto USING btree (producto_id, formato) WHERE predeterminado;
CREATE UNIQUE INDEX formatos_producto_unico ON public.formatos_producto USING btree (producto_id, formato, COALESCE(peso_estimado_kg, (0)::numeric));
CREATE UNIQUE INDEX pedidos_origen_unico ON public.pedidos USING btree (cliente_id, fecha_entrega, hash_origen) WHERE ((hash_origen IS NOT NULL) AND (estado <> 'anulado'::text) AND (archivado IS NOT TRUE));
CREATE OR REPLACE FUNCTION harvey.coste_compra(p uuid)
 RETURNS TABLE(precio numeric, fecha date, fuente text, unidad text, proveedor text, aviso text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'harvey'
AS $function$
  with pref as (select pp.proveedor_id, pp.aviso from harvey.proveedor_preferido pp join public.productos pr on pr.id = p where pr.nombre ~* pp.patron limit 1),
  x as (
    select precio, fecha, 'precio de compra del día'::text as fuente, unidad, null::uuid as proveedor_id from public.precios_compra_dia where producto_id = p
    union all select precio, fecha, 'factura de proveedor', unidad, proveedor_id from public.tarifas_compra where producto_id = p
    union all select precio, fecha, case when coalesce(dudoso, false) then 'factura leída (revisar)' else 'factura leída' end, unidad, proveedor_id from public.lineas_factura_leida where producto_id = p
    union all select l.precio_compra, l.created_at::date, 'lote', l.unidad, c.proveedor_id from public.lotes l left join public.compras c on c.id = l.compra_id where l.producto_id = p and l.precio_compra is not null)
  select x.precio, x.fecha, x.fuente, x.unidad, pv.nombre, (select aviso from pref)
  from x left join public.proveedores pv on pv.id = x.proveedor_id
  where x.precio > 0 and x.fecha > current_date - 30
    and (not exists (select 1 from pref) or x.proveedor_id = (select proveedor_id from pref))
  order by x.fecha desc limit 1 $function$
;
CREATE OR REPLACE FUNCTION harvey.proponer_lista(p_lista uuid, p_margen numeric, p_auto boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'harvey'
AS $function$
declare v_items jsonb; v_id uuid;
begin
  select coalesce(jsonb_agg(z order by z.nombre), '[]'::jsonb) into v_items from (
    select i.id as item_id, false as nuevo_producto, i.orden, i.nombre, i.unidad, i.precio as antes, i.coste as coste_antes, i.producto_id,
      c.precio as coste, c.fecha as coste_fecha, c.fuente, c.proveedor, c.unidad as coste_unidad,
      case when f.precio is not null then 'Precio fijo puesto por Fernando: no se recalcula' else c.aviso end as aviso,
      v.precio as venta_media, v.hasta as venta_hasta, v.veces as venta_veces,
      coalesce(f.precio, case when c.precio is not null and lower(coalesce(i.unidad, 'kg')) = 'kg' and (c.unidad is null or lower(c.unidad) in ('kg', 'kilo', 'kilos')) then round(c.precio + p_margen, 2) end) as nuevo,
      case when f.precio is not null then null when i.producto_id is null then 'sin producto enlazado' when c.precio is null then 'sin precio de compra en los últimos 30 días'
           when lower(coalesce(i.unidad, 'kg')) <> 'kg' then 'se vende por ' || i.unidad || ': revisar a mano'
           when c.unidad is not null and lower(c.unidad) not in ('kg', 'kilo', 'kilos') then 'la compra va por ' || c.unidad end as duda
    from public.listas_precios_items i left join lateral harvey.coste_compra(i.producto_id) c on true left join lateral harvey.venta_reciente(i.producto_id) v on true
    left join harvey.precios_fijos f on f.lista_id = p_lista and f.producto_id = i.producto_id
    where i.lista_id = p_lista
    union all
    select null, true, null, pr.nombre, coalesce(r.unidad, pr.unidad_precio, 'kg'), null, null, pr.id,
      c.precio, c.fecha, c.fuente, c.proveedor, c.unidad, c.aviso, v.precio, v.hasta, v.veces,
      case when c.precio is not null and lower(coalesce(r.unidad, pr.unidad_precio, 'kg')) = 'kg' and (c.unidad is null or lower(c.unidad) in ('kg', 'kilo', 'kilos')) then round(c.precio + p_margen, 2) end,
      case when c.precio is null then 'recomendado, pero sin precio de compra reciente' else 'recomendado de la semana: no está en la lista' end
    from (select distinct on (producto_id) * from public.recomendaciones where producto_id is not null and activa is not false and (desde is null or desde <= current_date) and (hasta is null or hasta >= current_date) order by producto_id, created_at desc) r
    join public.productos pr on pr.id = r.producto_id left join lateral harvey.coste_compra(pr.id) c on true left join lateral harvey.venta_reciente(pr.id) v on true
    where not exists (select 1 from public.listas_precios_items i2 where i2.lista_id = p_lista and i2.producto_id = r.producto_id)
  ) z;
  if p_auto then update harvey.listas_borrador set estado = 'reemplazado', resuelto_en = now() where lista_id = p_lista and estado = 'pendiente'; end if;
  insert into harvey.listas_borrador (lista_id, margen, items, automatico) values (p_lista, p_margen, v_items, p_auto) returning id into v_id;
  return v_id;
end $function$
;
CREATE OR REPLACE FUNCTION harvey.proponer_listas_auto()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'harvey'
AS $function$
declare r record;
begin for r in select * from harvey.listas_auto loop perform harvey.proponer_lista(r.lista_id, r.margen, true); end loop; end $function$
;
CREATE OR REPLACE FUNCTION harvey.sincronizar_precio_fijo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'harvey'
AS $function$
begin
  if new.precio is not null and new.precio is distinct from old.precio and new.producto_id is not null then
    update harvey.precios_fijos set precio = new.precio, nota = 'cambiado a mano ' || to_char(now() at time zone 'Europe/Madrid', 'DD/MM/YYYY HH24:MI')
     where lista_id = new.lista_id and producto_id = new.producto_id and precio is distinct from new.precio;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION harvey.venta_reciente(p uuid)
 RETURNS TABLE(precio numeric, hasta date, veces integer)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public', 'harvey'
AS $function$
  with ref as (select max(fecha) r from harvey.entregas where fecha <= current_date)
  select round(avg(e.precio) filter (where e.precio > 0)::numeric, 2), max(e.fecha), count(*)::int
  from harvey.entregas e join public.productos pr on pr.codigo = e.producto_codigo, ref
  where pr.id = p and e.fecha > ref.r - 30 and e.precio > 0 $function$
;
CREATE OR REPLACE FUNCTION public._albaran_json(p_pedido uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                         declare v jsonb;
                                                                                                                                                                                         begin
                                                                                                                                                                                           v := public._albaran_json_base(p_pedido);
                                                                                                                                                                                             if coalesce(v->>'ok', 'false') <> 'true' then return v; end if;
                                                                                                                                                                                               return v || coalesce((select jsonb_build_object('descuento_base', p.descuento_base, 'descuento_iva', p.descuento_iva, 'descuento_motivo', p.descuento_motivo)
                                                                                                                                                                                                                        from public.pedidos p where p.id = p_pedido), '{}'::jsonb);
                                                                                                                                                                                                                        end $function$
;
CREATE OR REPLACE FUNCTION public._albaran_json_base(p_pedido uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                            declare v_res jsonb;
                                            begin
                                              select jsonb_build_object(
                                                  'ok', true,
                                                      'serie', a.serie, 'numero', a.numero, 'fecha', coalesce(a.fecha, p.fecha_entrega),
                                                          'firma_png', a.firma_png, 'firma_nombre', a.firma_nombre, 'firma_at', a.firma_at,
 'descuento_base', case when coalesce(p.descuento_base,0) > 0 then p.descuento_base end, 'descuento_iva', p.descuento_iva, 'descuento_motivo', p.descuento_motivo,
                                                              'entregado_at', (select e.entregado_at from public.entregas e where e.pedido_id = p.id),
                                                                  'entrega_nota', (select e.nota from public.entregas e where e.pedido_id = p.id),
                                                                      'cliente', jsonb_build_object('nombre', c.nombre, 'nombre_comercial', c.nombre_comercial, 'nif', c.nif, 'direccion', c.direccion,
                                                                                                        'localidad', c.localidad, 'forma_pago', c.forma_pago, 'recargo_equivalencia', c.recargo_equivalencia),
                                                                                                            'lineas', coalesce((select jsonb_agg(jsonb_build_object(
                                                                                                                    'nombre', coalesce(pr.nombre_albaran, pr.nombre), 'cantidad_pedida', l.cantidad_pedida, 'unidad_pedida', l.unidad_pedida, 'peso_real', l.peso_real,
                                                                                                                            'unidad_precio', l.unidad_precio, 'precio', l.precio, 'iva', l.iva, 'iva_producto', pr.iva) order by pr.nombre)
                                                                                                                                    from public.lineas_pedido l join public.productos pr on pr.id = l.producto_id where l.pedido_id = p.id), '[]'::jsonb)
                                                                                                                                      ) into v_res
                                                                                                                                        from public.pedidos p join public.albaranes a on a.pedido_id = p.id join public.clientes c on c.id = p.cliente_id
                                                                                                                                          where p.id = p_pedido and a.numero is not null and a.estado = 'emitido';
                                                                                                                                            return coalesce(v_res, jsonb_build_object('ok', false));
                                                                                                                                            end $function$
;
CREATE OR REPLACE FUNCTION public._portal_limite()
 RETURNS date
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                            select case when meses_visibles > 0 then (current_date - make_interval(months => meses_visibles))::date else null end
                                from public.portal_ajustes where id = 1;
                                $function$
;
CREATE OR REPLACE FUNCTION public.albaran_publico(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                            declare v_ped uuid;
                                                                                                                                            begin
                                                                                                                                              if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
                                                                                                                                                select pedido_id into v_ped from public.albaran_enlaces where token = p_token;
                                                                                                                                                  if v_ped is null then return jsonb_build_object('ok', false); end if;
                                                                                                                                                    return public._albaran_json(v_ped);
                                                                                                                                                    end $function$
;
CREATE OR REPLACE FUNCTION public.anadir_linea_pedido(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric DEFAULT NULL::numeric, p_unidad_precio text DEFAULT 'kg'::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    declare v_estado text; v_id uuid;
    begin
      if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
        if p_cantidad is null or p_cantidad <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
          if p_unidad_precio not in ('kg','unidad') then raise exception 'UNIDAD_PRECIO_NO_VALIDA'; end if;
            if p_precio is not null and p_precio < 0 then raise exception 'PRECIO_NO_VALIDO'; end if;
              select estado into v_estado from public.pedidos where id = p_pedido for update;
                if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
                  if v_estado in ('terminado','anulado') then raise exception 'PEDIDO_CERRADO'; end if;
                    insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, unidad_precio, precio)
                      values (p_pedido, p_producto, p_cantidad, p_unidad, p_unidad_precio, p_precio)
                        returning id into v_id;
                          return v_id;
                          end $function$
;
CREATE OR REPLACE FUNCTION public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_estado text; v_id uuid;
        v_sin boolean; v_db numeric; v_dm text; v_iva numeric; v_r numeric;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  if p_cantidad is null or p_cantidad <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
  if p_unidad_precio not in ('kg','unidad') then raise exception 'UNIDAD_PRECIO_NO_VALIDA'; end if;
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;

  insert into public.lineas_pedido
    (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio,
     estado, preparado_por, preparado_en, notas, venta_ruta)
  values
    (p_pedido, p_producto, p_cantidad, p_unidad, p_cantidad, p_unidad_precio, p_precio,
     'hecha', auth.uid(), now(), 'Venta en ruta' || coalesce(' · ' || nullif(trim(coalesce(p_nota,'')),''), ''), true)
  returning id into v_id;

  update public.albaranes
     set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
   where pedido_id = p_pedido and estado = 'emitido' and traza_estado is not null;

  select coalesce(c.sin_iva, false), p.descuento_base, p.descuento_motivo into v_sin, v_db, v_dm
    from public.pedidos p join public.clientes c on c.id = p.cliente_id where p.id = p_pedido;
  if v_sin and (coalesce(v_db, 0) = 0 or v_dm = 'Descuento por productos') then
    with l as (
      select coalesce(l.iva, pr.iva, 4) as t,
             round((case when l.unidad_precio = 'kg' then l.peso_real else l.cantidad_pedida end) * l.precio, 2) as imp
        from public.lineas_pedido l left join public.productos pr on pr.id = l.producto_id
       where l.pedido_id = p_pedido and l.precio is not null
         and (case when l.unidad_precio = 'kg' then l.peso_real else l.cantidad_pedida end) is not null),
    b as (select t, sum(imp) as base from l group by t)
    select sum(round(base * t) / 100), (select t from b order by base desc limit 1) into v_iva, v_r from b;
    if coalesce(v_iva, 0) > 0 and v_r in (0, 4, 10, 21) then
      update public.pedidos
         set descuento_base = round(v_iva / (1 + v_r / 100), 2), descuento_iva = v_r, descuento_motivo = 'Descuento por productos'
       where id = p_pedido;
    end if;
  end if;
  return v_id;
end $function$
;
CREATE OR REPLACE FUNCTION public.anotar_lote(p_linea uuid, p_lote uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                                                   declare v_ped uuid; v_prod uuid; v_cant numeric; v_antes jsonb;
                                                                                                                                                                                                                   begin
                                                                                                                                                                                                                     if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                                                                                                       select l.pedido_id, l.producto_id,
                                                                                                                                                                                                                                case when l.unidad_precio = 'kg' then coalesce(l.peso_real, 0) else l.cantidad_pedida end
                                                                                                                                                                                                                                    into v_ped, v_prod, v_cant from public.lineas_pedido l where l.id = p_linea;
                                                                                                                                                                                                                                      if v_ped is null then raise exception 'LINEA_NO_EXISTE'; end if;
                                                                                                                                                                                                                                        if exists (select 1 from public.albaranes al where al.pedido_id = v_ped and al.estado = 'emitido' and al.traza_estado is not null) then
                                                                                                                                                                                                                                            raise exception 'TRAZABILIDAD_CERRADA'; end if;
                                                                                                                                                                                                                                              if p_lote is not null and not exists (select 1 from public.lotes lo where lo.id = p_lote and lo.producto_id = v_prod and not coalesce(lo.archivado, false)) then
                                                                                                                                                                                                                                                  raise exception 'ASIGNACION_NO_VALIDA'; end if;
                                                                                                                                                                                                                                                    select coalesce(jsonb_agg(jsonb_build_object('lote_id', lote_id, 'cantidad', cantidad)), '[]'::jsonb) into v_antes
                                                                                                                                                                                                                                                        from public.asignaciones_lote where linea_id = p_linea;
                                                                                                                                                                                                                                                          delete from public.asignaciones_lote where linea_id = p_linea;
                                                                                                                                                                                                                                                            if p_lote is not null then
                                                                                                                                                                                                                                                                insert into public.asignaciones_lote (linea_id, lote_id, cantidad) values (p_linea, p_lote, coalesce(v_cant, 0));
                                                                                                                                                                                                                                                                  end if;
                                                                                                                                                                                                                                                                    insert into public.historial (tabla, registro_id, accion, usuario, antes, despues)
                                                                                                                                                                                                                                                                      values ('lineas_pedido', p_linea, 'ANOTAR_LOTE', auth.uid(), jsonb_build_object('lotes', v_antes),
                                                                                                                                                                                                                                                                                jsonb_build_object('lote_id', p_lote));
                                                                                                                                                                                                                                                                                end $function$
;
CREATE OR REPLACE FUNCTION public.antes_de_actualizar()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  if tg_table_name = 'lineas_pedido' then
    new.version := old.version + 1;
  end if;
  return new;
end $function$
;
CREATE OR REPLACE FUNCTION public.anular_albaran(p_albaran uuid, p_motivo text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() not in ('oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  if coalesce(trim(p_motivo), '') = '' then raise exception 'MOTIVO_OBLIGATORIO'; end if;
  update public.albaranes set estado = 'anulado', motivo_anulacion = p_motivo where id = p_albaran;
end $function$
;
CREATE OR REPLACE FUNCTION public.apuntar_movil_cliente(p_pedido uuid, p_movil text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_cli uuid; v_mov text;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select cliente_id into v_cli from public.pedidos where id = p_pedido; if v_cli is null then return jsonb_build_object('ok', false); end if;
  v_mov := regexp_replace(coalesce(p_movil, ''), '\D', '', 'g'); if length(v_mov) = 11 and v_mov like '34%' then v_mov := substr(v_mov, 3); end if;
  if v_mov !~ '^[67][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'movil'); end if;
  if not exists (select 1 from public.contactos_portal where cliente_id = v_cli and movil = v_mov and estado <> 'descartado') then
    insert into public.contactos_portal (cliente_id, movil, origen, nombre) values (v_cli, v_mov, 'repartidor', (select nombre from public.perfiles where id = auth.uid()));
  end if;
  return jsonb_build_object('ok', true, 'movil', v_mov);
end $function$
;
CREATE OR REPLACE FUNCTION public.asignar_reparto(p_pedidos uuid[], p_repartidor uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_rol text := public.rol_actual(); v_yo uuid := auth.uid(); v_gest boolean; n integer := 0; r record; v_sig integer;
  begin
    if v_rol is null then raise exception 'SIN_PERMISO'; end if;
      v_gest := v_rol in ('admin','oficina');
        if p_pedidos is null or coalesce(array_length(p_pedidos, 1), 0) = 0 then raise exception 'DATOS_NO_VALIDOS'; end if;
          if p_repartidor is not null then
              if not exists (select 1 from public.perfiles where id = p_repartidor and coalesce(activo, true) and reparte) then raise exception 'REPARTIDOR_NO_VALIDO'; end if;
                  if p_repartidor <> v_yo and not v_gest then raise exception 'SIN_PERMISO'; end if;
                    end if;
                      for r in select id, fecha_entrega, repartidor_id, estado, archivado from public.pedidos where id = any(p_pedidos) order by id for update loop
                          if r.estado = 'anulado' or coalesce(r.archivado, false) then raise exception 'PEDIDO_NO_DISPONIBLE'; end if;
                              if exists (select 1 from public.entregas e where e.pedido_id = r.id) then raise exception 'PEDIDO_YA_ENTREGADO'; end if;
                                  if p_repartidor is null then
                                        if r.repartidor_id is not null and r.repartidor_id <> v_yo and not v_gest then raise exception 'PEDIDO_DE_OTRO'; end if;
                                              update public.pedidos set repartidor_id = null, orden_reparto = null where id = r.id;
                                                  else
                                                        if r.repartidor_id is not null and r.repartidor_id <> p_repartidor and not v_gest then raise exception 'PEDIDO_YA_ASIGNADO'; end if;
                                                              if r.repartidor_id is distinct from p_repartidor then
                                                                      select coalesce(max(orden_reparto), 0) + 1 into v_sig from public.pedidos where fecha_entrega = r.fecha_entrega and repartidor_id = p_repartidor;
                                                                              update public.pedidos set repartidor_id = p_repartidor, orden_reparto = v_sig where id = r.id;
                                                                                    end if;
                                                                                        end if;
                                                                                            n := n + 1;
                                                                                              end loop;
                                                                                                return n;
                                                                                                end $function$
;
CREATE OR REPLACE FUNCTION public.auditar()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  insert into public.historial (tabla, registro_id, accion, usuario, antes, despues)
  values (
    tg_table_name,
    coalesce(to_jsonb(new)->>'id', to_jsonb(old)->>'id')::uuid,
    tg_op,
    auth.uid(),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $function$
;
CREATE OR REPLACE FUNCTION public.borrar_pedido(p_pedido uuid, p_motivo text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                  declare v_estado text;
                                                                                                                                                                                  begin
                                                                                                                                                                                    if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                                                                      select estado into v_estado from public.pedidos where id = p_pedido for update;
                                                                                                                                                                                        if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
                                                                                                                                                                                          if v_estado = 'anulado' then return; end if;
                                                                                                                                                                                            if v_estado = 'terminado' or exists (select 1 from public.albaranes where pedido_id = p_pedido and estado = 'emitido') then
                                                                                                                                                                                                raise exception 'PEDIDO_TERMINADO';
                                                                                                                                                                                                  end if;
                                                                                                                                                                                                    update public.pedidos
                                                                                                                                                                                                         set estado = 'anulado',
                                                                                                                                                                                                                  notas = trim(both E' \n' from coalesce(notas,'') || E'\nBORRADO' || coalesce(': ' || nullif(trim(coalesce(p_motivo,'')),''), ''))
                                                                                                                                                                                                                     where id = p_pedido;
                                                                                                                                                                                                                     end $function$
;
CREATE OR REPLACE FUNCTION public.cobrar(p_pedido uuid, p_importe numeric, p_forma text, p_nota text DEFAULT NULL::text, p_clave text DEFAULT NULL::text)
 RETURNS cobros
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_ped public.pedidos; v_pend numeric; v_c public.cobros;
begin
  if public.rol_actual() not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;

  -- Esperar turno: solo un cobro a la vez por pedido
  select * into v_ped from public.pedidos where id = p_pedido for update;
  if not found then raise exception 'PEDIDO_NO_EXISTE'; end if;

  -- Reintento del mismo cobro (sin conexión): devolver el ya guardado
  if p_clave is not null then
    select * into v_c from public.cobros where clave = p_clave;
    if found then return v_c; end if;
  end if;

  if p_importe is null or p_importe <= 0 then raise exception 'IMPORTE_NO_VALIDO'; end if;
  select pendiente into v_pend from public.v_pedidos_importe where pedido_id = p_pedido;
  if v_pend is null then raise exception 'SIN_IMPORTE'; end if;
  if p_importe > v_pend + 0.01 then raise exception 'COBRO_MAYOR_QUE_PENDIENTE'; end if;

  insert into public.cobros (pedido_id, cliente_id, importe, forma, nota, clave)
    values (p_pedido, v_ped.cliente_id, round(p_importe, 2), p_forma, p_nota, p_clave)
    returning * into v_c;
  return v_c;
end $function$
;
CREATE OR REPLACE FUNCTION public.configurar_repartidor(p_perfil uuid, p_reparte boolean, p_color text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                 declare v_col text; v_pal text[] := array['#2563eb','#f97316','#7c3aed','#e11d48','#0d9488','#db2777','#92400e','#4b5563']; c text;
                                                                                                                                 begin
                                                                                                                                   if public.rol_actual() is null or public.rol_actual() not in ('admin','oficina') then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                     if not exists (select 1 from public.perfiles where id = p_perfil and rol in ('preparador','admin')) then raise exception 'REPARTIDOR_NO_VALIDO'; end if;
                                                                                                                                       if p_color is not null and p_color !~ '^#[0-9a-fA-F]{6}$' then raise exception 'COLOR_NO_VALIDO'; end if;
                                                                                                                                         v_col := lower(p_color);
                                                                                                                                           if coalesce(p_reparte, false) and v_col is null then
                                                                                                                                               select color_reparto into v_col from public.perfiles where id = p_perfil;
                                                                                                                                                   if v_col is null then   -- primer color de la paleta que no use otro repartidor
                                                                                                                                                         foreach c in array v_pal loop
                                                                                                                                                                 if not exists (select 1 from public.perfiles where reparte and lower(color_reparto) = c) then v_col := c; exit; end if;
                                                                                                                                                                       end loop;
                                                                                                                                                                             v_col := coalesce(v_col, v_pal[1]);
                                                                                                                                                                                 end if;
                                                                                                                                                                                   end if;
                                                                                                                                                                                     update public.perfiles set reparte = coalesce(p_reparte, false), color_reparto = coalesce(v_col, color_reparto) where id = p_perfil;
                                                                                                                                                                                       if not coalesce(p_reparte, false) then   -- si deja de repartir, sus pedidos sin entregar quedan libres
                                                                                                                                                                                           update public.pedidos set repartidor_id = null, orden_reparto = null
                                                                                                                                                                                                where repartidor_id = p_perfil and not exists (select 1 from public.entregas e where e.pedido_id = pedidos.id);
                                                                                                                                                                                                  end if;
                                                                                                                                                                                                  end $function$
;
CREATE OR REPLACE FUNCTION public.confirmar_previsto(p_pedido uuid, p_hacer boolean)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_estado text;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_estado <> 'previsto' then raise exception 'NO_ES_PREVISTO'; end if;
  update public.pedidos set estado = case when p_hacer then 'pendiente' else 'anulado' end where id = p_pedido;
  return case when p_hacer then 'pendiente' else 'anulado' end;
end $function$
;
CREATE OR REPLACE FUNCTION public.confirmar_trazabilidad(p_pedido uuid, p_asignaciones jsonb DEFAULT '[]'::jsonb, p_sin_motivo text DEFAULT NULL::text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare
    v_rol text := public.rol_actual(); v_estado text; v_num integer;
      v_motivo text := nullif(trim(coalesce(p_sin_motivo, '')), '');
      begin
        if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
          select estado into v_estado from public.pedidos where id = p_pedido for update;
            if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
              if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
                if v_estado = 'terminado' then raise exception 'PEDIDO_YA_TERMINADO'; end if;
                  if exists (select 1 from public.lineas_pedido where pedido_id = p_pedido and estado = 'pendiente') then
                      raise exception 'LINEAS_PENDIENTES'; end if;

                        if v_motivo is not null then
                            if v_rol not in ('oficina','admin') then raise exception 'SOLO_OFICINA_SIN_TRAZA'; end if;
                              else
                                  perform public.validar_trazabilidad(p_pedido, p_asignaciones);
                                      perform set_config('fj.traza_corr', '1', true);
                                          delete from public.asignaciones_lote
                                               where linea_id in (select id from public.lineas_pedido where pedido_id = p_pedido);
                                                   insert into public.asignaciones_lote (linea_id, lote_id, cantidad)
                                                       select x.linea_id, x.lote_id, x.cantidad
                                                             from jsonb_to_recordset(coalesce(p_asignaciones, '[]'::jsonb)) as x(linea_id uuid, lote_id uuid, cantidad numeric);
                                                               end if;

                                                                 v_num := public.terminar_pedido(p_pedido);
                                                                   update public.albaranes
                                                                        set traza_estado = case when v_motivo is null then 'confirmada' else 'sin_trazabilidad' end,
                                                                                 traza_motivo = v_motivo, traza_por = auth.uid(), traza_at = now()
                                                                                    where pedido_id = p_pedido;
                                                                                      return v_num;
                                                                                      end $function$
;
CREATE OR REPLACE FUNCTION public.copia_archivos(p_clave text, p_desde integer, p_limite integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'storage', 'pg_temp'
AS $function$
declare r jsonb;
begin
  if not public.copia_ok(p_clave) then raise exception 'clave incorrecta'; end if;
    select coalesce(jsonb_agg(jsonb_build_object('bucket', x.bucket_id, 'ruta', x.name, 'tam', coalesce((x.metadata->>'size')::bigint, 0)) order by x.bucket_id, x.name), '[]'::jsonb) into r
      from (
          select o.bucket_id, o.name, o.metadata from storage.objects o
              where o.bucket_id in ('facturas', 'pedidos-originales') and o.name not like '%.emptyFolderPlaceholder'
                  order by o.bucket_id, o.name
                      offset greatest(coalesce(p_desde, 0), 0)
                          limit least(greatest(coalesce(p_limite, 500), 1), 1000)
                            ) x;
                              return r;
                              end $function$
;
CREATE OR REPLACE FUNCTION public.copia_conteo(p_clave text, p_tabla text)
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare n bigint;
begin
  if not public.copia_ok(p_clave) then raise exception 'clave incorrecta'; end if;
  if p_tabla = 'copia_config' or not exists (
     select 1 from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE' and table_name = p_tabla) then
    raise exception 'tabla no permitida';
  end if;
  execute format('select count(*) from public.%I', p_tabla) into n;
  return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.copia_ok(p_clave text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  select exists (
    select 1 from public.copia_config
    where id = 1 and clave_hash = encode(sha256(convert_to(coalesce(p_clave, ''), 'utf8')), 'hex')
  );
$function$
;
CREATE OR REPLACE FUNCTION public.copia_pagina(p_clave text, p_tabla text, p_desde integer, p_limite integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r jsonb;
begin
  if not public.copia_ok(p_clave) then raise exception 'clave incorrecta'; end if;
  if p_tabla = 'copia_config' or not exists (
     select 1 from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE' and table_name = p_tabla) then
    raise exception 'tabla no permitida';
  end if;
  execute format(
    'select coalesce(jsonb_agg(to_jsonb(t)), ''[]''::jsonb) from (select * from public.%I order by 1, ctid offset %s limit %s) t',
    p_tabla, greatest(coalesce(p_desde, 0), 0), least(greatest(coalesce(p_limite, 1000), 1), 2000))
  into r;
  return r;
end $function$
;
CREATE OR REPLACE FUNCTION public.copia_tablas(p_clave text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare r jsonb;
begin
  if not public.copia_ok(p_clave) then raise exception 'clave incorrecta'; end if;
  select coalesce(jsonb_agg(t.table_name order by t.table_name), '[]'::jsonb) into r
  from information_schema.tables t
  where t.table_schema = 'public' and t.table_type = 'BASE TABLE' and t.table_name <> 'copia_config';
  return r;
end $function$
;
CREATE OR REPLACE FUNCTION public.corregir_linea(p_linea uuid, p_cantidad numeric DEFAULT NULL::numeric, p_peso numeric DEFAULT NULL::numeric, p_unidad text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_ped uuid; v_estado text; v_up text; v_reabrir boolean := false; v_nueva numeric;
begin
  if v_rol is null then raise exception 'SIN_PERMISO'; end if;
  select l.pedido_id, p.estado, l.unidad_precio into v_ped, v_estado, v_up
    from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id where l.id = p_linea for update of l;
  if v_ped is null then raise exception 'LINEA_NO_EXISTE'; end if;
  if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
  if v_rol not in ('oficina','admin') and exists (select 1 from public.entregas where pedido_id = v_ped) then
    raise exception 'PEDIDO_ENTREGADO'; end if;
  if p_cantidad is not null then
    if p_cantidad <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
    update public.lineas_pedido set cantidad_pedida = p_cantidad where id = p_linea;
    if v_up <> 'kg' then v_reabrir := true; v_nueva := p_cantidad; end if;
  end if;
  if nullif(trim(coalesce(p_unidad,'')),'') is not null then
    update public.lineas_pedido set unidad_pedida = p_unidad where id = p_linea;
  end if;
  if p_peso is not null then
    if p_peso < 0 then raise exception 'PESO_NO_VALIDO'; end if;
    update public.lineas_pedido set peso_real = p_peso, estado = 'hecha', preparado_por = auth.uid(), preparado_en = now() where id = p_linea;
    update public.pedidos set estado = 'en_preparacion' where id = v_ped and estado = 'pendiente';
    v_reabrir := true; if v_up = 'kg' then v_nueva := p_peso; end if;
  end if;
  if v_reabrir then
    update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
     where pedido_id = v_ped and estado = 'emitido' and traza_estado is not null;
    if v_nueva is not null and (select count(*) from public.asignaciones_lote where linea_id = p_linea) = 1 then
      perform set_config('fj.traza_corr', '1', true);
      update public.asignaciones_lote set cantidad = v_nueva where linea_id = p_linea;
      perform set_config('fj.traza_corr', '', true);
    end if;
  end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.corregir_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_motivo text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_alb uuid; v_antes jsonb; v_mot text := trim(coalesce(p_motivo, ''));
begin
  if public.rol_actual() not in ('oficina','admin') then raise exception 'SIN_PERMISO'; end if;
    if v_mot = '' then raise exception 'MOTIVO_OBLIGATORIO'; end if;
      select id into v_alb from public.albaranes where pedido_id = p_pedido and estado = 'emitido';
        if v_alb is null then raise exception 'ALBARAN_NO_EXISTE'; end if;
          perform public.validar_trazabilidad(p_pedido, p_asignaciones);

            select coalesce(jsonb_agg(jsonb_build_object('linea_id', a.linea_id, 'lote_id', a.lote_id, 'cantidad', a.cantidad)), '[]'::jsonb)
                into v_antes
                    from public.asignaciones_lote a join public.lineas_pedido l on l.id = a.linea_id
                       where l.pedido_id = p_pedido;

                         perform set_config('fj.traza_corr', '1', true);
                           delete from public.asignaciones_lote
                              where linea_id in (select id from public.lineas_pedido where pedido_id = p_pedido);
                                insert into public.asignaciones_lote (linea_id, lote_id, cantidad)
                                  select x.linea_id, x.lote_id, x.cantidad
                                      from jsonb_to_recordset(coalesce(p_asignaciones, '[]'::jsonb)) as x(linea_id uuid, lote_id uuid, cantidad numeric);

                                        update public.albaranes set traza_estado = 'confirmada', traza_motivo = v_mot,
                                                 traza_por = auth.uid(), traza_at = now() where id = v_alb;
                                                   insert into public.historial (tabla, registro_id, accion, usuario, antes, despues)
                                                     values ('albaranes', v_alb, 'CORREGIR_TRAZABILIDAD', auth.uid(),
                                                               jsonb_build_object('asignaciones', v_antes),
                                                                         jsonb_build_object('motivo', v_mot, 'asignaciones', coalesce(p_asignaciones, '[]'::jsonb)));
                                                                         end $function$
;
CREATE OR REPLACE FUNCTION public.coste_en_fecha(p_producto uuid, p_fecha date)
 RETURNS TABLE(precio numeric, fecha date, fuente text, proveedor text, unidad text, provisional boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'harvey'
AS $function$
  with pref as (select pp.proveedor_id from harvey.proveedor_preferido pp join public.productos pr on pr.id = p_producto where pr.nombre ~* pp.patron limit 1),
  x as (
    select precio, fecha, 'factura leída'::text as fuente, unidad, proveedor_id, 0 as rk from public.lineas_factura_leida where producto_id = p_producto
    union all select precio, fecha, 'factura de proveedor', unidad, proveedor_id, 0 from public.tarifas_compra where producto_id = p_producto
    union all select l.precio_compra, coalesce(c.fecha, l.created_at::date), 'lote', l.unidad, c.proveedor_id, 1 from public.lotes l left join public.compras c on c.id = l.compra_id where l.producto_id = p_producto and l.precio_compra is not null
    union all select precio, fecha, 'precio de compra del día', unidad, null::uuid, 2 from public.precios_compra_dia where producto_id = p_producto),
  c as (select x.*, case when x.fecha between p_fecha - 1 and p_fecha + 1 then 0 when x.fecha < p_fecha then 1 else 2 end as grupo
        from x where x.precio > 0 and x.fecha between p_fecha - 30 and p_fecha + 3
          and (not exists (select 1 from pref) or x.proveedor_id is null or x.proveedor_id = (select proveedor_id from pref)))
  select c.precio, c.fecha, c.fuente, pv.nombre, c.unidad, c.grupo <> 0
  from c left join public.proveedores pv on pv.id = c.proveedor_id
  order by c.grupo, case when c.fecha = p_fecha then 0 when c.fecha = p_fecha - 1 then 1 else 2 end, abs(c.fecha - p_fecha), c.rk
  limit 1 $function$
;
CREATE OR REPLACE FUNCTION public.costes_en_fechas(p jsonb)
 RETURNS TABLE(producto_id uuid, dia date, precio numeric, fecha date, fuente text, proveedor text, unidad text, provisional boolean)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if coalesce(public.rol_actual(), '') not in ('oficina', 'admin', 'compras') then raise exception 'SIN_PERMISO'; end if;
  return query select t.producto_id, t.dia, c.precio, c.fecha, c.fuente, c.proveedor, c.unidad, c.provisional
    from (select distinct x.producto_id, x.dia from jsonb_to_recordset(coalesce(p, '[]'::jsonb)) as x(producto_id uuid, dia date) where x.producto_id is not null and x.dia is not null) t
    cross join lateral public.coste_en_fecha(t.producto_id, t.dia) c;
end $function$
;
CREATE OR REPLACE FUNCTION public.crear_enlace_albaran(p_pedido uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
        declare v_tok text; v_env jsonb;
        begin
          if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
            if not exists (select 1 from public.albaranes where pedido_id = p_pedido and numero is not null) then raise exception 'ALBARAN_NO_EXISTE'; end if;
              select token, envios into v_tok, v_env from public.albaran_enlaces where pedido_id = p_pedido;
                if v_tok is null then
                    v_tok := replace(gen_random_uuid()::text, '-', '');
                        insert into public.albaran_enlaces(pedido_id, token) values (p_pedido, v_tok);
                            v_env := '[]'::jsonb;
                              end if;
                                return jsonb_build_object('token', v_tok, 'envios', v_env);
                                end $function$
;
CREATE OR REPLACE FUNCTION public.crear_enlace_cliente(p_cliente uuid, p_nuevo boolean DEFAULT false)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                    declare v_tok text;
                                                                                                                                                                                    begin
                                                                                                                                                                                      if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                                                                        if not exists (select 1 from public.clientes where id = p_cliente) then raise exception 'CLIENTE_NO_EXISTE'; end if;
                                                                                                                                                                                          if p_nuevo then delete from public.cliente_enlaces where cliente_id = p_cliente; end if;
                                                                                                                                                                                            select token into v_tok from public.cliente_enlaces where cliente_id = p_cliente;
                                                                                                                                                                                              if v_tok is null then
                                                                                                                                                                                                  v_tok := replace(gen_random_uuid()::text, '-', '');
                                                                                                                                                                                                      insert into public.cliente_enlaces(cliente_id, token) values (p_cliente, v_tok);
                                                                                                                                                                                                        end if;
                                                                                                                                                                                                          return v_tok;
                                                                                                                                                                                                          end $function$
;
CREATE OR REPLACE FUNCTION public.desmarcar_albaranes_facturados(p_pedidos uuid[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                          declare n integer;
                                          begin
                                            if public.rol_actual() is null or public.rol_actual() not in ('oficina','admin') then raise exception 'SIN_PERMISO'; end if;
                                              delete from public.albaranes_facturados where pedido_id = any(p_pedidos);
                                                get diagnostics n = row_count;
                                                  return n;
                                                  end $function$
;
CREATE OR REPLACE FUNCTION public.editar_pedido(p_pedido uuid, p_cliente uuid DEFAULT NULL::uuid, p_fecha date DEFAULT NULL::date, p_notas text DEFAULT NULL::text, p_cambiar_notas boolean DEFAULT false, p_lineas jsonb DEFAULT '[]'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
            declare
              v_rol text := public.rol_actual(); v_estado text; x jsonb; v_lin record;
              begin
                if v_rol is null then raise exception 'SIN_PERMISO'; end if;
                  select estado into v_estado from public.pedidos where id = p_pedido for update;
                    if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
                      if v_estado in ('terminado','anulado') then raise exception 'PEDIDO_CERRADO'; end if;

                        if p_cliente is not null then
                            if not exists (select 1 from public.clientes where id = p_cliente) then raise exception 'CLIENTE_NO_EXISTE'; end if;
                                update public.pedidos set cliente_id = p_cliente where id = p_pedido;
                                  end if;
                                    if p_fecha is not null then update public.pedidos set fecha_entrega = p_fecha where id = p_pedido; end if;
                                      if p_cambiar_notas then update public.pedidos set notas = nullif(trim(coalesce(p_notas,'')),'') where id = p_pedido; end if;

                                        for x in select * from jsonb_array_elements(coalesce(p_lineas,'[]'::jsonb)) loop
                                            select id, estado, peso_real into v_lin from public.lineas_pedido
                                                  where id = (x->>'id')::uuid and pedido_id = p_pedido for update;
                                                      if v_lin.id is null then raise exception 'LINEA_NO_ES_DE_ESTE_PEDIDO'; end if;
                                                          if coalesce((x->>'quitar')::boolean,false) then
                                                                if v_lin.estado <> 'pendiente' or v_lin.peso_real is not null
                                                                         or exists (select 1 from public.asignaciones_lote where linea_id = v_lin.id) then
                                                                                 raise exception 'LINEA_YA_PREPARADA';
                                                                                       end if;
                                                                                             update public.incidencias set linea_id = null where linea_id = v_lin.id;
                                                                                                   delete from public.lineas_pedido where id = v_lin.id;
                                                                                                       else
                                                                                                             if x ? 'cantidad' then
                                                                                                                     if (x->>'cantidad')::numeric is null or (x->>'cantidad')::numeric <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
                                                                                                                             update public.lineas_pedido set cantidad_pedida = (x->>'cantidad')::numeric where id = v_lin.id;
                                                                                                                                   end if;
                                                                                                                                         if x ? 'unidad' and nullif(x->>'unidad','') is not null then
                                                                                                                                                 update public.lineas_pedido set unidad_pedida = x->>'unidad' where id = v_lin.id;
                                                                                                                                                       end if;
                                                                                                                                                             if coalesce((x->>'cambiar_precio')::boolean,false) then
                                                                                                                                                                     if x->>'precio' is not null and (x->>'precio')::numeric < 0 then raise exception 'PRECIO_NO_VALIDO'; end if;
                                                                                                                                                                             update public.lineas_pedido set precio = (x->>'precio')::numeric where id = v_lin.id;
                                                                                                                                                                                   end if;
                                                                                                                                                                                       end if;
                                                                                                                                                                                         end loop;
                                                                                                                                                                                         end $function$
;
CREATE OR REPLACE FUNCTION public.eliminar_pedido(p_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() not in ('oficina','admin') then raise exception 'Sin permiso'; end if;
    update public.incidencias set linea_id = null where linea_id in (select id from public.lineas_pedido where pedido_id = p_id);
      update public.incidencias set pedido_id = null where pedido_id = p_id;
        delete from public.cobros where pedido_id = p_id;
          delete from public.albaranes where pedido_id = p_id;
            delete from public.pedidos where id = p_id;
            end $function$
;
CREATE OR REPLACE FUNCTION public.empezar_pedido(p_pedido uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_ped public.pedidos;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  select * into v_ped from public.pedidos where id = p_pedido for update;
  if not found then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_ped.estado in ('terminado','anulado') then raise exception 'PEDIDO_CERRADO'; end if;
  if v_ped.preparador_id is not null and v_ped.preparador_id <> auth.uid() and v_rol = 'preparador' then
    raise exception 'YA_ASIGNADO';
  end if;
  update public.pedidos
     set preparador_id = coalesce(preparador_id, auth.uid()),
         estado = 'en_preparacion'
   where id = p_pedido;
end $function$
;
CREATE OR REPLACE FUNCTION public.fichar(p_accion text, p_cuando timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS fichajes
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                            declare
                              v_uid uuid := auth.uid();
                                v_ts timestamptz := now();
                                  v_off boolean := false;
                                    v_f public.fichajes;
                                    begin
                                      if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                        if p_accion not in ('entrada','salida') then raise exception 'ACCION_NO_VALIDA'; end if;
                                          -- Si se fichó sin conexión, se acepta la hora del móvil (máximo 36 h atrás) y se marca.
                                            if p_cuando is not null and p_cuando < now() - interval '1 minute' and p_cuando > now() - interval '36 hours' then
                                                v_ts := p_cuando; v_off := true;
                                                  end if;
                                                    select * into v_f from public.fichajes
                                                       where usuario_id = v_uid and salida is null order by entrada desc limit 1 for update;
                                                         if p_accion = 'entrada' then
                                                             if found then return v_f; end if;
                                                                 insert into public.fichajes (usuario_id, entrada, sin_conexion) values (v_uid, v_ts, v_off)
                                                                     returning * into v_f;
                                                                         return v_f;
                                                                           end if;
                                                                             if not found then raise exception 'SIN_ENTRADA'; end if;
                                                                               update public.fichajes
                                                                                    set salida = greatest(v_ts, entrada), sin_conexion = sin_conexion or v_off
                                                                                       where id = v_f.id returning * into v_f;
                                                                                         return v_f;
                                                                                         end $function$
;
CREATE OR REPLACE FUNCTION public.foto_incidencia(p_id uuid)
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                    select foto from public.incidencias where id = p_id;
                                                    $function$
;
CREATE OR REPLACE FUNCTION public.generar_previstos(p_dias integer DEFAULT 14)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  n int := 0; d date; h record; nuevo uuid; marca text; hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if auth.uid() is not null and public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  for d in select generate_series(hoy, hoy + least(greatest(coalesce(p_dias, 14), 0), 31), interval '1 day')::date loop
    for h in
      select ph.id, ph.cliente_id, ph.repartidor_id, ph.tipo, ph.notas
      from public.pedidos_habituales ph join public.clientes c on c.id = ph.cliente_id
      where ph.activo and c.activo and ph.tipo <> 'si_llama' and extract(dow from d)::int = any(ph.dias_semana)
      order by ph.created_at
    loop
      marca := 'fijo:' || h.id || ':' || d;
      continue when exists (select 1 from public.pedidos where hash_origen = marca);
      continue when exists (select 1 from public.pedidos where cliente_id = h.cliente_id and fecha_entrega = d
                            and estado <> 'anulado' and not coalesce(archivado, false));
      insert into public.pedidos (cliente_id, fecha_entrega, estado, notas, repartidor_id, origen, hash_origen, creado_por)
      values (h.cliente_id, d, 'previsto',
              concat_ws(' · ',
                case h.tipo when 'no_siempre' then 'Fijo «no siempre»: confirmar si lo quiere'
                            when 'especifico' then 'Pedido específico: preguntar qué quiere'
                            else 'Pedido fijo' end,
                case when nullif(trim(h.notas), '') is not null then 'Suele llevar: ' || trim(h.notas) end),
              h.repartidor_id, 'fijo', marca, null)
      returning id into nuevo;
      insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, unidad_precio)
      select nuevo, lh.producto_id, lh.cantidad, lh.unidad, coalesce(p.unidad_precio, 'kg')
      from public.lineas_habituales lh join public.productos p on p.id = lh.producto_id
      where lh.habitual_id = h.id and p.activo;
      n := n + 1;
    end loop;
  end loop;
  return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_ajuste_compra(p_fecha date, p_producto uuid, p_unidad text, p_cantidad numeric DEFAULT NULL::numeric, p_nota text DEFAULT NULL::text, p_extra boolean DEFAULT false)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                          declare v_nota text := nullif(btrim(coalesce(p_nota,'')), '');
                          begin
                            if public.rol_actual() is null or public.rol_actual() not in ('compras','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
                              if p_fecha is null or p_producto is null or coalesce(btrim(p_unidad),'') = '' then raise exception 'DATOS_NO_VALIDOS'; end if;
                                if p_cantidad is not null and p_cantidad < 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
                                  -- Sin cantidad ni nota y no es un producto extra: se borra el ajuste (vuelve a lo calculado).
                                    if p_cantidad is null and v_nota is null and not coalesce(p_extra,false) then
                                        delete from public.compra_ajustes where fecha = p_fecha and producto_id = p_producto and unidad = p_unidad;
                                            return;
                                              end if;
                                                insert into public.compra_ajustes (fecha, producto_id, unidad, cantidad, nota, extra, actualizado_por, actualizado_en)
                                                  values (p_fecha, p_producto, p_unidad, p_cantidad, v_nota, coalesce(p_extra,false), auth.uid(), now())
                                                    on conflict (fecha, producto_id, unidad) do update
                                                        set cantidad = excluded.cantidad, nota = excluded.nota, extra = excluded.extra,
                                                                actualizado_por = auth.uid(), actualizado_en = now();
                                                                end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_firma_albaran(p_pedido uuid, p_firma text, p_nombre text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_n integer;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
    if p_firma is not null and (p_firma not like 'data:image/png;base64,%' or length(p_firma) > 300000) then raise exception 'FIRMA_NO_VALIDA'; end if;
      update public.albaranes
           set firma_png = p_firma,
                    firma_nombre = case when p_firma is null then null else left(nullif(btrim(coalesce(p_nombre,'')), ''), 80) end,
                             firma_at = case when p_firma is null then null else now() end
                                where pedido_id = p_pedido;
                                  get diagnostics v_n = row_count;
                                    if v_n = 0 then raise exception 'ALBARAN_NO_EXISTE'; end if;
                                    end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_foto(p_foto text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
        begin
          if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
            if p_foto is null then
                delete from public.fotos_perfil where usuario_id = auth.uid();
                  else
                      insert into public.fotos_perfil (usuario_id, foto) values (auth.uid(), p_foto)
                          on conflict (usuario_id) do update set foto = excluded.foto, updated_at = now();
                            end if;
                            end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_lineas_factura(p_factura uuid, p_proveedor uuid, p_fecha date, p_lineas jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                              declare n integer := 0; x jsonb;
                              begin
                                if public.rol_actual() is null or public.rol_actual() not in ('compras','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
                                  if p_factura is null or p_fecha is null or p_lineas is null or jsonb_typeof(p_lineas) <> 'array' then raise exception 'DATOS_NO_VALIDOS'; end if;
                                    delete from public.lineas_factura_leida where factura_id = p_factura;   -- se vuelve a guardar la lectura entera
                                      for x in select * from jsonb_array_elements(p_lineas) loop
                                          if coalesce(btrim(x->>'texto'),'') = '' then continue; end if;
                                              insert into public.lineas_factura_leida (factura_id, proveedor_id, fecha, texto, cantidad, unidad, precio, importe, producto_id, dudoso)
                                                  values (p_factura, p_proveedor, p_fecha, left(btrim(x->>'texto'), 200),
                                                              nullif(x->>'cantidad','')::numeric, nullif(x->>'unidad',''), nullif(x->>'precio','')::numeric, nullif(x->>'importe','')::numeric,
                                                                          nullif(x->>'producto_id','')::uuid, coalesce((x->>'dudoso')::boolean, false))
                                                                              on conflict (factura_id, texto, precio) do nothing;
                                                                                  n := n + 1;
                                                                                    end loop;
                                                                                      return n;
                                                                                      end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_peso(p_linea uuid, p_peso numeric, p_version integer, p_lote uuid DEFAULT NULL::uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_rol text := public.rol_actual();
  v_pedido uuid; v_estado text; v_nueva integer; v_prod uuid; v_up text; v_peso_antes numeric;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  if p_peso is null or p_peso < 0 then raise exception 'PESO_NO_VALIDO'; end if;

  select l.pedido_id, p.estado, l.producto_id, l.unidad_precio, l.peso_real
    into v_pedido, v_estado, v_prod, v_up, v_peso_antes
    from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id
   where l.id = p_linea;
  if v_pedido is null then raise exception 'LINEA_NO_EXISTE'; end if;
  if v_estado in ('terminado','anulado') and v_rol = 'preparador' then raise exception 'PEDIDO_CERRADO'; end if;
  if p_lote is not null and not exists (select 1 from public.lotes lo where lo.id = p_lote
       and lo.producto_id = v_prod and not coalesce(lo.archivado, false)) then
    raise exception 'ASIGNACION_NO_VALIDA'; end if;

  update public.lineas_pedido
     set peso_real = p_peso, estado = 'hecha', preparado_por = auth.uid(), preparado_en = now()
   where id = p_linea and version = p_version
   returning version into v_nueva;
  if v_nueva is null then raise exception 'CONFLICTO'; end if;

  if v_up = 'kg' and v_peso_antes is distinct from p_peso then
    update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
     where pedido_id = v_pedido and estado = 'emitido' and traza_estado is not null;
  end if;

  perform set_config('fj.traza_corr', '1', true);
  if p_lote is not null then
    delete from public.asignaciones_lote where linea_id = p_linea;
    insert into public.asignaciones_lote (linea_id, lote_id, cantidad) values (p_linea, p_lote, p_peso);
  elsif v_up = 'kg' and (select count(*) from public.asignaciones_lote where linea_id = p_linea) = 1 then
    update public.asignaciones_lote set cantidad = p_peso where linea_id = p_linea;
  end if;
  perform set_config('fj.traza_corr', '', true);

  update public.pedidos set estado = 'en_preparacion' where id = v_pedido and estado = 'pendiente';
  return v_nueva;
end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_precio_compra_dia(p_fecha date, p_producto uuid, p_unidad text, p_precio numeric DEFAULT NULL::numeric, p_nota text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                      declare v_nota text := nullif(btrim(coalesce(p_nota,'')), '');
                      begin
                        if public.rol_actual() is null or public.rol_actual() not in ('compras','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
                          if p_fecha is null or p_producto is null or coalesce(btrim(p_unidad),'') = '' then raise exception 'DATOS_NO_VALIDOS'; end if;
                            if p_precio is not null and p_precio < 0 then raise exception 'PRECIO_NO_VALIDO'; end if;
                              if p_precio is null then   -- sin precio = se quita el apunte de ese día
                                  delete from public.precios_compra_dia where fecha = p_fecha and producto_id = p_producto and unidad = p_unidad;
                                      return;
                                        end if;
                                          insert into public.precios_compra_dia (fecha, producto_id, unidad, precio, nota, actualizado_por, actualizado_en)
                                            values (p_fecha, p_producto, p_unidad, p_precio, v_nota, auth.uid(), now())
                                              on conflict (fecha, producto_id, unidad) do update
                                                  set precio = excluded.precio, nota = excluded.nota, actualizado_por = auth.uid(), actualizado_en = now();
                                                  end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_push(p_endpoint text, p_p256dh text, p_auth text, p_dispositivo text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
              begin
                if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                  if coalesce(p_endpoint,'') = '' or coalesce(p_p256dh,'') = '' or coalesce(p_auth,'') = '' then raise exception 'DATOS_NO_VALIDOS'; end if;
                    insert into public.push_suscripciones (usuario_id, endpoint, p256dh, auth, dispositivo)
                      values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(p_dispositivo, 120))
                        on conflict (endpoint) do update
                            set usuario_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, dispositivo = excluded.dispositivo;
                            end $function$
;
CREATE OR REPLACE FUNCTION public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
    if p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'UBICACION_NO_VALIDA'; end if;
      update public.clientes set lat = p_lat, lng = p_lng where id = p_cliente;
      end $function$
;
CREATE OR REPLACE FUNCTION public.guardia_asignaciones()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  if pg_trigger_depth() > 1 then return coalesce(new, old); end if;   -- borrado en cascada al eliminar un pedido
    if coalesce(current_setting('fj.traza_corr', true), '') = '1' then return coalesce(new, old); end if;
      if exists (select 1 from public.lineas_pedido l join public.albaranes al on al.pedido_id = l.pedido_id
                    where l.id = old.linea_id and al.estado = 'emitido' and al.traza_estado is not null) then
                        raise exception 'TRAZABILIDAD_CERRADA';
                          end if;
                            return coalesce(new, old);
                            end $function$
;
CREATE OR REPLACE FUNCTION public.incidencias_de_pedido(p_pedido uuid)
 RETURNS TABLE(id uuid, tipo text, nota text, created_at timestamp with time zone, con_foto boolean, resuelta boolean)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                            select i.id, i.tipo::text, i.nota, i.created_at, i.con_foto, i.resuelta
                                              from public.incidencias i
                                                where i.pedido_id = p_pedido and coalesce(i.archivado,false) = false
                                                  order by i.created_at;
                                                  $function$
;
CREATE OR REPLACE FUNCTION public.marcar_albaranes_facturados(p_pedidos uuid[], p_numero text, p_fecha date DEFAULT NULL::date)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
            declare v_num text := nullif(btrim(coalesce(p_numero,'')), ''); n integer;
            begin
              if public.rol_actual() is null or public.rol_actual() not in ('oficina','admin') then raise exception 'SIN_PERMISO'; end if;
                if v_num is null then raise exception 'NUMERO_FACTURA_VACIO'; end if;
                  if p_pedidos is null or coalesce(array_length(p_pedidos,1),0) = 0 then raise exception 'DATOS_NO_VALIDOS'; end if;
                    insert into public.albaranes_facturados (pedido_id, numero_factura, fecha_factura, marcado_por)
                      select x, v_num, p_fecha, auth.uid() from unnest(p_pedidos) x
                        where exists (select 1 from public.pedidos p where p.id = x)
                          on conflict (pedido_id) do update
                              set numero_factura = excluded.numero_factura, fecha_factura = excluded.fecha_factura,
                                      marcado_por = auth.uid(), marcado_en = now();
                                        get diagnostics n = row_count;
                                          return n;
                                          end $function$
;
CREATE OR REPLACE FUNCTION public.marcar_cargado(p_linea uuid, p_cargado boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() not in ('preparador','oficina','admin') then
      raise exception 'SIN_PERMISO';
        end if;
          if not exists (select 1 from public.lineas_pedido where id = p_linea) then
              raise exception 'LINEA_NO_EXISTE';
                end if;
                  insert into public.carga_lineas (linea_id, cargado, por, en)
                    values (p_linea, p_cargado, auth.uid(), now())
                      on conflict (linea_id) do update
                          set cargado = excluded.cargado, por = auth.uid(), en = now();
                          end $function$
;
CREATE OR REPLACE FUNCTION public.marcar_compra_despues(p_linea uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                                                                     declare v_rol text := public.rol_actual(); v_ped uuid; v_estado text;
                                                                                                                                                                                                                     begin
                                                                                                                                                                                                                       if v_rol is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                                                                                                         select l.pedido_id, p.estado into v_ped, v_estado
                                                                                                                                                                                                                             from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id where l.id = p_linea for update of l;
                                                                                                                                                                                                                               if v_ped is null then raise exception 'LINEA_NO_EXISTE'; end if;
                                                                                                                                                                                                                                 if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
                                                                                                                                                                                                                                   if v_rol not in ('oficina','admin') and exists (select 1 from public.entregas where pedido_id = v_ped) then
                                                                                                                                                                                                                                       raise exception 'PEDIDO_ENTREGADO';
                                                                                                                                                                                                                                         end if;
                                                                                                                                                                                                                                           delete from public.asignaciones_lote where linea_id = p_linea;
                                                                                                                                                                                                                                             update public.lineas_pedido
                                                                                                                                                                                                                                                  set peso_real = 0, estado = 'no_disponible', preparado_por = auth.uid(), preparado_en = now(),
                                                                                                                                                                                                                                                           notas = 'Se compra después'
                                                                                                                                                                                                                                                              where id = p_linea;
                                                                                                                                                                                                                                                                update public.pedidos set estado = 'en_preparacion' where id = v_ped and estado = 'pendiente';
                                                                                                                                                                                                                                                                  update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
                                                                                                                                                                                                                                                                     where pedido_id = v_ped and estado = 'emitido' and traza_estado is not null;
                                                                                                                                                                                                                                                                     end $function$
;
CREATE OR REPLACE FUNCTION public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone DEFAULT NULL::timestamp with time zone, p_nota text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
              declare v_estado text;
              begin
                if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                  select estado into v_estado from public.pedidos where id = p_pedido;
                    if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
                      if v_estado <> 'terminado' then raise exception 'PEDIDO_NO_TERMINADO'; end if;
                        insert into public.entregas (pedido_id, entregado_por, entregado_at, nota)
                          values (p_pedido, auth.uid(), coalesce(p_at, now()), nullif(trim(coalesce(p_nota,'')), ''))
                            on conflict (pedido_id) do nothing;
                            end $function$
;
CREATE OR REPLACE FUNCTION public.memoria_golden(p_cliente uuid)
 RETURNS TABLE(fecha date, factura_numero text, albaran text, producto_codigo text, cantidad numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  with f as (
    select gf.numero, gf.fecha
    from golden_facturas gf join clientes c on c.codigo = gf.cliente_codigo
    where c.id = p_cliente
      and rol_actual() = any (array['admin','oficina','secretaria','comercial','compras','direccion','preparador','repartidor'])
    order by gf.fecha desc limit 40)
  select f.fecha, gl.factura_numero, gl.albaran, gl.producto_codigo, gl.cantidad
  from f join golden_lineas gl on gl.factura_numero = f.numero;
$function$
;
CREATE OR REPLACE FUNCTION public.mi_caja(p_fecha date)
 RETURNS TABLE(id uuid, importe numeric, forma text, nota text, created_at timestamp with time zone, pedido_id uuid, cliente_codigo text, cliente_nombre text, cliente_nombre_comercial text)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                select c.id, c.importe, c.forma::text, c.nota, c.created_at, c.pedido_id, cl.codigo, cl.nombre, cl.nombre_comercial
                                  from public.cobros c left join public.clientes cl on cl.id = c.cliente_id
                                    where c.cobrado_por = auth.uid()
                                        and (c.created_at at time zone 'Europe/Madrid')::date = p_fecha
                                          order by c.created_at;
                                          $function$
;
CREATE OR REPLACE FUNCTION public.moviles_para_albaran(p_pedidos uuid[])
 RETURNS TABLE(pedido_id uuid, cliente_id uuid, cliente text, movil text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  return query
  select p.id, c.id, coalesce(c.nombre_comercial, c.nombre),
    coalesce(
      (select right(regexp_replace(pr.whatsapp, '\D', '', 'g'), 9) from harvey.preferencias pr where pr.cliente_id = c.id and coalesce(pr.whatsapp, '') <> ''),
      case when right(regexp_replace(coalesce(c.telefono, ''), '\D', '', 'g'), 9) ~ '^[67][0-9]{8}$' then right(regexp_replace(c.telefono, '\D', '', 'g'), 9) end,
      (select k.movil from public.contactos_portal k where k.cliente_id = c.id and k.movil is not null and k.estado <> 'descartado' order by k.created_at desc limit 1))
  from public.pedidos p join public.clientes c on c.id = p.cliente_id where p.id = any(p_pedidos);
end $function$
;
CREATE OR REPLACE FUNCTION public.ordenar_reparto(p_pedidos uuid[])
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); i integer; n integer := 0; c integer;
begin
  if v_rol is null then raise exception 'SIN_PERMISO'; end if;
  if p_pedidos is null or coalesce(array_length(p_pedidos, 1), 0) = 0 then raise exception 'DATOS_NO_VALIDOS'; end if;
  for i in 1 .. array_length(p_pedidos, 1) loop
    update public.pedidos set orden_reparto = i
      where id = p_pedidos[i] and repartidor_id is not null;
    get diagnostics c = row_count;
    if c = 0 then raise exception 'SIN_PERMISO'; end if;
    n := n + c;
  end loop;
  return n;
end $function$
;
CREATE OR REPLACE FUNCTION public.poner_descuento(p_pedido uuid, p_base numeric, p_motivo text, p_iva numeric DEFAULT 4)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
        declare v_rol text := public.rol_actual(); v_estado text; v_suma numeric;
        begin
          if v_rol is null or v_rol not in ('oficina','admin') then raise exception 'SOLO_OFICINA'; end if;
            select estado into v_estado from public.pedidos where id = p_pedido for update;
              if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
                if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
                  if p_base is null or p_base < 0 then raise exception 'DESCUENTO_NO_VALIDO'; end if;
                    if p_iva not in (0,4,10,21) then raise exception 'IVA_NO_VALIDO'; end if;
                      if p_base > 0 and coalesce(btrim(p_motivo),'') = '' then raise exception 'MOTIVO_OBLIGATORIO'; end if;
                        select coalesce(sum(round(l.peso_real * l.precio, 2)),0) into v_suma
                            from public.lineas_pedido l where l.pedido_id = p_pedido and l.peso_real is not null and l.precio is not null;
                              if p_base > v_suma then raise exception 'DESCUENTO_MAYOR_QUE_EL_PEDIDO'; end if;
                                update public.pedidos
                                     set descuento_base = round(p_base,2), descuento_iva = p_iva,
                                              descuento_motivo = case when p_base = 0 then null else btrim(p_motivo) end
                                                 where id = p_pedido;
                                                 end $function$
;
CREATE OR REPLACE FUNCTION public.poner_info_interna(p_pedido uuid, p_lineas jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  declare v_rol text := public.rol_actual(); x jsonb; v_n integer := 0; v_lista numeric;
  begin
    if v_rol is null or v_rol not in ('oficina','admin','compras') then raise exception 'SIN_PERMISO'; end if;
      if not exists (select 1 from public.pedidos where id = p_pedido) then raise exception 'PEDIDO_NO_EXISTE'; end if;
        for x in select * from jsonb_array_elements(coalesce(p_lineas,'[]'::jsonb)) loop
            v_lista := nullif(x->>'precio_lista','')::numeric;
                if v_lista is not null and v_lista < 0 then raise exception 'PRECIO_NO_VALIDO'; end if;
                    update public.lineas_pedido
                           set precio_lista = v_lista, nota_interna = nullif(trim(coalesce(x->>'nota_interna','')),'')
                                where id = (x->>'id')::uuid and pedido_id = p_pedido;
                                    if not found then raise exception 'LINEA_NO_ES_DE_ESTE_PEDIDO'; end if;
                                        v_n := v_n + 1;
                                          end loop;
                                            return v_n;
                                            end $function$
;
CREATE OR REPLACE FUNCTION public.poner_precios(p_pedido uuid, p_lineas jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_estado text; x jsonb; v_id uuid; n integer := 0;
begin
  if v_rol is null then raise exception 'SIN_PERMISO'; end if;
    select estado into v_estado from public.pedidos where id = p_pedido for update;
      if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
        if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;

          for x in select * from jsonb_array_elements(coalesce(p_lineas,'[]'::jsonb)) loop
              select id into v_id from public.lineas_pedido where id = (x->>'id')::uuid and pedido_id = p_pedido for update;
                  if v_id is null then raise exception 'LINEA_NO_ES_DE_ESTE_PEDIDO'; end if;
                      if x ? 'precio' then
                            if x->>'precio' is not null and (x->>'precio')::numeric < 0 then raise exception 'PRECIO_NO_VALIDO'; end if;
                                  update public.lineas_pedido set precio = (x->>'precio')::numeric where id = v_id;
                                      end if;
                                          if nullif(x->>'unidad_precio','') is not null then
                                                if x->>'unidad_precio' not in ('kg','unidad') then raise exception 'UNIDAD_PRECIO_NO_VALIDA'; end if;
                                                      update public.lineas_pedido set unidad_precio = x->>'unidad_precio' where id = v_id;
                                                          end if;
                                                              n := n + 1;
                                                                end loop;
                                                                  return n;
                                                                  end $function$
;
CREATE OR REPLACE FUNCTION public.portal_albaran(p_token text, p_numero integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                          declare v_cli uuid; v_ped uuid; v_lim date := public._portal_limite();
                                                                          begin
                                                                            if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
                                                                              select cliente_id into v_cli from public.cliente_enlaces where token = p_token;
                                                                                if v_cli is null then return jsonb_build_object('ok', false); end if;
                                                                                  select a.pedido_id into v_ped from public.albaranes a join public.pedidos p on p.id = a.pedido_id join public.albaran_portal ap on ap.pedido_id = a.pedido_id
                                                                                     where p.cliente_id = v_cli and a.numero = p_numero and a.estado = 'emitido' and (v_lim is null or a.fecha >= v_lim) limit 1;
                                                                                       if v_ped is null then return jsonb_build_object('ok', false); end if;
                                                                                         return public._albaran_json(v_ped);
                                                                                         end $function$
;
CREATE OR REPLACE FUNCTION public.portal_cliente(p_token text, p_desde date DEFAULT NULL::date, p_hasta date DEFAULT NULL::date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                declare v_cli uuid; v_nom jsonb; v_lista jsonb; v_lim date := public._portal_limite(); v_desde date;
                                begin
                                  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
                                    select cliente_id into v_cli from public.cliente_enlaces where token = p_token;
                                      if v_cli is null then return jsonb_build_object('ok', false); end if;
                                        v_desde := coalesce(p_desde, date_trunc('month', current_date)::date);
                                          if v_lim is not null and v_desde < v_lim then v_desde := v_lim; end if;
                                            select jsonb_build_object('nombre', c.nombre, 'nombre_comercial', c.nombre_comercial, 'nif', c.nif, 'localidad', c.localidad) into v_nom from public.clientes c where c.id = v_cli;
                                              select coalesce(jsonb_agg(public._albaran_json(x.pedido_id) - 'firma_png' order by x.fecha desc, x.numero desc), '[]'::jsonb) into v_lista
                                                  from (select a.pedido_id, a.fecha, a.numero from public.albaranes a join public.pedidos p on p.id = a.pedido_id join public.albaran_portal ap on ap.pedido_id = a.pedido_id
                                                             where p.cliente_id = v_cli and a.numero is not null and a.estado = 'emitido' and a.fecha >= v_desde and a.fecha <= coalesce(p_hasta, current_date)
                                                                        order by a.fecha desc, a.numero desc limit 200) x;
                                                                          return jsonb_build_object('ok', true, 'cliente', v_nom, 'albaranes', v_lista, 'limite', v_lim);
                                                                          end $function$
;
CREATE OR REPLACE FUNCTION public.portal_contacto_estado(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_cli uuid; v_tel text; v_mail text; v_wa text;
begin
  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
  select p.cliente_id into v_cli from public.albaran_enlaces e join public.pedidos p on p.id = e.pedido_id where e.token = p_token;
  if v_cli is null then select cliente_id into v_cli from public.cliente_enlaces where token = p_token; end if;
  if v_cli is null then return jsonb_build_object('ok', false); end if;
  select telefono, email into v_tel, v_mail from public.clientes where id = v_cli;
  select whatsapp into v_wa from harvey.preferencias where cliente_id = v_cli;
  return jsonb_build_object('ok', true,
    'movil', (coalesce(v_wa, '') <> '' or regexp_replace(coalesce(v_tel, ''), '\D', '', 'g') ~ '(^|34)[67][0-9]{8}$'
              or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.movil is not null and k.estado <> 'descartado')),
    'email', (coalesce(v_mail, '') like '%@%' or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.email is not null and k.estado <> 'descartado')));
end $function$
;
CREATE OR REPLACE FUNCTION public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_cli uuid; v_mov text; v_mail text; v_origen text;
begin
  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false, 'error', 'enlace'); end if;
  select p.cliente_id into v_cli from public.albaran_enlaces e join public.pedidos p on p.id = e.pedido_id where e.token = p_token;
  if v_cli is not null then v_origen := 'albaran'; else select cliente_id into v_cli from public.cliente_enlaces where token = p_token; v_origen := 'pagina'; end if;
  if v_cli is null then return jsonb_build_object('ok', false, 'error', 'enlace'); end if;
  v_mov := regexp_replace(coalesce(p_movil, ''), '\D', '', 'g');
  if length(v_mov) = 11 and v_mov like '34%' then v_mov := substr(v_mov, 3); end if;
  if v_mov = '' then v_mov := null; elsif v_mov !~ '^[67][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'movil'); end if;
  v_mail := nullif(lower(trim(coalesce(p_email, ''))), '');
  if v_mail is not null and (length(v_mail) > 120 or v_mail !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  if v_mov is null and v_mail is null then return jsonb_build_object('ok', false, 'error', 'vacio'); end if;
  if (select count(*) from public.contactos_portal where cliente_id = v_cli and created_at > now() - interval '1 day') >= 5 then return jsonb_build_object('ok', false, 'error', 'muchos'); end if;
  insert into public.contactos_portal (cliente_id, movil, email, nombre, origen) values (v_cli, v_mov, v_mail, left(nullif(trim(coalesce(p_nombre, '')), ''), 80), v_origen);
  return jsonb_build_object('ok', true);
end $function$
;
CREATE OR REPLACE FUNCTION public.portal_meses(p_meses integer DEFAULT NULL::integer)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    declare v integer;
    begin
      if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
        if p_meses is not null then
            if public.rol_actual() not in ('oficina','admin') then raise exception 'SOLO_OFICINA'; end if;
                if p_meses < 0 or p_meses > 120 then raise exception 'MESES_NO_VALIDO'; end if;
                    update public.portal_ajustes set meses_visibles = p_meses where id = 1;
                      end if;
                        select meses_visibles into v from public.portal_ajustes where id = 1;
                          return coalesce(v, 6);
                          end $function$
;
CREATE OR REPLACE FUNCTION public.publicar_albaran_portal(p_pedido uuid, p_publicar boolean DEFAULT true)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                                                                                                begin
                                                                                                                                                                  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                                                                                    if coalesce(p_publicar, true) then
                                                                                                                                                                        if not exists (select 1 from public.albaranes where pedido_id = p_pedido and numero is not null) then raise exception 'ALBARAN_NO_EXISTE'; end if;
                                                                                                                                                                            insert into public.albaran_portal(pedido_id) values (p_pedido) on conflict (pedido_id) do nothing;
                                                                                                                                                                              else
                                                                                                                                                                                  delete from public.albaran_portal where pedido_id = p_pedido;
                                                                                                                                                                                    end if;
                                                                                                                                                                                    end $function$
;
CREATE OR REPLACE FUNCTION public.quien_dia(p_fecha date)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_lineas jsonb; v_lotes jsonb;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'linea_id', l.id, 'pedido_id', p.id,
           'cliente', coalesce(c.nombre_comercial, c.nombre), 'producto_id', l.producto_id, 'producto', pr.nombre,
           'cantidad', case when l.unidad_precio = 'kg' then coalesce(l.peso_real, 0) else l.cantidad_pedida end,
           'unidad_precio', l.unidad_precio,
           'lotes', (select coalesce(jsonb_agg(jsonb_build_object('lote_id', a.lote_id, 'cantidad', a.cantidad)), '[]'::jsonb)
                       from public.asignaciones_lote a where a.linea_id = l.id))), '[]'::jsonb)
    into v_lineas
    from public.pedidos p
    join public.lineas_pedido l on l.pedido_id = p.id and l.estado in ('hecha','parcial')
    join public.productos pr on pr.id = l.producto_id
    left join public.clientes c on c.id = p.cliente_id
   where p.fecha_entrega = p_fecha and p.estado <> 'anulado'
     and not exists (select 1 from public.albaranes al where al.pedido_id = p.id and al.estado = 'emitido' and al.traza_estado is not null);

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', lo.id, 'producto_id', lo.producto_id, 'codigo', lo.codigo_lote, 'origen', lo.origen,
           'proveedor', pv.nombre, 'fecha', co.fecha, 'unidad', lo.unidad,
           'queda', lo.cantidad_recibida - coalesce((select sum(a.cantidad) from public.asignaciones_lote a
                      join public.lineas_pedido l3 on l3.id = a.linea_id join public.pedidos p3 on p3.id = l3.pedido_id
                     where a.lote_id = lo.id and p3.estado <> 'anulado'), 0))
           order by co.fecha, lo.created_at), '[]'::jsonb)
    into v_lotes
    from public.lotes lo
    join public.compras co on co.id = lo.compra_id
    left join public.proveedores pv on pv.id = co.proveedor_id
   where not coalesce(lo.archivado, false) and co.fecha >= p_fecha - 45
     and lo.producto_id in (select l2.producto_id from public.lineas_pedido l2 join public.pedidos p2 on p2.id = l2.pedido_id
                             where p2.fecha_entrega = p_fecha and p2.estado <> 'anulado' and l2.estado in ('hecha','parcial'));
  return jsonb_build_object('lineas', v_lineas, 'lotes', v_lotes);
end $function$
;
CREATE OR REPLACE FUNCTION public.quitar_linea(p_linea uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                                                                             declare v_rol text := public.rol_actual(); v_ped uuid; v_estado text; v_lin record;
                                                                                             begin
                                                                                               if v_rol is null then raise exception 'SIN_PERMISO'; end if;
                                                                                                 select l.pedido_id, p.estado into v_ped, v_estado
                                                                                                     from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id where l.id = p_linea for update of l;
                                                                                                       if v_ped is null then raise exception 'LINEA_NO_EXISTE'; end if;
                                                                                                         if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
                                                                                                           if v_rol not in ('oficina','admin') and exists (select 1 from public.entregas where pedido_id = v_ped) then
                                                                                                               raise exception 'PEDIDO_ENTREGADO';
                                                                                                                 end if;
                                                                                                                   select id, estado, peso_real into v_lin from public.lineas_pedido where id = p_linea;
                                                                                                                     if v_lin.estado = 'pendiente' and v_lin.peso_real is null
                                                                                                                          and not exists (select 1 from public.asignaciones_lote where linea_id = p_linea) then
                                                                                                                              update public.incidencias set linea_id = null where linea_id = p_linea;
                                                                                                                                  if to_regclass('public.carga_lineas') is not null then
                                                                                                                                        delete from public.carga_lineas where linea_id = p_linea;
                                                                                                                                            end if;
                                                                                                                                                delete from public.lineas_pedido where id = p_linea;
                                                                                                                                                    return 'quitada';
                                                                                                                                                      end if;
                                                                                                                                                        delete from public.asignaciones_lote where linea_id = p_linea;
                                                                                                                                                          update public.lineas_pedido
                                                                                                                                                               set peso_real = 0, estado = 'no_disponible', preparado_por = auth.uid(), preparado_en = now(),
                                                                                                                                                                        notas = trim(both ' ·' from coalesce(notas,'') || ' · No ha llegado')
                                                                                                                                                                           where id = p_linea;
                                                                                                                                                                             update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
                                                                                                                                                                                where pedido_id = v_ped and estado = 'emitido' and traza_estado is not null;
                                                                                                                                                                                  return 'no_disponible';
                                                                                                                                                                                  end $function$
;
CREATE OR REPLACE FUNCTION public.quitar_push(p_endpoint text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                            begin
                              if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                delete from public.push_suscripciones where endpoint = p_endpoint and usuario_id = auth.uid();
                                end $function$
;
CREATE OR REPLACE FUNCTION public.registrar_envio_albaran(p_pedido uuid, p_destino text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                begin
                                  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
                                    update public.albaran_enlaces
                                         set envios = envios || jsonb_build_array(jsonb_build_object('a', left(coalesce(p_destino,''), 120), 't', now(), 'por', auth.uid()))
                                            where pedido_id = p_pedido;
                                            end $function$
;
CREATE OR REPLACE FUNCTION public.rellenar_iva_linea()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
      begin
        if new.iva is null then
            select iva into new.iva from public.productos where id = new.producto_id;
              end if;
                return new;
                end $function$
;
CREATE OR REPLACE FUNCTION public.rol_actual()
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select rol from public.perfiles where id = auth.uid() and activo
$function$
;
CREATE OR REPLACE FUNCTION public.terminar_pedido(p_pedido uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_estado text; v_num integer;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
  if exists (select 1 from public.lineas_pedido where pedido_id = p_pedido and estado = 'pendiente') then
    raise exception 'LINEAS_PENDIENTES';
  end if;

  update public.pedidos set estado = 'terminado' where id = p_pedido;

  select numero into v_num from public.albaranes where pedido_id = p_pedido;
  if v_num is null then
    insert into public.albaranes (pedido_id) values (p_pedido) returning numero into v_num;
  end if;
  return v_num;
end $function$
;
CREATE OR REPLACE FUNCTION public.validar_trazabilidad(p_pedido uuid, p_asig jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  p_asig := coalesce(p_asig, '[]'::jsonb);
  if exists (select 1 from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
             group by x.linea_id, x.lote_id having count(*) > 1) then
    raise exception 'ASIGNACION_DUPLICADA'; end if;
  if exists (select 1 from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
               left join public.lineas_pedido l on l.id = x.linea_id and l.pedido_id = p_pedido
               left join public.lotes lo on lo.id = x.lote_id
              where l.id is null or lo.id is null or lo.producto_id <> l.producto_id
                 or l.estado not in ('hecha','parcial') or coalesce(lo.archivado, false)
                 or x.cantidad is null or x.cantidad <= 0) then
    raise exception 'ASIGNACION_NO_VALIDA'; end if;
  if exists (select 1 from public.lineas_pedido l
               left join (select x.linea_id, sum(x.cantidad) as s
                            from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                           group by x.linea_id) a on a.linea_id = l.id
              where l.pedido_id = p_pedido and l.estado in ('hecha','parcial')
                and (case when l.unidad_precio = 'kg' then coalesce(l.peso_real,0) else l.cantidad_pedida end) > 0
                and coalesce(a.s, 0) = 0) then
    raise exception 'FALTA_TRAZABILIDAD'; end if;
  if exists (select 1 from public.lineas_pedido l
               join (select x.linea_id, sum(x.cantidad) as s
                       from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                      group by x.linea_id) a on a.linea_id = l.id
              where l.pedido_id = p_pedido
                and abs(a.s - (case when l.unidad_precio = 'kg' then coalesce(l.peso_real,0) else l.cantidad_pedida end)) > 0.001) then
    raise exception 'KILOS_NO_COINCIDEN'; end if;
  if exists (select 1
               from (select x.lote_id, sum(x.cantidad) as pedido
                       from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                       join public.lineas_pedido l on l.id = x.linea_id and l.unidad_precio = 'kg'
                      group by x.lote_id) t
               join public.lotes lo on lo.id = t.lote_id
              where lo.unidad = 'kg'
                and t.pedido > lo.cantidad_recibida + 0.001 - coalesce((
                      select sum(a.cantidad) from public.asignaciones_lote a
                        join public.lineas_pedido l2 on l2.id = a.linea_id
                        join public.pedidos p2 on p2.id = l2.pedido_id
                       where a.lote_id = lo.id and l2.pedido_id <> p_pedido and p2.estado <> 'anulado'), 0)) then
    raise exception 'LOTE_SIN_KILOS'; end if;
end $function$
;
CREATE OR REPLACE FUNCTION public.web_solicitud_prospecto(p_nombre text, p_tipo text, p_localidad text, p_telefono text, p_email text DEFAULT NULL::text, p_mensaje text DEFAULT NULL::text, p_trampa text DEFAULT NULL::text, p_prueba boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_nom text; v_tipo text; v_loc text; v_tel text; v_mail text; v_msg text; v_id uuid;
begin
  if coalesce(p_trampa, '') <> '' then return jsonb_build_object('ok', true); end if;
  v_nom := left(nullif(trim(coalesce(p_nombre, '')), ''), 100);
  if v_nom is null or length(v_nom) < 2 then return jsonb_build_object('ok', false, 'error', 'nombre'); end if;
  v_tipo := case when p_tipo in ('restaurante','bar','colegio','residencia','escuela_infantil','catering','otro') then p_tipo else 'otro' end;
  v_loc := left(nullif(trim(coalesce(p_localidad, '')), ''), 80);
  v_tel := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  if length(v_tel) = 11 and v_tel like '34%' then v_tel := substr(v_tel, 3); end if;
  if v_tel !~ '^[6789][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'telefono'); end if;
  v_mail := nullif(lower(trim(coalesce(p_email, ''))), '');
  if v_mail is not null and (length(v_mail) > 120 or v_mail !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  v_msg := left(nullif(trim(coalesce(p_mensaje, '')), ''), 500);
  if p_prueba then return jsonb_build_object('ok', true, 'prueba', true); end if;
  if exists (select 1 from public.prospectos where regexp_replace(coalesce(telefono, ''), '\D', '', 'g') like '%' || v_tel
             and created_at > now() - interval '30 days') then return jsonb_build_object('ok', true, 'repetido', true); end if;
  if (select count(*) from public.prospectos where fuente = 'Formulario web' and created_at > now() - interval '1 day') >= 40 then
    return jsonb_build_object('ok', false, 'error', 'muchos'); end if;
  insert into public.prospectos (nombre, tipo, localidad, telefono, email, fuente, estado, proximo_contacto, notas)
  values (v_nom, v_tipo, v_loc, v_tel, v_mail, 'Formulario web', 'nuevo', (now() at time zone 'Europe/Madrid')::date,
          '🎯 Pidió pedido de prueba desde la web el ' || to_char(now() at time zone 'Europe/Madrid', 'DD/MM/YYYY HH24:MI') || coalesce('. Dice: ' || v_msg, ''))
  returning id into v_id;
  insert into public.avisos (tipo, para, titulo, texto, fijado, caduca, creado_por)
  values ('aviso', 'equipo', '🎯 Cliente nuevo desde la web: ' || v_nom,
          'Quiere un pedido de prueba. Llamarle HOY: Comercial → Avisos (contactos).', true,
          ((now() at time zone 'Europe/Madrid')::date + 3), null);
  return jsonb_build_object('ok', true);
end $function$
;
create or replace view public.v_lista_compra with (security_invoker=true) as  SELECT p.fecha_entrega,
    pr.codigo,
    pr.nombre AS producto,
    l.unidad_pedida,
    sum(l.cantidad_pedida) AS total_pedido
   FROM ((pedidos p
     JOIN lineas_pedido l ON ((l.pedido_id = p.id)))
     JOIN productos pr ON ((pr.id = l.producto_id)))
  WHERE (p.estado <> 'anulado'::text)
  GROUP BY p.fecha_entrega, pr.codigo, pr.nombre, l.unidad_pedida;
create or replace view public.v_trazabilidad with (security_invoker=true) as  SELECT lo.id AS lote_id,
    lo.codigo_lote,
    pr.nombre AS producto,
    lo.origen,
    pv.nombre AS proveedor,
    c.fecha AS fecha_compra,
    a.cantidad AS cantidad_entregada,
    p.fecha_entrega,
    cl.nombre AS cliente,
    al.serie,
    al.numero AS numero_albaran,
    cl.id AS cliente_id,
        CASE
            WHEN (l.unidad_precio = 'kg'::text) THEN 'kg'::text
            ELSE COALESCE(l.unidad_pedida, 'ud'::text)
        END AS unidad
   FROM ((((((((lotes lo
     JOIN compras c ON ((c.id = lo.compra_id)))
     LEFT JOIN proveedores pv ON ((pv.id = c.proveedor_id)))
     JOIN productos pr ON ((pr.id = lo.producto_id)))
     JOIN asignaciones_lote a ON ((a.lote_id = lo.id)))
     JOIN lineas_pedido l ON ((l.id = a.linea_id)))
     JOIN pedidos p ON ((p.id = l.pedido_id)))
     JOIN clientes cl ON ((cl.id = p.cliente_id)))
     LEFT JOIN albaranes al ON ((al.pedido_id = p.id)))
  WHERE (p.estado <> 'anulado'::text);
create or replace view public.v_controles with (security_invoker=true) as  SELECT 'linea_sin_lote'::text AS control,
    l.id AS registro_id,
    'Línea preparada sin lote asignado'::text AS detalle
   FROM lineas_pedido l
  WHERE ((l.estado = ANY (ARRAY['hecha'::text, 'parcial'::text])) AND (NOT (EXISTS ( SELECT 1
           FROM asignaciones_lote a
          WHERE (a.linea_id = l.id)))))
UNION ALL
 SELECT 'lote_sobreasignado'::text AS control,
    lo.id AS registro_id,
    'Cantidad repartida mayor que la recibida'::text AS detalle
   FROM lotes lo
  WHERE ((lo.unidad = 'kg'::text) AND (( SELECT COALESCE(sum(a.cantidad), (0)::numeric) AS "coalesce"
           FROM asignaciones_lote a
          WHERE (a.lote_id = lo.id)) > lo.cantidad_recibida))
UNION ALL
 SELECT 'lote_incompleto'::text AS control,
    lo.id AS registro_id,
    'Lote sin origen o sin código de lote'::text AS detalle
   FROM lotes lo
  WHERE ((COALESCE(lo.origen, ''::text) = ''::text) OR (COALESCE(lo.codigo_lote, ''::text) = ''::text))
UNION ALL
 SELECT 'compra_sin_documento'::text AS control,
    c.id AS registro_id,
    'Compra sin documento del proveedor'::text AS detalle
   FROM compras c
  WHERE (c.documento_url IS NULL);
create or replace view public.v_pedidos_importe with (security_invoker=false) as  WITH t AS (
         SELECT p_1.id AS pedido_id,
            COALESCE(l.iva, pr.iva, (4)::numeric) AS tipo,
            sum(round((l.peso_real * l.precio), 2)) AS base
           FROM ((pedidos p_1
             JOIN lineas_pedido l ON ((l.pedido_id = p_1.id)))
             JOIN productos pr ON ((pr.id = l.producto_id)))
          WHERE ((l.peso_real IS NOT NULL) AND (l.precio IS NOT NULL))
          GROUP BY p_1.id, COALESCE(l.iva, pr.iva, (4)::numeric)
        ), t2 AS (
         SELECT u.pedido_id,
            u.tipo,
            sum(u.base) AS base
           FROM ( SELECT t.pedido_id,
                    t.tipo,
                    t.base
                   FROM t
                UNION ALL
                 SELECT p_1.id,
                    (p_1.descuento_iva)::numeric AS descuento_iva,
                    (- p_1.descuento_base)
                   FROM pedidos p_1
                  WHERE ((p_1.descuento_base > (0)::numeric) AND (EXISTS ( SELECT 1
                           FROM t
                          WHERE (t.pedido_id = p_1.id))))) u
          GROUP BY u.pedido_id, u.tipo
        ), x AS (
         SELECT t2.pedido_id,
            sum(t2.base) AS base,
            sum(round(((t2.base * t2.tipo) / (100)::numeric), 2)) AS iva,
            sum(
                CASE
                    WHEN c_1.recargo_equivalencia THEN round(((t2.base *
                    CASE t2.tipo
                        WHEN 4 THEN 0.5
                        WHEN 10 THEN 1.4
                        WHEN 21 THEN 5.2
                        ELSE (0)::numeric
                    END) / (100)::numeric), 2)
                    ELSE (0)::numeric
                END) AS recargo
           FROM ((t2
             JOIN pedidos p_1 ON ((p_1.id = t2.pedido_id)))
             JOIN clientes c_1 ON ((c_1.id = p_1.cliente_id)))
          GROUP BY t2.pedido_id
        )
 SELECT p.id AS pedido_id,
    p.cliente_id,
    p.fecha_entrega,
    p.estado,
    c.codigo AS cliente_codigo,
    COALESCE(c.nombre_comercial, c.nombre) AS cliente_nombre,
    c.forma_pago,
    al.serie,
    al.numero AS numero_albaran,
    x.base,
    x.iva,
    x.recargo,
    ((x.base + x.iva) + x.recargo) AS total,
    COALESCE(cb.cobrado, (0)::numeric) AS cobrado,
    (((x.base + x.iva) + x.recargo) - COALESCE(cb.cobrado, (0)::numeric)) AS pendiente
   FROM ((((pedidos p
     JOIN clientes c ON ((c.id = p.cliente_id)))
     JOIN x ON ((x.pedido_id = p.id)))
     LEFT JOIN albaranes al ON (((al.pedido_id = p.id) AND (al.estado <> 'anulado'::text))))
     LEFT JOIN ( SELECT cobros.pedido_id,
            sum(cobros.importe) AS cobrado
           FROM cobros
          GROUP BY cobros.pedido_id) cb ON ((cb.pedido_id = p.id)))
  WHERE (rol_actual() IS NOT NULL);
create or replace view harvey.entregas as  SELECT f.cliente_codigo,
    COALESCE(to_date("substring"(g.albaran, 'de ([0-9]{2}/[0-9]{2}/[0-9]{4})'::text), 'DD/MM/YYYY'::text), f.fecha) AS fecha,
    g.producto_codigo,
    g.descripcion,
    g.cantidad,
    g.precio,
    g.importe
   FROM (golden_lineas g
     JOIN golden_facturas f ON ((f.numero = g.factura_numero)))
  WHERE ((f.tipo !~~* '%rectif%'::text) AND (COALESCE(f.borrador, false) = false));
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.fichajes FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.lineas_pedido FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_antes_actualizar BEFORE UPDATE ON public.sobrante FOR EACH ROW EXECUTE FUNCTION antes_de_actualizar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.albaranes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.alias_compra FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.asignaciones_lote FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.avisos FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.cobros FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.compra_ajustes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.compras FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.documentos_compra FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.entregas FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.facturas_clientes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.facturas_recibidas FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.fichajes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.formatos_cliente FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.formatos_producto FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.incidencias FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.lineas_factura_leida FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.lineas_habituales FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.lineas_pedido FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.listas_precios FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.listas_precios_items FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.lotes FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.pedidos_habituales FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.perfiles FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.precios_compra_dia FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.presentaciones FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.prospectos FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.recomendaciones FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.sobrante FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.tarifas FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_auditar AFTER INSERT OR DELETE OR UPDATE ON public.tarifas_compra FOR EACH ROW EXECUTE FUNCTION auditar();
CREATE TRIGGER trg_guardia_asignaciones BEFORE DELETE OR UPDATE ON public.asignaciones_lote FOR EACH ROW EXECUTE FUNCTION guardia_asignaciones();
CREATE TRIGGER trg_iva_linea BEFORE INSERT ON public.lineas_pedido FOR EACH ROW EXECUTE FUNCTION rellenar_iva_linea();
CREATE TRIGGER trg_precio_fijo AFTER UPDATE OF precio ON public.listas_precios_items FOR EACH ROW EXECUTE FUNCTION harvey.sincronizar_precio_fijo();
alter table public.listas_precios enable row level security;
alter table public.listas_precios_items enable row level security;
alter table public.facturas_recibidas enable row level security;
alter table public.recomendaciones enable row level security;
alter table public.prospectos enable row level security;
alter table public.tarifas_compra enable row level security;
alter table public.facturas_clientes enable row level security;
alter table public.push_suscripciones enable row level security;
alter table public.golden_facturas enable row level security;
alter table public.golden_lineas enable row level security;
alter table public.albaran_enlaces enable row level security;
alter table public.compra_ajustes enable row level security;
alter table public.albaran_portal enable row level security;
alter table public.lineas_factura_leida enable row level security;
alter table public.copia_config enable row level security;
alter table public.presentaciones enable row level security;
alter table public.alias_compra enable row level security;
alter table public.perfiles enable row level security;
alter table public.precios_compra_dia enable row level security;
alter table public.entregas enable row level security;
alter table public.cliente_enlaces enable row level security;
alter table public.albaranes_facturados enable row level security;
alter table public.clientes enable row level security;
alter table public.proveedores enable row level security;
alter table public.compras enable row level security;
alter table public.historial enable row level security;
alter table public.tarifas enable row level security;
alter table public.albaranes enable row level security;
alter table public.mensajes enable row level security;
alter table public.asignaciones_lote enable row level security;
alter table public.fotos_perfil enable row level security;
alter table public.carga_lineas enable row level security;
alter table public.lineas_pedido enable row level security;
alter table public.fichajes enable row level security;
alter table public.avisos enable row level security;
alter table public.pedidos enable row level security;
alter table public.lotes enable row level security;
alter table public.documentos_compra enable row level security;
alter table public.cobros enable row level security;
alter table public.lineas_habituales enable row level security;
alter table public.abreviaturas enable row level security;
alter table public.incidencias enable row level security;
alter table public.formatos_producto enable row level security;
alter table public.portal_ajustes enable row level security;
alter table public.pedidos_habituales enable row level security;
alter table harvey.preferencias enable row level security;
alter table harvey.contactos enable row level security;
alter table harvey.borradores enable row level security;
alter table harvey.registro enable row level security;
alter table public.contactos_portal enable row level security;
alter table public.envios_correo enable row level security;
alter table public.ayudas enable row level security;
alter table public.sobrante enable row level security;
alter table public.formatos_cliente enable row level security;
alter table public.productos enable row level security;
alter table public.whatsapp_mensajes enable row level security;
create policy abrev_todo on public.abreviaturas as PERMISSIVE for ALL to authenticated using ((rol_actual() IS NOT NULL)) with check ((rol_actual() IS NOT NULL));
create policy leer on public.albaran_portal as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy leer on public.albaranes as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy albaranes_facturados_leer on public.albaranes_facturados as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy borrar on public.alias_compra as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy cambiar on public.alias_compra as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy insertar on public.alias_compra as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.alias_compra as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy escribir on public.asignaciones_lote as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.asignaciones_lote as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy escribir on public.avisos as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.avisos as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy ayudas_atender on public.ayudas as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text]))) with check ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text])));
create policy ayudas_crear on public.ayudas as PERMISSIVE for INSERT to authenticated with check (((usuario_id = auth.uid()) AND (rol_actual() IS NOT NULL)));
create policy ayudas_ver on public.ayudas as PERMISSIVE for SELECT to authenticated using (((usuario_id = auth.uid()) OR (rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text]))));
create policy leer on public.carga_lineas as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy clientes_crear on public.clientes as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy clientes_editar on public.clientes as PERMISSIVE for UPDATE to authenticated using ((rol_actual() IS NOT NULL)) with check ((rol_actual() IS NOT NULL));
create policy leer on public.clientes as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy borrar on public.cobros as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.cobros as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy compra_ajustes_leer on public.compra_ajustes as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy escribir on public.compras as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.compras as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy contactos_portal_cambiar on public.contactos_portal as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text]))) with check ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text])));
create policy contactos_portal_ver on public.contactos_portal as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text])));
create policy borrar on public.documentos_compra as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy crear on public.documentos_compra as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy gestionar on public.documentos_compra as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.documentos_compra as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy borrar on public.entregas as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.entregas as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy envios_correo_ver on public.envios_correo as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy fcli_todo on public.facturas_clientes as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy cambiar on public.facturas_recibidas as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.facturas_recibidas as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy anadir on public.fichajes as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = 'admin'::text));
create policy corregir on public.fichajes as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = 'admin'::text)) with check ((rol_actual() = 'admin'::text));
create policy leer on public.fichajes as PERMISSIVE for SELECT to authenticated using (((usuario_id = auth.uid()) OR (rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))));
create policy fc_todo on public.formatos_cliente as PERMISSIVE for ALL to authenticated using ((rol_actual() IS NOT NULL)) with check ((rol_actual() IS NOT NULL));
create policy fp_borrar on public.formatos_producto as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy fp_crear on public.formatos_producto as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy fp_editar on public.formatos_producto as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy fp_leer on public.formatos_producto as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy leer on public.fotos_perfil as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy leer on public.golden_facturas as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.golden_lineas as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer_historial on public.historial as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy borrar on public.incidencias as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy crear on public.incidencias as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy gestionar on public.incidencias as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.incidencias as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy lineas_factura_leida_leer on public.lineas_factura_leida as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy escribir on public.lineas_habituales as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.lineas_habituales as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy escribir on public.lineas_pedido as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.lineas_pedido as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy lineas_crear on public.lineas_pedido as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy comercial_borrar on public.listas_precios as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_cambiar on public.listas_precios as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_insertar on public.listas_precios as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_leer on public.listas_precios as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_borrar on public.listas_precios_items as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_cambiar on public.listas_precios_items as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_insertar on public.listas_precios_items as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_leer on public.listas_precios_items as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy escribir on public.lotes as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.lotes as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy borrar on public.mensajes as PERMISSIVE for DELETE to authenticated using (((autor = auth.uid()) OR (rol_actual() = 'admin'::text)));
create policy escribir on public.mensajes as PERMISSIVE for INSERT to authenticated with check (((rol_actual() IS NOT NULL) AND (autor = auth.uid())));
create policy leer on public.mensajes as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy escribir on public.pedidos as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.pedidos as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy pedidos_crear on public.pedidos as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy escribir on public.pedidos_habituales as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.pedidos_habituales as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy admin_escribe on public.perfiles as PERMISSIVE for ALL to authenticated using ((rol_actual() = 'admin'::text)) with check ((rol_actual() = 'admin'::text));
create policy leer on public.perfiles as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy precios_compra_dia_leer on public.precios_compra_dia as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy comercial_borrar on public.presentaciones as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_cambiar on public.presentaciones as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_insertar on public.presentaciones as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_leer on public.presentaciones as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.productos as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy productos_crear on public.productos as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy productos_editar on public.productos as PERMISSIVE for UPDATE to authenticated using ((rol_actual() IS NOT NULL)) with check ((rol_actual() IS NOT NULL));
create policy comercial_borrar on public.prospectos as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_cambiar on public.prospectos as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_insertar on public.prospectos as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_leer on public.prospectos as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy escribir on public.proveedores as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy leer on public.proveedores as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy comercial_borrar on public.recomendaciones as PERMISSIVE for DELETE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_cambiar on public.recomendaciones as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_insertar on public.recomendaciones as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy comercial_leer on public.recomendaciones as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])));
create policy borrar on public.sobrante as PERMISSIVE for DELETE to authenticated using (((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])) OR (creado_por = auth.uid())));
create policy cambiar on public.sobrante as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['preparador'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['preparador'::text, 'oficina'::text, 'admin'::text])));
create policy crear on public.sobrante as PERMISSIVE for INSERT to authenticated with check ((rol_actual() = ANY (ARRAY['preparador'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.sobrante as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy tarifas_crear on public.tarifas as PERMISSIVE for INSERT to authenticated with check ((rol_actual() IS NOT NULL));
create policy tarifas_editar on public.tarifas as PERMISSIVE for UPDATE to authenticated using ((rol_actual() IS NOT NULL)) with check ((rol_actual() IS NOT NULL));
create policy tarifas_leer on public.tarifas as PERMISSIVE for SELECT to authenticated using ((rol_actual() IS NOT NULL));
create policy tarifas_quitar on public.tarifas as PERMISSIVE for DELETE to authenticated using ((rol_actual() IS NOT NULL));
create policy cambiar on public.tarifas_compra as PERMISSIVE for ALL to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))) with check ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy leer on public.tarifas_compra as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text])));
create policy whatsapp_descartar on public.whatsapp_mensajes as PERMISSIVE for UPDATE to authenticated using ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text]))) with check ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text])));
create policy whatsapp_ver on public.whatsapp_mensajes as PERMISSIVE for SELECT to authenticated using ((rol_actual() = ANY (ARRAY['admin'::text, 'oficina'::text])));
create policy ayudas_audio_subir on storage.objects as PERMISSIVE for INSERT to authenticated with check (((bucket_id = 'ayudas'::text) AND (rol_actual() IS NOT NULL)));
create policy ayudas_audio_ver on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'ayudas'::text) AND ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])) OR (owner = auth.uid()))));
create policy facturas_borrar on storage.objects as PERMISSIVE for DELETE to authenticated using (((bucket_id = 'facturas'::text) AND (rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))));
create policy facturas_leer on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'facturas'::text) AND (rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))));
create policy facturas_subir on storage.objects as PERMISSIVE for INSERT to authenticated with check (((bucket_id = 'facturas'::text) AND (rol_actual() = ANY (ARRAY['compras'::text, 'oficina'::text, 'admin'::text]))));
create policy po_borrar on storage.objects as PERMISSIVE for DELETE to authenticated using (((bucket_id = 'pedidos-originales'::text) AND ((rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text])) OR (owner = auth.uid()))));
create policy po_subir on storage.objects as PERMISSIVE for INSERT to authenticated with check (((bucket_id = 'pedidos-originales'::text) AND (rol_actual() IS NOT NULL)));
create policy po_ver on storage.objects as PERMISSIVE for SELECT to authenticated using (((bucket_id = 'pedidos-originales'::text) AND (rol_actual() = ANY (ARRAY['oficina'::text, 'admin'::text]))));
-- harvey: sin uso para authenticated
revoke all on table "public"."listas_precios" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."listas_precios" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."listas_precios" to authenticated;
revoke all on table "public"."listas_precios_items" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."listas_precios_items" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."listas_precios_items" to authenticated;
revoke all on table "public"."facturas_recibidas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."facturas_recibidas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."facturas_recibidas" to authenticated;
revoke all on table "public"."recomendaciones" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."recomendaciones" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."recomendaciones" to authenticated;
revoke all on table "public"."prospectos" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."prospectos" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."prospectos" to authenticated;
revoke all on table "public"."tarifas_compra" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."tarifas_compra" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."tarifas_compra" to authenticated;
revoke all on table "public"."facturas_clientes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."facturas_clientes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."facturas_clientes" to authenticated;
revoke all on table "public"."push_suscripciones" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."push_suscripciones" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."push_suscripciones" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."push_suscripciones" to anon;
revoke all on table "public"."golden_facturas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."golden_facturas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."golden_facturas" to authenticated;
revoke all on table "public"."golden_lineas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."golden_lineas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."golden_lineas" to authenticated;
revoke all on table "public"."albaran_enlaces" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaran_enlaces" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaran_enlaces" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaran_enlaces" to anon;
revoke all on table "public"."compra_ajustes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."compra_ajustes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."compra_ajustes" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."compra_ajustes" to anon;
revoke all on table "public"."albaran_portal" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaran_portal" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaran_portal" to authenticated;
revoke all on sequence "public"."albaran_f_seq" from anon, authenticated, service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."albaran_f_seq" to service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."albaran_f_seq" to authenticated;
revoke all on table "public"."lineas_factura_leida" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_factura_leida" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_factura_leida" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_factura_leida" to anon;
revoke all on table "public"."copia_config" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."copia_config" to service_role;
revoke all on table "public"."presentaciones" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."presentaciones" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."presentaciones" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."presentaciones" to anon;
revoke all on table "public"."alias_compra" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."alias_compra" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."alias_compra" to authenticated;
revoke all on table "public"."perfiles" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."perfiles" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."perfiles" to authenticated;
revoke all on table "public"."precios_compra_dia" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."precios_compra_dia" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."precios_compra_dia" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."precios_compra_dia" to anon;
revoke all on table "public"."v_lista_compra" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_lista_compra" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_lista_compra" to authenticated;
revoke all on table "public"."v_controles" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_controles" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_controles" to authenticated;
revoke all on sequence "public"."historial_id_seq" from anon, authenticated, service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."historial_id_seq" to service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."historial_id_seq" to authenticated;
revoke all on table "public"."entregas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."entregas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."entregas" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."entregas" to anon;
revoke all on table "public"."cliente_enlaces" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."cliente_enlaces" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."cliente_enlaces" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."cliente_enlaces" to anon;
revoke all on table "public"."albaranes_facturados" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaranes_facturados" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaranes_facturados" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaranes_facturados" to anon;
revoke all on table "public"."v_trazabilidad" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_trazabilidad" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_trazabilidad" to authenticated;
revoke all on table "public"."clientes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."clientes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."clientes" to authenticated;
revoke all on table "public"."proveedores" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."proveedores" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."proveedores" to authenticated;
revoke all on table "public"."compras" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."compras" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."compras" to authenticated;
revoke all on table "public"."historial" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."historial" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."historial" to authenticated;
revoke all on table "public"."tarifas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."tarifas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."tarifas" to authenticated;
revoke all on table "public"."albaranes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaranes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."albaranes" to authenticated;
revoke all on table "public"."mensajes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."mensajes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."mensajes" to authenticated;
revoke all on table "public"."asignaciones_lote" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."asignaciones_lote" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."asignaciones_lote" to authenticated;
revoke all on table "public"."fotos_perfil" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."fotos_perfil" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."fotos_perfil" to authenticated;
revoke all on table "public"."carga_lineas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."carga_lineas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."carga_lineas" to authenticated;
revoke all on table "public"."lineas_pedido" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_pedido" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_pedido" to authenticated;
revoke all on table "public"."fichajes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."fichajes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."fichajes" to authenticated;
revoke all on table "public"."avisos" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."avisos" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."avisos" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."avisos" to anon;
revoke all on table "public"."pedidos" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."pedidos" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."pedidos" to authenticated;
revoke all on table "public"."lotes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lotes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lotes" to authenticated;
revoke all on table "public"."documentos_compra" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."documentos_compra" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."documentos_compra" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."documentos_compra" to anon;
revoke all on table "public"."cobros" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."cobros" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."cobros" to authenticated;
revoke all on table "public"."v_pedidos_importe" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_pedidos_importe" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."v_pedidos_importe" to authenticated;
revoke all on table "public"."lineas_habituales" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_habituales" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_habituales" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."lineas_habituales" to anon;
revoke all on table "public"."abreviaturas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."abreviaturas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."abreviaturas" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."abreviaturas" to anon;
revoke all on table "public"."incidencias" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."incidencias" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."incidencias" to authenticated;
revoke all on table "public"."formatos_producto" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_producto" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_producto" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_producto" to anon;
revoke all on table "public"."portal_ajustes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."portal_ajustes" to service_role;
revoke all on table "public"."pedidos_habituales" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."pedidos_habituales" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."pedidos_habituales" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."pedidos_habituales" to anon;
revoke all on sequence "harvey"."registro_id_seq" from anon, authenticated, service_role;
revoke all on table "harvey"."notas" from anon, authenticated, service_role;
revoke all on table "harvey"."preferencias" from anon, authenticated, service_role;
revoke all on table "harvey"."contactos" from anon, authenticated, service_role;
revoke all on table "harvey"."borradores" from anon, authenticated, service_role;
revoke all on table "harvey"."registro" from anon, authenticated, service_role;
revoke all on table "harvey"."entregas" from anon, authenticated, service_role;
revoke all on sequence "harvey"."notas_id_seq" from anon, authenticated, service_role;
revoke all on sequence "harvey"."proveedor_preferido_id_seq" from anon, authenticated, service_role;
revoke all on table "harvey"."precios_fijos" from anon, authenticated, service_role;
revoke all on sequence "public"."contactos_portal_id_seq" from anon, authenticated, service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."contactos_portal_id_seq" to service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."contactos_portal_id_seq" to authenticated;
grant SELECT, UPDATE, USAGE on sequence "public"."contactos_portal_id_seq" to anon;
revoke all on table "harvey"."proveedor_preferido" from anon, authenticated, service_role;
revoke all on table "harvey"."listas_auto" from anon, authenticated, service_role;
revoke all on table "harvey"."listas_borrador" from anon, authenticated, service_role;
revoke all on table "public"."contactos_portal" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."contactos_portal" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."contactos_portal" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."contactos_portal" to anon;
revoke all on table "public"."envios_correo" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."envios_correo" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."envios_correo" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."envios_correo" to anon;
revoke all on sequence "public"."ayudas_id_seq" from anon, authenticated, service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."ayudas_id_seq" to service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."ayudas_id_seq" to authenticated;
grant SELECT, UPDATE, USAGE on sequence "public"."ayudas_id_seq" to anon;
revoke all on table "public"."ayudas" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."ayudas" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."ayudas" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."ayudas" to anon;
revoke all on table "public"."sobrante" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."sobrante" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."sobrante" to authenticated;
revoke all on table "public"."formatos_cliente" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_cliente" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_cliente" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."formatos_cliente" to anon;
revoke all on table "public"."productos" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."productos" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."productos" to authenticated;
revoke all on sequence "public"."whatsapp_mensajes_id_seq" from anon, authenticated, service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."whatsapp_mensajes_id_seq" to service_role;
grant SELECT, UPDATE, USAGE on sequence "public"."whatsapp_mensajes_id_seq" to authenticated;
grant SELECT, UPDATE, USAGE on sequence "public"."whatsapp_mensajes_id_seq" to anon;
revoke all on table "public"."whatsapp_mensajes" from anon, authenticated, service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."whatsapp_mensajes" to service_role;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."whatsapp_mensajes" to authenticated;
grant INSERT, SELECT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, MAINTAIN on table "public"."whatsapp_mensajes" to anon;
revoke all on function public.ordenar_reparto(p_pedidos uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.ordenar_reparto(p_pedidos uuid[]) to authenticated;
grant execute on function public.ordenar_reparto(p_pedidos uuid[]) to service_role;
revoke all on function public.borrar_pedido(p_pedido uuid, p_motivo text) from public, anon, authenticated, service_role;
grant execute on function public.borrar_pedido(p_pedido uuid, p_motivo text) to authenticated;
grant execute on function public.borrar_pedido(p_pedido uuid, p_motivo text) to service_role;
revoke all on function public.marcar_compra_despues(p_linea uuid) from public, anon, authenticated, service_role;
grant execute on function public.marcar_compra_despues(p_linea uuid) to authenticated;
grant execute on function public.marcar_compra_despues(p_linea uuid) to service_role;
revoke all on function public.copia_pagina(p_clave text, p_tabla text, p_desde integer, p_limite integer) from public, anon, authenticated, service_role;
grant execute on function public.copia_pagina(p_clave text, p_tabla text, p_desde integer, p_limite integer) to anon;
grant execute on function public.copia_pagina(p_clave text, p_tabla text, p_desde integer, p_limite integer) to authenticated;
grant execute on function public.copia_pagina(p_clave text, p_tabla text, p_desde integer, p_limite integer) to service_role;
revoke all on function public.antes_de_actualizar() from public, anon, authenticated, service_role;
grant execute on function public.antes_de_actualizar() to authenticated;
grant execute on function public.antes_de_actualizar() to service_role;
revoke all on function public.auditar() from public, anon, authenticated, service_role;
grant execute on function public.auditar() to authenticated;
grant execute on function public.auditar() to service_role;
revoke all on function public.rol_actual() from public, anon, authenticated, service_role;
grant execute on function public.rol_actual() to authenticated;
grant execute on function public.rol_actual() to service_role;
revoke all on function public.empezar_pedido(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public.empezar_pedido(p_pedido uuid) to authenticated;
grant execute on function public.empezar_pedido(p_pedido uuid) to service_role;
revoke all on function public.terminar_pedido(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public.terminar_pedido(p_pedido uuid) to authenticated;
grant execute on function public.terminar_pedido(p_pedido uuid) to service_role;
revoke all on function public.anular_albaran(p_albaran uuid, p_motivo text) from public, anon, authenticated, service_role;
grant execute on function public.anular_albaran(p_albaran uuid, p_motivo text) to authenticated;
grant execute on function public.anular_albaran(p_albaran uuid, p_motivo text) to service_role;
revoke all on function public.marcar_cargado(p_linea uuid, p_cargado boolean) from public, anon, authenticated, service_role;
grant execute on function public.marcar_cargado(p_linea uuid, p_cargado boolean) to authenticated;
grant execute on function public.marcar_cargado(p_linea uuid, p_cargado boolean) to service_role;
revoke all on function public.rellenar_iva_linea() from public, anon, authenticated, service_role;
grant execute on function public.rellenar_iva_linea() to public;
grant execute on function public.rellenar_iva_linea() to anon;
grant execute on function public.rellenar_iva_linea() to authenticated;
grant execute on function public.rellenar_iva_linea() to service_role;
revoke all on function public.guardar_foto(p_foto text) from public, anon, authenticated, service_role;
grant execute on function public.guardar_foto(p_foto text) to authenticated;
grant execute on function public.guardar_foto(p_foto text) to service_role;
revoke all on function public.fichar(p_accion text, p_cuando timestamp with time zone) from public, anon, authenticated, service_role;
grant execute on function public.fichar(p_accion text, p_cuando timestamp with time zone) to authenticated;
grant execute on function public.fichar(p_accion text, p_cuando timestamp with time zone) to service_role;
revoke all on function public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric) from public, anon, authenticated, service_role;
grant execute on function public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric) to public;
grant execute on function public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric) to anon;
grant execute on function public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric) to authenticated;
grant execute on function public.guardar_ubicacion(p_cliente uuid, p_lat numeric, p_lng numeric) to service_role;
revoke all on function public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone, p_nota text) from public, anon, authenticated, service_role;
grant execute on function public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone, p_nota text) to public;
grant execute on function public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone, p_nota text) to anon;
grant execute on function public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone, p_nota text) to authenticated;
grant execute on function public.marcar_entregado(p_pedido uuid, p_at timestamp with time zone, p_nota text) to service_role;
revoke all on function public.eliminar_pedido(p_id uuid) from public, anon, authenticated, service_role;
grant execute on function public.eliminar_pedido(p_id uuid) to authenticated;
grant execute on function public.eliminar_pedido(p_id uuid) to service_role;
revoke all on function public.cobrar(p_pedido uuid, p_importe numeric, p_forma text, p_nota text, p_clave text) from public, anon, authenticated, service_role;
grant execute on function public.cobrar(p_pedido uuid, p_importe numeric, p_forma text, p_nota text, p_clave text) to authenticated;
grant execute on function public.cobrar(p_pedido uuid, p_importe numeric, p_forma text, p_nota text, p_clave text) to service_role;
revoke all on function public.guardia_asignaciones() from public, anon, authenticated, service_role;
grant execute on function public.guardia_asignaciones() to public;
grant execute on function public.guardia_asignaciones() to anon;
grant execute on function public.guardia_asignaciones() to authenticated;
grant execute on function public.guardia_asignaciones() to service_role;
revoke all on function public.confirmar_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_sin_motivo text) from public, anon, authenticated, service_role;
grant execute on function public.confirmar_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_sin_motivo text) to authenticated;
grant execute on function public.confirmar_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_sin_motivo text) to service_role;
revoke all on function public.corregir_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_motivo text) from public, anon, authenticated, service_role;
grant execute on function public.corregir_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_motivo text) to authenticated;
grant execute on function public.corregir_trazabilidad(p_pedido uuid, p_asignaciones jsonb, p_motivo text) to service_role;
revoke all on function public.anotar_lote(p_linea uuid, p_lote uuid) from public, anon, authenticated, service_role;
grant execute on function public.anotar_lote(p_linea uuid, p_lote uuid) to authenticated;
grant execute on function public.anotar_lote(p_linea uuid, p_lote uuid) to service_role;
revoke all on function public.quien_dia(p_fecha date) from public, anon, authenticated, service_role;
grant execute on function public.quien_dia(p_fecha date) to authenticated;
grant execute on function public.quien_dia(p_fecha date) to service_role;
revoke all on function public.copia_ok(p_clave text) from public, anon, authenticated, service_role;
grant execute on function public.copia_ok(p_clave text) to service_role;
revoke all on function public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text) from public, anon, authenticated, service_role;
grant execute on function public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text) to authenticated;
grant execute on function public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text) to service_role;
revoke all on function public.copia_archivos(p_clave text, p_desde integer, p_limite integer) from public, anon, authenticated, service_role;
grant execute on function public.copia_archivos(p_clave text, p_desde integer, p_limite integer) to anon;
grant execute on function public.copia_archivos(p_clave text, p_desde integer, p_limite integer) to authenticated;
grant execute on function public.copia_archivos(p_clave text, p_desde integer, p_limite integer) to service_role;
revoke all on function public.copia_tablas(p_clave text) from public, anon, authenticated, service_role;
grant execute on function public.copia_tablas(p_clave text) to anon;
grant execute on function public.copia_tablas(p_clave text) to authenticated;
grant execute on function public.copia_tablas(p_clave text) to service_role;
revoke all on function public.poner_precios(p_pedido uuid, p_lineas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.poner_precios(p_pedido uuid, p_lineas jsonb) to authenticated;
grant execute on function public.poner_precios(p_pedido uuid, p_lineas jsonb) to service_role;
revoke all on function public.copia_conteo(p_clave text, p_tabla text) from public, anon, authenticated, service_role;
grant execute on function public.copia_conteo(p_clave text, p_tabla text) to anon;
grant execute on function public.copia_conteo(p_clave text, p_tabla text) to authenticated;
grant execute on function public.copia_conteo(p_clave text, p_tabla text) to service_role;
revoke all on function public.asignar_reparto(p_pedidos uuid[], p_repartidor uuid) from public, anon, authenticated, service_role;
grant execute on function public.asignar_reparto(p_pedidos uuid[], p_repartidor uuid) to authenticated;
grant execute on function public.asignar_reparto(p_pedidos uuid[], p_repartidor uuid) to service_role;
revoke all on function public.editar_pedido(p_pedido uuid, p_cliente uuid, p_fecha date, p_notas text, p_cambiar_notas boolean, p_lineas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.editar_pedido(p_pedido uuid, p_cliente uuid, p_fecha date, p_notas text, p_cambiar_notas boolean, p_lineas jsonb) to authenticated;
grant execute on function public.editar_pedido(p_pedido uuid, p_cliente uuid, p_fecha date, p_notas text, p_cambiar_notas boolean, p_lineas jsonb) to service_role;
revoke all on function public.anadir_linea_pedido(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text) from public, anon, authenticated, service_role;
grant execute on function public.anadir_linea_pedido(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text) to authenticated;
grant execute on function public.anadir_linea_pedido(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text) to service_role;
revoke all on function public.quitar_linea(p_linea uuid) from public, anon, authenticated, service_role;
grant execute on function public.quitar_linea(p_linea uuid) to authenticated;
grant execute on function public.quitar_linea(p_linea uuid) to service_role;
revoke all on function public.corregir_linea(p_linea uuid, p_cantidad numeric, p_peso numeric, p_unidad text) from public, anon, authenticated, service_role;
grant execute on function public.corregir_linea(p_linea uuid, p_cantidad numeric, p_peso numeric, p_unidad text) to authenticated;
grant execute on function public.corregir_linea(p_linea uuid, p_cantidad numeric, p_peso numeric, p_unidad text) to service_role;
revoke all on function public.poner_info_interna(p_pedido uuid, p_lineas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.poner_info_interna(p_pedido uuid, p_lineas jsonb) to authenticated;
grant execute on function public.poner_info_interna(p_pedido uuid, p_lineas jsonb) to service_role;
revoke all on function public.guardar_push(p_endpoint text, p_p256dh text, p_auth text, p_dispositivo text) from public, anon, authenticated, service_role;
grant execute on function public.guardar_push(p_endpoint text, p_p256dh text, p_auth text, p_dispositivo text) to authenticated;
grant execute on function public.guardar_push(p_endpoint text, p_p256dh text, p_auth text, p_dispositivo text) to service_role;
revoke all on function public.quitar_push(p_endpoint text) from public, anon, authenticated, service_role;
grant execute on function public.quitar_push(p_endpoint text) to authenticated;
grant execute on function public.quitar_push(p_endpoint text) to service_role;
revoke all on function public.guardar_ajuste_compra(p_fecha date, p_producto uuid, p_unidad text, p_cantidad numeric, p_nota text, p_extra boolean) from public, anon, authenticated, service_role;
grant execute on function public.guardar_ajuste_compra(p_fecha date, p_producto uuid, p_unidad text, p_cantidad numeric, p_nota text, p_extra boolean) to authenticated;
grant execute on function public.guardar_ajuste_compra(p_fecha date, p_producto uuid, p_unidad text, p_cantidad numeric, p_nota text, p_extra boolean) to service_role;
revoke all on function public.configurar_repartidor(p_perfil uuid, p_reparte boolean, p_color text) from public, anon, authenticated, service_role;
grant execute on function public.configurar_repartidor(p_perfil uuid, p_reparte boolean, p_color text) to authenticated;
grant execute on function public.configurar_repartidor(p_perfil uuid, p_reparte boolean, p_color text) to service_role;
revoke all on function public.guardar_firma_albaran(p_pedido uuid, p_firma text, p_nombre text) from public, anon, authenticated, service_role;
grant execute on function public.guardar_firma_albaran(p_pedido uuid, p_firma text, p_nombre text) to authenticated;
grant execute on function public.guardar_firma_albaran(p_pedido uuid, p_firma text, p_nombre text) to service_role;
revoke all on function public.marcar_albaranes_facturados(p_pedidos uuid[], p_numero text, p_fecha date) from public, anon, authenticated, service_role;
grant execute on function public.marcar_albaranes_facturados(p_pedidos uuid[], p_numero text, p_fecha date) to authenticated;
grant execute on function public.marcar_albaranes_facturados(p_pedidos uuid[], p_numero text, p_fecha date) to service_role;
revoke all on function public.desmarcar_albaranes_facturados(p_pedidos uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.desmarcar_albaranes_facturados(p_pedidos uuid[]) to authenticated;
grant execute on function public.desmarcar_albaranes_facturados(p_pedidos uuid[]) to service_role;
revoke all on function public.guardar_precio_compra_dia(p_fecha date, p_producto uuid, p_unidad text, p_precio numeric, p_nota text) from public, anon, authenticated, service_role;
grant execute on function public.guardar_precio_compra_dia(p_fecha date, p_producto uuid, p_unidad text, p_precio numeric, p_nota text) to authenticated;
grant execute on function public.guardar_precio_compra_dia(p_fecha date, p_producto uuid, p_unidad text, p_precio numeric, p_nota text) to service_role;
revoke all on function public.mi_caja(p_fecha date) from public, anon, authenticated, service_role;
grant execute on function public.mi_caja(p_fecha date) to authenticated;
grant execute on function public.mi_caja(p_fecha date) to service_role;
revoke all on function public.incidencias_de_pedido(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public.incidencias_de_pedido(p_pedido uuid) to authenticated;
grant execute on function public.incidencias_de_pedido(p_pedido uuid) to service_role;
revoke all on function public.foto_incidencia(p_id uuid) from public, anon, authenticated, service_role;
grant execute on function public.foto_incidencia(p_id uuid) to authenticated;
grant execute on function public.foto_incidencia(p_id uuid) to service_role;
revoke all on function public.guardar_lineas_factura(p_factura uuid, p_proveedor uuid, p_fecha date, p_lineas jsonb) from public, anon, authenticated, service_role;
grant execute on function public.guardar_lineas_factura(p_factura uuid, p_proveedor uuid, p_fecha date, p_lineas jsonb) to authenticated;
grant execute on function public.guardar_lineas_factura(p_factura uuid, p_proveedor uuid, p_fecha date, p_lineas jsonb) to service_role;
revoke all on function public.publicar_albaran_portal(p_pedido uuid, p_publicar boolean) from public, anon, authenticated, service_role;
grant execute on function public.publicar_albaran_portal(p_pedido uuid, p_publicar boolean) to authenticated;
grant execute on function public.publicar_albaran_portal(p_pedido uuid, p_publicar boolean) to service_role;
revoke all on function public._albaran_json_base(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public._albaran_json_base(p_pedido uuid) to service_role;
revoke all on function public.crear_enlace_albaran(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public.crear_enlace_albaran(p_pedido uuid) to authenticated;
grant execute on function public.crear_enlace_albaran(p_pedido uuid) to service_role;
revoke all on function public.registrar_envio_albaran(p_pedido uuid, p_destino text) from public, anon, authenticated, service_role;
grant execute on function public.registrar_envio_albaran(p_pedido uuid, p_destino text) to authenticated;
grant execute on function public.registrar_envio_albaran(p_pedido uuid, p_destino text) to service_role;
revoke all on function public.crear_enlace_cliente(p_cliente uuid, p_nuevo boolean) from public, anon, authenticated, service_role;
grant execute on function public.crear_enlace_cliente(p_cliente uuid, p_nuevo boolean) to authenticated;
grant execute on function public.crear_enlace_cliente(p_cliente uuid, p_nuevo boolean) to service_role;
revoke all on function public.albaran_publico(p_token text) from public, anon, authenticated, service_role;
grant execute on function public.albaran_publico(p_token text) to public;
grant execute on function public.albaran_publico(p_token text) to anon;
grant execute on function public.albaran_publico(p_token text) to authenticated;
grant execute on function public.albaran_publico(p_token text) to service_role;
revoke all on function public.portal_meses(p_meses integer) from public, anon, authenticated, service_role;
grant execute on function public.portal_meses(p_meses integer) to authenticated;
grant execute on function public.portal_meses(p_meses integer) to service_role;
revoke all on function public.poner_descuento(p_pedido uuid, p_base numeric, p_motivo text, p_iva numeric) from public, anon, authenticated, service_role;
grant execute on function public.poner_descuento(p_pedido uuid, p_base numeric, p_motivo text, p_iva numeric) to authenticated;
grant execute on function public.poner_descuento(p_pedido uuid, p_base numeric, p_motivo text, p_iva numeric) to service_role;
revoke all on function public._albaran_json(p_pedido uuid) from public, anon, authenticated, service_role;
grant execute on function public._albaran_json(p_pedido uuid) to service_role;
revoke all on function public._portal_limite() from public, anon, authenticated, service_role;
grant execute on function public._portal_limite() to service_role;
revoke all on function public.portal_cliente(p_token text, p_desde date, p_hasta date) from public, anon, authenticated, service_role;
grant execute on function public.portal_cliente(p_token text, p_desde date, p_hasta date) to public;
grant execute on function public.portal_cliente(p_token text, p_desde date, p_hasta date) to anon;
grant execute on function public.portal_cliente(p_token text, p_desde date, p_hasta date) to authenticated;
grant execute on function public.portal_cliente(p_token text, p_desde date, p_hasta date) to service_role;
revoke all on function public.portal_albaran(p_token text, p_numero integer) from public, anon, authenticated, service_role;
grant execute on function public.portal_albaran(p_token text, p_numero integer) to public;
grant execute on function public.portal_albaran(p_token text, p_numero integer) to anon;
grant execute on function public.portal_albaran(p_token text, p_numero integer) to authenticated;
grant execute on function public.portal_albaran(p_token text, p_numero integer) to service_role;
revoke all on function public.generar_previstos(p_dias integer) from public, anon, authenticated, service_role;
grant execute on function public.generar_previstos(p_dias integer) to authenticated;
grant execute on function public.generar_previstos(p_dias integer) to service_role;
revoke all on function public.confirmar_previsto(p_pedido uuid, p_hacer boolean) from public, anon, authenticated, service_role;
grant execute on function public.confirmar_previsto(p_pedido uuid, p_hacer boolean) to authenticated;
grant execute on function public.confirmar_previsto(p_pedido uuid, p_hacer boolean) to service_role;
revoke all on function public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text) from public, anon, authenticated, service_role;
grant execute on function public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text) to anon;
grant execute on function public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text) to authenticated;
grant execute on function public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text) to service_role;
revoke all on function harvey.proponer_listas_auto() from public, anon, authenticated, service_role;
revoke all on function harvey.venta_reciente(p uuid) from public, anon, authenticated, service_role;
revoke all on function harvey.coste_compra(p uuid) from public, anon, authenticated, service_role;
revoke all on function public.coste_en_fecha(p_producto uuid, p_fecha date) from public, anon, authenticated, service_role;
grant execute on function public.coste_en_fecha(p_producto uuid, p_fecha date) to service_role;
revoke all on function harvey.proponer_lista(p_lista uuid, p_margen numeric, p_auto boolean) from public, anon, authenticated, service_role;
revoke all on function public.costes_en_fechas(p jsonb) from public, anon, authenticated, service_role;
grant execute on function public.costes_en_fechas(p jsonb) to authenticated;
grant execute on function public.costes_en_fechas(p jsonb) to service_role;
revoke all on function public.portal_contacto_estado(p_token text) from public, anon, authenticated, service_role;
grant execute on function public.portal_contacto_estado(p_token text) to anon;
grant execute on function public.portal_contacto_estado(p_token text) to authenticated;
grant execute on function public.portal_contacto_estado(p_token text) to service_role;
revoke all on function public.moviles_para_albaran(p_pedidos uuid[]) from public, anon, authenticated, service_role;
grant execute on function public.moviles_para_albaran(p_pedidos uuid[]) to anon;
grant execute on function public.moviles_para_albaran(p_pedidos uuid[]) to authenticated;
grant execute on function public.moviles_para_albaran(p_pedidos uuid[]) to service_role;
revoke all on function public.apuntar_movil_cliente(p_pedido uuid, p_movil text) from public, anon, authenticated, service_role;
grant execute on function public.apuntar_movil_cliente(p_pedido uuid, p_movil text) to anon;
grant execute on function public.apuntar_movil_cliente(p_pedido uuid, p_movil text) to authenticated;
grant execute on function public.apuntar_movil_cliente(p_pedido uuid, p_movil text) to service_role;
revoke all on function public.memoria_golden(p_cliente uuid) from public, anon, authenticated, service_role;
grant execute on function public.memoria_golden(p_cliente uuid) to authenticated;
grant execute on function public.memoria_golden(p_cliente uuid) to service_role;
revoke all on function public.web_solicitud_prospecto(p_nombre text, p_tipo text, p_localidad text, p_telefono text, p_email text, p_mensaje text, p_trampa text, p_prueba boolean) from public, anon, authenticated, service_role;
grant execute on function public.web_solicitud_prospecto(p_nombre text, p_tipo text, p_localidad text, p_telefono text, p_email text, p_mensaje text, p_trampa text, p_prueba boolean) to anon;
grant execute on function public.web_solicitud_prospecto(p_nombre text, p_tipo text, p_localidad text, p_telefono text, p_email text, p_mensaje text, p_trampa text, p_prueba boolean) to authenticated;
grant execute on function public.web_solicitud_prospecto(p_nombre text, p_tipo text, p_localidad text, p_telefono text, p_email text, p_mensaje text, p_trampa text, p_prueba boolean) to service_role;
revoke all on function public.guardar_peso(p_linea uuid, p_peso numeric, p_version integer, p_lote uuid) from public, anon, authenticated, service_role;
grant execute on function public.guardar_peso(p_linea uuid, p_peso numeric, p_version integer, p_lote uuid) to authenticated;
grant execute on function public.guardar_peso(p_linea uuid, p_peso numeric, p_version integer, p_lote uuid) to service_role;
revoke all on function public.validar_trazabilidad(p_pedido uuid, p_asig jsonb) from public, anon, authenticated, service_role;
grant execute on function public.validar_trazabilidad(p_pedido uuid, p_asig jsonb) to service_role;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('facturas', 'facturas', false, null, null) on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('pedidos-originales', 'pedidos-originales', false, null, null) on conflict (id) do nothing;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('ayudas', 'ayudas', false, 5242880, '{audio/webm,audio/mp4,audio/ogg,audio/mpeg,audio/aac,audio/x-m4a}'::text[]) on conflict (id) do nothing;
select cron.schedule('ferjusanz-previstos', '15 4 * * *', 'select public.generar_previstos(14)');
select cron.schedule('harvey_tarifas_diarias', '15 6 * * *', 'select harvey.proponer_listas_auto()');
