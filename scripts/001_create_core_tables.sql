-- Core tables for the Total Information Awareness Research Platform
-- This schema supports research documents, timelines, connections, AI interactions, and analysis

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- For fuzzy text search
create extension if not exists "btree_gin"; -- For advanced indexing

-- User profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  organization text,
  role text, -- journalist, researcher, osint_specialist, archivist, historian, intelligence
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Research projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  status text default 'active', -- active, archived, completed
  color text default '#3b82f6',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents/Content table (central repository for all information)
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  content text,
  content_type text not null, -- text, pdf, image, video, audio, url, email, tweet, article
  source_url text,
  source_type text, -- web, upload, email, api, manual
  file_path text, -- For uploaded files
  metadata jsonb default '{}', -- Flexible metadata storage
  tags text[] default array[]::text[],
  status text default 'active', -- active, archived, deleted
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  indexed_at timestamptz -- For tracking search indexing
);

-- Create full-text search index on documents
create index if not exists documents_content_search_idx on public.documents using gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));
create index if not exists documents_tags_idx on public.documents using gin(tags);
create index if not exists documents_metadata_idx on public.documents using gin(metadata);

-- Timeline events table
create table if not exists public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  event_date timestamptz not null,
  end_date timestamptz, -- For events spanning time periods
  event_type text, -- incident, meeting, publication, discovery, deadline
  location text,
  coordinates jsonb, -- {lat, lng} for mapping
  metadata jsonb default '{}',
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists timeline_events_date_idx on public.timeline_events(event_date);
create index if not exists timeline_events_project_idx on public.timeline_events(project_id);

-- Connections table (links between documents, events, entities)
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  source_id uuid not null, -- Can reference documents or timeline_events
  source_type text not null, -- document, timeline_event, entity
  target_id uuid not null,
  target_type text not null,
  connection_type text not null, -- related_to, caused_by, references, contradicts, supports
  strength real default 1.0, -- Connection strength 0-1
  description text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists connections_source_idx on public.connections(source_id, source_type);
create index if not exists connections_target_idx on public.connections(target_id, target_type);
create index if not exists connections_project_idx on public.connections(project_id);

-- Entities table (people, organizations, locations extracted from research)
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  entity_type text not null, -- person, organization, location, event, concept
  description text,
  aliases text[] default array[]::text[], -- Alternative names
  metadata jsonb default '{}', -- Flexible storage for entity properties
  tags text[] default array[]::text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists entities_name_idx on public.entities using gin(name gin_trgm_ops);
create index if not exists entities_type_idx on public.entities(entity_type);
create index if not exists entities_project_idx on public.entities(project_id);

-- AI interactions table (tracks AI assistant conversations and analysis)
create table if not exists public.ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  interaction_type text not null, -- query, analysis, summary, extraction, suggestion
  input_data jsonb not null,
  output_data jsonb not null,
  model_used text,
  tokens_used integer,
  related_documents uuid[] default array[]::uuid[],
  created_at timestamptz default now()
);

create index if not exists ai_interactions_user_idx on public.ai_interactions(user_id);
create index if not exists ai_interactions_project_idx on public.ai_interactions(project_id);
create index if not exists ai_interactions_type_idx on public.ai_interactions(interaction_type);

-- Saved searches/queries table
create table if not exists public.saved_queries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  query_data jsonb not null, -- Stores search parameters
  description text,
  alert_enabled boolean default false, -- For monitoring new content
  last_run_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Analysis sessions table (tracks research sessions and insights)
create table if not exists public.analysis_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  insights text,
  related_documents uuid[] default array[]::uuid[],
  related_events uuid[] default array[]::uuid[],
  metadata jsonb default '{}',
  status text default 'in_progress', -- in_progress, completed, archived
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.documents enable row level security;
alter table public.timeline_events enable row level security;
alter table public.connections enable row level security;
alter table public.entities enable row level security;
alter table public.ai_interactions enable row level security;
alter table public.saved_queries enable row level security;
alter table public.analysis_sessions enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- RLS Policies for projects
create policy "Users can view their own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- RLS Policies for documents
create policy "Users can view their own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert their own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete their own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- RLS Policies for timeline_events
create policy "Users can view their own timeline events"
  on public.timeline_events for select
  using (auth.uid() = user_id);

create policy "Users can insert their own timeline events"
  on public.timeline_events for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own timeline events"
  on public.timeline_events for update
  using (auth.uid() = user_id);

create policy "Users can delete their own timeline events"
  on public.timeline_events for delete
  using (auth.uid() = user_id);

-- RLS Policies for connections
create policy "Users can view their own connections"
  on public.connections for select
  using (auth.uid() = user_id);

create policy "Users can insert their own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own connections"
  on public.connections for update
  using (auth.uid() = user_id);

create policy "Users can delete their own connections"
  on public.connections for delete
  using (auth.uid() = user_id);

-- RLS Policies for entities
create policy "Users can view their own entities"
  on public.entities for select
  using (auth.uid() = user_id);

create policy "Users can insert their own entities"
  on public.entities for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own entities"
  on public.entities for update
  using (auth.uid() = user_id);

create policy "Users can delete their own entities"
  on public.entities for delete
  using (auth.uid() = user_id);

-- RLS Policies for ai_interactions
create policy "Users can view their own AI interactions"
  on public.ai_interactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own AI interactions"
  on public.ai_interactions for insert
  with check (auth.uid() = user_id);

-- RLS Policies for saved_queries
create policy "Users can view their own saved queries"
  on public.saved_queries for select
  using (auth.uid() = user_id);

create policy "Users can insert their own saved queries"
  on public.saved_queries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own saved queries"
  on public.saved_queries for update
  using (auth.uid() = user_id);

create policy "Users can delete their own saved queries"
  on public.saved_queries for delete
  using (auth.uid() = user_id);

-- RLS Policies for analysis_sessions
create policy "Users can view their own analysis sessions"
  on public.analysis_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own analysis sessions"
  on public.analysis_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own analysis sessions"
  on public.analysis_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own analysis sessions"
  on public.analysis_sessions for delete
  using (auth.uid() = user_id);
