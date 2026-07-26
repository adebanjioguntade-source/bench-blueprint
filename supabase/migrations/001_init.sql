-- Enable required extensions
create extension if not exists citext;

-- Profiles table: linked 1:1 with auth.users
create table public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now(),
  last_worked_at timestamptz,
  entry_section text,                     -- "I am picking up at section" (workbook p.3)
  tier          text not null default 'free'  -- 'free' | 'full'
);

-- Section entries table: stores JSONB form fields for each section
create table public.section_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  section_id  text not null,              -- '00','01','02','03','05','10','15'
  data        jsonb not null default '{}'::jsonb,
  status      text not null default 'not_started', -- not_started|in_progress|complete
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  unique (user_id, section_id)
);

-- User outputs table: promoted values for quick lookup / carry-forward
create table public.user_outputs (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  diagnostic_total   int,        -- 12..60
  diagnostic_zone    text,       -- 'reactive'|'repositioning'|'momentum'
  priority_areas     text[],     -- 3
  bench_thesis       text,
  reset_sentence     text,
  north_star         text,
  top_3_areas        text[],     -- 3
  positioning_final  text,
  first_action       text,       -- b_tomorrow
  letter_written_at  date,
  updated_at         timestamptz not null default now()
);

-- Diagnostic leads table: tracks scores pre-signup
create table public.diagnostic_leads (
  id             uuid primary key default gen_random_uuid(),
  email          citext not null,
  total          int not null,
  zone           text not null,
  priority_areas text[],
  claimed_by     uuid references public.profiles(id),   -- set on later signup
  created_at     timestamptz not null default now()
);

-- Unique index to prevent duplicate unclaimed leads for the same email
create unique index diagnostic_leads_email_unclaimed_idx 
  on public.diagnostic_leads (email) 
  where claimed_by is null;

-- Enable Row-Level Security (RLS)
alter table public.profiles         enable row level security;
alter table public.section_entries  enable row level security;
alter table public.user_outputs     enable row level security;
alter table public.diagnostic_leads enable row level security;

-- Define RLS Policies
create policy own_profile on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy own_sections on public.section_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy own_outputs on public.user_outputs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- diagnostic_leads: Only service-role/admin access. No client select/insert/update allowed.

-- Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
declare
  lead_record record;
  diagnostic_data jsonb;
begin
  -- Insert into profiles
  insert into public.profiles (id, display_name, tier)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 
    'full' -- Defaulting to 'full' in v1 per spec
  );

  -- Check if a diagnostic lead exists for this email
  select * into lead_record 
  from public.diagnostic_leads 
  where email = new.email and claimed_by is null 
  limit 1;

  if found then
    -- Construct Section 00 JSONB data
    diagnostic_data := jsonb_build_object(
      'd_total', lead_record.total,
      'd_zone', lead_record.zone,
      'd_priorities', to_jsonb(lead_record.priority_areas)
    );

    -- Insert Section 00 entry
    insert into public.section_entries (user_id, section_id, data, status, completed_at)
    values (new.id, '00', diagnostic_data, 'complete', now());

    -- Insert user_outputs with migrated diagnostic data
    insert into public.user_outputs (user_id, diagnostic_total, diagnostic_zone, priority_areas)
    values (new.id, lead_record.total, lead_record.zone, lead_record.priority_areas);

    -- Mark diagnostic lead as claimed
    update public.diagnostic_leads 
    set claimed_by = new.id 
    where id = lead_record.id;
  else
    -- Default blank outputs row
    insert into public.user_outputs (user_id)
    values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- This keeps diagnostic lead email list secure from client leakage.

-- Table to log AI positioning helper invocations for daily rate limits
create table public.ai_request_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  requested_at timestamptz not null default now()
);

-- Enable RLS (Service role only access, no client select/insert/delete)
alter table public.ai_request_logs enable row level security;

