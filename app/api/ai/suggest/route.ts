import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { projectId, currentFocus } = await req.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get project context
    const { data: project } = await supabase.from("projects").select("*").eq("id", projectId).single()

    const { data: documents } = await supabase
      .from("documents")
      .select("title, content, tags")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(20)

    const { data: entities } = await supabase
      .from("entities")
      .select("name, entity_type")
      .eq("project_id", projectId)
      .limit(30)

    const context = `
Project: ${project?.title}
Description: ${project?.description || "No description"}

Recent Documents: ${documents?.map((d) => d.title).join(", ") || "None"}

Known Entities: ${entities?.map((e) => `${e.name} (${e.entity_type})`).join(", ") || "None"}

Current Focus: ${currentFocus || "General research"}
`

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are a research assistant. Based on the following project context, suggest 5 actionable next steps or research directions that would help advance this investigation. Be specific and practical.

${context}

Provide suggestions in JSON format: [{"title": "...", "description": "...", "priority": "high|medium|low"}]`,
    })

    // Log the interaction
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      project_id: projectId,
      interaction_type: "suggestion",
      input_data: { current_focus: currentFocus },
      output_data: { suggestions: text },
      model_used: "gpt-4o-mini",
    })

    return Response.json({ suggestions: text })
  } catch (error) {
    console.error("AI suggestion error:", error)
    return Response.json({ error: "Error generating suggestions" }, { status: 500 })
  }
}
