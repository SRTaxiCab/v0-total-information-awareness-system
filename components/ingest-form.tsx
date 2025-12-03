"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, LinkIcon, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Project {
  id: string
  name: string
}

export function IngestForm({ projects }: { projects: Project[] }) {
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>("")
  const router = useRouter()

  const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const file = formData.get("file") as File
    const tags = formData.get("tags") as string

    if (!file) {
      toast.error("Please select a file")
      setLoading(false)
      return
    }

    const uploadData = new FormData()
    uploadData.append("file", file)
    if (selectedProject) uploadData.append("projectId", selectedProject)
    if (tags) uploadData.append("tags", tags)

    try {
      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: uploadData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const result = await response.json()
      toast.success(`Document "${result.title}" uploaded successfully`)
      router.push(`/dashboard/document/${result.documentId}`)
    } catch (error) {
      toast.error("Failed to upload file")
    } finally {
      setLoading(false)
    }
  }

  const handleUrlCapture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const url = formData.get("url") as string
    const tags = formData.get("tags") as string

    if (!url) {
      toast.error("Please enter a URL")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/ingest/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          projectId: selectedProject || null,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        }),
      })

      if (!response.ok) throw new Error("URL capture failed")

      const result = await response.json()
      toast.success(`Content from "${result.title}" captured successfully`)
      router.push(`/dashboard/document/${result.documentId}`)
    } catch (error) {
      toast.error("Failed to capture URL")
    } finally {
      setLoading(false)
    }
  }

  const handleTextEntry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const source = formData.get("source") as string
    const tags = formData.get("tags") as string

    if (!title || !content) {
      toast.error("Please enter title and content")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          projectId: selectedProject || null,
          sourceUrl: source || null,
          tags: tags ? tags.split(",").map((t) => t.trim()) : [],
          contentType: "note",
        }),
      })

      if (!response.ok) throw new Error("Text entry failed")

      const result = await response.json()
      toast.success(`Document "${result.title}" created successfully`)
      router.push(`/dashboard/document/${result.documentId}`)
    } catch (error) {
      toast.error("Failed to create document")
    } finally {
      setLoading(false)
    }
  }

  return (
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
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-upload">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-upload">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <Input id="file" name="file" type="file" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags-upload">Tags (comma-separated)</Label>
              <Input
                id="tags-upload"
                name="tags"
                placeholder="investigation, 2024, confidential"
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processing..." : "Process & Upload"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="url" className="space-y-4">
        <Card className="p-6">
          <form onSubmit={handleUrlCapture} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-url">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-url">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://example.com/article"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags-url">Tags (comma-separated)</Label>
              <Input id="tags-url" name="tags" placeholder="web-research, source, verified" disabled={loading} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Capturing..." : "Capture & Archive"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="text" className="space-y-4">
        <Card className="p-6">
          <form onSubmit={handleTextEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-text">Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-text">
                  <SelectValue placeholder="Select project (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Document title" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Enter or paste content here..."
                rows={12}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Source (optional)</Label>
              <Input
                id="source"
                name="source"
                placeholder="Interview, observation, field notes..."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags-text">Tags (comma-separated)</Label>
              <Input id="tags-text" name="tags" placeholder="notes, interview, primary-source" disabled={loading} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Document"}
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
