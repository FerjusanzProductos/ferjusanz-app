-- 📣 Planes solo para Fernando dentro de «Resumen del día y correo» (15/11/2026).
-- Claude escribe aquí el plan de Google y redes y la lista para Jorge, y los va actualizando.
-- La app solo lo lee, y SOLO el correo de Fernando (y su usuario de pruebas). Nadie más lo ve ni lo puede cambiar.
create table if not exists public.plan_fernando (
  clave       text primary key,          -- 'marketing', 'jorge'…
  titulo      text not null,
  texto       text not null,
  enlace      text,                      -- página fijada en Claude con el detalle
  actualizado timestamptz not null default now()
);
alter table public.plan_fernando enable row level security;
revoke all on public.plan_fernando from anon, authenticated;
grant select on public.plan_fernando to authenticated;
drop policy if exists solo_fernando on public.plan_fernando;
create policy solo_fernando on public.plan_fernando for select to authenticated
  using (lower(auth.jwt() ->> 'email') in ('fernandosanzalba@gmail.com', 'fernando@pruebas.invalid'));
