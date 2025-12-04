import { createClient } from "@/lib/supabase/server"
// Mock analysis for sandbox environment

export const runtime = "edge"

const entitySchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["person", "organization", "location", "concept", "event"]),
      description: z.string().optional(),
      relevance: z.number().min(0).max(1),
    })
  ),
})

const connectionSchema = z.object({
  connections: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      type: z.string(),
      strength: z.number().min(0).max(1),
      description: z.string().optional(),
    })
  ),
})

const timelineSchema = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.string(),
      entities: z.array(z.string()).optional(),
    })
  ),
})

const summarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "negative", "neutral", "mixed"]),
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { documentId, analysisType } = await req.json()

    // Fetch document
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (error || !document) {
      return new Response("Document not found", { status: 404 })
    }

    let result: any = {}

    switch (analysisType) {
      case "entities": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: entitySchema,
          prompt: `Analyze this document and extract all important entities (people, organizations, locations, concepts, events).
          
Document: ${document.title}
Content: ${document.content}

Extract entities with their type and relevance score (0-1).`,
        })

        // Save entities to database
        if (object.entities.length > 0) {
          const entitiesToInsert = object.entities.map((entity) => ({
            user_id: user.id,
            name: entity.name,
            type: entity.type,
            description: entity.description || null,
            metadata: { relevance: entity.relevance, source_document: documentId },
          }))

          await supabase.from("entities").upsert(entitiesToInsert, {
            onConflict: "user_id,name,type",
            ignoreDuplicates: false,
          })
        }

        result = object
        break
      }

      case "connections": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: connectionSchema,
          prompt: `Analyze this document and identify connections between entities, concepts, or ideas.
          
Document: ${document.title}
Content: ${document.content}

Extract connections with type, strength (0-1), and description.`,
        })

        result = object
        break
      }

      case "timeline": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: timelineSchema,
          prompt: `Analyze this document and extract all temporal events with dates.
          
Document: ${document.title}
Content: ${document.content}

Extract events with dates, titles, descriptions, and related entities.`,
        })

        // Save timeline events to database
        if (object.events.length > 0) {
          const eventsToInsert = object.events.map((event) => ({
            user_id: user.id,
            title: event.title,
            description: event.description,
            event_date: event.date,
            event_type: event.type,
            metadata: { source_document: documentId, entities: event.entities },
          }))

          await supabase.from("timeline_events").insert(eventsToInsert)
        }

        result = object
        break
      }

      case "summary": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: summarySchema,
          prompt: `Analyze and summarize this document.
          
Document: ${document.title}
Content: ${document.content}

Provide a summary, key points, main topics, and overall sentiment.`,
        })

        result = object
        break
      }

      case "full": {
        // Run all analyses
        const [entities, connections, timeline, summary] = await Promise.all([
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: entitySchema,
            prompt: `Extract entities from: ${document.content.substring(0, 3000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: connectionSchema,
            prompt: `Extract connections from: ${document.content.substring(0, 3000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: timelineSchema,
            prompt: `Extract timeline events from: ${document.content.substring(0, 3000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: summarySchema,
            prompt: `Summarize: ${document.content.substring(0, 3000)}`,
          }),
        ])

        result = {
          entities: entities.object,
          connections: connections.object,
          timeline: timeline.object,
          summary: summary.object,
        }
        break
      }

      default:
        return new Response("Invalid analysis type", { status: 400 })
    }

    // Save analysis session
    await supabase.from("analysis_sessions").insert({
      user_id: user.id,
      document_id: documentId,
      analysis_type: analysisType,
      results: result,
    })

    return Response.json(result)
  } catch (error) {
    console.error("AI Analysis Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
