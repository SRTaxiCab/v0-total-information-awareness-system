import { createClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { message, projectId, documentIds } = await req.json()

    let context = ""

    // If document IDs provided, fetch their content for context
    if (documentIds && documentIds.length > 0) {
      const { data: documents } = await supabase
        .from("documents")
        .select("title, content, metadata")
        .in("id", documentIds)
        .eq("user_id", user.id)

      if (documents) {
        context = documents
          .map((doc) => `Document: ${doc.title}\n${doc.content.substring(0, 2000)}`)
          .join("\n\n")
      }
    }

    // If project ID provided, get project context
    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single()

      if (project) {
        context = `Project: ${project.name}\n${project.description || ""}\n\n${context}`
      }
    }

    const systemPrompt = `You are an AI research assistant for the Sentinel Total Information Awareness platform. 
You help researchers, journalists, and analysts understand their data, find connections, and generate insights.

${context ? `Context:\n${context}` : ""}

Provide clear, concise, and actionable responses. When analyzing documents, focus on:
- Key entities (people, organizations, locations)
- Important dates and events
- Connections and relationships
- Patterns and anomalies
- Research suggestions`

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Save interaction to database (fire and forget)
    supabase
      .from("ai_interactions")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        message,
        response: "", // Will be updated with full response later
        interaction_type: "chat",
      })
      .then()

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("AI Chat Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
