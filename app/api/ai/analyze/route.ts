import { createClient } from '@/lib/supabase/server'
import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'
import { z } from 'zod'

export const runtime = 'edge'

const entitySchema = z.object({
  name: z.string(),
  type: z.enum(['person', 'organization', 'location', 'concept', 'event']),
  description: z.string().optional(),
})

const connectionSchema = z.object({
  source: z.string(),
  target: z.string(),
  type: z.enum(['related', 'references', 'contradicts', 'supports', 'custom']),
  strength: z.number().min(0).max(1),
  description: z.string().optional(),
})

const timelineEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.string(),
  type: z.string(),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { documentId, analysisType } = await req.json()

    if (!documentId || !analysisType) {
      return new Response('Document ID and analysis type are required', { status: 400 })
    }

    // Fetch document
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return new Response('Document not found', { status: 404 })
    }

    let result: any = {}

    switch (analysisType) {
      case 'entities': {
        const { object } = await generateObject({
          model: openai('gpt-4-turbo'),
          schema: z.object({
            entities: z.array(entitySchema),
          }),
          prompt: `Analyze the following document and extract all entities (people, organizations, locations, concepts, events).

Document: ${document.title}
Content: ${document.content}

Extract entities with their types and brief descriptions.`,
        })
        result = { entities: object.entities }
        break
      }

      case 'connections': {
        const { object } = await generateObject({
          model: openai('gpt-4-turbo'),
          schema: z.object({
            connections: z.array(connectionSchema),
          }),
          prompt: `Analyze the following document and identify connections between entities or concepts.

Document: ${document.title}
Content: ${document.content}

Identify relationships, references, contradictions, or supporting evidence.`,
        })
        result = { connections: object.connections }
        break
      }

      case 'timeline': {
        const { object } = await generateObject({
          model: openai('gpt-4-turbo'),
          schema: z.object({
            events: z.array(timelineEventSchema),
          }),
          prompt: `Analyze the following document and extract all temporal events with dates.

Document: ${document.title}
Content: ${document.content}

Extract events with dates, titles, descriptions, and types.`,
        })
        result = { events: object.events }
        break
      }

      case 'summary': {
        const { object } = await generateObject({
          model: openai('gpt-4-turbo'),
          schema: z.object({
            summary: z.string(),
            keyPoints: z.array(z.string()),
          }),
          prompt: `Summarize the following document and extract key points.

Document: ${document.title}
Content: ${document.content}

Provide a concise summary and list of key points.`,
        })
        result = { summary: object.summary, keyPoints: object.keyPoints }
        break
      }

      case 'full': {
        // Run all analyses
        const [entitiesRes, connectionsRes, timelineRes, summaryRes] = await Promise.all([
          generateObject({
            model: openai('gpt-4-turbo'),
            schema: z.object({ entities: z.array(entitySchema) }),
            prompt: `Extract entities from: ${document.content}`,
          }),
          generateObject({
            model: openai('gpt-4-turbo'),
            schema: z.object({ connections: z.array(connectionSchema) }),
            prompt: `Identify connections in: ${document.content}`,
          }),
          generateObject({
            model: openai('gpt-4-turbo'),
            schema: z.object({ events: z.array(timelineEventSchema) }),
            prompt: `Extract timeline events from: ${document.content}`,
          }),
          generateObject({
            model: openai('gpt-4-turbo'),
            schema: z.object({ summary: z.string(), keyPoints: z.array(z.string()) }),
            prompt: `Summarize: ${document.content}`,
          }),
        ])

        result = {
          entities: entitiesRes.object.entities,
          connections: connectionsRes.object.connections,
          events: timelineRes.object.events,
          summary: summaryRes.object.summary,
          keyPoints: summaryRes.object.keyPoints,
        }
        break
      }

      default:
        return new Response('Invalid analysis type', { status: 400 })
    }

    // Save analysis session
    await supabase.from('analysis_sessions').insert({
      user_id: user.id,
      project_id: document.project_id,
      document_id: documentId,
      analysis_type: analysisType,
      results: result,
    })

    return Response.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
