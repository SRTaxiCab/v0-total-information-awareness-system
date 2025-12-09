import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { documentIds, analysisType, projectId } = await req.json()
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Fetch the documents to analyze
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .in("id", documentIds)
      .eq("user_id", user.id)

    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: "No documents found" }, { status: 404 })
    }

    const documentText = documents.map((doc) => `Title: ${doc.title}\nContent: ${doc.content}\n\n`).join("")

    let prompt = ""
    const interactionType: string = analysisType

    switch (analysisType) {
      case "extract_entities":
        prompt = `Analyze the following documents and extract all entities (people, organizations, locations, events). Return them in JSON format with fields: name, type, aliases, description.

Documents:
${documentText}`
        break

      case "find_connections":
        prompt = `Analyze the following documents and identify connections, relationships, and patterns between the information. List each connection with its type and strength.

Documents:
${documentText}`
        break

      case "timeline":
        prompt = `Extract all temporal information and events from the following documents. Create a timeline with dates, events, and descriptions. Return in JSON format.

Documents:
${documentText}`
        break

      case "summarize":
        prompt = `Provide a comprehensive summary of the following documents, highlighting key findings, main themes, and important details.

Documents:
${documentText}`
        break

      default:
        prompt = `Analyze the following documents and provide insights:

Documents:
${documentText}`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Log the interaction
    await supabase.from("ai_interactions").insert({
      user_id: user.id,
      project_id: projectId,
      interaction_type: interactionType,
      input_data: { document_ids: documentIds, analysis_type: analysisType },
      output_data: { result: text },
      model_used: "gpt-4o-mini",
      related_documents: documentIds,
    })

    return NextResponse.json({ result: text, analysis_type: analysisType })
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json({ error: "Error processing analysis" }, { status: 500 })
  }
}
