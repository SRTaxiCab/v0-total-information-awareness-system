"use client"

import { useState, useEffect } from "react"
import { FileText, Download, Trash2, Filter } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import type { Document } from "@/lib/types/database"

export default function ArchivePage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [sortBy, setSortBy] = useState("created_at")

  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [filterType, sortBy])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)

      if (filterType !== "all") {
        query = query.eq("content_type", filterType)
      }

      query = query.order(sortBy, { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setDocuments(data || [])
    } catch (error) {
      console.error("Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "json" }),
      })

      if (!response.ok) throw new Error("Export failed")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `sentinel-export-${Date.now()}.json`
      a.click()
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Archive</h1>
          <p className="text-muted-foreground">
            Browse and manage all your documents
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="article">Articles</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="note">Notes</SelectItem>
              <SelectItem value="email">Emails</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Newest First</SelectItem>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        <div className="ml-auto text-sm text-muted-foreground">
          {documents.length} {documents.length === 1 ? "document" : "documents"}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted" />
            </Card>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No documents found</h3>
          <p className="text-muted-foreground">
            Start by ingesting some content
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{doc.title}</h3>
                      <Badge variant="outline">{doc.content_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {doc.content}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {doc.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
