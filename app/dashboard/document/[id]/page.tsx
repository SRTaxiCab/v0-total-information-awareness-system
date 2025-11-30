import { createServerClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { DocumentViewer } from "@/components/document-viewer"

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: document, error } = await supabase
    .from("documents")
    .select(
      `
      *,
      project:projects(id, name, color)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !document) {
    notFound()
  }

  const { data: connections } = await supabase
    .from("connections")
    .select("*, to_document:to_document_id(*), to_entity:to_entity_id(*)")
    .eq("from_document_id", id)

  const { data: entities } = await supabase.from("entities").select("*").contains("mentioned_in_documents", [id])

  return <DocumentViewer document={document} connections={connections || []} entities={entities || []} />
}
