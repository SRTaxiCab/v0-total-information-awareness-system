import { createClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export const runtime = "edge"

const suggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(["search", "document", "connection", "entity", "timeline", "analysis"]),
      title: z.string(),
      description: z.string(),
      action: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
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

    const { projectId, context } = await req.json()

    // Gather context about user's research
    let researchContext = context || ""

    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single()

      if (project) {
        researchContext += `\nProject: ${project.name}\n${project.description || ""}`
      }

      // Get recent documents in project
      const { data: documents } = await supabase
        .from("documents")
        .select("title, content_type, tags")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      if (documents && documents.length > 0) {
        researchContext += `\n\nRecent documents: ${documents.map((d) => d.title).join(", ")}`
      }

      // Get entities
      const { data: entities } = await supabase
        .from("entities")
        .select("name, type")
        .eq("user_id", user.id)
        .limit(10)

      if (entities && entities.length > 0) {
        researchContext += `\n\nTracked entities: ${entities.map((e) => `${e.name} (${e.type})`).join(", ")}`
      }
    }

    const { object } = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: suggestionsSchema,
      prompt: `You are a research assistant helping with investigative research. Based on the current research context, suggest next steps.

Research Context:
${researchContext}

Provide 3-5 actionable suggestions for:
- New searches to perform
- Documents to review or find
- Connections to explore
- Entities to investigate
- Timeline events to map
- Analyses to run

Each suggestion should have a type, title, description, action, and priority level.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("AI Suggest Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
