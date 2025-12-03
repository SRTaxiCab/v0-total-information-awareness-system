import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { title, content, projectId, tags, contentType, sourceUrl } = await req.json()

    if (!title || !content) {
      return new Response("Title and content are required", { status: 400 })
    }

    // Extract metadata
    const metadata = {
      manualEntry: true,
      createdAt: new Date().toISOString(),
      wordCount: content.split(/\s+/).length,
    }

    // Insert document
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title,
        content,
        content_type: contentType || "note",
        source_url: sourceUrl || null,
        tags: tags || [],
        metadata,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to save document", { status: 500 })
    }

    return Response.json({
      documentId: document.id,
      title: document.title,
      contentType: document.content_type,
    })
  } catch (error) {
    console.error("Text Ingest Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
