import { createClient } from "@/lib/supabase/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

export const runtime = "edge"

const suggestionsSchema = z.object({
  suggestions: z.array(
    z.object({
      type: z.enum(["search", "connection", "document", "entity", "timeline"]),
      title: z.string(),
      description: z.string(),
      action: z.string().optional(),
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

    // Get project information
    let projectInfo = ""
    if (projectId) {
      const { data: project } = await supabase
        .from("projects")
        .select("name, description")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single()

      if (project) {
        projectInfo = `Project: ${project.name}\nDescription: ${project.description || "No description"}`
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
        projectInfo += `\n\nRecent Documents:\n${documents.map((d) => `- ${d.title} (${d.content_type})`).join("\n")}`
      }

      // Get entities in project
      const { data: entities } = await supabase
        .from("entities")
        .select("name, type")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .limit(10)

      if (entities && entities.length > 0) {
        projectInfo += `\n\nKey Entities:\n${entities.map((e) => `- ${e.name} (${e.type})`).join("\n")}`
      }
    }

    const { object } = await generateObject({
      model: openai("gpt-4-turbo"),
      schema: suggestionsSchema,
      prompt: `You are a research assistant helping with investigative research. Based on the current project state, suggest next steps for the researcher.

${projectInfo}

${context ? `Additional Context: ${context}` : ""}

Provide 3-5 actionable suggestions for:
- New searches to run
- Connections to explore
- Documents to review
- Entities to investigate
- Timeline events to add

Make suggestions specific and actionable.`,
    })

    return Response.json(object)
  } catch (error) {
    console.error("AI Suggest Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
