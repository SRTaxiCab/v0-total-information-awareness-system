import { createClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export const runtime = "edge"

const entitySchema = z.object({
  entities: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["person", "organization", "location", "concept", "event"]),
      description: z.string().optional(),
      mentions: z.number().optional(),
    })
  ),
})

const connectionSchema = z.object({
  connections: z.array(
    z.object({
      source: z.string(),
      target: z.string(),
      type: z.string(),
      strength: z.number().min(1).max(10),
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
      type: z.string().optional(),
    })
  ),
})

const summarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  topics: z.array(z.string()),
  sentiment: z.enum(["positive", "negative", "neutral", "mixed"]).optional(),
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

    // Get document
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single()

    if (docError || !document) {
      return new Response("Document not found", { status: 404 })
    }

    let result: any = {}

    switch (analysisType) {
      case "entities": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: entitySchema,
          prompt: `Extract all entities (people, organizations, locations, concepts, events) from this document:

Title: ${document.title}
Content: ${document.content}

Identify key entities and provide brief descriptions where relevant.`,
        })

        // Save entities to database
        if (object.entities.length > 0) {
          const entitiesToInsert = object.entities.map((entity) => ({
            user_id: user.id,
            project_id: document.project_id,
            name: entity.name,
            type: entity.type,
            description: entity.description || null,
            metadata: { source_document: documentId },
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
          prompt: `Identify relationships and connections between entities in this document:

Title: ${document.title}
Content: ${document.content}

Find connections between people, organizations, locations, and concepts. Rate connection strength from 1-10.`,
        })

        result = object
        break
      }

      case "timeline": {
        const { object } = await generateObject({
          model: openai("gpt-4-turbo"),
          schema: timelineSchema,
          prompt: `Extract all dates and events from this document to create a timeline:

Title: ${document.title}
Content: ${document.content}

Identify specific dates and events. Format dates as ISO strings (YYYY-MM-DD).`,
        })

        // Save timeline events to database
        if (object.events.length > 0) {
          const eventsToInsert = object.events.map((event) => ({
            user_id: user.id,
            project_id: document.project_id,
            title: event.title,
            description: event.description,
            event_date: event.date,
            event_type: event.type || "event",
            metadata: { source_document: documentId },
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
          prompt: `Provide a comprehensive summary of this document:

Title: ${document.title}
Content: ${document.content}

Include key points, main topics, and overall sentiment.`,
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
            prompt: `Extract entities from: ${document.content.substring(0, 2000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: connectionSchema,
            prompt: `Find connections in: ${document.content.substring(0, 2000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: timelineSchema,
            prompt: `Extract timeline from: ${document.content.substring(0, 2000)}`,
          }),
          generateObject({
            model: openai("gpt-4-turbo"),
            schema: summarySchema,
            prompt: `Summarize: ${document.content.substring(0, 2000)}`,
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
      project_id: document.project_id,
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
