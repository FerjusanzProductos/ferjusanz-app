-- Audios de las peticiones de ayuda (🆘): carpeta privada. Sube cualquiera del equipo; escuchan oficina y dirección (y quien lo grabó).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('ayudas', 'ayudas', false, 5242880, array['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/mpeg', 'audio/aac', 'audio/x-m4a'])
on conflict (id) do nothing;
create policy ayudas_audio_subir on storage.objects for insert to authenticated with check (bucket_id = 'ayudas' and public.rol_actual() is not null);
create policy ayudas_audio_ver on storage.objects for select to authenticated using (bucket_id = 'ayudas' and (public.rol_actual() = any (array['oficina', 'admin']) or owner = auth.uid()));
alter table public.ayudas add column if not exists audio text;
alter table public.ayudas add column if not exists ia jsonb;
