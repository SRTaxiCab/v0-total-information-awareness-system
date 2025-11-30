-- Triggers for automatic profile creation and timestamp updates

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'researcher')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger for auto-creating profile on user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at triggers to all relevant tables
drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.projects;
create trigger set_updated_at
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.documents;
create trigger set_updated_at
  before update on public.documents
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.timeline_events;
create trigger set_updated_at
  before update on public.timeline_events
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.connections;
create trigger set_updated_at
  before update on public.connections
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.entities;
create trigger set_updated_at
  before update on public.entities
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.saved_queries;
create trigger set_updated_at
  before update on public.saved_queries
  for each row
  execute function public.handle_updated_at();

drop trigger if exists set_updated_at on public.analysis_sessions;
create trigger set_updated_at
  before update on public.analysis_sessions
  for each row
  execute function public.handle_updated_at();
