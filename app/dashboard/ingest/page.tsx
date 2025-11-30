import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectSidebar } from "@/components/project-sidebar"
import { Upload, LinkIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default async function IngestPage() {
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

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidebar projects={projects || []} userId={data.user.id} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader user={data.user} profile={profile} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Ingest Content</h1>
              <p className="text-muted-foreground mt-2">
                Add documents, web content, and information to your research database
              </p>
            </div>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </TabsTrigger>
                <TabsTrigger value="url">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Capture URL
                </TabsTrigger>
                <TabsTrigger value="text">
                  <FileText className="h-4 w-4 mr-2" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <Card className="p-6">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-upload">Project</Label>
                      <Select name="project">
                        <SelectTrigger id="project-upload">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="file">Upload Files</Label>
                      <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary transition-colors">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">Supports: PDF, DOC, TXT, Images, Video, Audio</p>
                        <Input id="file" type="file" multiple className="hidden" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags-upload">Tags (comma-separated)</Label>
                      <Input id="tags-upload" placeholder="investigation, 2024, confidential" />
                    </div>

                    <Button className="w-full">Process & Upload</Button>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="url" className="space-y-4">
                <Card className="p-6">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-url">Project</Label>
                      <Select name="project">
                        <SelectTrigger id="project-url">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input id="url" type="url" placeholder="https://example.com/article" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-type">Content Type</Label>
                      <Select name="contentType">
                        <SelectTrigger id="content-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="report">Report</SelectItem>
                          <SelectItem value="social">Social Media</SelectItem>
                          <SelectItem value="documentation">Documentation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags-url">Tags (comma-separated)</Label>
                      <Input id="tags-url" placeholder="web-research, source, verified" />
                    </div>

                    <Button className="w-full">Capture & Archive</Button>
                  </form>
                </Card>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <Card className="p-6">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-text">Project</Label>
                      <Select name="project">
                        <SelectTrigger id="project-text">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects?.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input id="title" placeholder="Document title" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Content</Label>
                      <Textarea id="content" placeholder="Enter or paste content here..." rows={12} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="source">Source (optional)</Label>
                      <Input id="source" placeholder="Interview, observation, field notes..." />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags-text">Tags (comma-separated)</Label>
                      <Input id="tags-text" placeholder="notes, interview, primary-source" />
                    </div>

                    <Button className="w-full">Create Document</Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
