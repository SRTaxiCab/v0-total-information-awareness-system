import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'edge'

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      type: z.enum(['search', 'document', 'entity', 'connection', 'timeline']),
      priority: z.enum(['high', 'medium', 'low']),
    })
  ),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { projectId, context } = await req.json()

    // Gather context about the project
    let projectContext = ''
    
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('name, description')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single()

      if (project) {
        projectContext += `Project: ${project.name}\n${project.description || ''}\n\n`
      }

      // Get recent documents
      const { data: documents } = await supabase
        .from('documents')
        .select('title, content_type, tags')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (documents && documents.length > 0) {
        projectContext += `Recent documents:\n${documents.map((d) => `- ${d.title} (${d.content_type})`).join('\n')}\n\n`
      }

      // Get entities
      const { data: entities } = await supabase
        .from('entities')
        .select('name, entity_type')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .limit(10)

      if (entities && entities.length > 0) {
        projectContext += `Key entities:\n${entities.map((e) => `- ${e.name} (${e.entity_type})`).join('\n')}\n\n`
      }
    }

    const { object } = await generateObject({
      model: openai('gpt-4-turbo'),
      schema: suggestionSchema,
      prompt: `You are a research assistant helping with an investigation. Based on the current research context, suggest next steps.

${projectContext}

${context ? `Additional context: ${context}\n\n` : ''}

Suggest 3-5 actionable next steps for the researcher. These could be:
- Search queries to run
- Documents to find or analyze
- Entities to investigate
- Connections to explore
- Timeline events to map

Prioritize suggestions based on their potential impact on the investigation.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error('Suggestion error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
