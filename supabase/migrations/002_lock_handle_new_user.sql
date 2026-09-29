-- Lock down handle_new_user for databases that already applied 001_init.sql.
-- Recreate with a fixed search_path so SECURITY DEFINER cannot be hijacked
-- via a malicious object on a writable search_path.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  lead_record record;
  diagnostic_data jsonb;
begin
  insert into public.profiles (id, display_name, tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    'full'
  );

  select * into lead_record
  from public.diagnostic_leads
  where email = new.email and claimed_by is null
  limit 1;

  if found then
    diagnostic_data := jsonb_build_object(
      'd_total', lead_record.total,
      'd_zone', lead_record.zone,
      'd_priorities', to_jsonb(lead_record.priority_areas)
    );

    insert into public.section_entries (user_id, section_id, data, status, completed_at)
    values (new.id, '00', diagnostic_data, 'complete', now());

    insert into public.user_outputs (user_id, diagnostic_total, diagnostic_zone, priority_areas)
    values (new.id, lead_record.total, lead_record.zone, lead_record.priority_areas);

    update public.diagnostic_leads
    set claimed_by = new.id
    where id = lead_record.id;
  else
    insert into public.user_outputs (user_id)
    values (new.id);
  end if;

  return new;
end;
$$;
