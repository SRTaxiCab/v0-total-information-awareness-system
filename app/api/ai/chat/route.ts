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

    // Get context from documents if provided
    let context = ""
    if (documentIds && documentIds.length > 0) {
      const { data: documents } = await supabase
        .from("documents")
        .select("title, content, metadata")
        .in("id", documentIds)
        .eq("user_id", user.id)

      if (documents) {
        context = documents
          .map((doc) => `Document: ${doc.title}\n${doc.content.substring(0, 1000)}`)
          .join("\n\n")
      }
    }

    // Get project context if provided
    let projectContext = ""
    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single()

      if (project) {
        projectContext = `Project: ${project.name}\n${project.description || ""}`
      }
    }

    const systemPrompt = `You are an AI research assistant for the Sentinel Total Information Awareness platform. 
You help researchers, journalists, and analysts understand their data, find connections, and discover insights.

${projectContext ? `Current Project Context:\n${projectContext}\n` : ""}
${context ? `Relevant Documents:\n${context}\n` : ""}

Provide clear, concise, and actionable insights. When suggesting connections or patterns, be specific and reference the source material.`

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Save interaction to database
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      project_id: projectId || null,
      message,
      response: "", // Will be updated with full response later
      interaction_type: "chat",
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("AI Chat Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
