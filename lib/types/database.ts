// TypeScript types for database tables

export interface Profile {
  id: string
  display_name: string | null
  organization: string | null
  role: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: "active" | "archived" | "completed"
  color: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  project_id: string | null
  title: string
  content: string | null
  content_type: string
  source_url: string | null
  source_type: string | null
  file_path: string | null
  metadata: Record<string, any>
  tags: string[]
  status: "active" | "archived" | "deleted"
  created_at: string
  updated_at: string
  indexed_at: string | null
}

export interface TimelineEvent {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  event_date: string
  end_date: string | null
  event_type: string | null
  location: string | null
  coordinates: { lat: number; lng: number } | null
  metadata: Record<string, any>
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  user_id: string
  project_id: string | null
  source_id: string
  source_type: "document" | "timeline_event" | "entity"
  target_id: string
  target_type: "document" | "timeline_event" | "entity"
  connection_type: string
  strength: number
  description: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  user_id: string
  project_id: string | null
  name: string
  entity_type: "person" | "organization" | "location" | "event" | "concept"
  description: string | null
  aliases: string[]
  metadata: Record<string, any>
  tags: string[]
  created_at: string
  updated_at: string
}

export interface AIInteraction {
  id: string
  user_id: string
  project_id: string | null
  interaction_type: "query" | "analysis" | "summary" | "extraction" | "suggestion"
  input_data: Record<string, any>
  output_data: Record<string, any>
  model_used: string | null
  tokens_used: number | null
  related_documents: string[]
  created_at: string
}

export interface SavedQuery {
  id: string
  user_id: string
  project_id: string | null
  name: string
  query_data: Record<string, any>
  description: string | null
  alert_enabled: boolean
  last_run_at: string | null
  created_at: string
  updated_at: string
}

export interface AnalysisSession {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  insights: string | null
  related_documents: string[]
  related_events: string[]
  metadata: Record<string, any>
  status: "in_progress" | "completed" | "archived"
  created_at: string
  updated_at: string
}
