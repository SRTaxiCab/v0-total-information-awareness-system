import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"
import Link from "next/link"

export default async function ArchivePage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { data: stats } = await supabase
    .from("documents")
    .select("content_type")
    .eq("user_id", user.id)

  const contentTypeCounts = stats?.reduce((acc: Record<string, number>, doc) => {
    acc[doc.content_type] = (acc[doc.content_type] || 0) + 1
    return acc
  }, {})

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Archive</h1>
          <p className="text-muted-foreground">
            Browse and manage all your research documents
          </p>
        </div>
        <Button asChild>
          <Link href="/api/export?format=json">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{documents?.length || 0}</div>
          </CardContent>
        </Card>

        {contentTypeCounts && Object.entries(contentTypeCounts).slice(0, 3).map(([type, count]) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                {type}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{count}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {doc.content.substring(0, 200)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline">{doc.content_type}</Badge>
                        <Badge variant="secondary">{doc.source_type}</Badge>
                        {doc.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/dashboard/document/${doc.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by ingesting some content
            </p>
            <Button asChild>
              <Link href="/dashboard/ingest">Ingest Content</Link>
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
