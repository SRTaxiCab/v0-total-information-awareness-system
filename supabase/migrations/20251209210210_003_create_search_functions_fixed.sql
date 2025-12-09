-- Advanced search functions for the research platform

-- Full-text search function for documents
create or replace function public.search_documents(
  search_query text,
  user_uuid uuid,
  project_uuid uuid default null,
  content_types text[] default null,
  tags_filter text[] default null,
  limit_count int default 50
)
returns table (
  id uuid,
  title text,
  content text,
  content_type text,
  source_url text,
  tags text[],
  created_at timestamptz,
  rank real
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    d.id,
    d.title,
    d.content,
    d.content_type,
    d.source_url,
    d.tags,
    d.created_at,
    ts_rank(
      to_tsvector('english', coalesce(d.title, '') || ' ' || coalesce(d.content, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  from public.documents d
  where 
    d.user_id = user_uuid
    and d.status = 'active'
    and (project_uuid is null or d.project_id = project_uuid)
    and (content_types is null or d.content_type = any(content_types))
    and (tags_filter is null or d.tags && tags_filter)
    and (
      to_tsvector('english', coalesce(d.title, '') || ' ' || coalesce(d.content, '')) 
      @@ plainto_tsquery('english', search_query)
    )
  order by rank desc, d.created_at desc
  limit limit_count;
end;
$$;

-- Function to find connections between entities
create or replace function public.find_entity_connections(
  entity_uuid uuid,
  user_uuid uuid,
  max_depth int default 2
)
returns table (
  entity_id uuid,
  entity_name text,
  entity_type text,
  connection_path text[],
  depth int
)
language plpgsql
security definer
as $$
begin
  return query
  with recursive connection_graph as (
    -- Base case: direct connections
    select 
      e.id as entity_id,
      e.name as entity_name,
      e.entity_type,
      array[e.name] as connection_path,
      1 as depth
    from public.entities e
    join public.connections c on (
      (c.source_id = entity_uuid and c.target_id = e.id and c.target_type = 'entity')
      or (c.target_id = entity_uuid and c.source_id = e.id and c.source_type = 'entity')
    )
    where e.user_id = user_uuid and e.id != entity_uuid
    
    union
    
    -- Recursive case: indirect connections
    select 
      e.id,
      e.name,
      e.entity_type,
      cg.connection_path || e.name,
      cg.depth + 1
    from connection_graph cg
    join public.connections c on (
      (c.source_id = cg.entity_id and c.target_type = 'entity')
      or (c.target_id = cg.entity_id and c.source_type = 'entity')
    )
    join public.entities e on (
      e.id = case 
        when c.source_id = cg.entity_id then c.target_id
        else c.source_id
      end
    )
    where 
      e.user_id = user_uuid 
      and cg.depth < max_depth
      and e.id != any(select unnest(
        (select array_agg(id) from unnest(cg.connection_path) as path_item
         join public.entities on name = path_item)
      ))
  )
  select distinct entity_id, entity_name, entity_type, connection_path, depth
  from connection_graph
  order by depth, entity_name;
end;
$$;

-- Function to get timeline events within a date range
create or replace function public.get_timeline_range(
  user_uuid uuid,
  project_uuid uuid default null,
  start_date timestamptz default null,
  filter_end_date timestamptz default null,
  event_types text[] default null
)
returns table (
  id uuid,
  title text,
  description text,
  event_date timestamptz,
  end_date timestamptz,
  event_type text,
  location text,
  tags text[]
)
language plpgsql
security definer
as $$
begin
  return query
  select 
    te.id,
    te.title,
    te.description,
    te.event_date,
    te.end_date,
    te.event_type,
    te.location,
    te.tags
  from public.timeline_events te
  where 
    te.user_id = user_uuid
    and (project_uuid is null or te.project_id = project_uuid)
    and (start_date is null or te.event_date >= start_date)
    and (filter_end_date is null or te.event_date <= filter_end_date)
    and (event_types is null or te.event_type = any(event_types))
  order by te.event_date asc;
end;
$$;