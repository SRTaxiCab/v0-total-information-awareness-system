import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Unauthorized", { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string | null
    const tags = formData.get("tags") as string | null

    if (!file) {
      return new Response("No file provided", { status: 400 })
    }

    // Read file content
    const buffer = await file.arrayBuffer()
    const content = new TextDecoder().decode(buffer)

    // Determine content type
    let contentType = "document"
    const ext = file.name.split(".").pop()?.toLowerCase()
    
    if (["pdf"].includes(ext || "")) contentType = "document"
    else if (["txt", "md"].includes(ext || "")) contentType = "note"
    else if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) contentType = "image"
    else if (["doc", "docx"].includes(ext || "")) contentType = "document"

    // Extract metadata
    const metadata = {
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    // Insert document
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title: file.name,
        content: content.substring(0, 50000), // Limit content size
        content_type: contentType,
        source_url: null,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
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
    console.error("Upload Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
