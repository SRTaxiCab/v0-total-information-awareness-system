import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { documentIds, format = "json", includeMetadata = true } = body

    let query = supabase.from("documents").select("*").eq("user_id", user.id)

    if (documentIds && documentIds.length > 0) {
      query = query.in("id", documentIds)
    }

    const { data: documents, error } = await query

    if (error) throw error

    let exportData: any

    switch (format) {
      case "json":
        exportData = includeMetadata
          ? documents
          : documents.map((doc) => ({
              title: doc.title,
              content: doc.content,
              tags: doc.tags,
            }))
        break

      case "csv":
        const headers = ["Title", "Content", "Tags", "Created"]
        const rows = documents.map((doc) => [
          doc.title,
          doc.content.replace(/"/g, '""'),
          doc.tags?.join(";") || "",
          doc.created_at,
        ])
        exportData = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
        break

      case "markdown":
        exportData = documents
          .map(
            (doc) =>
              `# ${doc.title}\n\n${doc.content}\n\n---\nTags: ${doc.tags?.join(", ") || "None"}\nCreated: ${doc.created_at}\n\n`,
          )
          .join("\n")
        break

      default:
        exportData = documents
    }

    return NextResponse.json({
      data: exportData,
      count: documents.length,
      format,
    })
  } catch (error) {
    console.error("[v0] Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
