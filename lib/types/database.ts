export type ContentType = 
  | 'article'
  | 'email'
  | 'report'
  | 'transcript'
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'note'
  | 'other'

export type EntityType = 
  | 'person'
  | 'organization'
  | 'location'
  | 'concept'
  | 'event'

export type ConnectionType = 
  | 'related'
  | 'references'
  | 'contradicts'
  | 'supports'
  | 'custom'

export type AnalysisType = 
  | 'entities'
  | 'connections'
  | 'timeline'
  | 'summary'
  | 'full'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  project_id: string | null
  title: string
  content: string
  content_type: ContentType
  source_url: string | null
  source_type: 'upload' | 'url' | 'manual'
  metadata: Record<string, any> | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TimelineEvent {
  id: string
  user_id: string
  project_id: string | null
  title: string
  description: string | null
  event_date: string
  event_type: string
  related_documents: string[]
  related_entities: string[]
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface Entity {
  id: string
  user_id: string
  project_id: string | null
  name: string
  entity_type: EntityType
  description: string | null
  metadata: Record<string, any> | null
  related_documents: string[]
  created_at: string
  updated_at: string
}

export interface Connection {
  id: string
  user_id: string
  project_id: string | null
  source_id: string
  source_type: 'document' | 'entity'
  target_id: string
  target_type: 'document' | 'entity'
  connection_type: ConnectionType
  strength: number
  description: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface AIInteraction {
  id: string
  user_id: string
  project_id: string | null
  message: string
  response: string
  context: Record<string, any> | null
  created_at: string
}

export interface SavedQuery {
  id: string
  user_id: string
  name: string
  description: string | null
  query_params: Record<string, any>
  created_at: string
  updated_at: string
}

export interface AnalysisSession {
  id: string
  user_id: string
  project_id: string | null
  document_id: string | null
  analysis_type: AnalysisType
  results: Record<string, any>
  created_at: string
}
