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

    const { format, projectId, documentIds } = await req.json()

    // Build query
    let query = supabase.from("documents").select("*").eq("user_id", user.id)

    if (projectId) {
      query = query.eq("project_id", projectId)
    }

    if (documentIds && documentIds.length > 0) {
      query = query.in("id", documentIds)
    }

    const { data: documents, error } = await query.order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return new Response("Failed to fetch documents", { status: 500 })
    }

    let exportData: string
    let contentType: string
    let filename: string

    switch (format) {
      case "json":
        exportData = JSON.stringify(documents, null, 2)
        contentType = "application/json"
        filename = `sentinel-export-${Date.now()}.json`
        break

      case "csv":
        // Convert to CSV
        const headers = ["ID", "Title", "Content Type", "Created At", "Tags", "Source URL"]
        const rows = documents.map((doc) => [
          doc.id,
          doc.title,
          doc.content_type,
          doc.created_at,
          doc.tags?.join("; ") || "",
          doc.source_url || "",
        ])

        exportData = [
          headers.join(","),
          ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
        ].join("\n")

        contentType = "text/csv"
        filename = `sentinel-export-${Date.now()}.csv`
        break

      case "markdown":
        // Convert to Markdown
        exportData = documents
          .map(
            (doc) => `# ${doc.title}

**Type:** ${doc.content_type}
**Created:** ${new Date(doc.created_at).toLocaleDateString()}
**Tags:** ${doc.tags?.join(", ") || "None"}
${doc.source_url ? `**Source:** ${doc.source_url}` : ""}

---

${doc.content}

---

`
          )
          .join("\n\n")

        contentType = "text/markdown"
        filename = `sentinel-export-${Date.now()}.md`
        break

      default:
        return new Response("Invalid format", { status: 400 })
    }

    return new Response(exportData, {
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
