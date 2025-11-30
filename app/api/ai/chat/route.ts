import { createClient } from "@/lib/supabase/server"
import { streamText } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages, projectId, context } = await req.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get relevant documents for context if project is specified
    let documentContext = ""
    if (projectId && context?.useDocuments) {
      const { data: documents } = await supabase
        .from("documents")
        .select("title, content, tags")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .limit(10)

      if (documents && documents.length > 0) {
        documentContext = `\n\nRelevant documents from your research:\n${documents
          .map((doc) => `- ${doc.title}: ${doc.content?.substring(0, 200)}...`)
          .join("\n")}`
      }
    }

    const systemPrompt = `You are an advanced AI research assistant for a Total Information Awareness system. Your role is to help researchers, journalists, OSINT specialists, archivists, historians, and intelligence analysts with their investigations.

Your capabilities include:
- Analyzing documents and finding patterns
- Suggesting connections between information
- Summarizing complex research materials
- Extracting entities (people, organizations, locations, events)
- Identifying timelines and sequences of events
- Proposing new research directions
- Helping organize and structure research projects

Be concise, analytical, and focused on actionable insights. When suggesting connections or patterns, explain your reasoning.${documentContext}`

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      system: systemPrompt,
      messages,
    })

    // Log the interaction
    const lastMessage = messages[messages.length - 1]
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      project_id: projectId,
      interaction_type: "query",
      input_data: { message: lastMessage },
      output_data: { streaming: true },
      model_used: "gpt-4o-mini",
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("AI chat error:", error)
    return new Response("Error processing request", { status: 500 })
  }
}
