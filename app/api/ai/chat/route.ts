import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, projectId, documentIds } = await req.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    // Build context from documents if provided
    let context = ''
    if (documentIds && documentIds.length > 0) {
      const { data: documents } = await supabase
        .from('documents')
        .select('title, content')
        .in('id', documentIds)
        .eq('user_id', user.id)

      if (documents && documents.length > 0) {
        context = documents
          .map((doc) => `Document: ${doc.title}\n${doc.content}`)
          .join('\n\n---\n\n')
      }
    }

    const systemPrompt = `You are an AI research assistant for the Sentinel Total Information Awareness platform. 
You help journalists, researchers, OSINT specialists, and intelligence analysts with their investigations.

Your capabilities:
- Analyze documents and extract key information
- Identify connections between entities and events
- Suggest research directions
- Answer questions about documents
- Extract entities (people, organizations, locations)
- Build timelines from events

Be concise, accurate, and cite sources when possible.${context ? '\n\nContext:\n' + context : ''}`

    const result = await streamText({
      model: openai('gpt-4-turbo'),
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Save interaction to database (fire and forget)
    supabase
      .from('ai_interactions')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        message,
        response: '', // Will be updated with full response later
        context: { documentIds },
      })
      .then()

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('AI chat error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
