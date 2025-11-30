"use client"

import { FileText, LinkIcon, ImageIcon, Video, Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Document } from "@/lib/types/database"

interface SearchResultsProps {
  results: Document[]
  isLoading: boolean
}

const contentTypeIcons: Record<string, any> = {
  text: FileText,
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  url: LinkIcon,
  email: Mail,
  article: FileText,
}

export function SearchResults({ results, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-32 bg-muted/50" />
          </Card>
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <Card className="p-12 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">Try adjusting your search query or filters</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Found {results.length} {results.length === 1 ? "result" : "results"}
        </p>
      </div>

      <div className="space-y-3">
        {results.map((result) => {
          const Icon = contentTypeIcons[result.content_type] || FileText
          return (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg mt-1">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 truncate">{result.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{result.content}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">
                    {result.content_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                    <Button size="sm" variant="ghost">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
