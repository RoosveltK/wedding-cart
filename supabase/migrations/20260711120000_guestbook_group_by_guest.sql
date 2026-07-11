-- Livre d'or : regroupe les messages et photos par invité pour le mur public
-- (au lieu d'une carte par dépôt), afin de retrouver facilement "ses" médias à supprimer.

drop function if exists public.get_guestbook();
create function public.get_guestbook()
returns table(
  guest_id uuid,
  nom_complet text,
  entries jsonb,
  photos jsonb,
  last_activity timestamptz
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    g.id,
    g.nom_complet,
    coalesce(
      jsonb_agg(jsonb_build_object('id', e.id, 'message', e.message, 'created_at', e.created_at)
                order by e.created_at)
        filter (where e.message is not null),
      '[]'::jsonb
    ) as entries,
    coalesce(
      (select jsonb_agg(jsonb_build_object('id', p.id, 'path', p.path) order by p.created_at)
       from public.guestbook_photos p
       join public.guestbook_entries pe on pe.id = p.entry_id
       where pe.guest_id = g.id),
      '[]'::jsonb
    ) as photos,
    max(e.created_at) as last_activity
  from public.guestbook_entries e
  join public.guests g on g.id = e.guest_id
  group by g.id, g.nom_complet
  order by max(e.created_at) desc;
$$;
