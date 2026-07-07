-- Livre d'or : code invité à 5 chiffres, tables guestbook, RPC publiques, bucket photos.
-- Appliquée sur le projet Supabase le 2026-07-07 (copie de référence).

-- ——— Code invité à 5 chiffres ———
alter table public.guests add column if not exists code text;

create or replace function public.generate_guest_code()
returns text
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  v_code text;
begin
  loop
    v_code := lpad(floor(random() * 100000)::int::text, 5, '0');
    exit when not exists (select 1 from public.guests where code = v_code);
  end loop;
  return v_code;
end;
$$;

create or replace function public.set_guest_code()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.code is null then
    new.code := public.generate_guest_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_guest_code on public.guests;
create trigger trg_set_guest_code
  before insert on public.guests
  for each row execute function public.set_guest_code();

-- Backfill des invités existants, un par un pour garantir l'unicité
do $$
declare g record;
begin
  for g in select id from public.guests where code is null loop
    update public.guests set code = public.generate_guest_code() where id = g.id;
  end loop;
end;
$$;

alter table public.guests alter column code set not null;
alter table public.guests add constraint guests_code_key unique (code);

-- ——— Tables du livre d'or ———
create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  message text,
  created_at timestamptz not null default now()
);

create table public.guestbook_photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.guestbook_entries(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  path text not null,
  size_bytes bigint not null,
  created_at timestamptz not null default now()
);

alter table public.guestbook_entries enable row level security;
alter table public.guestbook_photos enable row level security;

-- Admin (authenticated) : accès complet ; anon : aucun accès direct (RPC + service role uniquement)
create policy admin_all_guestbook_entries on public.guestbook_entries
  for all to authenticated using (true) with check (true);
create policy admin_all_guestbook_photos on public.guestbook_photos
  for all to authenticated using (true) with check (true);

-- ——— Lecture publique du mur (même pattern que get_billet) ———
create or replace function public.get_guestbook()
returns table(id uuid, nom_complet text, message text, created_at timestamptz, photos text[])
language sql
stable
security definer
set search_path to 'public'
as $$
  select e.id, g.nom_complet, e.message, e.created_at,
    coalesce(array_agg(p.path order by p.created_at) filter (where p.id is not null), '{}') as photos
  from public.guestbook_entries e
  join public.guests g on g.id = e.guest_id
  left join public.guestbook_photos p on p.entry_id = e.id
  group by e.id, g.nom_complet, e.message, e.created_at
  order by e.created_at desc;
$$;

-- ——— get_billet : ajout du code invité (type de retour modifié => drop + recreate) ———
drop function if exists public.get_billet(text);
create function public.get_billet(p_token text)
returns table(
  nom_complet text, titre text, nom_marie text, nom_mariee text,
  date_debut timestamptz, date_fin timestamptz, lieu text, description text,
  video_url text, code text
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select g.nom_complet, e.titre, e.nom_marie, e.nom_mariee, e.date_debut, e.date_fin,
         e.lieu, e.description, e.video_url, g.code
  from public.guests g
  join public.event e on e.id = g.event_id
  where g.token = p_token
  limit 1;
$$;

-- ——— Occupation du storage (blocage des médias à saturation) ———
create or replace function public.get_storage_usage()
returns bigint
language sql
stable
security definer
set search_path to 'storage', 'public'
as $$
  select coalesce(sum((metadata->>'size')::bigint), 0) from storage.objects;
$$;

-- Réservée au serveur (service role) et à l'admin : pas d'accès anonyme direct.
revoke all on function public.get_storage_usage() from public, anon;
grant execute on function public.get_storage_usage() to authenticated, service_role;

-- ——— Bucket photos du livre d'or ———
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guestbook', 'guestbook', true, 3145728,
  array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif']
)
on conflict (id) do nothing;

-- Lecture/suppression pour l'admin ; uploads uniquement via service role (pas de policy insert anon)
create policy "authenticated select guestbook" on storage.objects
  for select to authenticated using (bucket_id = 'guestbook');
create policy "authenticated delete guestbook" on storage.objects
  for delete to authenticated using (bucket_id = 'guestbook');
