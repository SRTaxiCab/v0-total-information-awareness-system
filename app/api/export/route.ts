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

    const { format, documentIds, projectId, includeEntities, includeTimeline } = await req.json()

    // Fetch documents
    let query = supabase.from("documents").select("*").eq("user_id", user.id)

    if (documentIds && documentIds.length > 0) {
      query = query.in("id", documentIds)
    } else if (projectId) {
      query = query.eq("project_id", projectId)
    }

    const { data: documents, error } = await query.order("created_at", { ascending: false })

    if (error) {
      return new Response("Failed to fetch documents", { status: 500 })
    }

    let exportData: any = { documents }

    // Include entities if requested
    if (includeEntities) {
      const { data: entities } = await supabase.from("entities").select("*").eq("user_id", user.id)
      exportData.entities = entities
    }

    // Include timeline if requested
    if (includeTimeline) {
      const { data: timeline } = await supabase.from("timeline_events").select("*").eq("user_id", user.id)
      exportData.timeline = timeline
    }

    // Format data based on requested format
    let output: string
    let contentType: string
    let filename: string

    switch (format) {
      case "json":
        output = JSON.stringify(exportData, null, 2)
        contentType = "application/json"
        filename = `sentinel-export-${Date.now()}.json`
        break

      case "csv":
        // Convert documents to CSV
        const headers = ["ID", "Title", "Content Type", "Created At", "Tags", "Source URL"]
        const rows = documents.map((doc) => [
          doc.id,
          doc.title,
          doc.content_type,
          doc.created_at,
          doc.tags?.join("; ") || "",
          doc.source_url || "",
        ])

        output = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
        contentType = "text/csv"
        filename = `sentinel-export-${Date.now()}.csv`
        break

      case "markdown":
        // Convert to Markdown
        output = `# Sentinel Export\n\nExported: ${new Date().toISOString()}\n\n`

        documents.forEach((doc) => {
          output += `## ${doc.title}\n\n`
          output += `**Type:** ${doc.content_type}\n`
          output += `**Created:** ${doc.created_at}\n`
          if (doc.source_url) output += `**Source:** ${doc.source_url}\n`
          if (doc.tags && doc.tags.length > 0) output += `**Tags:** ${doc.tags.join(", ")}\n`
          output += `\n${doc.content}\n\n---\n\n`
        })

        contentType = "text/markdown"
        filename = `sentinel-export-${Date.now()}.md`
        break

      default:
        return new Response("Invalid format", { status: 400 })
    }

    return new Response(output, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export Error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
