"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, Link as LinkIcon, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function IngestPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  // Upload state
  const [file, setFile] = useState<File | null>(null)
  const [uploadProjectId, setUploadProjectId] = useState("")
  const [uploadTags, setUploadTags] = useState("")

  // URL state
  const [url, setUrl] = useState("")
  const [urlProjectId, setUrlProjectId] = useState("")
  const [urlTags, setUrlTags] = useState<string[]>([])

  // Text state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [contentType, setContentType] = useState("note")
  const [textProjectId, setTextProjectId] = useState("")
  const [textTags, setTextTags] = useState<string[]>([])

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      if (uploadProjectId) formData.append("projectId", uploadProjectId)
      if (uploadTags) formData.append("tags", uploadTags)

      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      toast({
        title: "Document uploaded",
        description: `${data.title} has been added to your research.`,
      })

      setFile(null)
      setUploadTags("")
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUrlIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    setLoading(true)
    try {
      const response = await fetch("/api/ingest/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          projectId: urlProjectId || null,
          tags: urlTags,
        }),
      })

      if (!response.ok) throw new Error("URL ingestion failed")

      const data = await response.json()
      toast({
        title: "Content ingested",
        description: `${data.title} has been added to your research.`,
      })

      setUrl("")
      setUrlTags([])
    } catch (error) {
      toast({
        title: "Ingestion failed",
        description: "There was an error fetching the URL.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTextIngest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    setLoading(true)
    try {
      const response = await fetch("/api/ingest/text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          contentType,
          projectId: textProjectId || null,
          tags: textTags,
        }),
      })

      if (!response.ok) throw new Error("Text ingestion failed")

      const data = await response.json()
      toast({
        title: "Document created",
        description: `${data.title} has been added to your research.`,
      })

      setTitle("")
      setContent("")
      setTextTags([])
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "There was an error creating your document.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ingest Content</h1>
        <p className="text-muted-foreground">
          Add documents, web pages, or notes to your research platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url">
            <LinkIcon className="h-4 w-4 mr-2" />
            From URL
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload File</CardTitle>
              <CardDescription>
                Upload documents, PDFs, images, or other files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uploadTags">Tags (comma-separated)</Label>
                  <Input
                    id="uploadTags"
                    placeholder="investigation, source, confidential"
                    value={uploadTags}
                    onChange={(e) => setUploadTags(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" disabled={!file || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload File"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Import from URL</CardTitle>
              <CardDescription>
                Fetch and store content from any web page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUrlIngest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlTags">Tags</Label>
                  <Input
                    id="urlTags"
                    placeholder="Add tags (comma-separated)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const tag = e.currentTarget.value.trim()
                        if (tag && !urlTags.includes(tag)) {
                          setUrlTags([...urlTags, tag])
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                    disabled={loading}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {urlTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={!url || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Import URL"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>
                Create a document by typing or pasting content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTextIngest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Document title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="note">Note</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="transcript">Transcript</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter or paste your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={loading}
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="textTags">Tags</Label>
                  <Input
                    id="textTags"
                    placeholder="Add tags (comma-separated)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        const tag = e.currentTarget.value.trim()
                        if (tag && !textTags.includes(tag)) {
                          setTextTags([...textTags, tag])
                          e.currentTarget.value = ""
                        }
                      }
                    }}
                    disabled={loading}
                  />
                  <div className="flex gap-2 flex-wrap">
                    {textTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={!title || !content || loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Document"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
