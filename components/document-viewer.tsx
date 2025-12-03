"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Download, Share2, Tag, Link2, Users, MapPin, Building, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface DocumentViewerProps {
  document: any
  connections: any[]
  entities: any[]
}

export function DocumentViewer({ document, connections, entities }: DocumentViewerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const supabase = createClient()

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: document.id,
          analysisType: "full",
        }),
      })

      if (response.ok) {
        toast.success("Document has been analyzed by AI")
      }
    } catch (error) {
      toast.error("Could not analyze document")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleExport = async () => {
    const blob = new Blob([document.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = window.document.createElement("a")
    a.href = url
    a.download = `${document.title}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "person":
        return <Users className="h-4 w-4" />
      case "organization":
        return <Building className="h-4 w-4" />
      case "location":
        return <MapPin className="h-4 w-4" />
      default:
        return <Tag className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/archive">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  {document.project && (
                    <Badge variant="outline" style={{ borderColor: document.project.color }}>
                      {document.project.name}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">{document.content_type}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "AI Analysis"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="w-full">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-6">
                <Card className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-foreground leading-relaxed">{document.content}</p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="metadata" className="mt-6">
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Created</div>
                        <div className="text-sm text-foreground">{new Date(document.created_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Updated</div>
                        <div className="text-sm text-foreground">{new Date(document.updated_at).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Source</div>
                        <div className="text-sm text-foreground break-all">{document.source_url || "Manual Entry"}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                        <Badge>{document.status}</Badge>
                      </div>
                    </div>

                    {document.metadata && (
                      <div className="mt-6">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Additional Metadata</div>
                        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                          {JSON.stringify(document.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="raw" className="mt-6">
                <Card className="p-6">
                  <pre className="text-xs text-foreground overflow-auto">{JSON.stringify(document, null, 2)}</pre>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h3>
              {document.tags && document.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tags</p>
              )}
            </Card>

            {/* Entities */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Related Entities
              </h3>
              {entities.length > 0 ? (
                <div className="space-y-2">
                  {entities.slice(0, 10).map((entity: any) => (
                    <Link
                      key={entity.id}
                      href={`/dashboard/entity/${entity.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      {getEntityIcon(entity.entity_type)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{entity.name}</div>
                        <div className="text-xs text-muted-foreground">{entity.entity_type}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No entities found</p>
              )}
            </Card>

            {/* Connections */}
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Connections
              </h3>
              {connections.length > 0 ? (
                <div className="space-y-3">
                  {connections.slice(0, 5).map((conn: any) => (
                    <div key={conn.id} className="p-3 bg-muted rounded-lg space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">{conn.connection_type}</div>
                      <div className="text-sm text-foreground">{conn.to_document?.title || conn.to_entity?.name}</div>
                      {conn.strength && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${conn.strength * 100}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{Math.round(conn.strength * 100)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No connections found</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
