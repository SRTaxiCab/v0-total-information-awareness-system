import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { Archive, FileText, Clock, Tag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default async function ArchivePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", data.user.id)
    .order("updated_at", { ascending: false })

  // Fetch all documents
  const { data: documents } = await supabase
    .from("documents")
    .select("*, projects(title)")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Get statistics
  const { count: totalDocuments } = await supabase
    .from("documents")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data.user.id)

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar projects={projects || []} userId={data.user.id} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={data.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Archive className="h-8 w-8" />
                  Archive
                </h1>
                <p className="text-muted-foreground mt-2">Browse and manage your research collection</p>
              </div>
              <div className="flex items-center gap-3">
                <Input placeholder="Search archive..." className="w-64" />
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="important">Important</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Documents</p>
                    <p className="text-2xl font-bold">{totalDocuments || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold">{projects?.length || 0}</p>
                  </div>
                  <Archive className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">
                      {documents?.filter((d) => {
                        const created = new Date(d.created_at)
                        const now = new Date()
                        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                      }).length || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              {documents?.map((doc) => (
                <Card key={doc.id} className="p-4 hover:bg-accent transition-colors">
                  <Link href={`/dashboard/document/${doc.id}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                        </div>
                        {doc.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {doc.content.substring(0, 200)}...
                          </p>
                        )}
                        <div className="flex items-center gap-3 flex-wrap">
                          {doc.projects && (
                            <Badge variant="outline" className="gap-1">
                              <Archive className="h-3 w-3" />
                              {doc.projects.title}
                            </Badge>
                          )}
                          <Badge variant="secondary">{doc.content_type || "document"}</Badge>
                          {doc.tags?.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="gap-1">
                              <Tag className="h-3 w-3" />
                              {tag}
                            </Badge>
                          ))}
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </Link>
                </Card>
              ))}

              {(!documents || documents.length === 0) && (
                <Card className="p-12 text-center">
                  <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">Start by ingesting content to build your archive</p>
                  <Link href="/dashboard/ingest">
                    <Button>Go to Ingest</Button>
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
