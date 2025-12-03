import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { FileText, Calendar, Tag } from "lucide-react"

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

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar projects={projects || []} userId={data.user.id} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={data.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Document Archive</h1>
                <p className="text-muted-foreground mt-2">
                  Browse and manage all documents in your research database
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/ingest">Add Documents</Link>
              </Button>
            </div>

            <Card className="p-4">
              <div className="flex gap-4">
                <Input placeholder="Search documents..." className="flex-1" />
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Content Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <div className="space-y-4">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <Card key={doc.id} className="p-6 hover:shadow-md transition-shadow">
                    <Link href={`/dashboard/document/${doc.id}`}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold hover:text-primary">{doc.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {doc.content?.substring(0, 200)}...
                            </p>
                          </div>
                          <Badge variant="secondary">{doc.content_type}</Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag className="h-4 w-4" />
                              {doc.tags.slice(0, 3).join(", ")}
                            </div>
                          )}
                          {doc.source_url && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              Source
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
                  <p className="text-muted-foreground mb-4">Start by adding documents to your archive</p>
                  <Button asChild>
                    <Link href="/dashboard/ingest">Add Your First Document</Link>
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
