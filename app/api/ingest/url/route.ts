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

    const { url, projectId, tags } = await req.json()

    if (!url) {
      return new Response("No URL provided", { status: 400 })
    }

    // Fetch URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SentinelBot/1.0)",
      },
    })

    if (!response.ok) {
      return new Response("Failed to fetch URL", { status: 400 })
    }

    const html = await response.text()

    // Basic HTML parsing to extract text content
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname

    // Extract metadata
    const metadata = {
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      contentLength: textContent.length,
      domain: new URL(url).hostname,
    }

    // Determine content type
    let contentType = "article"
    if (url.includes("twitter.com") || url.includes("x.com")) {
      contentType = "social_media"
    } else if (url.includes("youtube.com")) {
      contentType = "video"
    } else if (url.includes("pdf")) {
      contentType = "pdf"
    }

    // Insert document
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title,
        content: textContent.substring(0, 50000), // Limit content size
        content_type: contentType,
        source_url: url,
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
      success: true,
      document: {
        id: document.id,
        title: document.title,
        content: textContent.substring(0, 500),
        contentType: document.content_type,
      },
    })
  } catch (error) {
    console.error("URL Ingest Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
