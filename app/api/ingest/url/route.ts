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
    let content = ""
    let title = url
    let contentType = "article"

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; SentinelBot/1.0)",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const html = await response.text()

      // Basic HTML parsing to extract title and content
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) {
        title = titleMatch[1].trim()
      }

      // Remove scripts and styles
      let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      cleanHtml = cleanHtml.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")

      // Extract text content (basic approach)
      content = cleanHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 50000)

      // Determine content type from URL or content
      if (url.includes("twitter.com") || url.includes("x.com")) {
        contentType = "social_media"
      } else if (url.includes("youtube.com") || url.includes("video")) {
        contentType = "video"
      } else if (url.includes("pdf")) {
        contentType = "document"
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError)
      return new Response("Failed to fetch URL", { status: 400 })
    }

    // Extract metadata
    const metadata = {
      sourceUrl: url,
      fetchedAt: new Date().toISOString(),
      domain: new URL(url).hostname,
    }

    // Insert document
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        title,
        content,
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
      documentId: document.id,
      title: document.title,
      content: content.substring(0, 500),
      contentType: document.content_type,
    })
  } catch (error) {
    console.error("URL Ingest Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
