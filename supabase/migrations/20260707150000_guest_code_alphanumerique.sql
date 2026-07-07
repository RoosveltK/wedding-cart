-- Code invité : 5 caractères alphanumériques (lettres + chiffres), sans caractères
-- ambigus (0/O, 1/I/L), avec au moins une lettre ET un chiffre.
-- Appliquée sur le projet Supabase le 2026-07-07 (copie de référence).
create or replace function public.generate_guest_code()
returns text
language plpgsql
volatile
security definer
set search_path to 'public'
as $$
declare
  chars constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  v_code text;
begin
  loop
    select string_agg(substr(chars, 1 + floor(random() * length(chars))::int, 1), '')
      into v_code
      from generate_series(1, 5);
    exit when v_code ~ '[0-9]'
      and v_code ~ '[A-Z]'
      and not exists (select 1 from public.guests where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- Les codes existants (numériques) sont régénérés au nouveau format.
do $$
declare g record;
begin
  for g in select id from public.guests loop
    update public.guests set code = public.generate_guest_code() where id = g.id;
  end loop;
end;
$$;
